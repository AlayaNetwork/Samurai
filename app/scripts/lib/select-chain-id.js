import {
  MAINNET_CHAIN_ID,
  ALAYA_CHAIN_ID,
  ALAYA_DEV_CHAIN_ID,
  PLATON_DEV_CHAIN_ID,
} from '../controllers/network/enums'

const standardNetworkId = {
  '1021': MAINNET_CHAIN_ID,
  '210309': PLATON_DEV_CHAIN_ID,
  '201018': ALAYA_CHAIN_ID,
  '201030': ALAYA_DEV_CHAIN_ID,
}

export default function selectChainId (metamaskState) {
  const { network, provider: { chainId } } = metamaskState
  return standardNetworkId[network] || `0x${parseInt(chainId, 10).toString(16)}`
}
