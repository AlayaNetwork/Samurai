import { connect } from 'react-redux'
import { hideModal, hideWarning } from '../../../../store/actions'
import { getSelectedIdentity } from '../../../../selectors'
import AccountModalContainer from './account-modal-container.component'

function mapStateToProps (state, ownProps) {
  return {
    selectedIdentity: ownProps.selectedIdentity || getSelectedIdentity(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    hideModal: () => {
      dispatch(hideWarning())
      dispatch(hideModal())
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountModalContainer)
