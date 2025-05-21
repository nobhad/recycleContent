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
 * 
 * @note        This is the main logic hub for evaluating recyclable content.
 */

/**
 * Main class that handles full lifecycle processing of messages:
 * parsing, filtering, exclusion, and media content analysis.
 * 
 * @class
 */
class MessageProcessor {
    /**
     * Creates an instance of MessageProcessor.
     * 
     * @param {Object} options - Configuration options.
     * @param {MessageParser} options.parser - Instance of the MessageParser to use.
     * @param {Function} [options.filterFunc] - Optional filter function to apply on parsed tokens.
     * @param {Function} [options.exclusionChecker] - Function to check if tokens should be excluded.
     * @param {Function} [options.mediaAnalyzer] - Function to analyze media within the message.
     */
    constructor({ parser, filterFunc, exclusionChecker, mediaAnalyzer } = {}) {
      /**
       * Message parser instance.
       * @type {MessageParser}
       */
      this.parser = parser;
  
      /**
       * Optional filter function to further refine parsed tokens.
       * @type {Function|undefined}
       */
      this.filterFunc = filterFunc;
  
      /**
       * Function to check if a token/message should be excluded.
       * @type {Function|undefined}
       */
      this.exclusionChecker = exclusionChecker;
  
      /**
       * Function to analyze media content in the message.
       * @type {Function|undefined}
       */
      this.mediaAnalyzer = mediaAnalyzer;
    }
  
    /**
     * Processes a raw message string through the pipeline:
     * parsing, filtering, exclusion checking, and media analysis.
     * 
     * @param {string} message - The raw message text.
     * @returns {Object} Result object containing:
     *                   - tokens: filtered and parsed tokens,
     *                   - excluded: whether the message was excluded,
     *                   - mediaAnalysis: result of media analysis (if any).
     */
    process(message) {
      // Parse tokens from the message
      let tokens = this.parser.parse(message);
  
      // Filter tokens if filter function provided
      if (this.filterFunc) {
        tokens = tokens.filter(this.filterFunc);
      }
  
      // Check exclusion status
      const excluded = this.exclusionChecker ? this.exclusionChecker(message, tokens) : false;
  
      // Analyze media if function provided
      const mediaAnalysis = this.mediaAnalyzer ? this.mediaAnalyzer(message) : null;
  
      return {
        tokens,
        excluded,
        mediaAnalysis,
      };
    }
  }
  
  export default MessageProcessor;
  