import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class InfoTab extends PureComponent {
  state = {
    version: global.platform.getVersion(),
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  renderInfoLinks () {
    const { t } = this.context

    return (
      <div className="settings-page__content-item settings-page__content-item--without-height">
        <div className="info-tab__link-header">
          { t('links') }
        </div>
        <div className="info-tab__link-item">
          <a
            href="https://www.alaya.network/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="info-tab__link-text">
              { t('privacyMsg') }
            </span>
          </a>
        </div>
        <div className="info-tab__link-item">
          <a
            href="https://samurai.alaya.network/samurai-agreement/agreement.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="info-tab__link-text">
              { t('terms') }
            </span>
          </a>
        </div>
        <hr className="info-tab__separator" />
        <div className="info-tab__link-item">
          <a
            href="https://alaya.network/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="info-tab__link-text">
              { t('visitWebSite') }
            </span>
          </a>
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.context

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <div className="settings-page__content-item settings-page__content-item--without-height">
            <div className="info-tab__logo-wrapper">
              <img
                src="images/icon-128.svg"
                className="info-tab__logo"
              />
            </div>
            <div className="info-tab__item">
              <div className="info-tab__version-header">
                { t('metamaskVersion') }
              </div>
              <div className="info-tab__version-number">
                { this.state.version }
              </div>
            </div>
            <div className="info-tab__item">
              <div className="info-tab__about">
                { t('buildInShenzhen') }
              </div>
            </div>
          </div>
          { this.renderInfoLinks() }
        </div>
      </div>
    )
  }
}
