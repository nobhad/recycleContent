/**
 * @file        logger.js
 * @description Provides a lightweight logging utility for the RecycleContent extension.
 *              Supports different log levels and scoped debug output for development
 *              and debugging purposes.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Logger
 * 
 * @note        This file includes complete JSDoc annotations for logging functions,
 *              including @function and @param tags.
 */

/**
 * Logger utility for RecycleContent.
 * Supports log levels: error, warn, info, debug.
 */
const Logger = (() => {
    /** @enum {number} */
    const LEVELS = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };
  
    // Current log level threshold (default to INFO)
    let currentLevel = LEVELS.INFO;
  
    /**
     * Sets the logging level.
     * @function
     * @param {string} level - One of 'error', 'warn', 'info', 'debug'.
     */
    function setLevel(level) {
      const lvl = level.toUpperCase();
      if (lvl in LEVELS) {
        currentLevel = LEVELS[lvl];
      } else {
        console.warn(`Logger: Invalid log level "${level}"`);
      }
    }
  
    /**
     * Logs an error message.
     * @function
     * @param {...any} args - Arguments to log.
     */
    function error(...args) {
      if (currentLevel >= LEVELS.ERROR) {
        console.error('[RecycleContent][ERROR]', ...args);
      }
    }
  
    /**
     * Logs a warning message.
     * @function
     * @param {...any} args - Arguments to log.
     */
    function warn(...args) {
      if (currentLevel >= LEVELS.WARN) {
        console.warn('[RecycleContent][WARN]', ...args);
      }
    }
  
    /**
     * Logs an informational message.
     * @function
     * @param {...any} args - Arguments to log.
     */
    function info(...args) {
      if (currentLevel >= LEVELS.INFO) {
        console.info('[RecycleContent][INFO]', ...args);
      }
    }
  
    /**
     * Logs a debug message.
     * @function
     * @param {...any} args - Arguments to log.
     */
    function debug(...args) {
      if (currentLevel >= LEVELS.DEBUG) {
        console.debug('[RecycleContent][DEBUG]', ...args);
      }
    }
  
    return {
      setLevel,
      error,
      warn,
      info,
      debug,
    };
  })();
  
  export default Logger;
  