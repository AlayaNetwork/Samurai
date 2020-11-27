
export const WALLET_PREFIX = 'wallet_'

export const HISTORY_STORE_KEY = 'permissionsHistory'

export const LOG_STORE_KEY = 'permissionsLog'

export const METADATA_STORE_KEY = 'domainMetadata'

export const METADATA_CACHE_MAX_SIZE = 100

export const CAVEAT_NAMES = {
  exposedAccounts: 'exposedAccounts',
  primaryAccountOnly: 'primaryAccountOnly',
}

export const CAVEAT_TYPES = {
  limitResponseLength: 'limitResponseLength',
  filterResponse: 'filterResponse',
}

export const NOTIFICATION_NAMES = {
  accountsChanged: 'wallet_accountsChanged',
}

export const LOG_IGNORE_METHODS = [
  'wallet_sendDomainMetadata',
]

export const LOG_METHOD_TYPES = {
  restricted: 'restricted',
  internal: 'internal',
}

export const LOG_LIMIT = 100

export const SAFE_METHODS = [
  'web3_sha3',
  'web3_clientVersion',
  'net_listening',
  'net_peerCount',
  'net_version',
  'platon_blockNumber',
  'platon_call',
  'platon_chainId',
  'platon_coinbase',
  'platon_estimateGas',
  'platon_gasPrice',
  'platon_getBalance',
  'platon_getBlockByHash',
  'platon_getBlockByNumber',
  'platon_getBlockTransactionCountByHash',
  'platon_getBlockTransactionCountByNumber',
  'platon_getCode',
  'platon_getFilterChanges',
  'platon_getFilterLogs',
  'platon_getLogs',
  'platon_getStorageAt',
  'platon_getTransactionByBlockHashAndIndex',
  'platon_getTransactionByBlockNumberAndIndex',
  'platon_getTransactionByHash',
  'platon_getTransactionCount',
  'platon_getTransactionReceipt',
  'platon_getUncleByBlockHashAndIndex',
  'platon_getUncleByBlockNumberAndIndex',
  'platon_getUncleCountByBlockHash',
  'platon_getUncleCountByBlockNumber',
  'platon_getWork',
  'platon_hashrate',
  'platon_mining',
  'platon_newBlockFilter',
  'platon_newFilter',
  'platon_newPendingTransactionFilter',
  'platon_protocolVersion',
  'platon_sendRawTransaction',
  'platon_sendTransaction',
  'platon_sign',
  'personal_sign',
  'personal_ecRecover',
  'platon_signTypedData',
  'platon_signTypedData_v1',
  'platon_signTypedData_v3',
  'platon_signTypedData_v4',
  'platon_submitHashrate',
  'platon_submitWork',
  'platon_syncing',
  'platon_uninstallFilter',
  'metamask_watchAsset',
  'wallet_watchAsset',
  'platon_getEncryptionPublicKey',
  'platon_decrypt',
]
