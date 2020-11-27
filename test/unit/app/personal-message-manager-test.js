import assert from 'assert'
import PersonalMessageManager from '../../../app/scripts/lib/personal-message-manager'

describe('Personal Message Manager', function () {
  let messageManager

  beforeEach(function () {
    messageManager = new PersonalMessageManager()
  })

  describe('#getMsgList', function () {
    it('when new should return empty array', function () {
      const result = messageManager.messages
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 0)
    })
    it('should also return transactions from local storage if any', function () {

    })
  })

  describe('#addMsg', function () {
    it('adds a Msg returned in getMsgList', function () {
      const Msg = { id: 1, status: 'approved', metamaskNetworkId: 'unit test' }
      messageManager.addMsg(Msg)
      const result = messageManager.messages
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.equal(result[0].id, 1)
    })
  })

  describe('#setMsgStatusApproved', function () {
    it('sets the Msg status to approved', function () {
      const Msg = { id: 1, status: 'unapproved', metamaskNetworkId: 'unit test' }
      messageManager.addMsg(Msg)
      messageManager.setMsgStatusApproved(1)
      const result = messageManager.messages
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.equal(result[0].status, 'approved')
    })
  })

  describe('#rejectMsg', function () {
    it('sets the Msg status to rejected', function () {
      const Msg = { id: 1, status: 'unapproved', metamaskNetworkId: 'unit test' }
      messageManager.addMsg(Msg)
      messageManager.rejectMsg(1)
      const result = messageManager.messages
      assert.ok(Array.isArray(result))
      assert.equal(result.length, 1)
      assert.equal(result[0].status, 'rejected')
    })
  })

  describe('#_updateMsg', function () {
    it('replaces the Msg with the same id', function () {
      messageManager.addMsg({ id: '1', status: 'unapproved', metamaskNetworkId: 'unit test' })
      messageManager.addMsg({ id: '2', status: 'approved', metamaskNetworkId: 'unit test' })
      messageManager._updateMsg({ id: '1', status: 'blah', hash: 'foo', metamaskNetworkId: 'unit test' })
      const result = messageManager.getMsg('1')
      assert.equal(result.hash, 'foo')
    })
  })

  describe('#getUnapprovedMsgs', function () {
    it('returns unapproved Msgs in a hash', function () {
      messageManager.addMsg({ id: '1', status: 'unapproved', metamaskNetworkId: 'unit test' })
      messageManager.addMsg({ id: '2', status: 'approved', metamaskNetworkId: 'unit test' })
      const result = messageManager.getUnapprovedMsgs()
      assert.equal(typeof result, 'object')
      assert.equal(result['1'].status, 'unapproved')
      assert.equal(result['2'], undefined)
    })
  })

  describe('#getMsg', function () {
    it('returns a Msg with the requested id', function () {
      messageManager.addMsg({ id: '1', status: 'unapproved', metamaskNetworkId: 'unit test' })
      messageManager.addMsg({ id: '2', status: 'approved', metamaskNetworkId: 'unit test' })
      assert.equal(messageManager.getMsg('1').status, 'unapproved')
      assert.equal(messageManager.getMsg('2').status, 'approved')
    })
  })

  describe('#normalizeMsgData', function () {
    it('converts text to a utf8 hex string', function () {
      const input = 'hello'
      const output = messageManager.normalizeMsgData(input)
      assert.equal(output, '0x68656c6c6f', 'predictably hex encoded')
    })

    it('tolerates a hex prefix', function () {
      const input = '0x12'
      const output = messageManager.normalizeMsgData(input)
      assert.equal(output, '0x12', 'un modified')
    })

    it('tolerates normal hex', function () {
      const input = '12'
      const output = messageManager.normalizeMsgData(input)
      assert.equal(output, '0x12', 'adds prefix')
    })
  })
})
