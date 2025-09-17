import React, { useState } from 'react';
import { Feather, Loader2, ExternalLink } from 'lucide-react';
import SHA256 from 'crypto-js/sha256';
import { hederaService } from '../../services/hedera';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ChatDashboard = () => {
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState('');
  const [collectionId, setCollectionId] = useState(hederaService.tokenIds.CHAT_NFT_COLLECTION);
  const [mintHistory, setMintHistory] = useState([]);

  const createNftCollection = async () => {
    setStatus('Creating NFT Collection...');
    const accountId = hashConnectService.getAccountId();
    const publicKey = hashConnectService.getPublicKey();

    if (!publicKey) {
      throw new Error("Could not retrieve public key from wallet. Please reconnect.");
    }

    const createTx = hederaService.createNftCollectionTransaction("HISA Cultural Assets", "HISA-C", accountId, publicKey);
    const txBytes = createTx.toBytes();
    const response = await hashConnectService.sendTransaction(txBytes, accountId);
    const transactionId = response.transactionId.toString();

    setStatus(`Collection creation submitted (Tx: ${transactionId.substring(0, 10)}...). Waiting for receipt...`);

    let record = null;
    for (let i = 0; i < 10; i++) {
      record = await hederaService.getTransactionRecord(transactionId);
      if (record && record.receipt && record.receipt.token_id) break;
      await sleep(3000);
    }

    if (record && record.receipt && record.receipt.token_id) {
      const newCollectionId = record.receipt.token_id;
      hederaService.tokenIds.CHAT_NFT_COLLECTION = newCollectionId;
      setCollectionId(newCollectionId);
      setStatus(`Collection created: ${newCollectionId}`);
      return newCollectionId;
    } else {
      throw new Error("Could not retrieve NFT Collection creation receipt from mirror node.");
    }
  };

  const handleMint = async () => {
    if (!hashConnectService.isConnected()) return alert('Please connect your wallet first');
    if (!nftName || !nftDescription) return alert('Please provide a name and description for the NFT.');

    setMinting(true);
    try {
      let currentCollectionId = collectionId;
      if (!currentCollectionId) {
        currentCollectionId = await createNftCollection();
      }

      setStatus('Preparing NFT mint...');
      const metadata = { name: nftName, description: nftDescription, created_at: new Date().toISOString() };
      const cid = SHA256(JSON.stringify(metadata)).toString(); // Simulate CID

      const mintTx = hederaService.mintNftTransaction(currentCollectionId, cid);
      const txBytes = mintTx.toBytes();

      setStatus('Please sign the mint transaction...');
      const response = await hashConnectService.sendTransaction(txBytes, hashConnectService.getAccountId());
      const transactionId = response.transactionId.toString();

      // The serial number is in the receipt, which we can get by polling
      // For the MVP, we'll just show the transaction ID
      const newNft = { id: transactionId, name: nftName, cid, transactionId };
      setMintHistory(prev => [newNft, ...prev]);

      CelebrationService.showCelebrationMessage('NFT Minted Successfully!');

    } catch (error) {
      setStatus(`Error: ${error.message}`);
      alert(`An error occurred: ${error.message}`);
      console.error(error);
    } finally {
      setMinting(false);
      setStatus('');
      setNftName('');
      setNftDescription('');
    }
  };

  return (
    <div className="festive-container chat-theme">
      <div className="festive-header">
        <h2 className="festive-title">🎨 Chat - Cultural Heritage</h2>
        <p className="festive-subtitle">Preserve and monetize cultural assets as NFTs on Hedera.</p>
      </div>

      <div className="token-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--bright-cyan)', marginBottom: '1rem', textAlign: 'center' }}>Mint a Cultural Asset NFT</h3>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Asset Name:</label>
            <input type="text" value={nftName} onChange={e => setNftName(e.target.value)} placeholder="e.g., Maasai Beaded Necklace"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: 'none', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}/>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description / Story:</label>
            <textarea value={nftDescription} onChange={e => setNftDescription(e.target.value)} placeholder="A short story about the asset's origin and significance."
              rows="3" style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: 'none', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}/>
          </div>
          <button onClick={handleMint} disabled={minting} className="celebration-button" style={{ width: '100%', marginTop: '1rem' }}>
            {minting ? <Loader2 className="animate-spin" /> : 'Mint NFT'}
          </button>
          {status && <p style={{ marginTop: '1rem', color: 'var(--bright-cyan)', textAlign: 'center' }}>{status}</p>}
           {!collectionId && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>Note: A new NFT Collection will be created on the first mint.</p>}
        </div>
      </div>

      {mintHistory.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--bright-cyan)', marginBottom: '1rem' }}>Recently Minted NFTs</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {mintHistory.map(nft => (
              <div key={nft.id} className="token-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--celebration-gold)' }}>{nft.name}</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, wordBreak: 'break-all' }}>CID (simulated): {nft.cid}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, wordBreak: 'break-all' }}>Mint TX: {nft.transactionId}</p>
                  </div>
                  <a href={hederaService.getHashScanUrl(nft.transactionId)} target="_blank" rel="noopener noreferrer" className="celebration-button" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    <ExternalLink size={14} /> View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;
