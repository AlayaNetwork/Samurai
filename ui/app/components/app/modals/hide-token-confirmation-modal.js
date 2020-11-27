import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../../store/actions'
import Identicon from '../../ui/identicon'

function mapStateToProps (state) {
  return {
    network: state.metamask.network,
    token: state.appState.modal.modalState.props.token,
    assetImages: state.metamask.assetImages,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    hideModal: () => dispatch(actions.hideModal()),
    hideToken: (address) => {
      dispatch(actions.removeToken(address))
        .then(() => {
          dispatch(actions.hideModal())
        })
    },
  }
}

class HideTokenConfirmationModal extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    hideToken: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    assetImages: PropTypes.object.isRequired,
    token: PropTypes.shape({
      symbol: PropTypes.string,
      address: PropTypes.string,
    }),
  }

  state = {}

  render () {
    const { token, hideToken, hideModal, assetImages } = this.props
    const { symbol, address } = token
    const image = assetImages[address]

    return (
      <div className="hide-token-confirmation">
        <div className="hide-token-confirmation__container">
          <div className="hide-token-confirmation__title">
            {this.context.t('hideTokenPrompt')}
          </div>
          <Identicon
            className="hide-token-confirmation__identicon"
            diameter={45}
            address={address}
            image={image}
          />
          <div className="hide-token-confirmation__symbol">{symbol}</div>
          <div className="hide-token-confirmation__copy">
            {this.context.t('readdToken')}
          </div>
          <div className="hide-token-confirmation__buttons">
            <button
              className="btn-default hide-token-confirmation__button btn--large"
              data-testid="hide-token-confirmation__cancel"
              onClick={() => hideModal()}
            >
              {this.context.t('cancel')}
            </button>
            <button
              className="btn-secondary hide-token-confirmation__button btn--large"
              data-testid="hide-token-confirmation__hide"
              onClick={() => hideToken(address)}
            >
              {this.context.t('hide')}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HideTokenConfirmationModal)
