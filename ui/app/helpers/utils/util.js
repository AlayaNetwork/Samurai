import abi from 'human-standard-token-abi'
import ethUtil from '@alayanetwork/ethereumjs-util'
import { DateTime } from 'luxon'
import punycode from 'punycode'

// formatData :: ( date: <Unix Timestamp> ) -> String
export function formatDate (date, format = 'M/d/y \'at\' T') {
  return DateTime.fromMillis(date).toFormat(format)
}

export function formatDateWithYearContext (date, formatThisYear = 'MMM d', fallback = 'MMM d, y') {
  const dateTime = DateTime.fromMillis(date)
  const now = DateTime.local()
  return dateTime.toFormat(now.year === dateTime.year ? formatThisYear : fallback)
}

const valueTable = {
  wei: '1000000000000000000',
  kwei: '1000000000000000',
  mwei: '1000000000000',
  gwei: '1000000000',
  szabo: '1000000',
  finney: '1000',
  ether: '1',
  kether: '0.001',
  mether: '0.000001',
  gether: '0.000000001',
  tether: '0.000000000001',
}
const bnTable = {}
Object.keys(valueTable).forEach((currency) => {
  bnTable[currency] = new ethUtil.BN(valueTable[currency], 10)
})

export function isEthNetwork (netId) {
  if (!netId || netId === '1' || netId === '3' || netId === '4' || netId === '42' || netId === '5777') {
    return true
  }

  return false
}

export function valuesFor (obj) {
  if (!obj) {
    return []
  }
  return Object.keys(obj)
    .map(function (key) {
      return obj[key]
    })
}

export function addressSummary (address, firstSegLength = 10, lastSegLength = 4, includeHex = true) {
  if (!address) {
    return ''
  }
  // let checked = checksumAddress(address)
  let checked = address
  if (!includeHex) {
    checked = ethUtil.stripHexPrefix(checked)
  }
  return checked ? checked.slice(0, firstSegLength) + '...' + checked.slice(checked.length - lastSegLength) : '...'
}

export function isValidAddress (address, network) {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return false
  }
  let prefixAt
  if (!network) {
    prefixAt = address.startsWith('atx') || address.startsWith('atp')
  } else {
    prefixAt = address.startsWith(network === '201018' ? 'atp' : 'atx')
  }
  const prefixed = prefixAt ? address : ethUtil.addHexPrefix(address)
  if (prefixAt) {
    return ethUtil.isBech32Address(prefixed)
  }
  return false //(isAllOneCase(prefixed.slice(2)) && ethUtil.isValidAddress(prefixed)) || prefixed.toLowerCase()
}

export function isValidDomainName (address) {
  const match = punycode.toASCII(address)
    .toLowerCase()
    // Checks that the domain consists of at least one valid domain pieces separated by periods, followed by a tld
    // Each piece of domain name has only the characters a-z, 0-9, and a hyphen (but not at the start or end of chunk)
    // A chunk has minimum length of 1, but minimum tld is set to 2 for now (no 1-character tlds exist yet)
    .match(/^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/)
  return match !== null
}

export function isAllOneCase (address) {
  if (!address) {
    return true
  }
  const lower = address.toLowerCase()
  const upper = address.toUpperCase()
  return address === lower || address === upper
}

// Takes wei Hex, returns wei BN, even if input is null
export function numericBalance (balance) {
  if (!balance) {
    return new ethUtil.BN(0, 16)
  }
  const stripped = ethUtil.stripHexPrefix(balance)
  return new ethUtil.BN(stripped, 16)
}

// Takes  hex, returns [beforeDecimal, afterDecimal]
export function parseBalance (balance) {
  let afterDecimal
  const wei = numericBalance(balance)
  const weiString = wei.toString()
  const trailingZeros = /0+$/

  const beforeDecimal = weiString.length > 18 ? weiString.slice(0, weiString.length - 18) : '0'
  afterDecimal = ('000000000000000000' + wei).slice(-18).replace(trailingZeros, '')
  if (afterDecimal === '') {
    afterDecimal = '0'
  }
  return [beforeDecimal, afterDecimal]
}

// Takes wei hex, returns an object with three properties.
// Its "formatted" property is what we generally use to render values.
export function formatBalance (balance, decimalsToKeep, needsParse = true, ticker = 'ATP') {
  const parsed = needsParse ? parseBalance(balance) : balance.split('.')
  const beforeDecimal = parsed[0]
  let afterDecimal = parsed[1]
  let formatted = 'None'
  if (decimalsToKeep === undefined) {
    if (beforeDecimal === '0') {
      if (afterDecimal !== '0') {
        const sigFigs = afterDecimal.match(/^0*(.{2})/) // default: grabs 2 most significant digits
        if (sigFigs) {
          afterDecimal = sigFigs[0]
        }
        formatted = '0.' + afterDecimal + ` ${ticker}`
      }
    } else {
      formatted = beforeDecimal + '.' + afterDecimal.slice(0, 3) + ` ${ticker}`
    }
  } else {
    afterDecimal += Array(decimalsToKeep).join('0')
    formatted = beforeDecimal + '.' + afterDecimal.slice(0, decimalsToKeep) + ` ${ticker}`
  }
  return formatted
}

export function generateBalanceObject (formattedBalance, decimalsToKeep = 1) {
  let balance = formattedBalance.split(' ')[0]
  const label = formattedBalance.split(' ')[1]
  const beforeDecimal = balance.split('.')[0]
  const afterDecimal = balance.split('.')[1]
  const shortBalance = shortenBalance(balance, decimalsToKeep)

  if (beforeDecimal === '0' && afterDecimal.substr(0, 5) === '00000') {
    // eslint-disable-next-line eqeqeq
    if (afterDecimal == 0) {
      balance = '0'
    } else {
      balance = '<1.0e-5'
    }
  } else if (beforeDecimal !== '0') {
    balance = `${beforeDecimal}.${afterDecimal.slice(0, decimalsToKeep)}`
  }

  return { balance, label, shortBalance }
}

export function shortenBalance (balance, decimalsToKeep = 1) {
  let truncatedValue
  const convertedBalance = parseFloat(balance)
  if (convertedBalance > 1000000) {
    truncatedValue = (balance / 1000000).toFixed(decimalsToKeep)
    return `${truncatedValue}m`
  } else if (convertedBalance > 1000) {
    truncatedValue = (balance / 1000).toFixed(decimalsToKeep)
    return `${truncatedValue}k`
  } else if (convertedBalance === 0) {
    return '0'
  } else if (convertedBalance < 0.001) {
    return '<0.001'
  } else if (convertedBalance < 1) {
    const stringBalance = convertedBalance.toString()
    if (stringBalance.split('.')[1].length > 3) {
      return convertedBalance.toFixed(3)
    } else {
      return stringBalance
    }
  } else {
    return convertedBalance.toFixed(decimalsToKeep)
  }
}

// Takes a BN and an ethereum currency name,
// returns a BN in wei
export function normalizeToWei (amount, currency) {
  try {
    return amount.mul(bnTable.wei).div(bnTable[currency])
  } catch (e) {}
  return amount
}

export function normalizeEthStringToWei (str) {
  const parts = str.split('.')
  let eth = new ethUtil.BN(parts[0], 10).mul(bnTable.wei)
  if (parts[1]) {
    let decimal = parts[1]
    while (decimal.length < 18) {
      decimal += '0'
    }
    if (decimal.length > 18) {
      decimal = decimal.slice(0, 18)
    }
    const decimalBN = new ethUtil.BN(decimal, 10)
    eth = eth.add(decimalBN)
  }
  return eth
}

const multiple = new ethUtil.BN('10000', 10)
export function normalizeNumberToWei (n, currency) {
  const enlarged = n * 10000
  const amount = new ethUtil.BN(String(enlarged), 10)
  return normalizeToWei(amount, currency).div(multiple)
}

export function isHex (str) {
  return Boolean(str.match(/^(0x)?[0-9a-fA-F]+$/))
}

export function getContractAtAddress (tokenAddress) {
  return global.eth.contract(abi).at(tokenAddress)
}

export function getRandomFileName () {
  let fileName = ''
  const charBank = [
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  ]
  const fileNameLength = Math.floor((Math.random() * 7) + 6)

  for (let i = 0; i < fileNameLength; i++) {
    fileName += charBank[Math.floor(Math.random() * charBank.length)]
  }

  return fileName
}

export function exportAsFile (filename, data, type = 'text/csv') {
  filename = filename || getRandomFileName()
  // source: https://stackoverflow.com/a/33542499 by Ludovic Feltz
  const blob = new window.Blob([data], { type })
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const elem = window.document.createElement('a')
    elem.target = '_blank'
    elem.href = window.URL.createObjectURL(blob)
    elem.download = filename
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }
}

/**
 * Safely checksumms a potentially-null address
 *
 * @param {string} [address] - address to checksum
 * @returns {string} - checksummed address
 *
 */
export function checksumAddress (address) {
  const checksummed = address ? ethUtil.toChecksumAddress(address) : ''
  return checksummed
}

/**
 * Shortens an Ethereum address for display, preserving the beginning and end.
 * Returns the given address if it is no longer than 10 characters.
 * Shortened addresses are 13 characters long.
 *
 * Example output: 0xabcd...1234
 *
 * @param {string} address - The address to shorten.
 * @returns {string} The shortened address, or the original if it was no longer
 * than 10 characters.
 */
export function shortenAddress (address = '') {
  if (address.length < 11) {
    return address
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidAddressHead (hrp, address) {
  if (address.length <= 3 && hrp.startsWith(address)) {
    return true
  } else {
    const re = new RegExp('^a[t]{0,1}[' + hrp[2] + ']{1}[0-9a-z]{0,39}$', 'i')
    return re.test(address)
  }
}

export function getAccountByAddress (accounts = [], targetAddress) {
  return accounts.find(({ address }) => address === targetAddress)
}

/**
 * Strips the following schemes from URL strings:
 * - http
 * - https
 *
 * @param {string} urlString - The URL string to strip the scheme from.
 * @returns {string} The URL string, without the scheme, if it was stripped.
 */
export function stripHttpSchemes (urlString) {
  return urlString.replace(/^https?:\/\//u, '')
}

/**
 * Checks whether a URL-like value (object or string) is an extension URL.
 *
 * @param {string | URL | object} urlLike - The URL-like value to test.
 * @returns {boolean} Whether the URL-like value is an extension URL.
 */
export function isExtensionUrl (urlLike) {

  const EXT_PROTOCOLS = ['chrome-extension:', 'moz-extension:']

  if (typeof urlLike === 'string') {
    for (const protocol of EXT_PROTOCOLS) {
      if (urlLike.startsWith(protocol)) {
        return true
      }
    }
  }

  if (urlLike?.protocol) {
    return EXT_PROTOCOLS.includes(urlLike.protocol)
  }
  return false
}

/**
 * Checks whether an address is in a passed list of objects with address properties. The check is performed on the
 * lowercased version of the addresses.
 *
 * @param {string} address - The hex address to check
 * @param {array} list - The array of objects to check
 * @returns {boolean} Whether or not the address is in the list
 */
export function checkExistingAddresses (address, list = []) {
  if (!address) {
    return false
  }

  const matchesAddress = (obj) => {
    return obj.address.toLowerCase() === address.toLowerCase()
  }

  return list.some(matchesAddress)
}
