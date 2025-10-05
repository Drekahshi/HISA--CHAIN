"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class HashService {
    static hashTreeData(treeData) {
        const dataString = JSON.stringify({
            treeId: treeData.treeId,
            species: treeData.species,
            location: treeData.location,
            plantingDate: treeData.plantingDate,
            plantedBy: treeData.plantedBy
        });
        return crypto_1.default
            .createHash('sha256')
            .update(dataString)
            .digest('hex');
    }
    static verifyHash(data, hash) {
        const computedHash = this.hashTreeData(data);
        return computedHash === hash;
    }
}
exports.HashService = HashService;
