/**
 * @file        messageProcessor.js
 * @description Coordinates the end-to-end processing of messages by combining
 *              parsing, filtering, exclusion checking, and media analysis in
 *              the RecycleContent extension.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      MessageProcessor
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';
import Storage from '../common/storage.js';
import ExclusionList from './exclusionList.js';

/**
 * Main class that handles full lifecycle processing of messages:
 * parsing, filtering, exclusion, and media content analysis.
 */
class MessageProcessor {
  /**
   * @param {Object} options
   * @param {MessageParser} options.parser - Instance of the MessageParser to use.
   * @param {Function} [options.filterFunc] - Optional filter function to apply on parsed tokens.
   * @param {Function} [options.exclusionChecker] - Optional function to check for exclusions.
   * @param {Function} [options.mediaAnalyzer] - Optional async/sync function to analyze media content.
   */
  constructor({ parser, filterFunc, exclusionChecker, mediaAnalyzer } = {}) {
    if (!parser || typeof parser.parse !== 'function') {
      throw new Error('A valid parser with a .parse() method is required.');
    }

    this.parser = parser;
    this.filterFunc = filterFunc;
    this.exclusionChecker = exclusionChecker;
    this.mediaAnalyzer = mediaAnalyzer;
  }

  /**
   * Processes a single message: parses, filters, checks exclusions, analyzes media.
   * 
   * @param {string} message - Raw message text.
   * @returns {Promise<Object>} Processed result object.
   */
  async process(message) {
    if (typeof message !== 'string') {
      throw new TypeError('message must be a string');
    }

    // Step 1: Parse
    let tokens = this.parser.parse(message);

    // Step 2: Filter (if applicable)
    if (this.filterFunc) {
      tokens = tokens.filter(this.filterFunc);
    }

    // Step 3: Exclusion check
    const excluded = this.exclusionChecker ? this.exclusionChecker(message, tokens) : false;

    // Step 4: Media analysis
    const mediaAnalysis = this.mediaAnalyzer
      ? await this.mediaAnalyzer(message)
      : null;

    // Optional debug logging
    Logger.debug?.('Processed message:', { tokens, excluded, mediaAnalysis });

    return {
      tokens,
      excluded,
      mediaAnalysis,
    };
  }

  /**
   * Utility to process multiple messages in parallel.
   * 
   * @param {string[]} messages - Array of raw message strings.
   * @param {MessageProcessor} processor - An instance of MessageProcessor.
   * @returns {Promise<Object[]>} Array of result objects.
   */
  static async processBatch(messages, processor) {
    if (!Array.isArray(messages)) {
      throw new TypeError('messages must be an array of strings');
    }

    return Promise.all(messages.map(msg => processor.process(msg)));
  }
}

export default MessageProcessor;
