import { useState, useEffect } from 'react';
import tokenService from '../../services/tokenService';

const TokenDebugInfo = () => {
  const [tokenInfo, setTokenInfo] = useState<{
    hasToken: boolean;
    expiresAt: string;
    isExpiringSoon: boolean;
    timeUntilExpiry: number;
  } | null>(null);

  useEffect(() => {
    const updateTokenInfo = () => {
      setTokenInfo(tokenService.getTokenInfo());
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Token Status</strong></div>
      <div>Has Token: {tokenInfo.hasToken ? '✅' : '❌'}</div>
      <div>Expires: {tokenInfo.expiresAt}</div>
      <div>Expiring Soon: {tokenInfo.isExpiringSoon ? '⚠️' : '✅'}</div>
      <div>Time Until Expiry: {Math.floor(tokenInfo.timeUntilExpiry / 1000 / 60)} min</div>
    </div>
  );
};

export default TokenDebugInfo;
