const ganache = require('ganache-core')
const { promisify } = require('util')

const defaultOptions = {
  blockTime: 2,
  network_id: 5777,
  mnemonic: 'phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent',
  port: 8545,
  vmErrorsOnRPCResponse: false,
}

class Ganache {
  async start (options) {
    options = Object.assign({}, defaultOptions, options)

    const port = options.port
    this._server = ganache.server(options)

    const listen = promisify(this._server.listen).bind(this._server)
    const blockchain = await listen(port)

    return {
      ...blockchain,
      port,
    }
  }

  async quit () {
    if (!this._server) {
      throw new Error('Server not running yet')
    }
    const close = promisify(this._server.close).bind(this._server)
    await close()
  }
}

module.exports = Ganache
