import { connect } from 'react-redux'
import {
  getConversionRate,
  getGasTotal,
  getGasPrice,
  getGasLimit,
  getSendAmount,
  getSendFromBalance,
  getTokenBalance,
  getSendMaxModeState,
  getGasLoadingError,
  gasFeeIsInError,
  getGasButtonGroupShown,
  getAdvancedInlineGasShown,
  getCurrentEthBalance,
  getSendToken,
  getBasicGasEstimateLoadingStatus,
  getRenderableEstimateDataForSmallButtonsFromGWEI,
  getDefaultActiveButtonIndex,
  getIsMainnet,
} from '../../../../selectors'
import {
  isBalanceSufficient,
  calcGasTotal,
} from '../../send.utils.js'
import { calcMaxAmount } from '../send-amount-row/amount-max-button/amount-max-button.utils'
import {
  showGasButtonGroup,
  updateSendErrors,
} from '../../../../ducks/send/send.duck'
import {
  resetCustomData,
  setCustomGasPrice,
  setCustomGasLimit,
} from '../../../../ducks/gas/gas.duck'
import { showModal, setGasPrice, setGasLimit, setGasTotal, updateSendAmount } from '../../../../store/actions'
import SendGasRow from './send-gas-row.component'


export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SendGasRow)

function mapStateToProps (state) {
  const gasButtonInfo = getRenderableEstimateDataForSmallButtonsFromGWEI(state)
  const gasPrice = getGasPrice(state)
  const gasLimit = getGasLimit(state)
  const activeButtonIndex = getDefaultActiveButtonIndex(gasButtonInfo, gasPrice)

  const gasTotal = getGasTotal(state)
  const conversionRate = getConversionRate(state)
  const balance = getCurrentEthBalance(state)

  const insufficientBalance = !isBalanceSufficient({
    amount: getSendToken(state) ? '0x0' : getSendAmount(state),
    gasTotal,
    balance,
    conversionRate,
  })

  return {
    balance: getSendFromBalance(state),
    gasTotal,
    gasFeeError: gasFeeIsInError(state),
    gasLoadingError: getGasLoadingError(state),
    gasPriceButtonGroupProps: {
      buttonDataLoading: getBasicGasEstimateLoadingStatus(state),
      defaultActiveButtonIndex: 1,
      newActiveButtonIndex: activeButtonIndex > -1 ? activeButtonIndex : null,
      gasButtonInfo,
    },
    gasButtonGroupShown: getGasButtonGroupShown(state),
    advancedInlineGasShown: getAdvancedInlineGasShown(state),
    gasPrice,
    gasLimit,
    insufficientBalance,
    maxModeOn: getSendMaxModeState(state),
    sendToken: getSendToken(state),
    tokenBalance: getTokenBalance(state),
    isMainnet: getIsMainnet(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showCustomizeGasModal: () => dispatch(showModal({ name: 'CUSTOMIZE_GAS', hideBasic: true })),
    setGasPrice: (newPrice, gasLimit) => {
      dispatch(setGasPrice(newPrice))
      dispatch(setCustomGasPrice(newPrice))
      if (gasLimit) {
        dispatch(setGasTotal(calcGasTotal(gasLimit, newPrice)))
      }
    },
    setGasLimit: (newLimit, gasPrice) => {
      dispatch(setGasLimit(newLimit))
      dispatch(setCustomGasLimit(newLimit))
      if (gasPrice) {
        dispatch(setGasTotal(calcGasTotal(newLimit, gasPrice)))
      }
    },
    setAmountToMax: (maxAmountDataObject) => {
      dispatch(updateSendErrors({ amount: null }))
      dispatch(updateSendAmount(calcMaxAmount(maxAmountDataObject)))
    },
    showGasButtonGroup: () => dispatch(showGasButtonGroup()),
    resetCustomData: () => dispatch(resetCustomData()),
  }
}

function mergeProps (stateProps, dispatchProps, ownProps) {
  const { gasPriceButtonGroupProps } = stateProps
  const { gasButtonInfo } = gasPriceButtonGroupProps
  const {
    setGasPrice: dispatchSetGasPrice,
    showGasButtonGroup: dispatchShowGasButtonGroup,
    resetCustomData: dispatchResetCustomData,
    ...otherDispatchProps
  } = dispatchProps

  return {
    ...stateProps,
    ...otherDispatchProps,
    ...ownProps,
    gasPriceButtonGroupProps: {
      ...gasPriceButtonGroupProps,
      handleGasPriceSelection: dispatchSetGasPrice,
    },
    resetGasButtons: () => {
      dispatchResetCustomData()
      dispatchSetGasPrice(gasButtonInfo[1].priceInHexWei)
      dispatchShowGasButtonGroup()
    },
    setGasPrice: dispatchSetGasPrice,
  }
}
