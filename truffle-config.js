const HDWalletProvider = require("truffle-hdwallet-provider-klaytn")

/**
 * NETWORK_ID: Specifies the network id in Klaytn (1001 for Baobab)
 * URL: URL for the remote node you will be using
 * GASLIMIT: How much gas limit will you endure to deploy your contract
 */
const NETWORK_ID = '1001'
const URL = 'https://api.baobab.klaytn.net:8651'
const GASLIMIT = '8500000'

/**
 * ** WARNING **
 * You shouldn't expose your private key. Otherwise, your account would be hacked.
 * PRIVATE_KEY: Private key of the account that pays for the transaction (Change it to your own private key)
 */
const PRIVATE_KEY = '0x3de0c90ce7e440f19eff6439390c29389f611725422b79c95f9f48c856b58277'


module.exports = {
  networks: {
    /**
     * 1. DEPLOY METHOD 1: By private key
     * If you want to deploy your contract using the private key, `provider` option is needed.
     * 1) Pass your private key as the 1st argument of `new HDWalletProvider()`.
     * 2) Pass your Klaytn node's URL as the 2nd argument of `new HDWalletProvider()`.
     *
     * If you deploy your contract with private key connector,
     * You don't need to set `host`, `port`, `from` option.
     */
    baobab: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, URL),
      network_id: NETWORK_ID,
      gas: GASLIMIT,
      gasPrice: null,
    },

    /**
     * 2. DEPLOY METHOD 2: By unlocked account
     * You must set `host`, `port`, `from` option
     * to deploy your contract with unlocked account.
     *
     * If you deploy your contract with unlocked account on klaytn node,
     * You don't need to set `provider` option.
     */
    // baobab: {
    //   host: HOST,
    //   port: PORT,
    //   network_id: NETWORK_ID,
    //   from: FROM,
    //   gas: GASLIMIT,
    //   gasPrice: null,
    // },

  },
  // 3. Specify the version of compiler, we use 0.5.6
  compilers: {
    solc: {
      version: '0.5.6',
    },
  },
}
