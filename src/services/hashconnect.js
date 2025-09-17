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
    this.publicKey = null;
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
        // Assuming the first paired account is the one we want to use.
        this.connectedAccount = data.accountIds[0];

        // Correctly capture the public key from the pairing data.
        // The `hashconnect` library provides this in the `pairingData` object.
        // We'll find the public key associated with the connected account.
        const accountData = data.accountData.find(acc => acc.account === this.connectedAccount);
        if (accountData && accountData.publicKey) {
          this.publicKey = accountData.publicKey;
        }
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
          const accountData = data.accountData.find(acc => acc.account === this.connectedAccount);
          if (accountData && accountData.publicKey) {
            this.publicKey = accountData.publicKey;
          }
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

  async sendTransaction(transactionBytes, accountId) {
    const payload = {
      topic: this.pairingData.topic,
      byteArray: transactionBytes,
      metadata: {
        accountToSign: accountId,
        returnTransaction: false,
      }
    };

    return await this.hashconnect.sendTransaction(this.pairingData.topic, payload);
  }

  getAccountId() {
    return this.connectedAccount;
  }

  getPublicKey() {
    return this.publicKey;
  }

  isConnected() {
    return this.connectedAccount !== null;
  }
}

export const hashConnectService = new HashConnectService();
