import React, { useState, useEffect } from 'react';
import { Trees, Heart, Coins, MessageCircle } from 'lucide-react';
import WalletConnect from './components/Wallet/WalletConnect';
import TreePlanting from './components/Jani/TreePlanting';
import UmojaDashboard from './components/Umoja/UmojaDashboard';
import ChatDashboard from './components/Chat/ChatDashboard';
import { CelebrationService } from './services/celebration';
import './styles/festive.css';
import './styles/animations.css';

function App() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial celebration animation
    setTimeout(() => {
      CelebrationService.createConfetti(50);
      CelebrationService.createSparkles(15);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: null },
    { id: 'jani', label: 'Jani', icon: <Trees size={20} /> },
    { id: 'hisa', label: 'Hisa', icon: <Heart size={20} /> },
    { id: 'umoja', label: 'Umoja', icon: <Coins size={20} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletConnect />;
      case 'jani':
        return <TreePlanting />;
      case 'hisa':
        return (
          <div className="festive-container hisa-theme">
            <div className="festive-header">
              <h2 className="festive-title">❤️ Hisa - Health & Wellness</h2>
              <p className="festive-subtitle">AI-powered health assistant and wellness rewards</p>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Health module coming soon! Connect your wallet to get started.</p>
            </div>
          </div>
        );
      case 'umoja':
        return <UmojaDashboard />;
      case 'chat':
        return <ChatDashboard />;
      default:
        return <WalletConnect />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, var(--royal-purple) 0%, var(--festive-orange) 100%)',
        padding: '1rem 2rem',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="african-pattern"></div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(45deg, var(--celebration-gold), var(--bright-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          HISA MVP 🎉
        </h1>
        <p style={{ color: 'white', opacity: 0.9 }}>
          Hedera Integrated Sustainability Application - Testnet Demo
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(26, 26, 46, 0.8)',
        padding: '1rem',
        borderBottom: '2px solid var(--celebration-gold)'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="celebration-button"
              style={{
                background: activeTab === tab.id
                  ? 'linear-gradient(45deg, var(--festive-orange), var(--sunset-pink))'
                  : 'rgba(255,255,255,0.1)',
                padding: '10px 20px',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        marginTop: '2rem',
        borderTop: '1px solid rgba(255,215,63,0.3)'
      }}>
        <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
          Built on Hedera Hashgraph Testnet • All transactions are real and verifiable on HashScan
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="https://testnet.hashscan.io" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--bright-cyan)', textDecoration: 'none' }}>
            View on HashScan
          </a>
          <a href="https://hedera.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--bright-cyan)', textDecoration: 'none' }}>
            Hedera Documentation
          </a>
          <a href="https://hashpack.app" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--bright-cyan)', textDecoration: 'none' }}>
            Get HashPack Wallet
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
