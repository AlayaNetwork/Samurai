import { connect } from 'react-redux'
import SendAssetRow from './send-asset-row.component'
import { getMetaMaskAccounts, getSendTokenAddress } from '../../../../selectors'
import { updateSendToken } from '../../../../store/actions'

function mapStateToProps (state) {
  return {
    tokens: state.metamask.tokens,
    selectedAddress: state.metamask.selectedAddress,
    sendTokenAddress: getSendTokenAddress(state),
    accounts: getMetaMaskAccounts(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setSendToken: (token) => dispatch(updateSendToken(token)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendAssetRow)
