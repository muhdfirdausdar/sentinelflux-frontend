// logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];

// Default log level (dev = debug, prod = warn)
// Use import.meta.env for Vite instead of process.env
let currentLevel: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 
  (import.meta.env.DEV ? "debug" : "warn");

// Module name feature control via environment variable
const enableModuleNames: boolean = 
  import.meta.env.VITE_ENABLE_MODULE_NAMES === 'true' || 
  import.meta.env.DEV; // Enable by default in development

// Color styles for browser console
const styles: Record<LogLevel, string> = {
  debug: "color: gray; background: #eee; padding: 2px 4px; border-radius: 2px",
  info: "color: white; background: green; font-weight: bold; padding: 2px 4px; border-radius: 2px",
  warn: "color: black; background: orange; font-weight: bold; padding: 2px 4px; border-radius: 2px",
  error: "color: white; background: red; font-weight: bold; padding: 2px 4px; border-radius: 2px",
};

// Check if level should be logged
function shouldLog(level: LogLevel): boolean {
  return levels.indexOf(level) >= levels.indexOf(currentLevel);
}

// Internal log function
function log(level: LogLevel, moduleName: string | undefined, ...args: unknown[]): void {
  if (!shouldLog(level)) return;

  const levelLabel = `%c[${level.toUpperCase()}]%c`;
  const moduleLabel = enableModuleNames && moduleName ? `%c[${moduleName}]%c` : '';
  const style = styles[level];
  const moduleStyle = "color: blue; background: #f0f8ff; padding: 2px 4px; border-radius: 2px; margin-left: 4px";
  
  if (moduleLabel) {
    console.log(levelLabel + moduleLabel, style, "color: inherit", moduleStyle, "color: inherit", ...args);
  } else {
    console.log(levelLabel, style, "color: inherit", ...args);
  }
}

// Logger factory function to create module-specific loggers
function createLogger(moduleName?: string) {
  return {
    debug: (...args: unknown[]) => log("debug", moduleName, ...args),
    info: (...args: unknown[]) => log("info", moduleName, ...args),
    warn: (...args: unknown[]) => log("warn", moduleName, ...args),
    error: (...args: unknown[]) => log("error", moduleName, ...args),
  };
}

// Public API
const logger = {
  // Default logger without module name
  debug: (...args: unknown[]) => log("debug", undefined, ...args),
  info: (...args: unknown[]) => log("info", undefined, ...args),
  warn: (...args: unknown[]) => log("warn", undefined, ...args),
  error: (...args: unknown[]) => log("error", undefined, ...args),

  // Create module-specific logger
  module: (moduleName: string) => createLogger(moduleName),

  setLevel: (level: LogLevel) => {
    if (levels.includes(level)) {
      currentLevel = level;
    } else {
      console.warn(`[LOGGER] Invalid log level: ${level}`);
    }
  },
  getLevel: (): LogLevel => currentLevel,
};

export default logger;

/*
 * ===================================================================
 * LOGGER USAGE EXAMPLES
 * ===================================================================
 * 
 * The logger supports both default logging and module-specific logging
 * with optional module names that can be controlled via environment variables.
 * 
 * Environment Variables:
 * ----------------------
 * VITE_LOG_LEVEL=debug|info|warn|error    // Sets the minimum log level
 * VITE_ENABLE_MODULE_NAMES=true|false     // Shows/hides module names in logs
 * 
 * Default behavior:
 * - Development: log level = debug, module names = enabled
 * - Production: log level = warn, module names = from env var
 * 
 * 
 * 1. BASIC USAGE (no module name):
 * --------------------------------
 * import logger from '../utils/logger';
 * 
 * logger.debug('Debug message');     // [DEBUG] Debug message
 * logger.info('Info message');       // [INFO] Info message  
 * logger.warn('Warning message');    // [WARN] Warning message
 * logger.error('Error message');     // [ERROR] Error message
 * 
 * 
 * 2. MODULE-SPECIFIC USAGE:
 * -------------------------
 * import logger from '../utils/logger';
 * 
 * const moduleLogger = logger.module('useSSE');
 * moduleLogger.info('Connection established');    // [INFO][useSSE] Connection established
 * moduleLogger.error('Connection failed');        // [ERROR][useSSE] Connection failed
 * 
 * const apiLogger = logger.module('ApiService');
 * apiLogger.debug('Fetching data...');            // [DEBUG][ApiService] Fetching data...
 * 
 * 
 * 3. COMMON PATTERNS:
 * -------------------
 * // At the top of your module
 * import logger from '../utils/logger';
 * const log = logger.module('ComponentName');
 * 
 * function MyComponent() {
 *   log.info('Component mounted');
 *   
 *   useEffect(() => {
 *     log.debug('Running effect');
 *     try {
 *       // some operation
 *       log.info('Operation successful');
 *     } catch (error) {
 *       log.error('Operation failed:', error);
 *     }
 *   }, []);
 * }
 * 
 * 
 * 4. CONFIGURATION:
 * -----------------
 * // Check current level
 * console.log(logger.getLevel()); // 'debug' | 'info' | 'warn' | 'error'
 * 
 * // Change log level at runtime
 * logger.setLevel('warn'); // Only warn and error messages will show
 * 
 * 
 * 5. OUTPUT EXAMPLES:
 * -------------------
 * With VITE_ENABLE_MODULE_NAMES=true:
 * [INFO][useSSE] SSE connection established
 * [DEBUG][useMetrics] Fetching metrics data  
 * [ERROR][ApiService] Request failed: 500
 * 
 * With VITE_ENABLE_MODULE_NAMES=false:
 * [INFO] SSE connection established
 * [DEBUG] Fetching metrics data
 * [ERROR] Request failed: 500
 * 
 * 
 * 6. RECOMMENDED PRACTICES:
 * -------------------------
 * - Use module names for better debugging: logger.module('ModuleName')
 * - Keep module names short and descriptive: 'useSSE', 'ApiClient', 'Auth'
 * - Use appropriate log levels:
 *   - debug: Detailed debugging info (dev only)
 *   - info: General information (startup, connections)
 *   - warn: Warning conditions (recoverable errors)
 *   - error: Error conditions (unrecoverable errors)
 * - Don't log sensitive data (passwords, tokens, personal info)
 * 
 * 
 * 7. ENVIRONMENT SETUP (.env file):
 * ---------------------------------
 * # Enable debug logging and module names in development
 * VITE_LOG_LEVEL=debug
 * VITE_ENABLE_MODULE_NAMES=true
 * 
 * # Production settings (warnings and errors only)
 * VITE_LOG_LEVEL=warn  
 * VITE_ENABLE_MODULE_NAMES=false
 */
