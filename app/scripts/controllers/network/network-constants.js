export const defaultNetworksData = {
  mainnet: {
    providerType: 'mainnet',
    rpcTarget: 'https://samurai.platon.network',
    chainId: '100',
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://scan.platon.network',
  },
  platon_dev: {
    providerType: 'platon_dev',
    rpcTarget: 'http://47.241.98.219:6789',
    chainId: '210309',
    hrp: 'lat',
    ticker: 'LAT',
    blockExplorerUrl: 'https://devnetscan.platon.network',
  },
  alaya: {
    providerType: 'alaya',
    rpcTarget: 'https://samurai.alaya.network',
    chainId: '201018',
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://scan.alaya.network',
  },
  alaya_dev: {
    providerType: 'alaya_dev',
    rpcTarget: 'http://47.241.91.2:6789',
    chainId: '201030',
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://devnetscan.alaya.network',
  },
}
