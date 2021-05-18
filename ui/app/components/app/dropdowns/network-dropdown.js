import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import * as actions from '../../../store/actions'
import { Dropdown, DropdownMenuItem } from './components/dropdown'
import NetworkDropdownIcon from './components/network-dropdown-icon'
import { NETWORKS_ROUTE } from '../../../helpers/constants/routes'

// classes from nodes of the toggle element.
const notToggleElementClassnames = [
  'menu-icon',
  'network-name',
  'network-indicator',
  'network-caret',
  'network-component',
]

function mapStateToProps (state) {
  return {
    provider: state.metamask.provider,
    frequentRpcListDetail: state.metamask.frequentRpcListDetail || [],
    networkDropdownOpen: state.appState.networkDropdownOpen,
    network: state.metamask.network,
    hrp: state.metamask.hrp !== 'loading' ? state.metamask.hrp : state.metamask.settings.hrp,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setProviderType: (type) => {
      dispatch(actions.setProviderType(type))
    },
    setRpcTarget: (target, network, hrp, ticker, nickname) => {
      dispatch(actions.setRpcTarget(target, network, hrp, ticker, nickname))
    },
    delRpcTarget: (target) => {
      dispatch(actions.delRpcTarget(target))
    },
    hideNetworkDropdown: () => dispatch(actions.hideNetworkDropdown()),
    setNetworksTabAddMode: (isInAddMode) => dispatch(actions.setNetworksTabAddMode(isInAddMode)),
  }
}

class NetworkDropdown extends Component {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  }

  static propTypes = {
    provider: PropTypes.shape({
      nickname: PropTypes.string,
      rpcTarget: PropTypes.string,
      type: PropTypes.string,
      ticker: PropTypes.string,
    }).isRequired,
    setProviderType: PropTypes.func.isRequired,
    network: PropTypes.string.isRequired,
    hrp: PropTypes.string.isRequired,
    setRpcTarget: PropTypes.func.isRequired,
    hideNetworkDropdown: PropTypes.func.isRequired,
    setNetworksTabAddMode: PropTypes.func.isRequired,
    frequentRpcListDetail: PropTypes.array.isRequired,
    networkDropdownOpen: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    delRpcTarget: PropTypes.func.isRequired,
  }

  handleClick (newProviderType) {
    const { provider: { type: providerType }, setProviderType } = this.props
    const { metricsEvent } = this.context

    metricsEvent({
      eventOpts: {
        category: 'Navigation',
        action: 'Home',
        name: 'Switched Networks',
      },
      customVariables: {
        fromNetwork: providerType,
        toNetwork: newProviderType,
      },
    })
    setProviderType(newProviderType)
  }

  renderCustomOption (provider) {
    const { rpcTarget, type, ticker, nickname } = provider
    const network = this.props.network
    const hrp = this.props.hrp

    if (type !== 'rpc') {
      return null
    }

    switch (rpcTarget) {

      case 'http://localhost:8545':
        return null

      default:
        return (
          <DropdownMenuItem
            key={rpcTarget}
            onClick={() => this.props.setRpcTarget(rpcTarget, network, hrp, ticker, nickname)}
            closeMenu={() => this.props.hideNetworkDropdown()}
            style={{
              fontSize: '16px',
              lineHeight: '20px',
              padding: '12px 0',
            }}
          >
            <i className="fa fa-check" />
            <i className="fa fa-question-circle fa-med menu-icon-circle" />
            <span
              className="network-name-item"
              style={{
                color: '#ffffff',
              }}
            >
              {nickname || rpcTarget}
            </span>
          </DropdownMenuItem>
        )
    }
  }

  renderCommonRpc (rpcListDetail, provider) {
    const reversedRpcListDetail = rpcListDetail.slice().reverse()

    return reversedRpcListDetail.map((entry) => {
      const rpc = entry.rpcUrl
      const ticker = entry.ticker || 'ATP'
      const nickname = entry.nickname || ''
      const currentRpcTarget = provider.type === 'rpc' && rpc === provider.rpcTarget

      if ((rpc === 'http://localhost:8545') || currentRpcTarget) {
        return null
      } else {
        const chainId = entry.chainId
        const hrp = entry.hrp
        return (
          <DropdownMenuItem
            key={`common${rpc}`}
            closeMenu={() => this.props.hideNetworkDropdown()}
            onClick={() => this.props.setRpcTarget(rpc, chainId, hrp, ticker, nickname)}
            style={{
              fontSize: '16px',
              lineHeight: '20px',
              padding: '12px 0',
            }}
          >
            {
              currentRpcTarget
                ? <i className="fa fa-check" />
                : <div className="network-check__transparent">✓</div>
            }
            <i className="fa fa-question-circle fa-med menu-icon-circle" />
            <span
              className="network-name-item"
              style={{
                color: currentRpcTarget
                  ? '#ffffff'
                  : '#9b9b9b',
              }}
            >
              {nickname || rpc}
            </span>
            <i
              className="fa fa-times delete"
              onClick={(e) => {
                e.stopPropagation()
                this.props.delRpcTarget(rpc)
              }}
            />
          </DropdownMenuItem>
        )
      }
    })
  }

  getNetworkName () {
    const { provider } = this.props
    const providerName = provider.type

    let name

    if (providerName === 'mainnet') {
      name = this.context.t('mainnet')
    } else if (providerName === 'platon_dev') {
      name = this.context.t('platon_dev')
    } else if (providerName === 'alaya') {
      name = this.context.t('alaya')
    } else if (providerName === 'alaya_dev') {
      name = this.context.t('alaya_dev')
    } else {
      name = provider.nickname || this.context.t('unknownNetwork')
    }

    return name
  }

  render () {
    const { provider: { type: providerType, rpcTarget: activeNetwork }, setNetworksTabAddMode } = this.props
    const rpcListDetail = this.props.frequentRpcListDetail
    const isOpen = this.props.networkDropdownOpen
    const dropdownMenuItemStyle = {
      fontSize: '16px',
      lineHeight: '20px',
      padding: '12px 0',
    }

    return (
      <Dropdown
        isOpen={isOpen}
        onClickOutside={(event) => {
          const { classList } = event.target
          const isInClassList = (className) => classList.contains(className)
          const notToggleElementIndex = notToggleElementClassnames.findIndex(isInClassList)

          if (notToggleElementIndex === -1) {
            this.props.hideNetworkDropdown()
          }
        }}
        containerClassName="network-droppo"
        zIndex={55}
        style={{
          position: 'absolute',
          top: '58px',
          width: '309px',
          zIndex: '55px',
        }}
        innerStyle={{
          padding: '18px 8px',
        }}
      >
        <div className="network-dropdown-header">
          <div className="network-dropdown-title">
            {this.context.t('networks')}
          </div>
          <div className="network-dropdown-divider" />
          <div className="network-dropdown-content">
            {this.context.t('defaultNetwork')}
          </div>
        </div>
        <DropdownMenuItem
          key="main"
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => this.handleClick('mainnet')}
          style={{ ...dropdownMenuItemStyle, borderColor: '#038789' }}
        >
          {
            providerType === 'mainnet'
              ? <i className="fa fa-check" />
              : <div className="network-check__transparent">✓</div>
          }
          <NetworkDropdownIcon backgroundColor="#29B6AF" isSelected={providerType === 'mainnet'} />
          <span
            className="network-name-item"
            style={{
              color: providerType === 'mainnet'
                ? '#ffffff'
                : '#9b9b9b',
            }}
          >
            {this.context.t('mainnet')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key="platon_dev"
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => this.handleClick('platon_dev')}
          style={dropdownMenuItemStyle}
        >
          {
            providerType === 'platon_dev'
              ? <i className="fa fa-check" />
              : <div className="network-check__transparent">✓</div>
          }
          <NetworkDropdownIcon backgroundColor="#ff4a8d" isSelected={providerType === 'platon_dev'} />
          <span
            className="network-name-item"
            style={{
              color: providerType === 'platon_dev'
                ? '#ffffff'
                : '#9b9b9b',
            }}
          >
            {this.context.t('platon_dev')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key="alaya"
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => this.handleClick('alaya')}
          style={dropdownMenuItemStyle}
        >
          {
            providerType === 'alaya'
              ? <i className="fa fa-check" />
              : <div className="network-check__transparent">✓</div>
          }
          <NetworkDropdownIcon backgroundColor="#7057ff" isSelected={providerType === 'alaya'} />
          <span
            className="network-name-item"
            style={{
              color: providerType === 'alaya'
                ? '#ffffff'
                : '#9b9b9b',
            }}
          >
            {this.context.t('alaya')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          key="alaya_dev"
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => this.handleClick('alaya_dev')}
          style={dropdownMenuItemStyle}
        >
          {
            providerType === 'alaya_dev'
              ? <i className="fa fa-check" />
              : <div className="network-check__transparent">✓</div>
          }
          <NetworkDropdownIcon backgroundColor="#f6c343" isSelected={providerType === 'alaya_dev'} />
          <span
            className="network-name-item"
            style={{
              color: providerType === 'alaya_dev'
                ? '#ffffff'
                : '#9b9b9b',
            }}
          >
            {this.context.t('alaya_dev')}
          </span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem*/}
        {/*  key="goerli"*/}
        {/*  closeMenu={() => this.props.hideNetworkDropdown()}*/}
        {/*  onClick={() => this.handleClick('goerli')}*/}
        {/*  style={dropdownMenuItemStyle}*/}
        {/* >*/}
        {/*  {*/}
        {/*    providerType === 'goerli'*/}
        {/*      ? <i className="fa fa-check" />*/}
        {/*      : <div className="network-check__transparent">✓</div>*/}
        {/*  }*/}
        {/*  <NetworkDropdownIcon backgroundColor="#3099f2" isSelected={providerType === 'goerli'} />*/}
        {/*  <span*/}
        {/*    className="network-name-item"*/}
        {/*    style={{*/}
        {/*      color: providerType === 'goerli'*/}
        {/*        ? '#ffffff'*/}
        {/*        : '#9b9b9b',*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {this.context.t('goerli')}*/}
        {/*  </span>*/}
        {/* </DropdownMenuItem>*/}
        {/* <DropdownMenuItem*/}
        {/*  key="default"*/}
        {/*  closeMenu={() => this.props.hideNetworkDropdown()}*/}
        {/*  onClick={() => this.handleClick('localhost')}*/}
        {/*  style={dropdownMenuItemStyle}*/}
        {/* >*/}
        {/*  {*/}
        {/*    providerType === 'localhost'*/}
        {/*      ? <i className="fa fa-check" />*/}
        {/*      : <div className="network-check__transparent">✓</div>*/}
        {/*  }*/}
        {/*  <NetworkDropdownIcon isSelected={providerType === 'localhost'} innerBorder="1px solid #9b9b9b" />*/}
        {/*  <span*/}
        {/*    className="network-name-item"*/}
        {/*    style={{*/}
        {/*      color: providerType === 'localhost'*/}
        {/*        ? '#ffffff'*/}
        {/*        : '#9b9b9b',*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {this.context.t('localhost')}*/}
        {/*  </span>*/}
        {/* </DropdownMenuItem>*/}
        {this.renderCustomOption(this.props.provider)}
        {this.renderCommonRpc(rpcListDetail, this.props.provider)}
        <DropdownMenuItem
          closeMenu={() => this.props.hideNetworkDropdown()}
          onClick={() => {
            setNetworksTabAddMode(true)
            this.props.history.push(NETWORKS_ROUTE)
          }}
          style={dropdownMenuItemStyle}
        >
          {
            activeNetwork === 'custom'
              ? <i className="fa fa-check" />
              : <div className="network-check__transparent">✓</div>
          }
          <NetworkDropdownIcon isSelected={activeNetwork === 'custom'} innerBorder="1px solid #9b9b9b" />
          <span
            className="network-name-item"
            style={{
              color: activeNetwork === 'custom'
                ? '#ffffff'
                : '#9b9b9b',
            }}
          >
            {this.context.t('customRPC')}
          </span>
        </DropdownMenuItem>
      </Dropdown>
    )
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(NetworkDropdown)
