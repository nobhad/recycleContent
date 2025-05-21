/**
 * @file        messageParser.js
 * @description Parses and extracts relevant information from messages
 *              for downstream processing in the RecycleContent extension.
 *              Handles text normalization, pattern matching, and ID tagging.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      MessageParser
 * 
 * @note        Supports message tokenization and compatibility with exclusion logic.
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';

/**
 * Class responsible for parsing messages, normalizing text,
 * extracting relevant patterns, and tagging IDs for further processing.
 * 
 * @class
 */
class MessageParser {
  /**
   * Creates an instance of MessageParser.
   * 
   * @param {Object} [options] - Optional configuration for the parser.
   * @param {RegExp} [options.pattern] - Regex pattern used to extract information.
   * @param {string[]} [options.exclusionList] - Array of tokens/strings to exclude from parsing.
   */
  constructor(options = {}) {
    /**
     * Regex pattern to identify relevant data in messages.
     * Defaults to Constants.DEFAULT_PATTERN if defined, else matches words.
     * @type {RegExp}
     */
    this.pattern = options.pattern || Constants.DEFAULT_PATTERN || /\b\w+\b/g;

    /**
     * List of tokens or strings to exclude from parsing results.
     * Defaults to empty array.
     * @type {string[]}
     */
    this.exclusionList = options.exclusionList || [];
  }

  /**
   * Normalizes message text by trimming whitespace,
   * converting to lowercase, and removing unwanted characters.
   * 
   * @param {string} message - The raw message text.
   * @returns {string} Normalized message string.
   */
  normalize(message) {
    if (typeof message !== 'string') {
      Logger.warn('MessageParser.normalize received non-string input');
      return '';
    }
    return message
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, ''); // remove punctuation
  }

  /**
   * Parses the message text to extract relevant tokens
   * based on the pattern, excluding any tokens present in the exclusion list.
   * 
   * @param {string} message - The message string to parse.
   * @returns {string[]} Array of parsed tokens matching the pattern.
   */
  parse(message) {
    const normalized = this.normalize(message);
    const matches = normalized.match(this.pattern) || [];
    
    // Filter out excluded tokens
    const filteredTokens = matches.filter(token => !this.exclusionList.includes(token));
    Logger.debug(`MessageParser.parse extracted tokens: ${filteredTokens.join(', ')}`);
    return filteredTokens;
  }

  /**
   * Tags the parsed tokens with unique IDs or metadata for downstream use.
   * 
   * @param {string[]} tokens - Array of tokens to tag.
   * @returns {Object[]} Array of objects with token and assigned id.
   */
  tagIDs(tokens) {
    const tagged = tokens.map((token, index) => ({
      token,
      id: `msg-${index + 1}`
    }));
    Logger.debug(`MessageParser.tagIDs generated tags: ${JSON.stringify(tagged)}`);
    return tagged;
  }
}

export default MessageParser;
