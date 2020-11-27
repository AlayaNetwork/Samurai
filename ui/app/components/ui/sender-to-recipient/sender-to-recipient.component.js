import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Identicon from '../identicon'
import Tooltip from '../tooltip-v2'
import copyToClipboard from 'copy-to-clipboard'
import { DEFAULT_VARIANT, CARDS_VARIANT, FLAT_VARIANT } from './sender-to-recipient.constants'
import { shortenAddress } from '../../../helpers/utils/util'
import AccountMismatchWarning from '../account-mismatch-warning/account-mismatch-warning.component'
import { useI18nContext } from '../../../hooks/useI18nContext'


const variantHash = {
  [DEFAULT_VARIANT]: 'sender-to-recipient--default',
  [CARDS_VARIANT]: 'sender-to-recipient--cards',
  [FLAT_VARIANT]: 'sender-to-recipient--flat',
}

function SenderAddress ({
  addressOnly,
  checksummedSenderAddress,
  senderName,
  onSenderClick,
  senderAddress,
  warnUserOnAccountMismatch,
}) {
  const t = useI18nContext()
  const [addressCopied, setAddressCopied] = useState(false)
  let tooltipHtml = <p>{t('copiedExclamation')}</p>
  if (!addressCopied) {
    tooltipHtml = addressOnly
      ? <p>{t('copyAddress')}</p>
      : (
        <p>
          {shortenAddress(checksummedSenderAddress)}<br />
          {t('copyAddress')}
        </p>
      )
  }
  return (
    <div
      className={classnames('sender-to-recipient__party sender-to-recipient__party--sender')}
      onClick={() => {
        setAddressCopied(true)
        copyToClipboard(checksummedSenderAddress)
        if (onSenderClick) {
          onSenderClick()
        }
      }}
    >
      {!addressOnly && (
        <div className="sender-to-recipient__sender-icon">
          <Identicon
            address={senderAddress}
            diameter={24}
          />
        </div>
      )}
      <Tooltip
        position="bottom"
        html={tooltipHtml}
        wrapperClassName="sender-to-recipient__tooltip-wrapper"
        containerClassName="sender-to-recipient__tooltip-container"
        onHidden={() => setAddressCopied(false)}
      >
        <div className="sender-to-recipient__name">
          {
            addressOnly
              ? <span>{`${t('from')}: ${senderName || checksummedSenderAddress}`}</span>
              : senderName
          }
        </div>
      </Tooltip>
      {warnUserOnAccountMismatch && <AccountMismatchWarning address={senderAddress} />}
    </div>
  )
}

SenderAddress.propTypes = {
  senderName: PropTypes.string,
  checksummedSenderAddress: PropTypes.string,
  addressOnly: PropTypes.bool,
  senderAddress: PropTypes.string,
  onSenderClick: PropTypes.func,
  warnUserOnAccountMismatch: PropTypes.bool,
}

function RecipientWithAddress ({
  checksummedRecipientAddress,
  assetImage,
  onRecipientClick,
  addressOnly,
  recipientNickname,
  recipientEns,
  recipientName,
}) {
  const t = useI18nContext()
  const [addressCopied, setAddressCopied] = useState(false)

  let tooltipHtml = <p>{t('copiedExclamation')}</p>
  if (!addressCopied) {
    if (addressOnly && !recipientNickname && !recipientEns) {
      tooltipHtml = <p>{t('copyAddress')}</p>
    } else {
      tooltipHtml = (
        <p>
          {shortenAddress(checksummedRecipientAddress)}<br />
          {t('copyAddress')}
        </p>
      )
    }
  }
  return (
    <div
      className="sender-to-recipient__party sender-to-recipient__party--recipient sender-to-recipient__party--recipient-with-address"
      onClick={() => {
        setAddressCopied(true)
        copyToClipboard(checksummedRecipientAddress)
        if (onRecipientClick) {
          onRecipientClick()
        }
      }}
    >
      {!addressOnly && (
        <div className="sender-to-recipient__sender-icon">
          <Identicon
            address={checksummedRecipientAddress}
            diameter={24}
            image={assetImage}
          />
        </div>
      )}
      <Tooltip
        position="bottom"
        html={tooltipHtml}
        offset={-10}
        wrapperClassName="sender-to-recipient__tooltip-wrapper"
        containerClassName="sender-to-recipient__tooltip-container"
        onHidden={() => setAddressCopied(false)}
      >
        <div className="sender-to-recipient__name">
          <span>{ addressOnly ? `${t('to')}: ` : '' }</span>
          {
            addressOnly
              ? (recipientNickname || recipientEns || checksummedRecipientAddress)
              : (recipientNickname || recipientEns || recipientName || t('newContract'))
          }
        </div>
      </Tooltip>
    </div>
  )
}

RecipientWithAddress.propTypes = {
  checksummedRecipientAddress: PropTypes.string,
  recipientName: PropTypes.string,
  recipientEns: PropTypes.string,
  recipientNickname: PropTypes.string,
  addressOnly: PropTypes.bool,
  assetImage: PropTypes.string,
  onRecipientClick: PropTypes.func,
}


function Arrow ({ variant }) {
  return variant === DEFAULT_VARIANT
    ? (
      <div className="sender-to-recipient__arrow-container">
        <div className="sender-to-recipient__arrow-circle">
          <img
            height={15}
            width={15}
            src="./images/arrow-right.svg"
          />
        </div>
      </div>
    ) : (
      <div className="sender-to-recipient__arrow-container">
        <img
          height={20}
          src="./images/caret-right.svg"
        />
      </div>
    )
}

Arrow.propTypes = {
  variant: PropTypes.oneOf([DEFAULT_VARIANT, CARDS_VARIANT, FLAT_VARIANT]),
}

export default function SenderToRecipient ({
  senderAddress,
  addressOnly,
  assetImage,
  senderName,
  recipientNickname,
  recipientName,
  recipientEns,
  onRecipientClick,
  onSenderClick,
  recipientAddress,
  variant,
  warnUserOnAccountMismatch,
}) {
  const t = useI18nContext()
  const checksummedSenderAddress = senderAddress.toLowerCase()
  const checksummedRecipientAddress = recipientAddress

  return (
    <div className={classnames('sender-to-recipient', variantHash[variant])}>
      <SenderAddress
        checksummedSenderAddress={checksummedSenderAddress}
        addressOnly={addressOnly}
        senderName={senderName}
        onSenderClick={onSenderClick}
        senderAddress={senderAddress}
        warnUserOnAccountMismatch={warnUserOnAccountMismatch}
      />
      <Arrow variant={variant} />
      {recipientAddress
        ? (
          <RecipientWithAddress
            assetImage={assetImage}
            checksummedRecipientAddress={checksummedRecipientAddress}
            onRecipientClick={onRecipientClick}
            addressOnly={addressOnly}
            recipientNickname={recipientNickname}
            recipientEns={recipientEns}
            recipientName={recipientName}
          />
        )
        : (
          <div className="sender-to-recipient__party sender-to-recipient__party--recipient">
            { !addressOnly && <i className="fa fa-file-text-o" /> }
            <div className="sender-to-recipient__name">
              {t('newContract') }
            </div>
          </div>
        )
      }
    </div>
  )
}

SenderToRecipient.defaultProps = {
  variant: DEFAULT_VARIANT,
  warnUserOnAccountMismatch: true,
}

SenderToRecipient.propTypes = {
  senderName: PropTypes.string,
  senderAddress: PropTypes.string,
  recipientName: PropTypes.string,
  recipientEns: PropTypes.string,
  recipientAddress: PropTypes.string,
  recipientNickname: PropTypes.string,
  variant: PropTypes.oneOf([DEFAULT_VARIANT, CARDS_VARIANT, FLAT_VARIANT]),
  addressOnly: PropTypes.bool,
  assetImage: PropTypes.string,
  onRecipientClick: PropTypes.func,
  onSenderClick: PropTypes.func,
  warnUserOnAccountMismatch: PropTypes.bool,
}
