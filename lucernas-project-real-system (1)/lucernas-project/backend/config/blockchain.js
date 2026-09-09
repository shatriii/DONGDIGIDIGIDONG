// config/blockchain.js
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(
  process.env.BESU_RPC_URL || 'http://127.0.0.1:8545'
);

const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const TICKET_REGISTRY_ABI = [
  'function issueTicket(bytes32 ticketHash) external',
  'function redeemTicket(bytes32 ticketHash) external',
  'function getTicketStatus(bytes32 ticketHash) external view returns (uint8)',
  'function isTicketValid(bytes32 ticketHash) external view returns (bool)',
  'function getTicketTimestamps(bytes32 ticketHash) external view returns (uint256 issued, uint256 redeemed)',
  'event TicketIssued(bytes32 indexed ticketHash, uint256 timestamp)',
  'event TicketRedeemed(bytes32 indexed ticketHash, uint256 timestamp)',
];

const ticketRegistry = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  TICKET_REGISTRY_ABI,
  wallet
);

(async () => {
  try {
    const network = await provider.getNetwork();
    console.log(`[Blockchain] Connected to chainId ${network.chainId}`);
    console.log(`[Blockchain] Wallet: ${wallet.address}`);
    console.log(`[Blockchain] Contract: ${process.env.CONTRACT_ADDRESS}`);
  } catch (err) {
    console.error('[Blockchain] Connection error:', err.message);
  }
})();

module.exports = { provider, wallet, ticketRegistry };