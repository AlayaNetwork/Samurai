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
    rpcTarget: 'https://devnetopenapi.platon.network/rpc',
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
    rpcTarget: 'https://devnetopenapi.alaya.network/rpc',
    chainId: '201030',
    hrp: 'atp',
    ticker: 'ATP',
    blockExplorerUrl: 'https://devnetscan.alaya.network',
  },
}
