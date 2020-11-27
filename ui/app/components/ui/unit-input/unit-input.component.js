import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { removeLeadingZeroes } from '../../../pages/send/send.utils'

/**
 * Component that attaches a suffix or unit of measurement trailing user input, ex. 'ATP'. Also
 * allows rendering a child component underneath the input to, for example, display conversions of
 * the shown suffix.
 */
export default class UnitInput extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    actionComponent: PropTypes.node,
    error: PropTypes.bool,
    maxModeOn: PropTypes.bool,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    suffix: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }

  static defaultProps = {
    value: '',
    placeholder: '0',
  }

  state = {
    value: this.props.value,
  }

  componentDidUpdate (prevProps) {
    const { value: prevPropsValue } = prevProps
    const { value: propsValue } = this.props
    const { value: stateValue } = this.state

    if (prevPropsValue !== propsValue && propsValue !== stateValue) {
      this.setState({ value: propsValue })
    }
  }

  handleFocus = () => {
    this.unitInput.focus()
  }

  handleChange = (event) => {
    const { value: userInput } = event.target
    let value = userInput

    if (userInput.length && userInput.length > 1) {
      value = removeLeadingZeroes(userInput)
    }

    this.setState({ value })
    this.props.onChange(value)
  }

  getInputWidth (value) {
    const valueString = String(value)
    const valueLength = valueString.length || 1
    const decimalPointDeficit = valueString.match(/\./) ? -0.5 : 0
    return (valueLength + decimalPointDeficit + 0.5) + 'ch'
  }

  render () {
    const { error, placeholder, suffix, actionComponent, children, maxModeOn } = this.props
    const { value } = this.state

    return (
      <div
        className={classnames('unit-input', { 'unit-input--error': error }, { 'unit-input__disabled': maxModeOn })}
        onClick={maxModeOn ? null : this.handleFocus}
      >
        <div className="unit-input__inputs">
          <div className="unit-input__input-container">
            <input
              type="number"
              dir="ltr"
              className={classnames('unit-input__input', { 'unit-input__disabled': maxModeOn })}
              value={value}
              placeholder={placeholder}
              onChange={this.handleChange}
              style={{ width: this.getInputWidth(value) }}
              ref={(ref) => {
                this.unitInput = ref
              }}
              disabled={maxModeOn}
            />
            {
              suffix && (
                <div className="unit-input__suffix">
                  { suffix }
                </div>
              )
            }
          </div>
          { children }
        </div>
        {actionComponent}
      </div>
    )
  }
}
