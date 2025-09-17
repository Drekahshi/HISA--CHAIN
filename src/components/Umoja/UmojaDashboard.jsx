import React, { useState, useEffect } from 'react';
import { Coins, Loader2, ArrowDownUp, ExternalLink } from 'lucide-react';
import { hederaService } from '../../services/hedera';
import { hashConnectService } from '../../services/hashconnect';
import { CelebrationService } from '../../services/celebration';

const UmojaDashboard = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [swapAmount, setSwapAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState('');
  const [swapHistory, setSwapHistory] = useState([]);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const poolData = await hederaService.getSaucerSwapPools();
        setPools(poolData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch liquidity pools. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  const handleSwap = async () => {
    if (!hashConnectService.isConnected()) return alert('Please connect your wallet first');
    if (!swapAmount || isNaN(swapAmount) || parseFloat(swapAmount) <= 0) return alert('Please enter a valid amount to swap.');

    setIsSwapping(true);
    const accountId = hashConnectService.getAccountId();
    const routerContractId = '0.0.19264'; // SaucerSwap V1 Router on Testnet

    try {
      const pool = pools[0];
      if (!pool) throw new Error("No liquidity pools available for swapping.");

      const tokenA = pool.tokenA;
      const tokenB = pool.tokenB;
      const amountIn = Math.floor(parseFloat(swapAmount) * Math.pow(10, tokenA.decimals));

      // --- Step 1: Approve Token Allowance ---
      setSwapStatus('Step 1/2: Approving token allowance...');
      const approvalTx = hederaService.createTokenApprovalTransaction(tokenA.id, routerContractId, amountIn);
      const approvalTxBytes = approvalTx.toBytes();

      await hashConnectService.sendTransaction(approvalTxBytes, accountId);
      setSwapStatus('Approval successful! Proceeding to swap...');
      // In a real app, we should wait for the approval to be confirmed by a mirror node.
      // For this MVP, we'll just wait a few seconds.
      await new Promise(resolve => setTimeout(resolve, 5000));

      // --- Step 2: Execute Swap ---
      setSwapStatus('Step 2/2: Executing swap...');
      const amountOutMin = 0; // No slippage protection for MVP
      const path = [tokenA.id, tokenB.id];
      const deadline = Math.floor(Date.now() / 1000) + 300;

      const swapTx = hederaService.createSwapTransaction(routerContractId, amountIn, amountOutMin, path, accountId, deadline);
      const swapTxBytes = swapTx.toBytes();

      const response = await hashConnectService.sendTransaction(swapTxBytes, accountId);

      const transactionId = response.transactionId.toString();
      const newSwap = {
        id: transactionId,
        from: `${swapAmount} ${tokenA.symbol}`,
        to: `${tokenB.symbol}`,
        status: 'Completed',
        transactionId,
      };
      setSwapHistory(prev => [newSwap, ...prev]);

      CelebrationService.showCelebrationMessage('Swap Submitted Successfully!');

    } catch (err) {
      setSwapStatus(`Error: ${err.message}`);
      alert(`Swap failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsSwapping(false);
      setSwapStatus('');
      setSwapAmount('');
    }
  };

  const formatReserve = (amount, decimals) => (parseFloat(amount) / Math.pow(10, decimals)).toFixed(2);

  return (
    <div className="festive-container umoja-theme">
      <div className="festive-header">
        <h2 className="festive-title">💰 Umoja - Community Finance</h2>
        <p className="festive-subtitle">SaucerSwap V1 Integration (Testnet)</p>
      </div>

      <div className="token-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem', textAlign: 'center' }}>Swap Tokens</h3>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.8rem', textAlign: 'center', opacity: 0.7, marginBottom: '1rem' }}>
            This is a 2-step process: 1. Approve, 2. Swap. You will be asked to sign twice.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <label>You Pay:</label>
            <input type="number" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} placeholder="0.0"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: 'none', background: 'rgba(0,0,0,0.2)', color: 'white', marginTop: '0.5rem' }}/>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
              {pools.length > 0 ? `Token: ${pools[0].tokenA.symbol}` : 'Loading...'}
            </p>
          </div>
          <div style={{ textAlign: 'center', margin: '1rem 0' }}><ArrowDownUp size={24} /></div>
          <div>
            <label>You Receive (estimate):</label>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '5px', marginTop: '0.5rem', minHeight: '2.5rem' }} />
            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem' }}>
              {pools.length > 0 ? `Token: ${pools[0].tokenB.symbol}` : 'Loading...'}
            </p>
          </div>
          <button onClick={handleSwap} disabled={isSwapping || loading || !pools.length}
            className="celebration-button" style={{ width: '100%', marginTop: '2rem', background: 'linear-gradient(45deg, var(--celebration-gold), var(--festive-orange))' }}>
            {isSwapping ? <Loader2 className="animate-spin" /> : 'Approve & Swap'}
          </button>
          {swapStatus && <p style={{ marginTop: '1rem', color: 'var(--bright-cyan)', textAlign: 'center' }}>{swapStatus}</p>}
        </div>
      </div>

      <div>
        <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>Available Liquidity Pools</h3>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={48} /><p style={{ marginLeft: '1rem', fontSize: '1.2rem' }}>Loading Pools...</p></div>}
        {error && <p style={{ color: 'var(--sunset-pink)', textAlign: 'center', padding: '1rem' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pools.slice(0, 5).map(pool => (
              <div key={pool.contractId} className="token-card">
                <h4 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>{pool.tokenA.symbol} / {pool.tokenB.symbol}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{pool.tokenA.symbol} Reserve</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatReserve(pool.tokenReserveA, pool.tokenA.decimals)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{pool.tokenB.symbol} Reserve</p>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatReserve(pool.tokenReserveB, pool.tokenB.decimals)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {swapHistory.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--celebration-gold)', marginBottom: '1rem' }}>Your Swap History</h3>
          {swapHistory.map(tx => (
             <div key={tx.id} className="token-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--bright-cyan)' }}>Swap: {tx.from} to {tx.to}</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, wordBreak: 'break-all' }}>TX: {tx.transactionId}</p>
                </div>
                <a href={hederaService.getHashScanUrl(tx.transactionId)} target="_blank" rel="noopener noreferrer" className="celebration-button" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  <ExternalLink size={14} /> View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UmojaDashboard;
