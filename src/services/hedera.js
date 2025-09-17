import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransactionReceiptQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TokenApproveTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
  PublicKey
} from "@hashgraph/sdk";

// This is needed for the NFT minting metadata
import { Buffer } from 'buffer';
window.Buffer = Buffer;


class HederaService {
  constructor() {
    // Initialize a client for the testnet without an operator
    // This client can be used to build transactions
    this.client = Client.forTestnet();

    this.topicIds = {
      JANI: null,
      HISA: null,
      UMOJA: null,
      CHAT: null
    };
    this.tokenIds = {
      ...this.topicIds,
      CHAT_NFT_COLLECTION: null,
    }
  }

  // HCS Methods
  createTopicTransaction() {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo("Jani Project - Tree Planting Records");
      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating topic transaction:", error);
      throw error;
    }
  }

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

  // DEX Methods
  createSwapTransaction(routerContractId, amountIn, amountOutMin, path, toAddress, deadline) {
    try {
      const gasLimit = 240000;
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

  // NFT Methods
  createNftCollectionTransaction(name, symbol, treasuryAccountId, treasuryAccountPublicKeyString) {
    try {
      const treasuryAccountPublicKey = PublicKey.fromString(treasuryAccountPublicKeyString);
      const transaction = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(255)
        .setAdminKey(treasuryAccountPublicKey)
        .setSupplyKey(treasuryAccountPublicKey);
      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating NFT collection transaction:", error);
      throw error;
    }
  }

  mintNftTransaction(tokenId, cid) {
    try {
      const metadata = Buffer.from(cid);
      const transaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadata]);
      return transaction.freezeWith(this.client);
    } catch (error) {
      console.error("Error creating NFT mint transaction:", error);
      throw error;
    }
  }

  // Generic Helper Methods
  async getTransactionRecord(transactionId) {
    const mirrorNodeUrl = `https://testnet.mirrornode.hedera.com/api/v1/transactions/${transactionId.toString()}`;
    try {
      const response = await fetch(mirrorNodeUrl);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.transactions && data.transactions.length > 0 ? data.transactions[0] : null;
    } catch (error) {
      console.error(`Error fetching transaction record for ${transactionId}:`, error);
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
        headers: { 'x-api-key': '875e1017-87b8-4b12-8301-6aa1f1aa073b' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching SaucerSwap pools:", error);
      throw error;
    }
  }
}

export const hederaService = new HederaService();
