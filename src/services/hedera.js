import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransactionReceiptQuery
} from "@hashgraph/sdk";

class HederaService {
  constructor() {
    // Initialize a client for the testnet without an operator
    // This client can be used to build transactions
    this.client = Client.forTestnet();

    this.topicIds = {
      JANI: null, // We will set this after creating the topic
      HISA: null,
      UMOJA: null,
      CHAT: null
    };
  }

  // This method now builds and returns a frozen transaction
  // It needs to be signed and executed by the user's wallet
  createTopicTransaction() {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo("Jani Project - Tree Planting Records");

      // The transaction must be frozen before it can be signed
      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating topic transaction:", error);
      throw error;
    }
  }

  // This method now builds and returns a frozen transaction
  // It needs to be signed and executed by the user's wallet
  submitTopicMessageTransaction(topicId, message) {
    try {
      const transaction = new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: message,
      });

      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating topic message transaction:", error);
      throw error;
    }
  }

  // NOTE: This method will not work without an operator
  // To get a receipt, the query must be paid for. This would need to be done
  // either on a backend or by the user signing the query.
  // For now, we will rely on the wallet response for success/failure.
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

  getHashScanUrl(transactionId, isMainnet = false) {
    const network = isMainnet ? "mainnet" : "testnet";
    return `https://hashscan.io/${network}/transaction/${transactionId}`;
  }
}

export const hederaService = new HederaService();
