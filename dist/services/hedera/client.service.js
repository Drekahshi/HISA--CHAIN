"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaClientService = void 0;
const sdk_1 = require("@hashgraph/sdk");
class HederaClientService {
    static getClient() {
        if (!this.instance) {
            const network = process.env.HEDERA_NETWORK || 'testnet';
            if (network === 'mainnet') {
                this.instance = sdk_1.Client.forMainnet();
            }
            else {
                this.instance = sdk_1.Client.forTestnet();
            }
            const operatorId = sdk_1.AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
            const operatorKey = sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
            this.instance.setOperator(operatorId, operatorKey);
            console.log('✅ Hedera client initialized');
        }
        return this.instance;
    }
}
exports.HederaClientService = HederaClientService;
