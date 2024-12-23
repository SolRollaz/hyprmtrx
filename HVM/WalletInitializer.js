import dag4 from "@stardust-collective/dag4";
import { ethers } from "ethers";
import SystemConfig from "../systemConfig.js"; // Import SystemConfig

console.log("Ethers Module:", ethers);


class WalletInitializer {
  constructor(userId) {
    this.userId = userId;
    this.systemConfig = new SystemConfig(); // Use SystemConfig for configurations

    // Providers
    this.providers = {
      ETH: new ethers.JsonRpcProvider(this.systemConfig.getNetworkConfig("ETH").rpcUrl),
      BNB: new ethers.JsonRpcProvider(this.systemConfig.getNetworkConfig("BNB").rpcUrl),
      AVAX: new ethers.JsonRpcProvider(this.systemConfig.getNetworkConfig("AVAX").rpcUrl),
      Base: new ethers.JsonRpcProvider(this.systemConfig.getNetworkConfig("Base").rpcUrl),
    };

    // Initialized wallets
    this.initializedWallets = {};
  }

  /**
   * Initialize all wallets provided.
   * @param {Array} wallets - Array of wallets with network, address, and private key.
   */
  async initializeWallets(wallets) {
    for (const wallet of wallets) {
      switch (wallet.network) {
        case "DAG":
          this.initializeDAGWallet(wallet);
          break;
        case "ETH":
        case "BNB":
        case "AVAX":
        case "Base":
          this.initializeEthereumCompatibleWallet(wallet);
          break;
        default:
          console.warn(`Unsupported network type: ${wallet.network}`);
      }
    }
  }

  /**
   * Initialize a DAG wallet.
   * @param {Object} wallet - The wallet object (network, address, private key).
   */
  initializeDAGWallet(wallet) {
    try {
      const dagWallet = new dag4.Wallet();
      dagWallet.loginWithPrivateKey(wallet.private_key);
      this.initializedWallets[wallet.network] = {
        address: dagWallet.getAddress(),
        wallet: dagWallet,
      };
      console.log(`DAG wallet initialized successfully for user: ${this.userId}`);
    } catch (error) {
      console.error(`Error initializing DAG wallet for user: ${this.userId}`, error);
      throw error;
    }
  }

  /**
   * Initialize Ethereum-compatible wallets (ETH, BNB, AVAX, Base).
   * @param {Object} wallet - The wallet object (network, address, private key).
   */
  initializeEthereumCompatibleWallet(wallet) {
    try {
      const provider = this.providers[wallet.network];
      const ethWallet = new ethers.Wallet(wallet.private_key, provider);
      this.initializedWallets[wallet.network] = {
        address: ethWallet.address,
        wallet: ethWallet,
      };
      console.log(`${wallet.network} wallet initialized successfully for user: ${this.userId}`);
    } catch (error) {
      console.error(`Error initializing ${wallet.network} wallet for user: ${this.userId}`, error);
      throw error;
    }
  }

  /**
   * Get initialized wallets.
   * @returns {Object} - A mapping of network to initialized wallet details.
   */
  getInitializedWallets() {
    return this.initializedWallets;
  }
}

export default WalletInitializer;
