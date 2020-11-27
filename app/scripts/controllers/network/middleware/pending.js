import { formatTxMetaForRpcResult } from '../util'
import createAsyncMiddleware from 'json-rpc-engine/src/createAsyncMiddleware'

export function createPendingNonceMiddleware ({ getPendingNonce }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method, params } = req
    if (method !== 'platon_getTransactionCount') {
      return next()
    }
    const [param, blockRef] = params
    if (blockRef !== 'pending') {
      return next()
    }
    res.result = await getPendingNonce(param)
  })
}

export function createPendingTxMiddleware ({ getPendingTransactionByHash }) {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method, params } = req
    if (method !== 'platon_getTransactionByHash') {
      return next()
    }
    const [hash] = params
    const txMeta = getPendingTransactionByHash(hash)
    if (!txMeta) {
      return next()
    }
    res.result = formatTxMetaForRpcResult(txMeta)
  })
}
