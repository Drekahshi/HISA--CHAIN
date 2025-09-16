import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenAssociateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  TransferTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransactionReceiptQuery
} from "@hashgraph/sdk";

class HederaService {
  constructor() {
    this.client = null;
    this.tokenIds = {
      HISA: null,
      JANI: null,
      UMOJA: null,
      CHAT: null
    };
    this.topicIds = {
      JANI: null,
      HISA: null,
      UMOJA: null,
      CHAT: null
    };
  }

  async initializeClient(accountId, privateKey) {
    try {
      this.client = Client.forTestnet();
      this.client.setOperator(accountId, privateKey);
      return this.client;
    } catch (error) {
      console.error("Error initializing Hedera client:", error);
      throw error;
    }
  }

  async createToken(name, symbol, initialSupply, treasuryAccount, treasuryKey) {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(initialSupply)
        .setTreasuryAccountId(treasuryAccount)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000000000) // 1B max for HISA
        .setSupplyKey(treasuryKey)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(treasuryKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const tokenId = receipt.tokenId;
      this.tokenIds[symbol] = tokenId;

      return {
        tokenId,
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error(`Error creating ${symbol} token:`, error);
      throw error;
    }
  }

  async associateToken(accountId, tokenId, privateKey) {
    try {
      const transaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(this.client);

      const signedTx = await transaction.sign(privateKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error("Error associating token:", error);
      throw error;
    }
  }

  async mintToken(tokenId, amount, treasuryKey) {
    try {
      const transaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(treasuryKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error("Error minting token:", error);
      throw error;
    }
  }

  async transferToken(tokenId, fromAccount, toAccount, amount, privateKey) {
    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccount, -amount)
        .addTokenTransfer(tokenId, toAccount, amount)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(privateKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error("Error transferring token:", error);
      throw error;
    }
  }

  async createTopic() {
    try {
      const transaction = new TopicCreateTransaction();
      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return receipt.topicId;
    } catch (error) {
      console.error("Error creating topic:", error);
      throw error;
    }
  }

  async submitTopicMessage(topicId, message) {
    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(JSON.stringify(message));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        receipt
      };
    } catch (error) {
      console.error("Error submitting topic message:", error);
      throw error;
    }
  }

  async getTransactionReceipt(transactionId) {
    try {
      const receiptQuery = new TransactionReceiptQuery()
        .setTransactionId(transactionId);

      const receipt = await receiptQuery.execute(this.client);
      return receipt;
    } catch (error) {
      console.error("Error getting transaction receipt:", error);
      throw error;
    }
  }

  getHashScanUrl(transactionId) {
    return `https://testnet.hashscan.io/transaction/${transactionId}`;
  }
}

export const hederaService = new HederaService();
