import { ALAYA_NETWORK_ID, MAINNET_NETWORK_ID, ALAYA_DEV_NETWORK_ID, PLATON_DEV_NETWORK_ID } from '../../../../../app/scripts/controllers/network/enums';

const defaultNetworksData = [
  {
    labelKey: 'mainnet',
    iconColor: '#29B6AF',
    providerType: 'mainnet',
    rpcUrl: 'https://openapi2.platon.network/rpc',
    chainId: MAINNET_NETWORK_ID,
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://scan.platon.network',
  },
  {
    labelKey: 'platon_dev',
    iconColor: '#F6C343',
    providerType: 'platon_dev',
    rpcUrl: 'https://devnetopenapi.platon.network/rpc',
    chainId: PLATON_DEV_NETWORK_ID,
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://devnetscan.platon.network',
  },
  {
    labelKey: 'alaya',
    iconColor: '#F6C343',
    providerType: 'alaya',
    rpcUrl: 'https://samurai.alaya.network',
    chainId: ALAYA_NETWORK_ID,
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://scan.alaya.network',
  },
  {
    labelKey: 'alaya_dev',
    iconColor: '#F6C343',
    providerType: 'alaya_dev',
    rpcUrl: 'https://devnetopenapi.alaya.network/rpc',
    chainId: ALAYA_DEV_NETWORK_ID,
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://devnetscan.alaya.network',
  },
]

export {
  defaultNetworksData,
}
