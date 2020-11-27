import ObservableStore from 'obs-store'

const Box = process.env.IN_TEST
  ? require('../../../development/mock-3box')
  : require('3box')

import log from 'loglevel'
import migrations from '../migrations'
import Migrator from '../lib/migrator'
import JsonRpcEngine from 'json-rpc-engine'
import providerFromEngine from '@alayanetwork/eth-json-rpc-middleware/providerFromEngine'
import createMetamaskMiddleware from './network/createMetamaskMiddleware'
import createOriginMiddleware from '../lib/createOriginMiddleware'

const SYNC_TIMEOUT = 60 * 1000 // one minute

export default class ThreeBoxController {
  constructor (opts = {}) {
    const {
      preferencesController,
      keyringController,
      addressBookController,
      version,
      getKeyringControllerState,
    } = opts

    this.preferencesController = preferencesController
    this.addressBookController = addressBookController
    this.keyringController = keyringController
    this.provider = this._createProvider({
      version,
      getAccounts: async ({ origin }) => {
        if (origin !== '3Box') {
          return []
        }
        const isUnlocked = getKeyringControllerState().isUnlocked

        const accounts = await this.keyringController.getAccounts()

        if (isUnlocked && accounts[0]) {
          const appKeyAddress = await this.keyringController.getAppKeyAddress(accounts[0], 'wallet://3box.metamask.io')
          return [appKeyAddress]
        } else {
          return []
        }
      },
      processPersonalMessage: async (msgParams) => {
        const accounts = await this.keyringController.getAccounts()
        return keyringController.signPersonalMessage({ ...msgParams, from: accounts[0] }, {
          withAppKeyOrigin: 'wallet://3box.metamask.io',
        })
      },
    })

    const initState = {
      threeBoxSyncingAllowed: false,
      showRestorePrompt: true,
      threeBoxLastUpdated: 0,
      ...opts.initState,
      threeBoxAddress: null,
      threeBoxSynced: false,
      threeBoxDisabled: false,
    }
    this.store = new ObservableStore(initState)
    this.registeringUpdates = false
    this.lastMigration = migrations.sort((a, b) => a.version - b.version).slice(-1)[0]

    if (initState.threeBoxSyncingAllowed) {
      this.init()
    }
  }

  async init () {
    const accounts = await this.keyringController.getAccounts()
    this.address = accounts[0]
    if (this.address && !(this.box && this.store.getState().threeBoxSynced)) {
      await this.new3Box()
    }
  }

  async _update3Box () {
    try {
      const { threeBoxSyncingAllowed, threeBoxSynced } = this.store.getState()
      if (threeBoxSyncingAllowed && threeBoxSynced) {
        const newState = {
          preferences: this.preferencesController.store.getState(),
          addressBook: this.addressBookController.state,
          lastUpdated: Date.now(),
          lastMigration: this.lastMigration,
        }

        await this.space.private.set('alaya-metamaskBackup', JSON.stringify(newState))
        await this.setShowRestorePromptToFalse()
      }
    } catch (error) {
      console.error(error)
    }
  }

  _createProvider (providerOpts) {
    const metamaskMiddleware = createMetamaskMiddleware(providerOpts)
    const engine = new JsonRpcEngine()
    engine.push(createOriginMiddleware({ origin: '3Box' }))
    engine.push(metamaskMiddleware)
    const provider = providerFromEngine(engine)
    return provider
  }

  _waitForOnSyncDone () {
    return new Promise((resolve) => {
      this.box.onSyncDone(() => {
        log.debug('3Box box sync done')
        return resolve()
      })
    })
  }

  async new3Box () {
    const accounts = await this.keyringController.getAccounts()
    this.address = await this.keyringController.getAppKeyAddress(accounts[0], 'wallet://3box.metamask.io')
    let backupExists
    try {
      const threeBoxConfig = await Box.getConfig(this.address)
      backupExists = threeBoxConfig.spaces && threeBoxConfig.spaces.metamask
    } catch (e) {
      if (e.message.match(/^Error: Invalid response \(404\)/)) {
        backupExists = false
      } else {
        throw e
      }
    }
    if (this.getThreeBoxSyncingState() || backupExists) {
      this.store.updateState({ threeBoxSynced: false })

      let timedOut = false
      const syncTimeout = setTimeout(() => {
        log.error(`3Box sync timed out after ${SYNC_TIMEOUT} ms`)
        timedOut = true
        this.store.updateState({
          threeBoxDisabled: true,
          threeBoxSyncingAllowed: false,
        })
      }, SYNC_TIMEOUT)
      try {
        this.box = await Box.openBox(this.address, this.provider)
        await this._waitForOnSyncDone()
        this.space = await this.box.openSpace('alaya-metamask', {
          onSyncDone: async () => {
            const stateUpdate = {
              threeBoxSynced: true,
              threeBoxAddress: this.address,
            }
            if (timedOut) {
              log.info(`3Box sync completed after timeout; no longer disabled`)
              stateUpdate.threeBoxDisabled = false
            }

            clearTimeout(syncTimeout)
            this.store.updateState(stateUpdate)

            log.debug('3Box space sync done')
          },
        })
      } catch (e) {
        console.error(e)
        throw e
      }
    }
  }

  async getLastUpdated () {
    const res = await this.space.private.get('alaya-metamaskBackup')
    const parsedRes = JSON.parse(res || '{}')
    return parsedRes.lastUpdated
  }

  async migrateBackedUpState (backedUpState) {
    const migrator = new Migrator({ migrations })

    const formattedStateBackup = {
      PreferencesController: backedUpState.preferences,
      AddressBookController: backedUpState.addressBook,
    }
    const initialMigrationState = migrator.generateInitialState(formattedStateBackup)
    const migratedState = await migrator.migrateData(initialMigrationState)
    return {
      preferences: migratedState.PreferencesController,
      addressBook: migratedState.AddressBookController,
    }
  }

  async restoreFromThreeBox () {
    const backedUpState = await this.space.private.get('alaya-metamaskBackup')
    const {
      preferences,
      addressBook,
    } = await this.migrateBackedUpState(backedUpState)
    this.store.updateState({ threeBoxLastUpdated: backedUpState.lastUpdated })
    preferences && this.preferencesController.store.updateState(JSON.parse(preferences))
    addressBook && this.addressBookController.update(JSON.parse(addressBook), true)
    this.setShowRestorePromptToFalse()
  }

  turnThreeBoxSyncingOn () {
    this._registerUpdates()
  }

  turnThreeBoxSyncingOff () {
    this.box.logout()
  }

  setShowRestorePromptToFalse () {
    this.store.updateState({ showRestorePrompt: false })
  }

  setThreeBoxSyncingPermission (newThreeboxSyncingState) {
    if (this.store.getState().threeBoxDisabled) {
      return
    }
    this.store.updateState({
      threeBoxSyncingAllowed: newThreeboxSyncingState,
    })

    if (newThreeboxSyncingState && this.box) {
      this.turnThreeBoxSyncingOn()
    }

    if (!newThreeboxSyncingState && this.box) {
      this.turnThreeBoxSyncingOff()
    }
  }

  getThreeBoxSyncingState () {
    return this.store.getState().threeBoxSyncingAllowed
  }

  _registerUpdates () {
    if (!this.registeringUpdates) {
      const updatePreferences = this._update3Box.bind(this)
      this.preferencesController.store.subscribe(updatePreferences)
      const updateAddressBook = this._update3Box.bind(this)
      this.addressBookController.subscribe(updateAddressBook)
      this.registeringUpdates = true
    }
  }
}
