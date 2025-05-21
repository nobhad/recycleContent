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
    if (typeof level !== 'string') {
      console.warn(`Logger: Level must be a string, got ${typeof level}`);
      return;
    }
    const lvl = level.trim().toUpperCase();
    if (LEVELS.hasOwnProperty(lvl)) {
      currentLevel = LEVELS[lvl];
    } else {
      console.warn(`Logger: Invalid log level "${level}", defaulting to INFO`);
      currentLevel = LEVELS.INFO;
    }
  }

  /**
   * Gets the current log level as a string.
   * @function
   * @returns {string} Current log level.
   */
  function getLevel() {
    return Object.keys(LEVELS).find(key => LEVELS[key] === currentLevel);
  }

  function error(...args) {
    if (currentLevel >= LEVELS.ERROR) {
      console.error('[RecycleContent][ERROR]', ...args);
    }
  }

  function warn(...args) {
    if (currentLevel >= LEVELS.WARN) {
      console.warn('[RecycleContent][WARN]', ...args);
    }
  }

  function info(...args) {
    if (currentLevel >= LEVELS.INFO) {
      console.info('[RecycleContent][INFO]', ...args);
    }
  }

  function debug(...args) {
    if (currentLevel >= LEVELS.DEBUG) {
      console.debug('[RecycleContent][DEBUG]', ...args);
    }
  }

  return {
    setLevel,
    getLevel,
    error,
    warn,
    info,
    debug,
  };
})();

export default Logger;
