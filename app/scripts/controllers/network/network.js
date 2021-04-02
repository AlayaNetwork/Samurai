import assert from 'assert'
import EventEmitter from 'events'
import ObservableStore from 'obs-store'
import ComposedStore from 'obs-store/lib/composed'
import EthQuery from '@alayanetwork/eth-query'
import JsonRpcEngine from 'json-rpc-engine'
import providerFromEngine from '@alayanetwork/eth-json-rpc-middleware/providerFromEngine'
import log from 'loglevel'
import createMetamaskMiddleware from './createMetamaskMiddleware'
import createJsonRpcClient from './createJsonRpcClient'
import createLocalhostClient from './createLocalhostClient'
import { createSwappableProxy, createEventEmitterProxy } from 'swappable-obj-proxy'

const networks = { networkList: {} }

import {
  ALAYA,
  MAINNET,
  LOCALHOST,
  INFURA_PROVIDER_TYPES,
} from './enums'
import { defaultNetworksData } from './network-constants'

const env = process.env.METAMASK_ENV
const METAMASK_DEBUG = process.env.METAMASK_DEBUG

let defaultProviderConfigType
let defaultProviderConfigURL
let defaultProviderConfigChainID
let defaultProviderConfigHrp
if (process.env.IN_TEST === 'true') {
  defaultProviderConfigType = LOCALHOST
} else {
  defaultProviderConfigType = ALAYA
  defaultProviderConfigHrp = 'atp'
  defaultProviderConfigURL = defaultNetworksData['alaya'].rpcTarget
  defaultProviderConfigChainID = defaultNetworksData['alaya'].chainId
}

// else if (METAMASK_DEBUG || env === 'test') {
//   defaultProviderConfigType = ALAYA
//   defaultProviderConfigURL = defaultNetworksData['alaya'].rpcTarget
//   defaultProviderConfigChainID = defaultNetworksData['alaya'].chainId
// } else {
//   defaultProviderConfigType = MAINNET
//   defaultProviderConfigURL = defaultNetworksData['mainnet'].rpcTarget
//   defaultProviderConfigChainID = defaultNetworksData['mainnet'].chainId
// }

const defaultProviderConfig = {
  type: defaultProviderConfigType,
  rpcTarget: defaultProviderConfigURL,
  chainId: defaultProviderConfigChainID,
  hrp: defaultProviderConfigHrp,
}

const defaultNetworkConfig = {
  chainId: defaultProviderConfigChainID,
  hrp: defaultProviderConfigHrp,
  ticker: 'ATP',
}

export default class NetworkController extends EventEmitter {

  constructor (opts = {}) {
    super()

    // parse options
    const providerConfig = opts.provider || defaultProviderConfig
    // create stores
    this.providerStore = new ObservableStore(providerConfig)
    this.networkStore = new ObservableStore('loading')
    this.hrpStore = new ObservableStore('loading')
    this.networkConfig = new ObservableStore(defaultNetworkConfig)
    this.store = new ComposedStore({ provider: this.providerStore, network: this.networkStore, hrp: this.hrpStore, settings: this.networkConfig })
    this.on('networkDidChange', this.lookupNetwork)
    // provider and block tracker
    this._provider = null
    this._blockTracker = null
    // provider and block tracker proxies - because the network changes
    this._providerProxy = null
    this._blockTrackerProxy = null
  }

  initializeProvider (providerParams) {
    this._baseProviderParams = providerParams
    const { type, rpcTarget, chainId, hrp, ticker, nickname } = this.providerStore.getState()
    this._configureProvider({ type, rpcTarget, chainId, hrp, ticker, nickname })
    this.lookupNetwork()
  }

  // return the proxies so the references will always be good
  getProviderAndBlockTracker () {
    const provider = this._providerProxy
    const blockTracker = this._blockTrackerProxy
    return { provider, blockTracker }
  }

  verifyNetwork () {
    // Check network when restoring connectivity:
    if (this.isNetworkLoading()) {
      this.lookupNetwork()
    }
  }

  getNetworkState () {
    return this.networkStore.getState()
  }

  getHrpState () {
    return this.hrpStore.getState()
  }

  getNetworkConfig () {
    return this.networkConfig.getState()
  }

  setHrpState (hrp, type) {
    if (hrp === 'loading') {
      return this.hrpStore.putState(hrp)
    }

    // type must be defined
    if (!type) {
      return
    }
    hrp = networks.networkList[type]?.hrp || hrp
    return this.hrpStore.putState(hrp)
  }

  setNetworkState (network, type) {
    if (network === 'loading') {
      return this.networkStore.putState(network)
    }

    // type must be defined
    if (!type) {
      return
    }
    network = networks.networkList[type]?.chainId || network
    return this.networkStore.putState(network)
  }

  isNetworkLoading () {
    return this.getNetworkState() === 'loading'
  }

  lookupNetwork () {
    // Prevent firing when provider is not defined.
    if (!this._provider) {
      return log.warn('NetworkController - lookupNetwork aborted due to missing provider')
    }
    const { type } = this.providerStore.getState()
    const ethQuery = new EthQuery(this._provider)
    const initialNetwork = this.getNetworkState()
    ethQuery.sendAsync({ method: 'platon_getAddressHrp' }, (err, hrp) => {
      const currentNetwork = this.getNetworkState()
      if (initialNetwork === currentNetwork) {
        if (err) {
          return this.setHrpState('atp', type)
        }
        if (defaultNetworksData[type]) {
          hrp = defaultNetworksData[type].hrp
        } else {
          hrp = this.networkConfig.getState().hrp
        }
        log.info('web3.getHrp returned ' + hrp)
        this.setHrpState(hrp, type)
      }
    })
    ethQuery.sendAsync({ method: 'net_version' }, (err, network) => {
      const currentNetwork = this.getNetworkState()
      if (initialNetwork === currentNetwork) {
        if (err) {
          return this.setNetworkState('loading')
        }
        if (defaultNetworksData[type]) {
          network = defaultNetworksData[type].chainId
        } else {
          network = this.networkConfig.getState().chainId
        }
        log.info('web3.getNetwork returned ' + network)
        this.setNetworkState(network, type)
      }
    })
  }

  setRpcTarget (rpcTarget, chainId, hrp, ticker = 'ATP', nickname = '', rpcPrefs) {
    const providerConfig = {
      type: 'rpc',
      rpcTarget,
      chainId,
      hrp,
      ticker,
      nickname,
      rpcPrefs,
    }
    this.providerConfig = providerConfig
  }

  async setProviderType (type, chainId = '', hrp = '', rpcTarget = '', ticker = 'ATP', nickname = '') {
    assert.notEqual(type, 'rpc', `NetworkController - cannot call "setProviderType" with type 'rpc'. use "setRpcTarget"`)
    assert(INFURA_PROVIDER_TYPES.includes(type) || type === LOCALHOST, `NetworkController - Unknown rpc type "${type}"`)
    if (rpcTarget === '') {
      rpcTarget = defaultNetworksData[type].rpcTarget
    }
    if (chainId === '') {
      chainId = defaultNetworksData[type].chainId
    }
    if (hrp === '') {
      hrp = defaultNetworksData[type].hrp
    }
    const providerConfig = { type, chainId, hrp, rpcTarget, ticker, nickname }
    this.providerConfig = providerConfig
  }

  resetConnection () {
    this.providerConfig = this.getProviderConfig()
  }

  set providerConfig (providerConfig) {
    this.providerStore.updateState(providerConfig)
    this._switchNetwork(providerConfig)
  }

  getProviderConfig () {
    return this.providerStore.getState()
  }

  //
  // Private
  //

  _switchNetwork (opts) {
    this.setNetworkState('loading')
    if (opts.hrp) {
      this.setHrpState(opts.hrp, opts.type)
    } else {
      this.setHrpState('loading')
    }
    this._configureProvider(opts)
    this.emit('networkDidChange', opts.type)
  }

  _configureProvider (opts) {
    const { type, rpcTarget, chainId, hrp, ticker, nickname } = opts
    // infura type-based endpoints
    const isInfura = INFURA_PROVIDER_TYPES.includes(type)
    if (isInfura) {
      this._configureInfuraProvider(opts)
    // other type-based rpc endpoints
    } else if (type === LOCALHOST) {
      this._configureLocalhostProvider()
    // url-based rpc endpoints
    } else if (type === 'rpc') {
      this._configureStandardProvider({ rpcUrl: rpcTarget, chainId, hrp, ticker, nickname })
    } else {
      throw new Error(`NetworkController - _configureProvider - unknown type "${type}"`)
    }
  }

  _configureInfuraProvider ({ type }) {
    log.info('NetworkController - configureInfuraProvider', type)
    const rpcUrl = defaultNetworksData[type].rpcTarget
    const networkClient = createJsonRpcClient({ rpcUrl })
    networks.networkList[type] = {
      chainId: defaultNetworksData[type].chainId,
      hrp: defaultNetworksData[type].hrp,
      rpcUrl,
      ticker: defaultNetworksData[type].ticker || 'ATP',
      nickname: defaultNetworksData[type].providerType,
    }
    // setup networkConfig
    let settings = {
      network: defaultNetworksData[type].chainId,
      hrp: defaultNetworksData[type].hrp,
      ticker: 'ATP',
    }
    settings = Object.assign(settings, networks.networkList[type])
    this.networkConfig.putState(settings)
    this._setNetworkClient(networkClient)
  }

  _configureLocalhostProvider () {
    log.info('NetworkController - configureLocalhostProvider')
    const networkClient = createLocalhostClient()
    this._setNetworkClient(networkClient)
  }

  _configureStandardProvider ({ rpcUrl, chainId, hrp, ticker, nickname }) {
    log.info('NetworkController - configureStandardProvider', rpcUrl)
    const networkClient = createJsonRpcClient({ rpcUrl })
    // hack to add a 'rpc' network with chainId
    networks.networkList['rpc'] = {
      chainId,
      hrp,
      rpcUrl,
      ticker: ticker || 'ATP',
      nickname,
    }
    // setup networkConfig
    let settings = {
      network: chainId,
      hrp: hrp
    }
    settings = Object.assign(settings, networks.networkList['rpc'])
    this.networkConfig.putState(settings)
    this._setNetworkClient(networkClient)
  }

  _setNetworkClient ({ networkMiddleware, blockTracker }) {
    const metamaskMiddleware = createMetamaskMiddleware(this._baseProviderParams)
    const engine = new JsonRpcEngine()
    engine.push(metamaskMiddleware)
    engine.push(networkMiddleware)
    const provider = providerFromEngine(engine)
    this._setProviderAndBlockTracker({ provider, blockTracker })
  }

  _setProviderAndBlockTracker ({ provider, blockTracker }) {
    // update or intialize proxies
    if (this._providerProxy) {
      this._providerProxy.setTarget(provider)
    } else {
      this._providerProxy = createSwappableProxy(provider)
    }
    if (this._blockTrackerProxy) {
      this._blockTrackerProxy.setTarget(blockTracker)
    } else {
      this._blockTrackerProxy = createEventEmitterProxy(blockTracker, { eventFilter: 'skipInternal' })
    }
    // set new provider and blockTracker
    this._provider = provider
    this._blockTracker = blockTracker
  }
}
