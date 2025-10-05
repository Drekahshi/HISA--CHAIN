import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId
} from '@hashgraph/sdk';
import { HederaClientService } from './client.service';

export class HCSService {
  private client = HederaClientService.getClient();

  async createTopic(memo: string): Promise<string> {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(memo)
        .setAdminKey(this.client.operatorPublicKey!);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const topicId = receipt.topicId!.toString();
      console.log(`✅ Topic created: ${topicId}`);

      return topicId;
    } catch (error) {
      console.error('❌ Error creating topic:', error);
      throw error;
    }
  }

  async submitTreeVerification(topicId: string, treeData: any): Promise<string> {
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

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(topicId))
        .setMessage(message);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      const txId = response.transactionId.toString();
      console.log(`✅ Message submitted to HCS: ${txId}`);

      return txId;
    } catch (error) {
      console.error('❌ Error submitting to HCS:', error);
      throw error;
    }
  }
}