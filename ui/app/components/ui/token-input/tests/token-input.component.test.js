import React from 'react'
import PropTypes from 'prop-types'
import assert from 'assert'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import TokenInput from '../token-input.component'
import UnitInput from '../../unit-input'
import CurrencyDisplay from '../../currency-display'

describe('TokenInput Component', function () {
  const t = (key) => `translate ${key}`

  describe('rendering', function () {
    it('should render properly', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)

      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
          />
        </Provider>,
        { context: { t },
          childContextTypes: {
            t: PropTypes.func,
          },
        },
      )

      assert.ok(wrapper)
      assert.equal(wrapper.find('.unit-input__suffix').length, 1)
      assert.equal(wrapper.find('.unit-input__suffix').text(), 'ABC')
      assert.equal(wrapper.find('.currency-input__conversion-component').length, 1)
      assert.equal(wrapper.find('.currency-input__conversion-component').text(), 'translate noConversionRateAvailable')
    })

    it('should render properly with tokenExchangeRates', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)

      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
          />
        </Provider>,
        { context: { t },
          childContextTypes: {
            t: PropTypes.func,
          },
        },
      )

      assert.ok(wrapper)
      assert.equal(wrapper.find('.unit-input__suffix').length, 1)
      assert.equal(wrapper.find('.unit-input__suffix').text(), 'ABC')
      assert.equal(wrapper.find(CurrencyDisplay).length, 1)
    })

    it('should render properly with a token value for ETH', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)

      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            value="2710"
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
          />
        </Provider>,
      )

      assert.ok(wrapper)
      const tokenInputInstance = wrapper.find(TokenInput).at(0).instance()
      assert.equal(tokenInputInstance.state.decimalValue, 1)
      assert.equal(tokenInputInstance.state.hexValue, '2710')
      assert.equal(wrapper.find('.unit-input__suffix').length, 1)
      assert.equal(wrapper.find('.unit-input__suffix').text(), 'ABC')
      assert.equal(wrapper.find('.unit-input__input').props().value, '1')
      assert.equal(wrapper.find('.currency-display-component').text(), '2ETH')
    })

    it('should render properly with a token value for fiat', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)

      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            value="2710"
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
            showFiat
          />
        </Provider>,
      )

      assert.ok(wrapper)
      const tokenInputInstance = wrapper.find(TokenInput).at(0).instance()
      assert.equal(tokenInputInstance.state.decimalValue, 1)
      assert.equal(tokenInputInstance.state.hexValue, '2710')
      assert.equal(wrapper.find('.unit-input__suffix').length, 1)
      assert.equal(wrapper.find('.unit-input__suffix').text(), 'ABC')
      assert.equal(wrapper.find('.unit-input__input').props().value, '1')
      assert.equal(wrapper.find('.currency-display-component').text(), '$462.12USD')
    })

    it('should render properly with a token value for fiat, but hideConversion is true', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)

      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            value="2710"
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
            showFiat
            hideConversion
          />
        </Provider>,
        {
          context: { t },
          childContextTypes: {
            t: PropTypes.func,
          },
        },
      )

      assert.ok(wrapper)
      const tokenInputInstance = wrapper.find(TokenInput).at(0).instance()
      assert.equal(tokenInputInstance.state.decimalValue, 1)
      assert.equal(tokenInputInstance.state.hexValue, '2710')
      assert.equal(wrapper.find('.unit-input__suffix').length, 1)
      assert.equal(wrapper.find('.unit-input__suffix').text(), 'ABC')
      assert.equal(wrapper.find('.unit-input__input').props().value, '1')
      assert.equal(wrapper.find('.currency-input__conversion-component').text(), 'translate noConversionRateAvailable')
    })
  })

  describe('handling actions', function () {
    const handleChangeSpy = sinon.spy()
    const handleBlurSpy = sinon.spy()

    afterEach(function () {
      handleChangeSpy.resetHistory()
      handleBlurSpy.resetHistory()
    })

    it('should call onChange on input changes with the hex value for ETH', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)
      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            onChange={handleChangeSpy}
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
          />
        </Provider>,
      )

      assert.ok(wrapper)
      assert.equal(handleChangeSpy.callCount, 0)
      assert.equal(handleBlurSpy.callCount, 0)

      const tokenInputInstance = wrapper.find(TokenInput).at(0).instance()
      assert.equal(tokenInputInstance.state.decimalValue, 0)
      assert.equal(tokenInputInstance.state.hexValue, undefined)
      assert.equal(wrapper.find('.currency-display-component').text(), '0ETH')
      const input = wrapper.find('input')
      assert.equal(input.props().value, 0)

      input.simulate('change', { target: { value: 1 } })
      assert.equal(handleChangeSpy.callCount, 1)
      assert.ok(handleChangeSpy.calledWith('2710'))
      assert.equal(wrapper.find('.currency-display-component').text(), '2ETH')
      assert.equal(tokenInputInstance.state.decimalValue, 1)
      assert.equal(tokenInputInstance.state.hexValue, '2710')
    })

    it('should call onChange on input changes with the hex value for fiat', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)
      const wrapper = mount(
        <Provider store={store}>
          <TokenInput
            onChange={handleChangeSpy}
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
            showFiat
          />
        </Provider>,
      )

      assert.ok(wrapper)
      assert.equal(handleChangeSpy.callCount, 0)
      assert.equal(handleBlurSpy.callCount, 0)

      const tokenInputInstance = wrapper.find(TokenInput).at(0).instance()
      assert.equal(tokenInputInstance.state.decimalValue, 0)
      assert.equal(tokenInputInstance.state.hexValue, undefined)
      assert.equal(wrapper.find('.currency-display-component').text(), '$0.00USD')
      const input = wrapper.find('input')
      assert.equal(input.props().value, 0)

      input.simulate('change', { target: { value: 1 } })
      assert.equal(handleChangeSpy.callCount, 1)
      assert.ok(handleChangeSpy.calledWith('2710'))
      assert.equal(wrapper.find('.currency-display-component').text(), '$462.12USD')
      assert.equal(tokenInputInstance.state.decimalValue, 1)
      assert.equal(tokenInputInstance.state.hexValue, '2710')
    })

    it('should change the state and pass in a new decimalValue when props.value changes', function () {
      const mockStore = {
        metamask: {
          currentCurrency: 'usd',
          conversionRate: 231.06,
        },
      }
      const store = configureMockStore()(mockStore)
      const wrapper = shallow(
        <Provider store={store}>
          <TokenInput
            onChange={handleChangeSpy}
            token={{
              address: '0x1',
              decimals: 4,
              symbol: 'ABC',
            }}
            tokenExchangeRates={{ '0x1': 2 }}
            showFiat
          />
        </Provider>,
      )

      assert.ok(wrapper)
      const tokenInputInstance = wrapper.find(TokenInput).dive()
      assert.equal(tokenInputInstance.state('decimalValue'), 0)
      assert.equal(tokenInputInstance.state('hexValue'), undefined)
      assert.equal(tokenInputInstance.find(UnitInput).props().value, 0)

      tokenInputInstance.setProps({ value: '2710' })
      tokenInputInstance.update()
      assert.equal(tokenInputInstance.state('decimalValue'), 1)
      assert.equal(tokenInputInstance.state('hexValue'), '2710')
      assert.equal(tokenInputInstance.find(UnitInput).props().value, 1)
    })
  })
})
