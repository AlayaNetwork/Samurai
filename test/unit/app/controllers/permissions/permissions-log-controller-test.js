import { strict as assert } from 'assert'
import ObservableStore from 'obs-store'
import nanoid from 'nanoid'
import { useFakeTimers } from 'sinon'

import PermissionsLogController
  from '../../../../../app/scripts/controllers/permissions/permissionsLog'

import {
  LOG_LIMIT,
  LOG_METHOD_TYPES,
} from '../../../../../app/scripts/controllers/permissions/enums'

import {
  validateActivityEntry,
} from './helpers'

import {
  constants,
  getters,
  noop,
} from './mocks'

const {
  PERMS,
  RPC_REQUESTS,
} = getters

const {
  ACCOUNTS,
  EXPECTED_HISTORIES,
  DOMAINS,
  PERM_NAMES,
  REQUEST_IDS,
  RESTRICTED_METHODS,
} = constants

let clock

const initPermLog = () => {
  return new PermissionsLogController({
    store: new ObservableStore(),
    restrictedMethods: RESTRICTED_METHODS,
  })
}

const mockNext = (handler) => {
  if (handler) {
    handler(noop)
  }
}

const initMiddleware = (permLog) => {
  const middleware = permLog.createMiddleware()
  return (req, res, next = mockNext) => {
    middleware(req, res, next)
  }
}

const initClock = () => {
  // useFakeTimers, is in fact, not a react-hook
  // eslint-disable-next-line
  clock = useFakeTimers(1)
}

const tearDownClock = () => {
  clock.restore()
}

const getSavedMockNext = (arr) => (handler) => {
  arr.push(handler)
}

describe('permissions log', function () {

  describe('activity log', function () {

    let permLog, logMiddleware

    beforeEach(function () {
      permLog = initPermLog()
      logMiddleware = initMiddleware(permLog)
    })

    it('records activity for restricted methods', function () {

      let log, req, res

      // test_method, success

      req = RPC_REQUESTS.test_method(DOMAINS.a.origin)
      req.id = REQUEST_IDS.a
      res = { foo: 'bar' }

      logMiddleware({ ...req }, res)

      log = permLog.getActivityLog()
      const entry1 = log[0]

      assert.equal(log.length, 1, 'log should have single entry')
      validateActivityEntry(
        entry1, { ...req }, { ...res },
        LOG_METHOD_TYPES.restricted, true,
      )

      // eth_accounts, failure

      req = RPC_REQUESTS.eth_accounts(DOMAINS.b.origin)
      req.id = REQUEST_IDS.b
      res = { error: new Error('Unauthorized.') }

      logMiddleware({ ...req }, res)

      log = permLog.getActivityLog()
      const entry2 = log[1]

      assert.equal(log.length, 2, 'log should have 2 entries')
      validateActivityEntry(
        entry2, { ...req }, { ...res },
        LOG_METHOD_TYPES.restricted, false,
      )

      // eth_requestAccounts, success

      req = RPC_REQUESTS.eth_requestAccounts(DOMAINS.c.origin)
      req.id = REQUEST_IDS.c
      res = { result: ACCOUNTS.c.permitted }

      logMiddleware({ ...req }, res)

      log = permLog.getActivityLog()
      const entry3 = log[2]

      assert.equal(log.length, 3, 'log should have 3 entries')
      validateActivityEntry(
        entry3, { ...req }, { ...res },
        LOG_METHOD_TYPES.restricted, true,
      )

      // test_method, no response

      req = RPC_REQUESTS.test_method(DOMAINS.a.origin)
      req.id = REQUEST_IDS.a
      res = null

      logMiddleware({ ...req }, res)

      log = permLog.getActivityLog()
      const entry4 = log[3]

      assert.equal(log.length, 4, 'log should have 4 entries')
      validateActivityEntry(
        entry4, { ...req }, null,
        LOG_METHOD_TYPES.restricted, false,
      )

      // validate final state

      assert.equal(entry1, log[0], 'first log entry should remain')
      assert.equal(entry2, log[1], 'second log entry should remain')
      assert.equal(entry3, log[2], 'third log entry should remain')
      assert.equal(entry4, log[3], 'fourth log entry should remain')
    })

    it('handles responses added out of order', function () {

      let log

      const handlerArray = []

      const id1 = nanoid()
      const id2 = nanoid()
      const id3 = nanoid()

      const req = RPC_REQUESTS.test_method(DOMAINS.a.origin)

      // get make requests
      req.id = id1
      const res1 = { foo: id1 }
      logMiddleware({ ...req }, { ...res1 }, getSavedMockNext(handlerArray))

      req.id = id2
      const res2 = { foo: id2 }
      logMiddleware({ ...req }, { ...res2 }, getSavedMockNext(handlerArray))

      req.id = id3
      const res3 = { foo: id3 }
      logMiddleware({ ...req }, { ...res3 }, getSavedMockNext(handlerArray))

      // verify log state
      log = permLog.getActivityLog()
      assert.equal(log.length, 3, 'log should have 3 entries')
      const entry1 = log[0]
      const entry2 = log[1]
      const entry3 = log[2]
      assert.ok(
        (
          entry1.id === id1 && entry1.response === null &&
          entry2.id === id2 && entry2.response === null &&
          entry3.id === id3 && entry3.response === null
        ),
        'all entries should be in correct order and without responses',
      )

      // call response handlers
      for (const i of [1, 2, 0]) {
        handlerArray[i](noop)
      }

      // verify log state again
      log = permLog.getActivityLog()
      assert.equal(log.length, 3, 'log should have 3 entries')

      // verify all entries
      log = permLog.getActivityLog()

      validateActivityEntry(
        log[0], { ...req, id: id1 }, { ...res1 },
        LOG_METHOD_TYPES.restricted, true,
      )

      validateActivityEntry(
        log[1], { ...req, id: id2 }, { ...res2 },
        LOG_METHOD_TYPES.restricted, true,
      )

      validateActivityEntry(
        log[2], { ...req, id: id3 }, { ...res3 },
        LOG_METHOD_TYPES.restricted, true,
      )
    })

    it('handles a lack of response', function () {

      let req = RPC_REQUESTS.test_method(DOMAINS.a.origin)
      req.id = REQUEST_IDS.a
      let res = { foo: 'bar' }

      // noop for next handler prevents recording of response
      logMiddleware({ ...req }, res, noop)

      let log = permLog.getActivityLog()
      const entry1 = log[0]

      assert.equal(log.length, 1, 'log should have single entry')
      validateActivityEntry(
        entry1, { ...req }, null,
        LOG_METHOD_TYPES.restricted, true,
      )

      // next request should be handled as normal
      req = RPC_REQUESTS.eth_accounts(DOMAINS.b.origin)
      req.id = REQUEST_IDS.b
      res = { result: ACCOUNTS.b.permitted }

      logMiddleware({ ...req }, res)

      log = permLog.getActivityLog()
      const entry2 = log[1]
      assert.equal(log.length, 2, 'log should have 2 entries')
      validateActivityEntry(
        entry2, { ...req }, { ...res },
        LOG_METHOD_TYPES.restricted, true,
      )

      // validate final state
      assert.equal(entry1, log[0], 'first log entry remains')
      assert.equal(entry2, log[1], 'second log entry remains')
    })

    it('ignores expected methods', function () {

      let log = permLog.getActivityLog()
      assert.equal(log.length, 0, 'log should be empty')

      const res = { foo: 'bar' }
      const req1 = RPC_REQUESTS.wallet_sendDomainMetadata(DOMAINS.c.origin, 'foobar')
      const req2 = RPC_REQUESTS.custom(DOMAINS.b.origin, 'eth_getBlockNumber')
      const req3 = RPC_REQUESTS.custom(DOMAINS.b.origin, 'net_version')

      logMiddleware(req1, res)
      logMiddleware(req2, res)
      logMiddleware(req3, res)

      log = permLog.getActivityLog()
      assert.equal(log.length, 0, 'log should still be empty')
    })

    it('enforces log limit', function () {

      const req = RPC_REQUESTS.test_method(DOMAINS.a.origin)
      const res = { foo: 'bar' }

      // max out log
      let lastId
      for (let i = 0; i < LOG_LIMIT; i++) {
        lastId = nanoid()
        logMiddleware({ ...req, id: lastId }, { ...res })
      }

      // check last entry valid
      let log = permLog.getActivityLog()
      assert.equal(
        log.length, LOG_LIMIT, 'log should have LOG_LIMIT num entries',
      )

      validateActivityEntry(
        log[LOG_LIMIT - 1], { ...req, id: lastId }, res,
        LOG_METHOD_TYPES.restricted, true,
      )

      // store the id of the current second entry
      const nextFirstId = log[1]['id']

      // add one more entry to log, putting it over the limit
      lastId = nanoid()
      logMiddleware({ ...req, id: lastId }, { ...res })

      // check log length
      log = permLog.getActivityLog()
      assert.equal(
        log.length, LOG_LIMIT, 'log should have LOG_LIMIT num entries',
      )

      // check first and last entries
      validateActivityEntry(
        log[0], { ...req, id: nextFirstId }, res,
        LOG_METHOD_TYPES.restricted, true,
      )

      validateActivityEntry(
        log[LOG_LIMIT - 1], { ...req, id: lastId }, res,
        LOG_METHOD_TYPES.restricted, true,
      )
    })
  })

  describe('permissions history', function () {

    let permLog, logMiddleware

    beforeEach(function () {
      permLog = initPermLog()
      logMiddleware = initMiddleware(permLog)
      initClock()
    })

    afterEach(function () {
      tearDownClock()
    })

    it('only updates history on responses', function () {

      let permHistory

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.test_method,
      )
      const res = { result: [ PERMS.granted.test_method() ] }

      // noop => no response
      logMiddleware({ ...req }, { ...res }, noop)

      permHistory = permLog.getHistory()
      assert.deepEqual(permHistory, {}, 'history should not have been updated')

      // response => records granted permissions
      logMiddleware({ ...req }, { ...res })

      permHistory = permLog.getHistory()
      assert.equal(
        Object.keys(permHistory).length, 1,
        'history should have single origin',
      )
      assert.ok(
        Boolean(permHistory[DOMAINS.a.origin]),
        'history should have expected origin',
      )
    })

    it('ignores malformed permissions requests', function () {

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.test_method,
      )
      delete req.params
      const res = { result: [ PERMS.granted.test_method() ] }

      // no params => no response
      logMiddleware({ ...req }, { ...res })

      assert.deepEqual(permLog.getHistory(), {}, 'history should not have been updated')
    })

    it('records and updates account history as expected', async function () {

      let permHistory

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.eth_accounts,
      )
      const res = {
        result: [ PERMS.granted.eth_accounts(ACCOUNTS.a.permitted) ],
      }

      logMiddleware({ ...req }, { ...res })

      // validate history

      permHistory = permLog.getHistory()

      assert.deepEqual(
        permHistory,
        EXPECTED_HISTORIES.case1[0],
        'should have correct history',
      )

      // mock permission requested again, with another approved account

      clock.tick(1)

      res.result = [ PERMS.granted.eth_accounts([ ACCOUNTS.a.permitted[0] ]) ]

      logMiddleware({ ...req }, { ...res })

      permHistory = permLog.getHistory()

      assert.deepEqual(
        permHistory,
        EXPECTED_HISTORIES.case1[1],
        'should have correct history',
      )
    })

    it('handles eth_accounts response without caveats', async function () {

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.eth_accounts,
      )
      const res = {
        result: [ PERMS.granted.eth_accounts(ACCOUNTS.a.permitted) ],
      }
      delete res.result[0].caveats

      logMiddleware({ ...req }, { ...res })

      // validate history

      assert.deepEqual(
        permLog.getHistory(), EXPECTED_HISTORIES.case2[0],
        'should have expected history',
      )
    })

    it('handles extra caveats for eth_accounts', async function () {

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.eth_accounts,
      )
      const res = {
        result: [ PERMS.granted.eth_accounts(ACCOUNTS.a.permitted) ],
      }
      res.result[0].caveats.push({ foo: 'bar' })

      logMiddleware({ ...req }, { ...res })

      // validate history

      assert.deepEqual(
        permLog.getHistory(),
        EXPECTED_HISTORIES.case1[0],
        'should have correct history',
      )
    })

    // wallet_requestPermissions returns all permissions approved for the
    // requesting origin, including old ones
    it('handles unrequested permissions on the response', async function () {

      const req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.eth_accounts,
      )
      const res = {
        result: [
          PERMS.granted.eth_accounts(ACCOUNTS.a.permitted),
          PERMS.granted.test_method(),
        ],
      }

      logMiddleware({ ...req }, { ...res })

      // validate history

      assert.deepEqual(
        permLog.getHistory(),
        EXPECTED_HISTORIES.case1[0],
        'should have correct history',
      )
    })

    it('does not update history if no new permissions are approved', async function () {

      let req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.test_method,
      )
      let res = {
        result: [
          PERMS.granted.test_method(),
        ],
      }

      logMiddleware({ ...req }, { ...res })

      // validate history

      assert.deepEqual(
        permLog.getHistory(),
        EXPECTED_HISTORIES.case4[0],
        'should have correct history',
      )

      // new permission requested, but not approved

      clock.tick(1)

      req = RPC_REQUESTS.requestPermission(
        DOMAINS.a.origin, PERM_NAMES.eth_accounts,
      )
      res = {
        result: [
          PERMS.granted.test_method(),
        ],
      }

      logMiddleware({ ...req }, { ...res })

      // validate history

      assert.deepEqual(
        permLog.getHistory(),
        EXPECTED_HISTORIES.case4[0],
        'should have same history as before',
      )
    })

    it('records and updates history for multiple origins, regardless of response order', async function () {

      let permHistory

      // make first round of requests

      const round1 = []
      const handlers1 = []

      // first origin
      round1.push({
        req: RPC_REQUESTS.requestPermission(
          DOMAINS.a.origin, PERM_NAMES.test_method,
        ),
        res: {
          result: [ PERMS.granted.test_method() ],
        },
      })

      // second origin
      round1.push({
        req: RPC_REQUESTS.requestPermission(
          DOMAINS.b.origin, PERM_NAMES.eth_accounts,
        ),
        res: {
          result: [ PERMS.granted.eth_accounts(ACCOUNTS.b.permitted) ],
        },
      })

      // third origin
      round1.push({
        req: RPC_REQUESTS.requestPermissions(DOMAINS.c.origin, {
          [PERM_NAMES.test_method]: {},
          [PERM_NAMES.eth_accounts]: {},
        }),
        res: {
          result: [
            PERMS.granted.test_method(),
            PERMS.granted.eth_accounts(ACCOUNTS.c.permitted),
          ],
        },
      })

      // make requests and process responses out of order
      round1.forEach((x) => {
        logMiddleware({ ...x.req }, { ...x.res }, getSavedMockNext(handlers1))
      })

      for (const i of [1, 2, 0]) {
        handlers1[i](noop)
      }

      // validate history
      permHistory = permLog.getHistory()

      assert.deepEqual(
        permHistory, EXPECTED_HISTORIES.case3[0],
        'should have expected history',
      )

      // make next round of requests

      clock.tick(1)

      const round2 = []
      // we're just gonna process these in order

      // first origin
      round2.push({
        req: RPC_REQUESTS.requestPermission(
          DOMAINS.a.origin, PERM_NAMES.test_method,
        ),
        res: {
          result: [ PERMS.granted.test_method() ],
        },
      })

      // nothing for second origin

      // third origin
      round2.push({
        req: RPC_REQUESTS.requestPermissions(DOMAINS.c.origin, {
          [PERM_NAMES.eth_accounts]: {},
        }),
        res: {
          result: [
            PERMS.granted.eth_accounts(ACCOUNTS.b.permitted),
          ],
        },
      })

      // make requests
      round2.forEach((x) => {
        logMiddleware({ ...x.req }, { ...x.res })
      })

      // validate history
      permHistory = permLog.getHistory()

      assert.deepEqual(
        permHistory, EXPECTED_HISTORIES.case3[1],
        'should have expected history',
      )
    })
  })
})
