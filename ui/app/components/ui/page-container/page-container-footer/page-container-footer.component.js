import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../../button'

export default class PageContainerFooter extends Component {

  static propTypes = {
    children: PropTypes.node,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    cancelButtonType: PropTypes.string,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    disabled: PropTypes.bool,
    submitButtonType: PropTypes.string,
    hideCancel: PropTypes.bool,
    buttonSizeLarge: PropTypes.bool,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  render () {
    const {
      children,
      onCancel,
      cancelText,
      onSubmit,
      submitText,
      disabled,
      submitButtonType,
      hideCancel,
      cancelButtonType,
      buttonSizeLarge = false,
    } = this.props

    return (
      <div className="page-container__footer">

        <footer>
          {!hideCancel && (
            <Button
              type={cancelButtonType || 'default'}
              large={buttonSizeLarge}
              className="page-container__footer-button"
              onClick={(e) => onCancel(e)}
              data-testid="page-container-footer-cancel"
            >
              { cancelText || this.context.t('cancel') }
            </Button>
          )}

          <Button
            type={submitButtonType || 'secondary'}
            large={buttonSizeLarge}
            className="page-container__footer-button"
            disabled={disabled}
            onClick={(e) => onSubmit(e)}
            data-testid="page-container-footer-next"
          >
            { submitText || this.context.t('next') }
          </Button>
        </footer>

        {children && (
          <div className="page-container__footer-secondary">
            {children}
          </div>
        )}

      </div>
    )
  }

}
