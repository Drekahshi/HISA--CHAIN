"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HCSService = void 0;
const sdk_1 = require("@hashgraph/sdk");
const client_service_1 = require("./client.service");
class HCSService {
    constructor() {
        this.client = client_service_1.HederaClientService.getClient();
    }
    async createTopic(memo) {
        try {
            const transaction = new sdk_1.TopicCreateTransaction()
                .setTopicMemo(memo)
                .setAdminKey(this.client.operatorPublicKey);
            const response = await transaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const topicId = receipt.topicId.toString();
            console.log(`✅ Topic created: ${topicId}`);
            return topicId;
        }
        catch (error) {
            console.error('❌ Error creating topic:', error);
            throw error;
        }
    }
    async submitTreeVerification(topicId, treeData) {
        try {
            const message = JSON.stringify({
                type: 'TREE_VERIFICATION',
                timestamp: new Date().toISOString(),
                data: {
                    treeId: treeData.treeId,
                    hash: treeData.hash,
                    validators: treeData.validators,
                    location: treeData.location
                }
            });
            const transaction = new sdk_1.TopicMessageSubmitTransaction()
                .setTopicId(sdk_1.TopicId.fromString(topicId))
                .setMessage(message);
            const response = await transaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const txId = response.transactionId.toString();
            console.log(`✅ Message submitted to HCS: ${txId}`);
            return txId;
        }
        catch (error) {
            console.error('❌ Error submitting to HCS:', error);
            throw error;
        }
    }
}
exports.HCSService = HCSService;
