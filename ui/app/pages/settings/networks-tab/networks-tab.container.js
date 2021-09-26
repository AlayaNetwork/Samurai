import NetworksTab from './networks-tab.component'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  setSelectedSettingsRpcUrl,
  updateAndSetCustomRpc,
  displayWarning,
  setNetworksTabAddMode,
  editRpc,
  showModal,
} from '../../../store/actions'
import { defaultNetworksData } from './networks-tab.constants'

const defaultNetworks = defaultNetworksData.map((network) => ({ ...network, viewOnly: true }))

const mapStateToProps = (state) => {
  const {
    frequentRpcListDetail,
    provider,
  } = state.metamask
  const {
    networksTabSelectedRpcUrl,
    networksTabIsInAddMode,
  } = state.appState

  const frequentRpcNetworkListDetails = frequentRpcListDetail.map((rpc) => {
    return {
      label: rpc.nickname,
      iconColor: '#6A737D',
      providerType: 'rpc',
      rpcUrl: rpc.rpcUrl,
      chainId: rpc.chainId,
      hrp: rpc.hrp,
      ticker: rpc.ticker,
      blockExplorerUrl: (rpc.rpcPrefs && rpc.rpcPrefs.blockExplorerUrl) || '',
    }
  })

  const networksToRender = [ ...defaultNetworks, ...frequentRpcNetworkListDetails ]
  let selectedNetwork = networksToRender.find((network) => network.rpcUrl === networksTabSelectedRpcUrl) || {}
  const networkIsSelected = Boolean(selectedNetwork.rpcUrl)

  let networkDefaultedToProvider = false
  if (!networkIsSelected && !networksTabIsInAddMode) {
    selectedNetwork = networksToRender.find((network) => {
      return network.rpcUrl === provider.rpcTarget || (network.providerType !== 'rpc' && network.providerType === provider.type)
    }) || {}
    networkDefaultedToProvider = true
  }

  return {
    selectedNetwork,
    networksToRender,
    networkIsSelected,
    networksTabIsInAddMode,
    providerType: provider.type,
    providerUrl: provider.rpcTarget,
    networkDefaultedToProvider,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setSelectedSettingsRpcUrl: (newRpcUrl) => dispatch(setSelectedSettingsRpcUrl(newRpcUrl)),
    setRpcTarget: (newRpc, chainId, hrp, ticker, nickname, rpcPrefs) => {
      dispatch(updateAndSetCustomRpc(newRpc, chainId, hrp, ticker, nickname, rpcPrefs))
    },
    showConfirmDeleteNetworkModal: ({ target, onConfirm }) => {
      return dispatch(showModal({ name: 'CONFIRM_DELETE_NETWORK', target, onConfirm }))
    },
    displayWarning: (warning) => dispatch(displayWarning(warning)),
    setNetworksTabAddMode: (isInAddMode) => dispatch(setNetworksTabAddMode(isInAddMode)),
    editRpc: (oldRpc, newRpc, chainId, hrp, ticker, nickname, rpcPrefs) => {
      dispatch(editRpc(oldRpc, newRpc, chainId, hrp, ticker, nickname, rpcPrefs))
    },
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NetworksTab)
