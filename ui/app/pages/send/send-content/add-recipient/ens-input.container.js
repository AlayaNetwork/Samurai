import { connect } from 'react-redux'
import EnsInput from './ens-input.component'
import {
  getCurrentNetwork,
  getCurrentHrp,
  getSendTo,
  getSendToNickname,
  getAddressBookEntry,
} from '../../../../selectors'

export default connect(
  (state) => {
    const selectedAddress = getSendTo(state)
    return {
      network: getCurrentNetwork(state),
      hrp: getCurrentHrp(state),
      selectedAddress,
      selectedName: getSendToNickname(state),
      contact: getAddressBookEntry(state, selectedAddress),
    }
  },
)(EnsInput)
