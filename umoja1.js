const {
  AccountId,
  PrivateKey,
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} = require("@hashgraph/sdk"); // v2.64.5

// ==================== UMOJA ECOSYSTEM CONFIGURATION ====================
const MY_ACCOUNT_ID = AccountId.fromString("0.0.5834216");
const MY_PRIVATE_KEY = PrivateKey.fromStringECDSA(
  "0xbd68588b9994d1ba6d274b2e502442ab41454faf2adaca072d32928a1f4dea5d"
);

// ==================== DATA STRUCTURES ====================

class UmojaToken {
  constructor(name, symbol, supply, decimals, description) {
    this.name = name;
    this.symbol = symbol;
    this.supply = supply;
    this.decimals = decimals;
    this.description = description;
    this.tokenId = null;
  }
}

class AssetTokenization {
  constructor(assetId, assetType, location, value, owner) {
    this.assetId = assetId;
    this.assetType = assetType; // land, realestate, infrastructure_bond, gold, bitcoin
    this.location = location;
    this.value = value; // in UMOS
    this.owner = owner;
    this.tokenizedAmount = 0;
    this.timestamp = new Date().toISOString();
    this.status = "pending"; // pending, verified, active, tokenized
  }
}

class SMETokenOffering {
  constructor(smeName, businessType, requestedCapital, equityShare) {
    this.smeId = `SME_${Date.now()}`;
    this.smeName = smeName;
    this.businessType = businessType; // agri, tech, retail, etc.
    this.requestedCapital = requestedCapital;
    this.equityShare = equityShare;
    this.tokensMinted = 0;
    this.fundingProgress = 0;
    this.status = "pending"; // pending, approved, active, funded
  }
}

class YieldVault {
  constructor(vaultName, strategy, targetAPY) {
    this.vaultId = `VAULT_${Date.now()}`;
    this.vaultName = vaultName;
    this.strategy = strategy; // bitcoin_farming, bond_farming, mixed
    this.targetAPY = targetAPY;
    this.tvl = 0; // Total Value Locked
    this.currentReturns = 0;
  }
}

class QRPayment {
  constructor(sender, recipient, amount, tokenType) {
    this.paymentId = `QR_${Date.now()}`;
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.tokenType = tokenType; // UMOT, UMOS, UMOO
    this.qrCode = this.generateQRCode();
    this.status = "pending"; // pending, scanned, confirmed, settled
    this.timestamp = new Date().toISOString();
  }

  generateQRCode() {
    return {
      data: `umoja://pay/${this.sender}/${this.recipient}/${this.amount}/${this.tokenType}`,
      encodedHash: Buffer.from(this.paymentId).toString("base64"),
    };
  }
}

class DAOMember {
  constructor(name, walletAddress, contributionAmount, memberType) {
    this.memberId = `DAO_${Date.now()}`;
    this.name = name;
    this.walletAddress = walletAddress;
    this.contributionAmount = contributionAmount;
    this.memberType = memberType; // y10_member, accredited_investor, community
    this.reputationScore = 50;
    this.governanceRights = true;
    this.dateJoined = new Date().toISOString();
  }
}

// ==================== MAIN UMOJA ECOSYSTEM ====================
async function main() {
  let client;

  try {
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║        🌍 UMOJA HISA - BLOCKCHAIN FINANCIAL REVOLUTION 🌍        ║");
    console.log("║      Democratizing Finance for Kenya & Africa's Future        ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    // ==================== SETUP ====================
    console.log("🔧 Initializing Hedera Testnet Client...\n");
    client = Client.forTestnet();
    client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

    // ==================== STEP 1: CREATE TRIPLE-TOKEN MODEL ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📝 STEP 1: Creating UMOJA Triple-Token Ecosystem");
    console.log("═══════════════════════════════════════════════════════════\n");

    const tokens = [
      new UmojaToken(
        "Umoja Token",
        "UMOT",
        21000000000,
        2,
        "Governance + Utility + ETF Backed by BTC, Gold, Infrastructure Bonds"
      ),
      new UmojaToken(
        "Umoja Stable",
        "UMOS",
        1000000000,
        2,
        "Stablecoin backed by 10% BTC, 20% Gold, 40% HBAR USDC, 30% Kenyan Bonds"
      ),
      new UmojaToken(
        "Umoja Options",
        "UMOO",
        210000000000,
        0,
        "Options Trading Token + Ecosystem Gas Fee"
      ),
    ];

    const createdTokens = {};

    for (const token of tokens) {
      console.log(`📌 Creating ${token.name} (${token.symbol})...`);

      const txCreateToken = new TokenCreateTransaction()
        .setTokenName(token.name)
        .setTokenSymbol(token.symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(token.decimals)
        .setInitialSupply(token.supply)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(MY_ACCOUNT_ID)
        .setAdminKey(MY_PRIVATE_KEY)
        .setSupplyKey(MY_PRIVATE_KEY)
        .freezeWith(client);

      const txSign = await txCreateToken.sign(MY_PRIVATE_KEY);
      const txResponse = await txSign.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const tokenId = receipt.tokenId.toString();

      createdTokens[token.symbol] = tokenId;
      token.tokenId = tokenId;

      console.log(`   ✅ ${token.symbol} Created Successfully!`);
      console.log(`   Token ID: ${tokenId}`);
      console.log(`   Initial Supply: ${token.supply}`);
      console.log(`   Description: ${token.description}`);
      console.log(
        `   Explorer: https://hashscan.io/testnet/token/${tokenId}\n`
      );
    }

    // ==================== STEP 2: CREATE UMOJA GOVERNANCE TOPIC ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📡 STEP 2: Creating UMOJA Governance & Asset Verification Topic");
    console.log("═══════════════════════════════════════════════════════════\n");

    const txCreateGovernanceTopic = new TopicCreateTransaction()
      .setTopicMemo("UMOJA Hisa - DAO Governance & Asset Verification Stream")
      .freezeWith(client);

    const txGovernanceSign = await txCreateGovernanceTopic.sign(MY_PRIVATE_KEY);
    const txGovernanceResponse = await txGovernanceSign.execute(client);
    const governanceReceipt = await txGovernanceResponse.getReceipt(client);
    const governanceTopicId = governanceReceipt.topicId.toString();

    console.log("✅ Governance Topic Created!");
    console.log("   Topic ID:", governanceTopicId);
    console.log(
      "   Purpose: DAO Voting, Asset Tokenization, Governance Decisions\n"
    );

    // ==================== STEP 3: CREATE UCSE (CENTRAL SECURITIES EXCHANGE) TOPIC ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log(
      "🏛️  STEP 3: Creating UCSE (Umoja Central Securities Exchange) Topic"
    );
    console.log("═══════════════════════════════════════════════════════════\n");

    const txCreateUCSETopic = new TopicCreateTransaction()
      .setTopicMemo(
        "UCSE - SME Tokenization & Securities Trading Stream"
      )
      .freezeWith(client);

    const txUCSESign = await txCreateUCSETopic.sign(MY_PRIVATE_KEY);
    const txUCSEResponse = await txUCSESign.execute(client);
    const ucseReceipt = await txUCSEResponse.getReceipt(client);
    const ucseTopicId = ucseReceipt.topicId.toString();

    console.log("✅ UCSE Topic Created!");
    console.log("   Topic ID:", ucseTopicId);
    console.log(
      "   Purpose: SME Asset Tokenization, Securities Trading, Passive Liquidity\n"
    );

    // ==================== STEP 4: REGISTER DAO MEMBERS ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("👥 STEP 4: Registering UMOJA DAO Members (Max 15)");
    console.log("═══════════════════════════════════════════════════════════\n");

    const daoMembers = [
      new DAOMember("Y10_Admin_1", "wallet_y10_1", 5000000, "y10_member"),
      new DAOMember("Y10_Admin_2", "wallet_y10_2", 5000000, "y10_member"),
      new DAOMember("Y10_Admin_3", "wallet_y10_3", 5000000, "y10_member"),
      new DAOMember("Y10_Admin_4", "wallet_y10_4", 5000000, "y10_member"),
      new DAOMember(
        "Accredited_Investor_1",
        "wallet_accred_1",
        2000000,
        "accredited_investor"
      ),
      new DAOMember(
        "Accredited_Investor_2",
        "wallet_accred_2",
        2500000,
        "accredited_investor"
      ),
      new DAOMember(
        "Accredited_Investor_3",
        "wallet_accred_3",
        3000000,
        "accredited_investor"
      ),
      new DAOMember(
        "Institutional_Partner_1",
        "wallet_inst_1",
        1500000,
        "accredited_investor"
      ),
      new DAOMember(
        "Foundation_Partner",
        "wallet_foundation_1",
        2000000,
        "accredited_investor"
      ),
      new DAOMember(
        "Tech_Expert",
        "wallet_tech_1",
        1000000,
        "accredited_investor"
      ),
      new DAOMember(
        "Finance_Expert",
        "wallet_finance_1",
        1000000,
        "accredited_investor"
      ),
    ];

    let totalDAOContribution = 0;

    for (const member of daoMembers) {
      const daoMsg = {
        messageType: "dao_member_registration",
        memberId: member.memberId,
        name: member.name,
        walletAddress: member.walletAddress,
        contribution: member.contributionAmount,
        memberType: member.memberType,
        reputationScore: member.reputationScore,
        timestamp: member.dateJoined,
      };

      const txDAO = new TopicMessageSubmitTransaction()
        .setTopicId(governanceTopicId)
        .setMessage(JSON.stringify(daoMsg))
        .freezeWith(client);

      const txDAOSign = await txDAO.sign(MY_PRIVATE_KEY);
      await txDAOSign.execute(client);

      totalDAOContribution += member.contributionAmount;

      console.log(`   ✅ ${member.name} registered`);
      console.log(
        `      Type: ${member.memberType} | Contribution: ${member.contributionAmount} UMOS`
      );
    }

    console.log(`\n   Total DAO Treasury: ${totalDAOContribution} UMOS\n`);

    // ==================== STEP 5: ASSET TOKENIZATION (TaaS) ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🏗️  STEP 5: Tokenizing Real-World Assets (TaaS)");
    console.log("═══════════════════════════════════════════════════════════\n");

    const assets = [
      new AssetTokenization(
        "LAND_001",
        "land",
        "Ololua Forest, Nairobi",
        50000000,
        "Community_Forest_Association"
      ),
      new AssetTokenization(
        "LAND_002",
        "land",
        "Kipchoge Farm, Kericho",
        30000000,
        "Farmer_Cooperative"
      ),
      new AssetTokenization(
        "REIT_001",
        "real_estate",
        "Westlands Commercial Complex",
        100000000,
        "Umoja_Treasury"
      ),
      new AssetTokenization(
        "BOND_001",
        "infrastructure_bond",
        "Kenya Water Project",
        75000000,
        "Government_Partner"
      ),
      new AssetTokenization(
        "GOLD_001",
        "gold",
        "Geneva Vault Storage",
        25000000,
        "Umoja_Treasury"
      ),
      new AssetTokenization(
        "BTC_001",
        "bitcoin",
        "Hedera Custody",
        500000,
        "Umoja_Treasury"
      ),
    ];

    let totalAssetValue = 0;

    for (const asset of assets) {
      const assetMsg = {
        messageType: "asset_tokenization",
        assetId: asset.assetId,
        assetType: asset.assetType,
        location: asset.location,
        value: asset.value,
        owner: asset.owner,
        status: "verified",
        timestamp: asset.timestamp,
      };

      const txAsset = new TopicMessageSubmitTransaction()
        .setTopicId(governanceTopicId)
        .setMessage(JSON.stringify(assetMsg))
        .freezeWith(client);

      const txAssetSign = await txAsset.sign(MY_PRIVATE_KEY);
      await txAssetSign.execute(client);

      totalAssetValue += asset.value;

      console.log(`   ✅ ${asset.assetId} - ${asset.assetType.toUpperCase()}`);
      console.log(`      Location: ${asset.location}`);
      console.log(`      Valuation: ${asset.value} UMOS | Owner: ${asset.owner}`);
    }

    console.log(`\n   Total Asset Value: ${totalAssetValue} UMOS\n`);

    // ==================== STEP 6: SME TOKENIZATION (UCSE) ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🏢 STEP 6: SME Asset Tokenization via UCSE");
    console.log("═══════════════════════════════════════════════════════════\n");

    const smes = [
      new SMETokenOffering(
        "Nairobi Green Farms",
        "agri",
        5000000,
        15
      ),
      new SMETokenOffering(
        "TechHub Solutions",
        "tech",
        3000000,
        20
      ),
      new SMETokenOffering(
        "Easterly Retail Co",
        "retail",
        2000000,
        10
      ),
      new SMETokenOffering(
        "Women's Crafts Collective",
        "manufacturing",
        1500000,
        25
      ),
    ];

    let totalSMECapital = 0;

    for (const sme of smes) {
      // Calculate tokens minted
      const tokenPrice = sme.requestedCapital / (100 / sme.equityShare);
      sme.tokensMinted = Math.floor(sme.requestedCapital / tokenPrice);

      const smeMsg = {
        messageType: "sme_offering",
        smeId: sme.smeId,
        smeName: sme.smeName,
        businessType: sme.businessType,
        requestedCapital: sme.requestedCapital,
        equityShare: sme.equityShare,
        tokensMinted: sme.tokensMinted,
        status: "active",
        timestamp: new Date().toISOString(),
      };

      const txSME = new TopicMessageSubmitTransaction()
        .setTopicId(ucseTopicId)
        .setMessage(JSON.stringify(smeMsg))
        .freezeWith(client);

      const txSMESign = await txSME.sign(MY_PRIVATE_KEY);
      await txSMESign.execute(client);

      totalSMECapital += sme.requestedCapital;

      console.log(`   ✅ ${sme.smeName}`);
      console.log(`      Type: ${sme.businessType.toUpperCase()}`);
      console.log(
        `      Capital Sought: ${sme.requestedCapital} UMOS | Equity: ${sme.equityShare}%`
      );
      console.log(`      Tokens Minted: ${sme.tokensMinted} SME-Tokens\n`);
    }

    console.log(`   Total SME Capital Raised: ${totalSMECapital} UMOS\n`);

    // ==================== STEP 7: YIELD VAULTS ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("💰 STEP 7: AI-Powered Yield Optimization Vaults");
    console.log("═══════════════════════════════════════════════════════════\n");

    const vaults = [
      new YieldVault("Bitcoin Farming", "bitcoin_yield", 12),
      new YieldVault("Bond Farming", "bond_yield", 8),
      new YieldVault("Mixed Strategy", "diversified_yield", 10),
      new YieldVault("Aggressive Growth", "high_yield", 15),
      new YieldVault("Conservative", "low_risk", 6),
    ];

    for (const vault of vaults) {
      vault.tvl = Math.random() * 10000000 + 1000000; // Random TVL

      const vaultMsg = {
        messageType: "yield_vault",
        vaultId: vault.vaultId,
        vaultName: vault.vaultName,
        strategy: vault.strategy,
        targetAPY: vault.targetAPY,
        tvl: Math.floor(vault.tvl),
        aiPowered: true,
        timestamp: new Date().toISOString(),
      };

      const txVault = new TopicMessageSubmitTransaction()
        .setTopicId(governanceTopicId)
        .setMessage(JSON.stringify(vaultMsg))
        .freezeWith(client);

      const txVaultSign = await txVault.sign(MY_PRIVATE_KEY);
      await txVaultSign.execute(client);

      console.log(`   ✅ ${vault.vaultName}`);
      console.log(
        `      Strategy: ${vault.strategy} | Target APY: ${vault.targetAPY}%`
      );
      console.log(`      TVL: ${Math.floor(vault.tvl)} UMOS\n`);
    }

    // ==================== STEP 8: QR-BASED PAYMENTS ====================
    console.log("═══════════════════════════════════════════════════════════");
    console.log("📱 STEP 8: QR-Based Scan-to-Send Payments");
    console.log("═══════════════════════════════════════════════════════════\n");

    const qrPayments = [
      new QRPayment("farmer_john", "merchant_mary", 5000, "UMOS"),
      new QRPayment("student_alice", "school_fees_account", 15000, "UMOS"),
      new QRPayment("investor_bob", "sme_nairobi_green", 100000, "UMOT"),
      new QRPayment("diaspora_jane", "family_nairobi", 25000, "UMOS"),
    ];

    for (const payment of qrPayments) {
      const qrMsg = {
        messageType: "qr_payment",
        paymentId: payment.paymentId,
        sender: payment.sender,
        recipient: payment.recipient,
        amount: payment.amount,
        tokenType: payment.tokenType,
        qrCodeData: payment.qrCode.data,
        status: "settled",
        settlementTime: "3-5 seconds",
        fee: "< $0.01",
        timestamp: payment.timestamp,
      };

      const txQR = new TopicMessageSubmitTransaction()
        .setTopicId(ucseTopicId)
        .setMessage(JSON.stringify(qrMsg))
        .freezeWith(client);

      const txQRSign = await txQR.sign(MY_PRIVATE_KEY);
      await txQRSign.execute(client);

      console.log(`   ✅ ${payment.paymentId}`);
      console.log(
        `      ${payment.sender} → ${payment.recipient} | ${payment.amount} ${payment.tokenType}`
      );
      console.log(`      QR Code: [GENERATED] | Settlement: 3-5 seconds\n`);
    }

    // ==================== FINAL SUMMARY ====================
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    🎉 UMOJA ECOSYSTEM SUMMARY 🎉                ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📊 TRIPLE-TOKEN MODEL:");
    console.log(`   UMOT (Governance): ${createdTokens.UMOT}`);
    console.log(`   UMOS (Stablecoin): ${createdTokens.UMOS}`);
    console.log(`   UMOO (Options):    ${createdTokens.UMOO}\n`);

    console.log("🏛️  GOVERNANCE INFRASTRUCTURE:");
    console.log(`   Governance Topic: ${governanceTopicId}`);
    console.log(`   UCSE Topic:       ${ucseTopicId}`);
    console.log(`   DAO Members:      ${daoMembers.length}/15`);
    console.log(`   DAO Treasury:     ${totalDAOContribution} UMOS\n`);

    console.log("🏗️  REAL-WORLD ASSET TOKENIZATION (TaaS):");
    console.log(`   Assets Tokenized:  ${assets.length}`);
    console.log(`   Total Asset Value: ${totalAssetValue} UMOS`);
    console.log(`   Asset Types:       Land, REITs, Bonds, Gold, Bitcoin\n`);

    console.log("🏢 SME CAPITAL MARKET (UCSE):");
    console.log(`   SMEs Registered:   ${smes.length}`);
    console.log(`   Total Capital:     ${totalSMECapital} UMOS`);
    console.log(`   Passive Liquidity: Enabled via tokenization\n`);

    console.log("💰 YIELD OPTIMIZATION:");
    console.log(`   Vaults Deployed:   ${vaults.length}`);
    console.log(`   Strategies:        Bitcoin, Bonds, Mixed, Aggressive, Conservative`);
    console.log(`   AI-Powered:        Yes (Agentic AI Integration)\n`);

    console.log("📱 PAYMENT INFRASTRUCTURE:");
    console.log(`   QR Payments:       ${qrPayments.length} transactions`);
    console.log(`   Settlement Time:   3-5 seconds`);
    console.log(`   Average Fee:       < $0.01\n`);

    console.log("🔗 HEDERA EXPLORER LINKS:");
    console.log(
      `   Governance Topic: https://hashscan.io/testnet/topic/${governanceTopicId}`
    );
    console.log(
      `   UCSE Topic:       https://hashscan.io/testnet/topic/${ucseTopicId}`
    );
    console.log(
      `   Account:          https://hashscan.io/testnet/account/${MY_ACCOUNT_ID}\n`
    );

    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  ✨ UMOJA HISA ECOSYSTEM INITIALIZED SUCCESSFULLY! ✨        ║");
    console.log("║   Democratizing Finance for Kenya & Africa's Prosperity    ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    if (client) {
      client.close();
    }
  }
}

main();