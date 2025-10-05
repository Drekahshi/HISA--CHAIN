import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

export class HederaClientService {
  private static instance: Client;

  static getClient(): Client {
    if (!this.instance) {
      const network = process.env.HEDERA_NETWORK || 'testnet';

      if (network === 'mainnet') {
        this.instance = Client.forMainnet();
      } else {
        this.instance = Client.forTestnet();
      }

      const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);
      const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

      this.instance.setOperator(operatorId, operatorKey);

      console.log('✅ Hedera client initialized');
    }

    return this.instance;
  }
}