/**
 * @file        messageHandler.js
 * @description Handles incoming messages and dispatches them through the processor pipeline.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 */

import MessageProcessor from './messageProcessor.js';
import MessageParser from '../content/messageParser.js';
import ExclusionList from './exclusionList.js';
import MediaHandler from './mediaHandler.js';

/**
 * Creates a default handler using standard config.
 * You can customize this if you want to inject dependencies.
 */
const processor = new MessageProcessor({
  parser: new MessageParser(),
  filterFunc: token => token && token.length > 1, // Example filter
  exclusionChecker: ExclusionList.check,
  mediaAnalyzer: MediaHandler.analyze,
});

/**
 * Handles a single raw message string.
 * 
 * @param {string} message
 * @returns {Promise<Object>} Result of message processing.
 */
export async function handleMessage(message) {
  return processor.process(message);
}

/**
 * Handles an array of messages (batch).
 * 
 * @param {string[]} messages
 * @returns {Promise<Object[]>}
 */
export async function handleBatch(messages) {
  return MessageProcessor.processBatch(messages, processor);
}
