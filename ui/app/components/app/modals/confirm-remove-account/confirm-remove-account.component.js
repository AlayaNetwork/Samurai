import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from '../../modal'
import { addressSummary } from '../../../../helpers/utils/util'
import Identicon from '../../../ui/identicon'
import genAccountLink from '../../../../../lib/account-link'

export default class ConfirmRemoveAccount extends Component {
  static propTypes = {
    hideModal: PropTypes.func.isRequired,
    removeAccount: PropTypes.func.isRequired,
    identity: PropTypes.object.isRequired,
    network: PropTypes.string.isRequired,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  handleRemove = () => {
    this.props.removeAccount(this.props.identity.address)
      .then(() => this.props.hideModal())
  }

  handleCancel = () => {
    this.props.hideModal()
  }

  renderSelectedAccount () {
    const { identity } = this.props
    return (
      <div className="confirm-remove-account__account">
        <div className="confirm-remove-account__account__identicon">
          <Identicon
            address={identity.address}
            diameter={32}
          />
        </div>
        <div className="confirm-remove-account__account__name">
          <span className="confirm-remove-account__account__label">Name</span>
          <span className="account_value">{identity.name}</span>
        </div>
        <div className="confirm-remove-account__account__address">
          <span className="confirm-remove-account__account__label">Public Address</span>
          <span className="account_value">{ addressSummary(identity.address, 4, 4) }</span>
        </div>
        <div className="confirm-remove-account__account__link">
          <a
            className=""
            href={genAccountLink(identity.address, this.props.network)}
            target="_blank"
            rel="noopener noreferrer"
            title={this.context.t('etherscanView')}
          >
            <img src="images/popout.svg" />
          </a>
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.context

    return (
      <Modal
        headerText={`${t('removeAccount')}?`}
        onClose={this.handleCancel}
        onSubmit={this.handleRemove}
        onCancel={this.handleCancel}
        submitText={t('remove')}
        cancelText={t('nevermind')}
        submitType="secondary"
      >
        <div>
          { this.renderSelectedAccount() }
          <div className="confirm-remove-account__description">
            { t('removeAccountDescription') }
            <a
              className="confirm-remove-account__link"
              rel="noopener noreferrer"
              target="_blank"
              href="https://metamask.zendesk.com/hc/en-us/articles/360015289932"
            >
              { t('learnMore') }
            </a>
          </div>
        </div>
      </Modal>
    )
  }
}
