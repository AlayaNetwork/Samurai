export default function getAccountLink (address, network, rpcPrefs) {
  if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
    return `${rpcPrefs.blockExplorerUrl.replace(/\/+$/, '')}/address/${address}`
  }

  const net = parseInt(network)
  let link
  switch (net) {
    case 100:
      link = `https://scan.platon.network/address-detail?address=${address}`
      break
    case 210309: // platon dev net
      link = `https://devnetscan.platon.network/address-detail?address=${address}`
      break
    case 201018: // alaya net
      link = `https://scan.alaya.network/address-detail?address=${address}`
      break
    case 201030: // alaya dev net
      link = `https://devnetscan.alaya.network/address-detail?address=${address}`
      break
    default:
      link = ''
      break
  }

  return link
}
