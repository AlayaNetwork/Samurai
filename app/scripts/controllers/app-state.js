import ObservableStore from 'obs-store'
import EventEmitter from 'events'

export default class AppStateController extends EventEmitter {
  /**
   * @constructor
   * @param opts
   */
  constructor (opts = {}) {
    const {
      addUnlockListener,
      isUnlocked,
      initState,
      onInactiveTimeout,
      showUnlockRequest,
      preferencesStore,
    } = opts
    const { preferences } = preferencesStore.getState()

    super()

    this.onInactiveTimeout = onInactiveTimeout || (() => {})
    this.store = new ObservableStore(Object.assign({
      timeoutMinutes: 0,
      connectedStatusPopoverHasBeenShown: true,
      defaultHomeActiveTabName: null,
    }, initState))
    this.timer = null

    this.isUnlocked = isUnlocked
    this.waitingForUnlock = []
    addUnlockListener(this.handleUnlock.bind(this))

    this._showUnlockRequest = showUnlockRequest

    preferencesStore.subscribe(({ preferences }) => {
      const currentState = this.store.getState()
      if (currentState.timeoutMinutes !== preferences.autoLockTimeLimit) {
        this._setInactiveTimeout(preferences.autoLockTimeLimit)
      }
    })

    this._setInactiveTimeout(preferences.autoLockTimeLimit)
  }

  /**
   * Get a Promise that resolves when the extension is unlocked.
   * This Promise will never reject.
   *
   * @param {boolean} shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   * @returns {Promise<void>} A promise that resolves when the extension is
   * unlocked, or immediately if the extension is already unlocked.
   */
  getUnlockPromise (shouldShowUnlockRequest) {
    return new Promise((resolve) => {
      if (this.isUnlocked()) {
        resolve()
      } else {
        this.waitForUnlock(resolve, shouldShowUnlockRequest)
      }
    })
  }

  /**
   * Adds a Promise's resolve function to the waitingForUnlock queue.
   * Also opens the extension popup if specified.
   *
   * @param {Promise.resolve} resolve - A Promise's resolve function that will
   * be called when the extension is unlocked.
   * @param {boolean} shouldShowUnlockRequest - Whether the extension notification
   * popup should be opened.
   */
  waitForUnlock (resolve, shouldShowUnlockRequest) {
    this.waitingForUnlock.push({ resolve })
    this.emit('updateBadge')
    if (shouldShowUnlockRequest) {
      this._showUnlockRequest()
    }
  }

  /**
   * Drains the waitingForUnlock queue, resolving all the related Promises.
   */
  handleUnlock () {
    if (this.waitingForUnlock.length > 0) {
      while (this.waitingForUnlock.length > 0) {
        this.waitingForUnlock.shift().resolve()
      }
      this.emit('updateBadge')
    }
  }

  /**
   * Sets the default home tab
   * @param {string} [defaultHomeActiveTabName] - the tab name
   */
  setDefaultHomeActiveTabName (defaultHomeActiveTabName) {
    this.store.updateState({
      defaultHomeActiveTabName,
    })
  }

  /**
   * Record that the user has seen the connected status info popover
   */
  setConnectedStatusPopoverHasBeenShown () {
    this.store.updateState({
      connectedStatusPopoverHasBeenShown: true,
    })
  }

  /**
   * Sets the last active time to the current time
   * @returns {void}
   */
  setLastActiveTime () {
    this._resetTimer()
  }

  /**
   * Sets the inactive timeout for the app
   * @param {number} timeoutMinutes - the inactive timeout in minutes
   * @returns {void}
   * @private
   */
  _setInactiveTimeout (timeoutMinutes) {
    this.store.updateState({
      timeoutMinutes,
    })

    this._resetTimer()
  }

  /**
   * Resets the internal inactive timer
   *
   * If the {@code timeoutMinutes} state is falsy (i.e., zero) then a new
   * timer will not be created.
   *
   * @returns {void}
   * @private
   */
  _resetTimer () {
    const { timeoutMinutes } = this.store.getState()

    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (!timeoutMinutes) {
      return
    }

    this.timer = setTimeout(() => this.onInactiveTimeout(), timeoutMinutes * 60 * 1000)
  }
}
