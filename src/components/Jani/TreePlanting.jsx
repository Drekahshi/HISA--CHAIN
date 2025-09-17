import React, { useState, useEffect } from 'react';
import { TreePine, MapPin, Zap, ExternalLink } from 'lucide-react';
import SHA256 from 'crypto-js/sha256';
import { hederaService } from '../../services/hedera';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

const TreePlanting = () => {
  const [trees, setTrees] = useState([]);
  const [planting, setPlanting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [janiTopicId, setJaniTopicId] = useState(hederaService.topicIds.JANI);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const mockTrees = [
    { id: 1, species: 'Mukuyu (Fig)', location: 'Oloolua Forest', gps: '-1.3733, 36.7425', age: '2 years', health: 'Excellent' },
    { id: 2, species: 'Mugumo (Sacred Fig)', location: 'Oloolua Forest', gps: '-1.3728, 36.7419', age: '5 years', health: 'Good' },
    { id: 3, species: 'Cedar', location: 'Oloolua Forest', gps: '-1.3741, 36.7432', age: '1 year', health: 'Growing' },
    { id: 4, species: 'Bamboo', location: 'Oloolua Forest', gps: '-1.3730, 36.7405', age: '6 months', health: 'Excellent' },
  ];

  useEffect(() => {
    setTrees(mockTrees);
  }, []);

  const createJaniTopic = async () => {
    setStatusMessage('Creating Jani HCS topic...');
    const accountId = hashConnectService.getAccountId();
    const createTopicTx = await hederaService.createTopicTransaction();
    const txBytes = createTopicTx.toBytes();

    const response = await hashConnectService.sendTransaction(txBytes, accountId);

    if (response.receipt) {
      const newTopicId = response.receipt.topicId.toString();
      hederaService.topicIds.JANI = newTopicId;
      setJaniTopicId(newTopicId);
      setStatusMessage(`Jani topic created: ${newTopicId}`);
      return newTopicId;
    } else {
      throw new Error("Failed to get topic creation receipt");
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

      // 1. Construct the tree data record
      const treeRecord = {
        treeId: `T${Date.now()}`,
        species: 'Mukuyu (Fig)',
        gps: [-1.3733, 36.7425],
        plantedBy: hashConnectService.getAccountId(),
        validator: "HISA_APP_VALIDATOR", // As per user spec
        status: "Growing",
        timestamp: new Date().toISOString(),
      };

      // 2. Hash the record
      const recordString = JSON.stringify(treeRecord);
      const recordHash = SHA256(recordString).toString();
      setStatusMessage(`Record hash generated: ${recordHash.substring(0, 10)}...`);

      // 3. Build and send the HCS transaction
      const accountId = hashConnectService.getAccountId();
      const submitMessageTx = await hederaService.submitTopicMessageTransaction(currentTopicId, recordHash);
      const txBytes = submitMessageTx.toBytes();

      setStatusMessage('Please sign the transaction in your wallet...');
      const response = await hashConnectService.sendTransaction(txBytes, accountId);

      // 4. Update history and celebrate
      const transactionId = response.transactionId.toString();
      const newTransaction = {
        id: transactionId,
        type: 'Tree Planted (HCS)',
        status: 'Completed',
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

  const viewOnHashScan = (transactionId) => {
    window.open(hederaService.getHashScanUrl(transactionId), '_blank');
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
          {planting ? 'Processing...' : (
            <>
              <TreePine size={24} style={{ marginRight: '10px' }} />
              Plant a Tree & Record on Hedera
            </>
          )}
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
                  <button
                    onClick={() => viewOnHashScan(tx.transactionId)}
                    className="celebration-button"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} /> View on HashScan
                  </button>
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
