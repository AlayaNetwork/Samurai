// export const ROPSTEN = 'ropsten'
// export const RINKEBY = 'rinkeby'
// export const KOVAN = 'kovan'
export const MAINNET = 'mainnet'
export const PLATON_DEV = 'platon_dev'
export const ALAYA = 'alaya'
export const ALAYA_DEV = 'alaya_dev'
export const LOCALHOST = 'localhost'

export const MAINNET_NETWORK_ID = '1021'
export const PLATON_DEV_NETWORK_ID = '210309'
export const ALAYA_NETWORK_ID = '201018'
export const ALAYA_DEV_NETWORK_ID = '201030'

export const MAINNET_CHAIN_ID = '0x3fd'
export const PLATON_DEV_CHAIN_ID = '0x33585'
export const ALAYA_CHAIN_ID = '0x3113A'
export const ALAYA_DEV_CHAIN_ID = '0x31146'

export const MAINNET_DISPLAY_NAME = 'Main PlatON Network'
export const PLATON_DEV_DISPLAY_NAME = 'PlatON dev Network'
export const ALAYA_DISPLAY_NAME = 'Alaya Network'
export const ALAYA_DEV_DISPLAY_NAME = 'Alaya dev Network'

export const INFURA_PROVIDER_TYPES = [
  MAINNET,
  PLATON_DEV,
  ALAYA,
  ALAYA_DEV
]

export const NETWORK_TYPE_TO_ID_MAP = {
  [MAINNET]: { networkId: MAINNET_NETWORK_ID, chainId: MAINNET_CHAIN_ID },
  [PLATON_DEV]: { networkId: PLATON_DEV_NETWORK_ID, chainId: PLATON_DEV_CHAIN_ID },
  [ALAYA]: { networkId: ALAYA_NETWORK_ID, chainId: ALAYA_CHAIN_ID },
  [ALAYA_DEV]: { networkId: ALAYA_DEV_NETWORK_ID, chainId: ALAYA_DEV_CHAIN_ID }
}

export const NETWORK_TO_NAME_MAP = {
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [PLATON_DEV]: PLATON_DEV_DISPLAY_NAME,
  [ALAYA]: ALAYA_DISPLAY_NAME,
  [ALAYA_DEV]: ALAYA_DEV_DISPLAY_NAME,

  [MAINNET_NETWORK_ID]: MAINNET_DISPLAY_NAME,
  [PLATON_DEV_NETWORK_ID]: PLATON_DEV_DISPLAY_NAME,
  [ALAYA_NETWORK_ID]: ALAYA_DISPLAY_NAME,
  [ALAYA_DEV_NETWORK_ID]: ALAYA_DEV_DISPLAY_NAME,

  [MAINNET_CHAIN_ID]: MAINNET_DISPLAY_NAME,
  [PLATON_DEV_CHAIN_ID]: PLATON_DEV_DISPLAY_NAME,
  [ALAYA_CHAIN_ID]: ALAYA_DISPLAY_NAME,
  [ALAYA_DEV_CHAIN_ID]: ALAYA_DISPLAY_NAME
}
