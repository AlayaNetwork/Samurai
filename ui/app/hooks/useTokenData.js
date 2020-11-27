import { useMemo } from 'react'
import { getTokenData } from '../helpers/utils/transactions.util'

/**
 * useTokenData
 * Given the data string from txParams return a decoded object of the details of the
 * transaction data.
 * @param {string}  [transactionData]    - Raw data string from token transaction
 * @param {boolean} [isTokenTransaction] - Due to the nature of hooks, it isn't possible
 *                                         to conditionally call this hook. This flag will
 *                                         force this hook to return null if it set as false
 *                                         which indicates the transaction is not associated
 *                                         with a token.
 * @return {Object} - Decoded token data
 */
export function useTokenData (transactionData, isTokenTransaction = true) {
  return useMemo(() => {
    if (!isTokenTransaction || !transactionData) {
      return null
    }
    return getTokenData(transactionData)
  }, [isTokenTransaction, transactionData])
}
