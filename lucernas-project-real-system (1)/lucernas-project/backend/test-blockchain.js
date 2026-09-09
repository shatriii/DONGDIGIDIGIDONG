// test-blockchain.js
const { provider, wallet, ticketRegistry } = require('./config/blockchain');

(async () => {
  const network = await provider.getNetwork();
  console.log('ChainId:', network.chainId.toString());
  console.log('Wallet:', wallet.address);
  console.log('Contract:', ticketRegistry.target);
})();