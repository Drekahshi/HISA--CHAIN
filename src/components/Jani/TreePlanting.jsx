import React, { useState, useEffect } from 'react';
import { TreePine, MapPin, Zap, ExternalLink, Loader2 } from 'lucide-react';
import SHA256 from 'crypto-js/sha256';
import { hederaService } from '../../services/hedera';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

// Helper function to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TreePlanting = () => {
  const [trees, setTrees] = useState([]);
  const [planting, setPlanting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [janiTopicId, setJaniTopicId] = useState(hederaService.topicIds.JANI);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    // This is just for displaying some mock data, not used in the transaction logic
    const mockTrees = [
      { id: 1, species: 'Mukuyu (Fig)', location: 'Oloolua Forest', gps: '-1.3733, 36.7425', age: '2 years', health: 'Excellent' },
      { id: 2, species: 'Mugumo (Sacred Fig)', location: 'Oloolua Forest', gps: '-1.3728, 36.7419', age: '5 years', health: 'Good' },
    ];
    setTrees(mockTrees);
  }, []);

  const createJaniTopic = async () => {
    setStatusMessage('Creating Jani HCS topic...');
    const accountId = hashConnectService.getAccountId();
    const createTopicTx = hederaService.createTopicTransaction();
    const txBytes = createTopicTx.toBytes();

    const response = await hashConnectService.sendTransaction(txBytes, accountId);
    const transactionId = response.transactionId.toString();

    setStatusMessage(`Topic creation submitted (Tx: ${transactionId.substring(0, 10)}...). Waiting for receipt...`);

    // Poll mirror node for the record
    let record = null;
    for (let i = 0; i < 10; i++) { // Poll for a max of ~30 seconds
      record = await hederaService.getTransactionRecord(transactionId);
      if (record && record.receipt && record.receipt.topic_id) {
        break;
      }
      await sleep(3000);
    }

    if (record && record.receipt && record.receipt.topic_id) {
      const newTopicId = record.receipt.topic_id;
      hederaService.topicIds.JANI = newTopicId;
      setJaniTopicId(newTopicId);
      setStatusMessage(`Jani topic created: ${newTopicId}`);
      return newTopicId;
    } else {
      throw new Error("Could not retrieve topic creation receipt from mirror node.");
    }
  };

  const plantTree = async () => {
    if (!hashConnectService.isConnected()) {
      alert('Please connect your wallet first');
      return;
    }

    setPlanting(true);
    setStatusMessage('Preparing transaction...');

    try {
      let currentTopicId = janiTopicId;
      if (!currentTopicId) {
        currentTopicId = await createJaniTopic();
      }

      const treeRecord = {
        treeId: `T${Date.now()}`,
        species: 'Mukuyu (Fig)',
        gps: [-1.3733, 36.7425],
        plantedBy: hashConnectService.getAccountId(),
        validator: "HISA_APP_VALIDATOR",
        status: "Growing",
        timestamp: new Date().toISOString(),
      };

      const recordString = JSON.stringify(treeRecord);
      const recordHash = SHA256(recordString).toString();
      setStatusMessage(`Record hash generated: ${recordHash.substring(0, 10)}...`);

      const accountId = hashConnectService.getAccountId();
      const submitMessageTx = hederaService.submitTopicMessageTransaction(currentTopicId, recordHash);
      const txBytes = submitMessageTx.toBytes();

      setStatusMessage('Please sign the transaction in your wallet...');
      const response = await hashConnectService.sendTransaction(txBytes, accountId);

      const transactionId = response.transactionId.toString();
      const newTransaction = {
        id: transactionId,
        type: 'Tree Planted (HCS)',
        status: 'Submitted',
        hash: recordHash,
        data: recordString,
        transactionId,
      };
      setTransactionHistory(prev => [newTransaction, ...prev]);

      CelebrationService.createConfetti(200);
      CelebrationService.createSparkles(40);
      CelebrationService.showCelebrationMessage('Tree Planting Recorded on Hedera!');

    } catch (error) {
      console.error('Error planting tree:', error);
      setStatusMessage(`Error: ${error.message}`);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setPlanting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="festive-container jani-theme">
      <div className="festive-header">
        <h2 className="festive-title">🌿 Jani - Tree Planting</h2>
        <p className="festive-subtitle">Record your conservation efforts on the Hedera network.</p>
      </div>

      <div className="african-pattern-bg" style={{ padding: '2rem', borderRadius: '15px', marginBottom: '2rem', textAlign: 'center' }}>
        <button
          onClick={plantTree}
          disabled={planting}
          className="celebration-button pulse"
          style={{
            fontSize: '1.2rem',
            padding: '15px 30px',
            background: 'linear-gradient(45deg, var(--forest-green), var(--bright-cyan))'
          }}
        >
          {planting ? <Loader2 className="animate-spin" /> : <TreePine size={24} style={{ marginRight: '10px' }} />}
          {planting ? 'Processing...' : 'Plant a Tree & Record on Hedera'}
        </button>
        {statusMessage && <p style={{ marginTop: '1rem', color: 'var(--bright-cyan)' }}>{statusMessage}</p>}
        {!janiTopicId && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Note: A new HCS topic will be created on the first transaction.</p>}
      </div>

      {transactionHistory.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>Your On-Chain Transactions</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {transactionHistory.map(tx => (
              <div key={tx.id} className="token-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--bright-cyan)' }}>{tx.type}</h4>
                  <a href={hederaService.getHashScanUrl(tx.transactionId)} target="_blank" rel="noopener noreferrer" className="celebration-button" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    <ExternalLink size={14} /> View on HashScan
                  </a>
                </div>
                <div style={{ fontSize: '0.8rem', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '5px' }}>
                  <p><strong>Transaction ID:</strong> {tx.transactionId}</p>
                  <p><strong>Record Hash:</strong> {tx.hash}</p>
                  <details>
                    <summary style={{ cursor: 'pointer', marginTop: '0.5rem' }}>View Original Data</summary>
                    <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '5px', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(JSON.parse(tx.data), null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreePlanting;
