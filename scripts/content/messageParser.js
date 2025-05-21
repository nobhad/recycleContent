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
       * @type {RegExp}
       */
      this.pattern = options.pattern || /./;
  
      /**
       * List of tokens or strings to exclude from parsing results.
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
      return matches.filter(token => !this.exclusionList.includes(token));
    }
  
    /**
     * Tags the parsed tokens with unique IDs or metadata for downstream use.
     * 
     * @param {string[]} tokens - Array of tokens to tag.
     * @returns {Object[]} Array of objects with token and assigned id.
     */
    tagIDs(tokens) {
      return tokens.map((token, index) => ({
        token,
        id: `msg-${index + 1}`
      }));
    }
  }
  
  export default MessageParser;
  