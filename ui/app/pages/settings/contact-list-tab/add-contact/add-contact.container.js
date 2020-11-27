import AddContact from './add-contact.component'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addToAddressBook, showQrScanner, qrCodeDetected } from '../../../../store/actions'
import {
  getQrCodeData,
} from '../../../../selectors'

const mapStateToProps = (state) => {
  return {
    qrCodeData: getQrCodeData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToAddressBook: (recipient, nickname) => dispatch(addToAddressBook(recipient, nickname)),
    scanQrCode: () => dispatch(showQrScanner()),
    qrCodeDetected: (data) => dispatch(qrCodeDetected(data)),
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AddContact)
