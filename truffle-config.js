const HDWalletProvider = require("@truffle/hdwallet-provider");

const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;
const gasPrice = process.env.GAS_PRICE || '5000000000';

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    mainnet: {
      network_id: '1',
      provider: () => new HDWalletProvider(privateKey, rpcUrl),
      gasPrice
    },
    rinkeby: {
      network_id: '4',
      provider: () => new HDWalletProvider(privateKey, rpcUrl),
      gasPrice
    },
  },
  compilers: {
    solc: {
      version: '0.5.12'
    }
  }
}
