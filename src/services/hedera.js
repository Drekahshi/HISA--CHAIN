import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransactionReceiptQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TokenApproveTransaction
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

  async getTransactionRecord(transactionId) {
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/transactions/${transactionId}`;
    try {
      const response = await fetch(mirrorNodeUrl);
      if (response.status === 404) {
        // Not found yet, this is expected for recent transactions
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assuming the first transaction in the response is the one we want
      return data.transactions[0];
    } catch (error) {
      console.error(`Error fetching transaction record for ${transactionId}:`, error);
      // Don't re-throw, as we want to retry
      return null;
    }
  }

  getHashScanUrl(transactionId, isMainnet = false) {
    const network = isMainnet ? "mainnet" : "testnet";
    return `https://hashscan.io/${network}/transaction/${transactionId}`;
  }

  async getSaucerSwapPools() {
    try {
      const response = await fetch('https://test-api.saucerswap.finance/pools', {
        headers: {
          'x-api-key': '875e1017-87b8-4b12-8301-6aa1f1aa073b'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching SaucerSwap pools:", error);
      throw error;
    }
  }

  createSwapTransaction(routerContractId, amountIn, amountOutMin, path, toAddress, deadline) {
    try {
      const gasLimit = 240000; // As recommended by SaucerSwap docs

      const params = new ContractFunctionParameters()
        .addUint256(amountIn)
        .addUint256(amountOutMin)
        .addAddressArray(path)
        .addAddress(toAddress)
        .addUint256(deadline);

      const transaction = new ContractExecuteTransaction()
        .setContractId(routerContractId)
        .setGas(gasLimit)
        .setFunction("swapExactTokensForTokens", params);

      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating swap transaction:", error);
      throw error;
    }
  }

  createTokenApprovalTransaction(tokenId, spenderAccountId, amount) {
    try {
      const transaction = new TokenApproveTransaction()
        .addTokenApproval(tokenId, spenderAccountId, amount);

      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating token approval transaction:", error);
      throw error;
    }
  }
}

export const hederaService = new HederaService();
