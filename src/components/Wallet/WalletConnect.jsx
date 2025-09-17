import React, { useState, useEffect } from 'react';
import { HashpackIcon, Copy, ExternalLink } from 'lucide-react';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (hashConnectService.isConnected()) {
      setIsConnected(true);
      setAccountId(hashConnectService.getAccountId());
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const account = await hashConnectService.connectToWallet();
      setAccountId(account);
      setIsConnected(true);

      // Celebration!
      CelebrationService.createConfetti(150);
      CelebrationService.createSparkles(30);
      CelebrationService.playCelebrationSound();
      CelebrationService.showCelebrationMessage('Wallet Connected Successfully!');

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure HashPack is installed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await hashConnectService.disconnect();
      setIsConnected(false);
      setAccountId('');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const copyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    CelebrationService.createSparkles(10);
  };

  const viewOnHashScan = () => {
    window.open(`https://testnet.hashscan.io/account/${accountId}`, '_blank');
  };

  return (
    <div className="festive-container">
      <div className="festive-header">
        <h2 className="festive-title">Wallet Connection</h2>
        <p className="festive-subtitle">Connect your HashPack wallet to get started</p>
      </div>

      {!isConnected ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <HashpackIcon size={64} style={{ marginBottom: '1rem', color: 'var(--celebration-gold)' }} />
          <button
            className="celebration-button pulse"
            onClick={handleConnect}
            disabled={loading}
            style={{ fontSize: '1.2rem', padding: '15px 30px' }}
          >
            {loading ? 'Connecting...' : 'Connect HashPack Wallet'}
          </button>
          <p style={{ marginTop: '1rem', opacity: 0.8 }}>
            Make sure you have the HashPack extension installed
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="token-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <HashpackIcon size={48} style={{ marginBottom: '1rem', color: 'var(--bright-cyan)' }} />
            <h3 style={{ marginBottom: '1rem', color: 'var(--celebration-gold)' }}>Wallet Connected</h3>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              wordBreak: 'break-all'
            }}>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Account ID:</p>
              <p style={{ fontWeight: 'bold', margin: '0.5rem 0' }}>{accountId}</p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  onClick={copyAccountId}
                  className="celebration-button"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  <Copy size={16} style={{ marginRight: '5px' }} /> Copy
                </button>

                <button
                  onClick={viewOnHashScan}
                  className="celebration-button"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  <ExternalLink size={16} style={{ marginRight: '5px' }} /> View
                </button>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="celebration-button"
              style={{
                background: 'linear-gradient(45deg, var(--sunset-pink), var(--royal-purple))',
                padding: '10px 20px'
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
