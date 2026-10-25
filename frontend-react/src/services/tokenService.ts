// Token Service for JWT management with secure cookies and auto-renewal
import { API_ENDPOINTS } from '../constants';
import { fetchFromApi } from './apiNetlify';
import Cookies from 'js-cookie';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  expires_at: string;
  client_id: string;
}

interface TokenInfo {
  hasToken: boolean;
  expiresAt: string;
  isExpiringSoon: boolean;
  timeUntilExpiry: number;
}

class TokenService {
  private tokenKey = 'sf_access_token';
  private expiryKey = 'sf_token_expiry';
  private refreshInProgress = false;
  private refreshPromise: Promise<TokenData> | null = null;
  
  constructor() {
    // No auto-renewal
  }

  // Set token with secure cookie options using js-cookie
  setToken(tokenData: TokenData): boolean {
    const { access_token, expires_at, expires_in_minutes } = tokenData;
    
    // Parse the ISO 8601 UTC timestamp properly
    const expiryTime = new Date(expires_at).getTime();
    const currentTime = Date.now();
    
    // Check if token is already expired
    if (expiryTime <= currentTime) {
      console.warn(`⚠️ Received expired token! Current: ${new Date(currentTime).toISOString()}, Expires: ${expires_at}`);
      return false;
    }
    
    // Set localStorage for fallback
    localStorage.setItem(this.tokenKey, access_token);
    localStorage.setItem(this.expiryKey, expiryTime.toString());
    
    // Set cookies using js-cookie (much more reliable)
    Cookies.set(this.tokenKey, access_token, {
      expires: expires_in_minutes / (60 * 24), // convert minutes to days
      secure: location.protocol === 'https:', // only secure in production
      sameSite: 'Lax', // protect against CSRF
      path: '/'
    });
    
    Cookies.set(this.expiryKey, expiryTime.toString(), {
      expires: expires_in_minutes / (60 * 24), // convert minutes to days
      secure: location.protocol === 'https:',
      sameSite: 'Lax',
      path: '/'
    });
    
    // console.log(`Token set using js-cookie ✅`);
    // console.log(`Token length: ${access_token.length} characters`);
    // console.log(`Raw expires_at: ${expires_at}`);
    // console.log(`Parsed expiry (UTC): ${new Date(expiryTime).toISOString()}`);
    // console.log(`Parsed expiry (local): ${new Date(expiryTime).toLocaleString()}`);
    // console.log(`Current time (UTC): ${new Date(currentTime).toISOString()}`);
    // console.log(`Current time (local): ${new Date(currentTime).toLocaleString()}`);
    // console.log(`Time until expiry: ${Math.round((expiryTime - currentTime) / 1000 / 60)} minutes`);
    
    // Verify cookies were set
    // const cookieToken = Cookies.get(this.tokenKey);
    // console.log(`Cookie verification - Token found: ${!!cookieToken}`);
    
    return true;
  }

  // Get current token using js-cookie
  getToken(): string | null {
    // Try localStorage first (faster)
    let token = localStorage.getItem(this.tokenKey);
    let expiry = localStorage.getItem(this.expiryKey);
    
    // If not in localStorage, try cookies
    if (!token) {
      token = Cookies.get(this.tokenKey) || null;
      const cookieExpiry = Cookies.get(this.expiryKey);
      if (cookieExpiry && token) {
        expiry = cookieExpiry;
        // Sync back to localStorage
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.expiryKey, cookieExpiry);
      }
    }
    
    if (!token || !expiry) return null;
    
    const currentTime = Date.now();
    const expiryTime = parseInt(expiry);
    
    if (currentTime >= expiryTime) {
      console.log(`Token expired!`);
      console.log(`Current time (UTC): ${new Date(currentTime).toISOString()}`);
      console.log(`Current time (local): ${new Date(currentTime).toLocaleString()}`);
      console.log(`Expiry time (UTC): ${new Date(expiryTime).toISOString()}`);
      console.log(`Expiry time (local): ${new Date(expiryTime).toLocaleString()}`);
      console.log(`Time difference: ${Math.round((currentTime - expiryTime) / 1000 / 60)} minutes past expiry`);
      this.clearToken();
      return null;
    }
    
    return token;
  }

  // Check if token exists and is valid (not expired)
  hasValidToken(): boolean {
    const token = this.getToken();
    return !!token; // getToken() already checks expiry and clears if expired
  }

  // Check if token is expiring soon (within 5 minutes for manual check)
  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.expiryKey);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const bufferTime = Date.now() + (5 * 60 * 1000); // 5 minutes buffer
    
    return bufferTime >= expiryTime;
  }

  // Clear token using js-cookie
  clearToken(): void {
    console.log(`clearToken() called - Stack trace:`, new Error().stack);
    
    // Clear localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
    
    // Clear cookies using js-cookie
    Cookies.remove(this.tokenKey, { path: '/' });
    Cookies.remove(this.expiryKey, { path: '/' });
    
    console.log('Token cleared from localStorage and cookies using js-cookie ✅');
  }

  // Fetch new token via Netlify function
  async fetchToken(): Promise<TokenData> {
    try {
      const data: TokenData = await fetchFromApi(API_ENDPOINTS.FETCH_SESSION_TOKEN, {}, 'POST');
      
      // Check if the received token is already expired
      const success = this.setToken(data);
      if (!success) {
        throw new Error('Received expired token from API');
      }
      
      return data;
      
    } catch (error) {
      console.error('Failed to fetch token:', error);
      throw error;
    }
  }

  // Refresh token with deduplication
  async refreshToken(): Promise<TokenData> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshInProgress && this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshInProgress = true;
    console.log('Refreshing token...');
    
    this.refreshPromise = this.fetchToken()
      .then(data => {
        console.log('Token refreshed successfully');
        return data;
      })
      .catch(error => {
        console.error('Token refresh failed:', error);
        this.clearToken();
        throw error;
      })
      .finally(() => {
        this.refreshInProgress = false;
        this.refreshPromise = null;
      });
    
    return this.refreshPromise;
  }

  // Ensure valid token (refresh if needed)
  async ensureValidToken(): Promise<string | null> {
    if (this.hasValidToken()) {
      return this.getToken();
    }
    
    // Prevent rapid successive token fetches
    if (this.refreshInProgress) {
      if (this.refreshPromise) {
        await this.refreshPromise;
        return this.getToken();
      }
    }
    
    // Just fetch new token, no auto-renewal logic
    await this.fetchToken();
    return this.getToken();
  }

  // Debug method to test cookie functionality
  testCookies(): void {
    console.log('=== Cookie Debug Test (js-cookie) ===');
    console.log('All cookies:', document.cookie);
    
    // Test setting a simple cookie
    Cookies.set('test_cookie', 'test_value', { path: '/' });
    console.log('After setting test cookie:', document.cookie);
    console.log('Test cookie via js-cookie:', Cookies.get('test_cookie'));
    
    // Check our token cookies
    console.log(`sf_access_token cookie: ${Cookies.get(this.tokenKey) || 'not found'}`);
    console.log(`sf_token_expiry cookie: ${Cookies.get(this.expiryKey) || 'not found'}`);
    
    // Check localStorage
    console.log(`localStorage token: ${localStorage.getItem(this.tokenKey) ? 'exists' : 'not found'}`);
    console.log(`localStorage expiry: ${localStorage.getItem(this.expiryKey)}`);
    
    // Clean up test cookie
    Cookies.remove('test_cookie', { path: '/' });
  }

  // Get token info for debugging
  getTokenInfo(): TokenInfo | null {
    const token = this.getToken();
    if (!token) return null;
    
    const expiry = localStorage.getItem(this.expiryKey);
    return {
      hasToken: !!token,
      expiresAt: expiry ? new Date(parseInt(expiry)).toLocaleString() : 'Unknown',
      isExpiringSoon: this.isTokenExpiringSoon(),
      timeUntilExpiry: expiry ? Math.max(0, parseInt(expiry) - Date.now()) : 0
    };
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).tokenService = tokenService;
}

export default tokenService;
