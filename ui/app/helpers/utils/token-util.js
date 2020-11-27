import log from 'loglevel'
import * as util from './util'
import BigNumber from 'bignumber.js'
import contractMap from 'eth-contract-metadata'
import { conversionUtil, multiplyCurrencies } from './conversion-util'
import { formatCurrency } from './confirm-tx.util'
import { toBech32Address } from '@alayanetwork/ethereumjs-util'

const casedContractMap = Object.keys(contractMap).reduce((acc, base) => {
  return {
    ...acc,
    [base.toLowerCase()]: contractMap[base],
  }
}, {})

const DEFAULT_SYMBOL = ''
const DEFAULT_DECIMALS = '0'

async function getSymbolFromContract (tokenAddress) {
  const token = util.getContractAtAddress(tokenAddress)

  try {
    const result = await token.symbol()
    return result[0]
  } catch (error) {
    log.warn(`symbol() call for token at address ${tokenAddress} resulted in error:`, error)
  }
}

async function getDecimalsFromContract (tokenAddress) {
  const token = util.getContractAtAddress(tokenAddress)

  try {
    const result = await token.decimals()
    const decimalsBN = result[0]
    return decimalsBN && decimalsBN.toString()
  } catch (error) {
    log.warn(`decimals() call for token at address ${tokenAddress} resulted in error:`, error)
  }
}

function getContractMetadata (tokenAddress) {
  return tokenAddress && casedContractMap[tokenAddress.toLowerCase()]
}

async function getSymbol (tokenAddress) {
  let symbol = await getSymbolFromContract(tokenAddress)

  if (!symbol) {
    const contractMetadataInfo = getContractMetadata(tokenAddress)

    if (contractMetadataInfo) {
      symbol = contractMetadataInfo.symbol
    }
  }

  return symbol
}

async function getDecimals (tokenAddress) {
  let decimals = await getDecimalsFromContract(tokenAddress)

  if (!decimals || decimals === '0') {
    const contractMetadataInfo = getContractMetadata(tokenAddress)

    if (contractMetadataInfo) {
      decimals = contractMetadataInfo.decimals
    }
  }

  return decimals
}

export async function fetchSymbolAndDecimals (tokenAddress) {
  let symbol, decimals

  try {
    symbol = await getSymbol(tokenAddress)
    decimals = await getDecimals(tokenAddress)
  } catch (error) {
    log.warn(`symbol() and decimal() calls for token at address ${tokenAddress} resulted in error:`, error)
  }

  return {
    symbol: symbol || DEFAULT_SYMBOL,
    decimals: decimals || DEFAULT_DECIMALS,
  }
}

export async function getSymbolAndDecimals (tokenAddress, existingTokens = []) {
  const existingToken = existingTokens.find(({ address }) => tokenAddress === address)

  if (existingToken) {
    return {
      symbol: existingToken.symbol,
      decimals: existingToken.decimals,
    }
  }

  let symbol, decimals

  try {
    symbol = await getSymbol(tokenAddress)
    decimals = await getDecimals(tokenAddress)
  } catch (error) {
    log.warn(`symbol() and decimal() calls for token at address ${tokenAddress} resulted in error:`, error)
  }

  return {
    symbol: symbol || DEFAULT_SYMBOL,
    decimals: decimals || DEFAULT_DECIMALS,
  }
}

export function tokenInfoGetter () {
  const tokens = {}

  return async (address) => {
    if (tokens[address]) {
      return tokens[address]
    }

    tokens[address] = await getSymbolAndDecimals(address)

    return tokens[address]
  }
}

export function calcTokenAmount (value, decimals) {
  const multiplier = Math.pow(10, Number(decimals || 0))
  return new BigNumber(String(value)).div(multiplier)
}

export function calcTokenValue (value, decimals) {
  const multiplier = Math.pow(10, Number(decimals || 0))
  return new BigNumber(String(value)).times(multiplier)
}

export function getTokenValue (tokenParams = []) {
  const valueData = tokenParams.find((param) => param.name === '_value')
  return valueData && valueData.value
}

export function getTokenToAddress (tokenParams = [], hrp) {
  const toAddressData = tokenParams.find((param) => param.name === '_to')
  const addr = toAddressData ? toAddressData.value : tokenParams[0].value
  return toBech32Address(hrp, addr)
}

/**
 * Get the token balance converted to fiat and formatted for display
 *
 * @param {number} [contractExchangeRate] - The exchange rate between the current token and the native currency
 * @param {number} conversionRate - The exchange rate between the current fiat currency and the native currency
 * @param {string} currentCurrency - The currency code for the user's chosen fiat currency
 * @param {string} [tokenAmount] - The current token balance
 * @param {string} [tokenSymbol] - The token symbol
 * @returns {string|undefined} The formatted token amount in the user's chosen fiat currency
 */
export function getFormattedTokenFiatAmount (
  contractExchangeRate,
  conversionRate,
  currentCurrency,
  tokenAmount,
  tokenSymbol,
) {
  // If the conversionRate is 0 (i.e. unknown) or the contract exchange rate
  // is currently unknown, the fiat amount cannot be calculated so it is not
  // shown to the user
  if (conversionRate <= 0 || !contractExchangeRate || tokenAmount === undefined) {
    return undefined
  }

  const currentTokenToFiatRate = multiplyCurrencies(
    contractExchangeRate,
    conversionRate,
  )
  const currentTokenInFiat = conversionUtil(tokenAmount, {
    fromNumericBase: 'dec',
    fromCurrency: tokenSymbol,
    toCurrency: currentCurrency.toUpperCase(),
    numberOfDecimals: 2,
    conversionRate: currentTokenToFiatRate,
  })
  return `${formatCurrency(currentTokenInFiat, currentCurrency)} ${currentCurrency.toUpperCase()}`
}
