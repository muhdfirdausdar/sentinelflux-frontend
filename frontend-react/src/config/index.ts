// Configuration settings
const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000, // 10 seconds
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SentinelFlux',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    enableErrorReporting: import.meta.env.NODE_ENV === 'production',
    enableDebugMode: import.meta.env.NODE_ENV === 'development',
  },
};

export default config;
