import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class TokenListPlaceholder extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  render () {
    return (
      <div className="token-list-placeholder">
        <img src="images/tokensearch.svg" />
        <div className="token-list-placeholder__text">
          { this.context.t('addAcquiredTokens') }
        </div>
        <a
          className="token-list-placeholder__link"
          href="https://metamask.zendesk.com/hc/en-us/articles/360015489031"
          target="_blank"
          rel="noopener noreferrer"
        >
          { this.context.t('learnMore') }
        </a>
      </div>
    )
  }
}
