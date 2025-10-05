import crypto from 'crypto';

export class HashService {
  static hashTreeData(treeData: any): string {
    const dataString = JSON.stringify({
      treeId: treeData.treeId,
      species: treeData.species,
      location: treeData.location,
      plantingDate: treeData.plantingDate,
      plantedBy: treeData.plantedBy
    });

    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex');
  }

  static verifyHash(data: any, hash: string): boolean {
    const computedHash = this.hashTreeData(data);
    return computedHash === hash;
  }
}