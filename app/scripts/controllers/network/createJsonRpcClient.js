import mergeMiddleware from 'json-rpc-engine/src/mergeMiddleware'
import createFetchMiddleware from '@alayanetwork/eth-json-rpc-middleware/fetch'
import createBlockRefRewriteMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-ref-rewrite'
import createBlockCacheMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-cache'
import createInflightMiddleware from '@alayanetwork/eth-json-rpc-middleware/inflight-cache'
import createBlockTrackerInspectorMiddleware from '@alayanetwork/eth-json-rpc-middleware/block-tracker-inspector'
import providerFromMiddleware from '@alayanetwork/eth-json-rpc-middleware/providerFromMiddleware'
import BlockTracker from '@alayanetwork/eth-block-tracker'

export default function createJsonRpcClient ({ rpcUrl }) {
  const fetchMiddleware = createFetchMiddleware({ rpcUrl })
  const blockProvider = providerFromMiddleware(fetchMiddleware)
  const blockTracker = new BlockTracker({ provider: blockProvider })

  const networkMiddleware = mergeMiddleware([
    createBlockRefRewriteMiddleware({ blockTracker }),
    createBlockCacheMiddleware({ blockTracker }),
    createInflightMiddleware(),
    createBlockTrackerInspectorMiddleware({ blockTracker }),
    fetchMiddleware,
  ])
  return { networkMiddleware, blockTracker }
}
