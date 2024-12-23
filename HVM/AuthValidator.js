import dag4 from "@stardust-collective/dag4";
import { ethers } from "ethers";
import SystemConfig from "../systemConfig.js"; // Include `.js` extension for local files

// Destructure wallet from dag4
const { wallet: dagWallet } = dag4;

console.log("Ethers Module:", ethers);

class AuthValidator {
    constructor() {
        this.dagWallet = dagWallet; // Use DAG wallet directly
        this.systemConfig = new SystemConfig(); // Centralized network configuration
    }

    /**
     * Validate the wallet address using DAG4 (Stargazer)
     * @param {string} walletAddress - DAG wallet address
     * @returns {boolean} - Validation result
     */
    async authenticateWithDAG4(walletAddress) {
        try {
            this.dagWallet.loginWithPrivateKey(""); // Initialize DAG wallet (empty for validation only)
            const isValid = this.dagWallet.validateAddress(walletAddress);
            console.log("DAG Wallet validation result:", isValid);
            return isValid;
        } catch (error) {
            console.error("Error during DAG4 authentication:", error.message);
            return false;
        }
    }

    /**
     * Validate the wallet address using Metamask (signature-based)
     * @param {string} message - Authentication message
     * @param {string} signature - Wallet signature
     * @param {string} walletAddress - Wallet address
     * @returns {boolean} - Validation result
     */
    async authenticateWithMetamask(message, signature, walletAddress) {
        try {
            const signerAddress = ethers.verifyMessage(message, signature);
            console.log("Metamask signer address:", signerAddress);
            return signerAddress.toLowerCase() === walletAddress.toLowerCase();
        } catch (error) {
            console.error("Error during Metamask authentication:", error.message);
            return false;
        }
    }

    /**
     * Centralized method to handle all wallet validation (signature-based)
     * @param {string} authType - Type of authentication (e.g., stargazer, metamask)
     * @param {object} userData - User data including wallet address
     * @param {string} signature - Wallet signature
     * @returns {boolean} - Validation result
     */
    async validateWallet(authType, userData, signature) {
        if (!userData || !userData.wallet_address) {
            console.error("Invalid user data. Wallet address missing.");
            return false;
        }

        const { wallet_address } = userData;

        // Use SystemConfig to get the appropriate network configuration
        const networkConfig = this.systemConfig.getNetworkConfig(authType.toUpperCase());

        if (!networkConfig) {
            console.error(`Unsupported authentication type: ${authType}`);
            return false;
        }

        if (authType === "stargazer") {
            // Authenticate with Stargazer (DAG network)
            return await this.authenticateWithDAG4(wallet_address);
        }

        if (authType === "metamask") {
            // Authenticate with Metamask (ETH-compatible networks)
            const message = `Sign this message to authenticate with HyperMatrix: ${wallet_address} - ${Date.now()}`;
            return await this.authenticateWithMetamask(message, signature, wallet_address);
        }

        console.error("Unsupported authentication type:", authType);
        return false; // In case of unsupported authType
    }
}

export default AuthValidator;
