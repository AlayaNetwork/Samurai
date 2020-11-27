import assert from 'assert'
import sinon from 'sinon'
import NetworkController from '../../../app/scripts/controllers/network/index'
import TypedMessageManager from '../../../app/scripts/lib/typed-message-manager'

describe('Typed Message Manager', function () {
  let typedMessageManager, msgParamsV1, msgParamsV3, typedMsgs, messages, msgId, numberMsgId

  const address = '0xc42edfcc21ed14dda456aa0756c153f7985d8813'
  const networkController = new NetworkController()
  sinon.stub(networkController, 'getNetworkState').returns('1')

  beforeEach(function () {
    typedMessageManager = new TypedMessageManager({
      networkController,
    })

    msgParamsV1 = {
      from: address,
      data: [
        { type: 'string', name: 'unit test', value: 'hello there' },
        { type: 'uint32', name: 'A number, but not really a number', value: '$$$' },
      ],
    }

    msgParamsV3 = {
      from: address,
      data: JSON.stringify({
        'types': {
          'EIP712Domain': [
            { 'name': 'name', 'type': 'string' },
            { 'name': 'version', 'type': 'string' },
            { 'name': 'chainId', 'type': 'uint256' },
            { 'name': 'verifyingContract', 'type': 'address' },
          ],
          'Person': [
            { 'name': 'name', 'type': 'string' },
            { 'name': 'wallet', 'type': 'address' },
          ],
          'Mail': [
            { 'name': 'from', 'type': 'Person' },
            { 'name': 'to', 'type': 'Person' },
            { 'name': 'contents', 'type': 'string' },
          ],
        },
        'primaryType': 'Mail',
        'domain': {
          'name': 'Ether Mainl',
          'version': '1',
          'chainId': 1,
          'verifyingContract': '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        'message': {
          'from': {
            'name': 'Cow',
            'wallet': '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          'to': {
            'name': 'Bob',
            'wallet': '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          'contents': 'Hello, Bob!',
        },
      }),
    }

    typedMessageManager.addUnapprovedMessage(msgParamsV3, null, 'V3')
    typedMsgs = typedMessageManager.getUnapprovedMsgs()
    messages = typedMessageManager.messages
    msgId = Object.keys(typedMsgs)[0]
    messages[0].msgParams.metamaskId = parseInt(msgId)
    numberMsgId = parseInt(msgId)
  })

  it('supports version 1 of signedTypedData', function () {
    typedMessageManager.addUnapprovedMessage(msgParamsV1, null, 'V1')
    assert.equal(messages[messages.length - 1].msgParams.data, msgParamsV1.data)
  })

  it('has params address', function () {
    assert.equal(typedMsgs[msgId].msgParams.from, address)
  })

  it('adds to unapproved messages and sets status to unapproved', function () {
    assert.equal(typedMsgs[msgId].status, 'unapproved')
  })

  it('validates params', function () {
    assert.doesNotThrow(() => {
      typedMessageManager.validateParams(messages[0].msgParams)
    }, 'Does not throw with valid parameters')
  })

  it('gets unapproved by id', function () {
    const getMsg = typedMessageManager.getMsg(numberMsgId)
    assert.equal(getMsg.id, numberMsgId)
  })

  it('approves messages', async function () {
    const messageMetaMaskId = messages[0].msgParams
    typedMessageManager.approveMessage(messageMetaMaskId)
    assert.equal(messages[0].status, 'approved')
  })

  it('sets msg status to signed and adds a raw sig to message details', function () {
    typedMessageManager.setMsgStatusSigned(numberMsgId, 'raw sig')
    assert.equal(messages[0].status, 'signed')
    assert.equal(messages[0].rawSig, 'raw sig')
  })

  it('rejects message', function () {
    typedMessageManager.rejectMsg(numberMsgId)
    assert.equal(messages[0].status, 'rejected')
  })

})
