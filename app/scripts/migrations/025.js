// next version number
const version = 25

/*

normalizes txParams on unconfirmed txs

*/
import ethUtil from '@alayanetwork/ethereumjs-util'

import { cloneDeep } from 'lodash'

export default {
  version,

  migrate: async function (originalVersionedData) {
    const versionedData = cloneDeep(originalVersionedData)
    versionedData.meta.version = version
    const state = versionedData.data
    const newState = transformState(state)
    versionedData.data = newState
    return versionedData
  },
}

function transformState (state) {
  const newState = state

  if (newState.TransactionController) {
    if (newState.TransactionController.transactions) {
      const transactions = newState.TransactionController.transactions
      newState.TransactionController.transactions = transactions.map((txMeta) => {
        if (txMeta.status !== 'unapproved') {
          return txMeta
        }
        txMeta.txParams = normalizeTxParams(txMeta.txParams)
        return txMeta
      })
    }
  }

  return newState
}

function normalizeTxParams (txParams) {
  // functions that handle normalizing of that key in txParams
  const whiteList = {
    from: (from) => ethUtil.addHexPrefix(from).toLowerCase(),
    to: () => ethUtil.addHexPrefix(txParams.to).toLowerCase(),
    nonce: (nonce) => ethUtil.addHexPrefix(nonce),
    value: (value) => ethUtil.addHexPrefix(value),
    data: (data) => ethUtil.addHexPrefix(data),
    gas: (gas) => ethUtil.addHexPrefix(gas),
    gasPrice: (gasPrice) => ethUtil.addHexPrefix(gasPrice),
  }

  // apply only keys in the whiteList
  const normalizedTxParams = {}
  Object.keys(whiteList).forEach((key) => {
    if (txParams[key]) {
      normalizedTxParams[key] = whiteList[key](txParams[key])
    }
  })

  return normalizedTxParams
}
