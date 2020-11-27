import { connect } from 'react-redux'
import ConfirmTransactionSwitch from './confirm-transaction-switch.component'
import { unconfirmedTransactionsListSelector } from '../../selectors'

const mapStateToProps = (state, ownProps) => {
  const { metamask: { unapprovedTxs } } = state
  const { match: { params = {}, url } } = ownProps
  const urlId = url && url.match(/\d+/) && url.match(/\d+/)[0]
  const { id: paramsId } = params
  const transactionId = paramsId || urlId

  const unconfirmedTransactions = unconfirmedTransactionsListSelector(state)
  const totalUnconfirmed = unconfirmedTransactions.length
  const transaction = totalUnconfirmed
    ? unapprovedTxs[transactionId] || unconfirmedTransactions[0]
    : {}

  return {
    txData: transaction,
  }
}

export default connect(mapStateToProps)(ConfirmTransactionSwitch)
