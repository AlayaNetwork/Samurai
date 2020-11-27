import * as utils from './transactions.util'
import assert from 'assert'

describe('Transactions utils', function () {
  describe('getTokenData', function () {
    it('should return token data', function () {
      const tokenData = utils.getTokenData('0xa9059cbb00000000000000000000000050a9d56c2b8ba9a5c7f2c08c3d26e0499f23a7060000000000000000000000000000000000000000000000000000000000004e20')
      assert.ok(tokenData)
      const { name, params } = tokenData
      assert.equal(name, 'transfer')
      const [to, value] = params
      assert.equal(to.name, '_to')
      assert.equal(to.type, 'address')
      assert.equal(value.name, '_value')
      assert.equal(value.type, 'uint256')
    })

    it('should not throw errors when called without arguments', function () {
      assert.doesNotThrow(() => utils.getTokenData())
    })
  })

  describe('getStatusKey', function () {
    it('should return the correct status', function () {
      const tests = [
        {
          transaction: {
            status: 'confirmed',
            txReceipt: {
              status: '0x0',
            },
          },
          expected: 'failed',
        },
        {
          transaction: {
            status: 'confirmed',
            txReceipt: {
              status: '0x1',
            },
          },
          expected: 'confirmed',
        },
        {
          transaction: {
            status: 'pending',
          },
          expected: 'pending',
        },
      ]

      tests.forEach(({ transaction, expected }) => {
        assert.equal(utils.getStatusKey(transaction), expected)
      })
    })
  })

  describe('getBlockExplorerUrlForTx', function () {
    it('should return the correct block explorer url for a transaction', function () {
      const tests = [
        {
          expected: 'https://etherscan.io/tx/0xabcd',
          networkId: '1',
          hash: '0xabcd',
        },
        {
          expected: 'https://ropsten.etherscan.io/tx/0xdef0',
          networkId: '3',
          hash: '0xdef0',
          rpcPrefs: {},
        },
        {
          // test handling of `blockExplorerUrl` for a custom RPC
          expected: 'https://block.explorer/tx/0xabcd',
          networkId: '31',
          hash: '0xabcd',
          rpcPrefs: {
            blockExplorerUrl: 'https://block.explorer',
          },
        },
        {
          // test handling of trailing `/` in `blockExplorerUrl` for a custom RPC
          expected: 'https://another.block.explorer/tx/0xdef0',
          networkId: '33',
          hash: '0xdef0',
          rpcPrefs: {
            blockExplorerUrl: 'https://another.block.explorer/',
          },
        },
      ]

      tests.forEach(({ expected, networkId, hash, rpcPrefs }) => {
        assert.equal(utils.getBlockExplorerUrlForTx(networkId, hash, rpcPrefs), expected)
      })
    })
  })
})
