import {ALAYA_CHAIN_ID, MAINNET_CHAIN_ID, ALAYA_DEV_CHAIN_ID, PLATON_DEV_CHAIN_ID} from "../../../../../app/scripts/controllers/network/enums";

const defaultNetworksData = [
  {
    labelKey: 'mainnet',
    iconColor: '#29B6AF',
    providerType: 'mainnet',
    rpcUrl: "http://10.10.8.183:7790",
    chainId: MAINNET_CHAIN_ID,
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://scan.alaya.network',
  },
  {
    labelKey: 'platon_dev',
    iconColor: '#F6C343',
    providerType: 'platon_dev',
    rpcUrl: 'http://47.241.98.219:6789',
    chainId: PLATON_DEV_CHAIN_ID,
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://devnetscan.platon.network',
  },
  {
    labelKey: 'alaya',
    iconColor: '#F6C343',
    providerType: 'alaya',
    rpcUrl: 'https://samurai.alaya.network',
    chainId: ALAYA_CHAIN_ID,
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://scan.alaya.network',
  },
  {
    labelKey: 'alaya_dev',
    iconColor: '#F6C343',
    providerType: 'alaya_dev',
    rpcUrl: 'http://47.241.91.2:6789',
    chainId: ALAYA_DEV_CHAIN_ID,
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://devnetscan.alaya.network',
  }
]

export {
  defaultNetworksData,
}
