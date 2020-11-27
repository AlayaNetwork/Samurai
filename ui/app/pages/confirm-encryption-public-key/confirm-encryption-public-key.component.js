import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AccountListItem from '../send/account-list-item/account-list-item.component'
import Button from '../../components/ui/button'
import Identicon from '../../components/ui/identicon'

import { ENVIRONMENT_TYPE_NOTIFICATION } from '../../../../app/scripts/lib/enums'
import { getEnvironmentType } from '../../../../app/scripts/lib/util'
import { conversionUtil } from '../../helpers/utils/conversion-util'

export default class ConfirmEncryptionPublicKey extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
    metricsEvent: PropTypes.func.isRequired,
  }

  static propTypes = {
    fromAccount: PropTypes.shape({
      address: PropTypes.string.isRequired,
      balance: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    clearConfirmTransaction: PropTypes.func.isRequired,
    cancelEncryptionPublicKey: PropTypes.func.isRequired,
    encryptionPublicKey: PropTypes.func.isRequired,
    conversionRate: PropTypes.number,
    history: PropTypes.object.isRequired,
    requesterAddress: PropTypes.string,
    txData: PropTypes.object,
    domainMetadata: PropTypes.object,
    mostRecentOverviewPage: PropTypes.string.isRequired,
  }

  state = {
    fromAccount: this.props.fromAccount,
  }

  componentDidMount = () => {
    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION) {
      window.addEventListener('beforeunload', this._beforeUnload)
    }
  }

  componentWillUnmount = () => {
    this._removeBeforeUnload()
  }

  _beforeUnload = async (event) => {
    const {
      clearConfirmTransaction,
      cancelEncryptionPublicKey,
      txData,
    } = this.props
    const { metricsEvent } = this.context
    await cancelEncryptionPublicKey(txData, event)
    metricsEvent({
      eventOpts: {
        category: 'Messages',
        action: 'Encryption public key Request',
        name: 'Cancel Via Notification Close',
      },
    })
    clearConfirmTransaction()
  }

  _removeBeforeUnload = () => {
    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION) {
      window.removeEventListener('beforeunload', this._beforeUnload)
    }
  }

  renderHeader = () => {
    return (
      <div className="request-encryption-public-key__header">
        <div className="request-encryption-public-key__header-background" />

        <div className="request-encryption-public-key__header__text">
          { this.context.t('encryptionPublicKeyRequest') }
        </div>

        <div className="request-encryption-public-key__header__tip-container">
          <div className="request-encryption-public-key__header__tip" />
        </div>
      </div>
    )
  }

  renderAccount = () => {
    const { fromAccount } = this.state
    const { t } = this.context

    return (
      <div className="request-encryption-public-key__account">
        <div className="request-encryption-public-key__account-text">
          { `${t('account')}:` }
        </div>

        <div className="request-encryption-public-key__account-item">
          <AccountListItem
            account={fromAccount}
            displayBalance={false}
          />
        </div>
      </div>
    )
  }

  renderBalance = () => {
    const { conversionRate } = this.props
    const { t } = this.context
    const { fromAccount: { balance } } = this.state

    const balanceInEther = conversionUtil(balance, {
      fromNumericBase: 'hex',
      toNumericBase: 'dec',
      fromDenomination: 'WEI',
      numberOfDecimals: 6,
      conversionRate,
    })

    return (
      <div className="request-encryption-public-key__balance">
        <div className="request-encryption-public-key__balance-text">
          { `${t('balance')}:` }
        </div>
        <div className="request-encryption-public-key__balance-value">
          { `${balanceInEther} ATP` }
        </div>
      </div>
    )
  }

  renderRequestIcon = () => {
    const { requesterAddress } = this.props

    return (
      <div className="request-encryption-public-key__request-icon">
        <Identicon
          diameter={40}
          address={requesterAddress}
        />
      </div>
    )
  }

  renderAccountInfo = () => {
    return (
      <div className="request-encryption-public-key__account-info">
        { this.renderAccount() }
        { this.renderRequestIcon() }
        { this.renderBalance() }
      </div>
    )
  }

  renderBody = () => {
    const { domainMetadata, txData } = this.props
    const { t } = this.context

    const origin = domainMetadata[txData.origin]
    const notice = t('encryptionPublicKeyNotice', [origin.name])

    return (
      <div className="request-encryption-public-key__body">
        { this.renderAccountInfo() }
        <div
          className="request-encryption-public-key__visual"
        >
          <section>
            {origin.icon ? (
              <img
                className="request-encryption-public-key__visual-identicon"
                src={origin.icon}
              />
            ) : (
              <i className="request-encryption-public-key__visual-identicon--default">
                {origin.name.charAt(0).toUpperCase()}
              </i>
            )}
            <div
              className="request-encryption-public-key__notice"
            >
              { notice }
            </div>
          </section>
        </div>
      </div>
    )
  }

  renderFooter = () => {
    const {
      cancelEncryptionPublicKey,
      clearConfirmTransaction,
      encryptionPublicKey,
      history,
      mostRecentOverviewPage,
      txData,
    } = this.props
    const { t, metricsEvent } = this.context

    return (
      <div className="request-encryption-public-key__footer">
        <Button
          type="default"
          large
          className="request-encryption-public-key__footer__cancel-button"
          onClick={async (event) => {
            this._removeBeforeUnload()
            await cancelEncryptionPublicKey(txData, event)
            metricsEvent({
              eventOpts: {
                category: 'Messages',
                action: 'Encryption public key Request',
                name: 'Cancel',
              },
            })
            clearConfirmTransaction()
            history.push(mostRecentOverviewPage)
          }}
        >
          { this.context.t('cancel') }
        </Button>
        <Button
          type="secondary"
          large
          className="request-encryption-public-key__footer__sign-button"
          onClick={async (event) => {
            this._removeBeforeUnload()
            await encryptionPublicKey(txData, event)
            this.context.metricsEvent({
              eventOpts: {
                category: 'Messages',
                action: 'Encryption public key Request',
                name: 'Confirm',
              },
            })
            clearConfirmTransaction()
            history.push(mostRecentOverviewPage)
          }}
        >
          { t('provide') }
        </Button>
      </div>
    )
  }

  render = () => {
    return (
      <div className="request-encryption-public-key__container">
        { this.renderHeader() }
        { this.renderBody() }
        { this.renderFooter() }
      </div>
    )
  }
}
