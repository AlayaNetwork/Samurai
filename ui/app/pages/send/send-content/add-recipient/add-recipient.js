import {
  REQUIRED_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_ERROR,
} from '../../send.constants'

import { isValidAddress, checkExistingAddresses } from '../../../../helpers/utils/util'
import contractMap from 'eth-contract-metadata'

export function getToErrorObject (to, hasHexData = false, network) {
  let toError = null
  if (!to) {
    if (!hasHexData) {
      toError = REQUIRED_ERROR
    }
  } else if (!isValidAddress(to, network) && !toError) {
    toError = INVALID_RECIPIENT_ADDRESS_ERROR
  }

  return { to: toError }
}

export function getToWarningObject (to, tokens = [], sendToken = null) {
  let toWarning = null
  if (sendToken && (to in contractMap || checkExistingAddresses(to, tokens))) {
    toWarning = KNOWN_RECIPIENT_ADDRESS_ERROR
  }
  return { to: toWarning }
}
