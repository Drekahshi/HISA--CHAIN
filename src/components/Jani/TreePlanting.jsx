import React, { useState, useEffect } from 'react';
import { TreePine, MapPin, Camera, Zap, ExternalLink } from 'lucide-react';
import { hederaService } from '../../services/hedera';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

const TreePlanting = () => {
  const [trees, setTrees] = useState([]);
  const [planting, setPlanting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Oloolua Forest');
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Mock tree data for Oloolua Forest
  const mockTrees = [
    { id: 1, species: 'Mukuyu (Fig)', location: 'Oloolua Forest', gps: '-1.3733, 36.7425', age: '2 years', health: 'Excellent' },
    { id: 2, species: 'Mugumo (Sacred Fig)', location: 'Oloolua Forest', gps: '-1.3728, 36.7419', age: '5 years', health: 'Good' },
    { id: 3, species: 'Cedar', location: 'Oloolua Forest', gps: '-1.3741, 36.7432', age: '1 year', health: 'Growing' },
    { id: 4, species: 'Bamboo', location: 'Oloolua Forest', gps: '-1.3730, 36.7405', age: '6 months', health: 'Excellent' },
  ];

  useEffect(() => {
    setTrees(mockTrees);
  }, []);

  const plantTree = async () => {
    if (!hashConnectService.isConnected()) {
      alert('Please connect your wallet first');
      return;
    }

    setPlanting(true);
    try {
      // Simulate planting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock transaction data (in real app, this would be real Hedera transactions)
      const mockTransaction = {
        id: Date.now(),
        type: 'Tree Planting',
        location: selectedLocation,
        gps: '-1.3733, 36.7425',
        species: 'Mukuyu',
        timestamp: new Date().toISOString(),
        transactionId: `0.0.${Math.floor(Math.random() * 1000000)}@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000000000)}`,
        status: 'Completed'
      };

      setTransactionHistory(prev => [mockTransaction, ...prev]);

      // Celebration!
      CelebrationService.createConfetti(200);
      CelebrationService.createSparkles(40);
      CelebrationService.playCelebrationSound();
      CelebrationService.showCelebrationMessage('Tree Planted Successfully!');

    } catch (error) {
      console.error('Error planting tree:', error);
    } finally {
      setPlanting(false);
    }
  };

  const viewOnHashScan = (transactionId) => {
    window.open(`https://testnet.hashscan.io/transaction/${transactionId}`, '_blank');
  };

  return (
    <div className="festive-container jani-theme">
      <div className="festive-header">
        <h2 className="festive-title">🌿 Jani - Tree Planting</h2>
        <p className="festive-subtitle">Plant trees in Oloolua Forest and earn JANI tokens</p>
      </div>

      <div className="african-pattern-bg" style={{ padding: '2rem', borderRadius: '15px', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: 'var(--forest-green)', marginBottom: '1rem' }}>
              <MapPin size={20} style={{ marginRight: '10px' }} />
              Oloolua Forest
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              GPS: -1.3733, 36.7425<br />
              Area: 1,100 acres<br />
              Elevation: 1,600-1,800m
            </p>

            <div className="celebration-button" style={{ marginBottom: '1rem' }}>
              <TreePine size={20} style={{ marginRight: '10px' }} />
              {trees.length} Trees Planted
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--bright-cyan)', marginBottom: '1rem' }}>
              <Zap size={20} style={{ marginRight: '10px' }} />
              Environmental Impact
            </h3>
            <p>
              CO2 Sequestered: 12.4 tons<br />
              Forest Coverage: +2.3% this year<br />
              Community Participants: 156
            </p>
          </div>
        </div>

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
          {planting ? 'Planting Tree...' : (
            <>
              <TreePine size={24} style={{ marginRight: '10px' }} />
              Plant a Tree in Oloolua Forest
            </>
          )}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>Recent Tree Plantings</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {trees.slice(0, 4).map(tree => (
            <div key={tree.id} className="token-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--forest-green)' }}>{tree.species}</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{tree.location} • {tree.age}</p>
                </div>
                <span style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  background: 'rgba(76, 175, 80, 0.2)',
                  color: 'var(--forest-green)',
                  fontSize: '0.8rem'
                }}>
                  {tree.health}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {transactionHistory.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>Your Transactions</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {transactionHistory.map(tx => (
              <div key={tx.id} className="token-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--bright-cyan)' }}>{tx.type}</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      {tx.species} • {tx.location}<br />
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => viewOnHashScan(tx.transactionId)}
                    className="celebration-button"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <ExternalLink size={14} /> View
                  </button>
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '5px 10px',
                  background: 'rgba(6, 255, 165, 0.1)',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all'
                }}>
                  TX: {tx.transactionId}
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
