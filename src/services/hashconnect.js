import { HashConnect } from 'hashconnect';

class HashConnectService {
  constructor() {
    this.hashconnect = new HashConnect(true); // testnet = true
    this.appMetadata = {
      name: "HISA Festive MVP",
      description: "Hedera Integrated Sustainability Application",
      icon: "https://your-app.com/icon.png"
    };
    this.connectedAccount = null;
    this.topic = null;
    this.pairingData = null;
  }

  async initialize() {
    try {
      const initData = await this.hashconnect.init(this.appMetadata, "testnet", false);
      this.topic = initData.topic;

      this.hashconnect.foundExtensionEvent.once((data) => {
        console.log("HashPack extension found", data);
      });

      this.hashconnect.pairingEvent.on((data) => {
        console.log("Paired with wallet", data);
        this.pairingData = data;
        this.connectedAccount = data.accountIds[0];
      });

      return initData;
    } catch (error) {
      console.error("Error initializing HashConnect:", error);
      throw error;
    }
  }

  async connectToWallet() {
    try {
      if (!this.topic) await this.initialize();

      // Check if already connected
      if (this.connectedAccount) {
        return this.connectedAccount;
      }

      // Try to connect to existing pairing
      if (this.pairingData) {
        this.connectedAccount = this.pairingData.accountIds[0];
        return this.connectedAccount;
      }

      // Create new pairing request
      const state = await this.hashconnect.connect();
      this.topic = state.topic;

      const pairingString = this.hashconnect.generatePairingString(state, "testnet", false);
      this.hashconnect.openPairingPopup(pairingString);

      // Wait for pairing to complete
      return new Promise((resolve, reject) => {
        this.hashconnect.pairingEvent.once((data) => {
          this.pairingData = data;
          this.connectedAccount = data.accountIds[0];
          resolve(this.connectedAccount);
        });

        // Timeout after 30 seconds
        setTimeout(() => reject(new Error("Connection timeout")), 30000);
      });
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.pairingData) {
        await this.hashconnect.disconnect(this.pairingData.topic);
      }
      this.connectedAccount = null;
      this.pairingData = null;
      return true;
    } catch (error) {
      console.error("Error disconnecting:", error);
      throw error;
    }
  }

  getAccountId() {
    return this.connectedAccount;
  }

  isConnected() {
    return this.connectedAccount !== null;
  }
}

export const hashConnectService = new HashConnectService();
