import mergeMiddleware from 'json-rpc-engine/src/mergeMiddleware'
import createScaffoldMiddleware from 'json-rpc-engine/src/createScaffoldMiddleware'
import createBlockReRefMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-ref'
import createRetryOnEmptyMiddleware from '@alayanetwork/eth-json-rpc-middleware/retryOnEmpty'
import createBlockCacheMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-cache'
import createInflightMiddleware from '@alayanetwork/eth-json-rpc-middleware/inflight-cache'
import createBlockTrackerInspectorMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-tracker-inspector'
import providerFromMiddleware from '@alayanetwork/eth-json-rpc-middleware/providerFromMiddleware'
import createInfuraMiddleware from 'eth-json-rpc-infura'
import BlockTracker from '@alayanetwork/eth-block-tracker'
import * as networkEnums from './enums'

export default function createInfuraClient ({ network }) {
  const infuraMiddleware = createInfuraMiddleware({ network, maxAttempts: 5, source: 'alaya-metamask' })
  const infuraProvider = providerFromMiddleware(infuraMiddleware)
  const blockTracker = new BlockTracker({ provider: infuraProvider })

  const networkMiddleware = mergeMiddleware([
    createNetworkAndChainIdMiddleware({ network }),
    createBlockCacheMiddleware({ blockTracker }),
    createInflightMiddleware(),
    createBlockReRefMiddleware({ blockTracker, provider: infuraProvider }),
    createRetryOnEmptyMiddleware({ blockTracker, provider: infuraProvider }),
    createBlockTrackerInspectorMiddleware({ blockTracker }),
    infuraMiddleware,
  ])
  return { networkMiddleware, blockTracker }
}

function createNetworkAndChainIdMiddleware ({ network }) {
  let chainId
  let netId

  switch (network) {
    case 'mainnet':
      netId = networkEnums.MAINNET_NETWORK_ID
      chainId = '0x01'
      break
    case 'alaya':
      netId = networkEnums.ALAYA_NETWORK_ID
      chainId = '0x3113A'
      break
    default:
      throw new Error(`createInfuraClient - unknown network "${network}"`)
  }

  return createScaffoldMiddleware({
    platon_chainId: chainId,
    net_version: netId,
  })
}
