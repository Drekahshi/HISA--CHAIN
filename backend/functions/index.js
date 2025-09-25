// JANI Module
const jani = require('./jani/treeVerification');
exports.verifyTreePlanting = jani.verifyTreePlanting;

// UMOJA Module
const umoja = require('./umoja/assetTokenization');
exports.tokenizeAsset = umoja.tokenizeAsset;

// HISA-HEALTH Module
const hisaHealth = require('./hisa-health/assessment');
exports.performHealthAssessment = hisaHealth.performHealthAssessment;

// CULTURE Module (placeholder)
// const culture = require('./culture/mintNFT');
// exports.mintNFT = culture.mintNFT;

// SHARED utilities can be required here if needed.
// const shared = require('./shared/utils');