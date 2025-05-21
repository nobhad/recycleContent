/**
 * @file        mediaHandler.js
 * @description Manages media elements such as images, videos, and attachments
 *              within messages processed by the RecycleContent extension.
 *              Handles source extraction, media validation, and fallback behavior.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      MediaHandler
 * 
 * @note        Ensures proper handling of embedded and external media content.
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';
import Storage from '../common/storage.js'; // if stores media preferences or cache

/**
 * Main class handling extraction, validation, and insertion of media
 * elements within messages.
 * 
 * @class
 */
class MediaHandler {
  constructor() {
    /**
     * Cache for media elements keyed by message ID.
     * @type {Map<string, Array<Object>>}
     */
    this.mediaCache = new Map();
  }

  /**
   * Extract media elements from a message by ID, caching results.
   * 
   * @async
   * @param {string} messageId - Unique identifier for the message.
   * @returns {Promise<Array<Object>>} Array of media element descriptors.
   */
  async extractMediaFromMessage(messageId) {
    const message = await this.fetchOriginalMessage(messageId);
    const mediaElements = this.parseMediaElements(message);
    this.mediaCache.set(messageId, mediaElements);
    return mediaElements;
  }

  /**
   * Retrieve cached media elements or extract if not cached.
   * 
   * @async
   * @param {string} messageId - Unique identifier for the message.
   * @returns {Promise<Array<Object>>}
   */
  async getMediaElements(messageId) {
    if (this.mediaCache.has(messageId)) {
      return this.mediaCache.get(messageId);
    }
    return this.extractMediaFromMessage(messageId);
  }

  /**
   * Insert media elements into the given container element.
   * 
   * @async
   * @param {string} messageId - Unique message ID.
   * @param {HTMLElement} targetContainer - DOM container for media.
   * @returns {Promise<Array<Object>>} Results of insertion attempts.
   */
  async insertMediaIntoNewMessage(messageId, targetContainer) {
    const mediaElements = await this.getMediaElements(messageId);
    const insertionTasks = mediaElements.map(media => this.createInsertionTask(media, targetContainer));
    return this.processInsertionQueue(insertionTasks);
  }

  /**
   * Create insertion task for a single media element.
   * 
   * @async
   * @param {Object} media - Media descriptor (type, src, alt, etc).
   * @param {HTMLElement} targetContainer - DOM container element.
   * @returns {Object} Task with async insert method.
   */
  async createInsertionTask(media, targetContainer) {
    return {
      media,
      insert: async () => {
        try {
          await this.validateMediaAvailability(media);
          const element = this.createMediaElement(media);
          this.insertWithProperFormatting(element, targetContainer);
          return { success: true, element };
        } catch (error) {
          Logger.error(`Media insertion failed: ${error.message}`);
          return { success: false, error, fallback: this.generateFallback(media) };
        }
      }
    };
  }

  /**
   * Fetch original message content by message ID.
   * Placeholder method — implement per your backend.
   * 
   * @async
   * @param {string} messageId
   * @returns {Promise<string>}
   */
  async fetchOriginalMessage(messageId) {
    return Promise.resolve('<message>Sample media content</message>');
  }

  /**
   * Parse media elements from raw message content.
   * 
   * @param {string} messageContent
   * @returns {Array<Object>} Media elements descriptors.
   */
  parseMediaElements(messageContent) {
    // Example parser — replace with real parsing logic.
    return [{ type: 'image', src: 'https://example.com/image.jpg', alt: 'Example' }];
  }

  /**
   * Validate media availability and accessibility.
   * 
   * @async
   * @param {Object} media
   * @throws {Error} if media is invalid or unavailable.
   */
  async validateMediaAvailability(media) {
    if (!media.src) throw new Error('Missing media source URL');
    return Promise.resolve();
  }

  /**
   * Create DOM element representing the media.
   * 
   * @param {Object} media
   * @returns {HTMLElement}
   */
  createMediaElement(media) {
    let element;
    switch (media.type) {
      case 'image':
        element = document.createElement('img');
        element.src = media.src;
        element.alt = media.alt || '';
        break;
      case 'video':
        element = document.createElement('video');
        element.src = media.src;
        element.controls = true;
        break;
      default:
        element = document.createElement('span');
        element.textContent = '[Unsupported media]';
    }
    return element;
  }

  /**
   * Insert element into container with styling and handlers.
   * 
   * @param {HTMLElement} element
   * @param {HTMLElement} targetContainer
   */
  insertWithProperFormatting(element, targetContainer) {
    element.classList.add('recycle-media');
    targetContainer.appendChild(element);
  }

  /**
   * Process insertion tasks sequentially.
   * 
   * @async
   * @param {Array<Object>} insertionTasks
   * @returns {Promise<Array<Object>>}
   */
  async processInsertionQueue(insertionTasks) {
    const results = [];
    for (const task of insertionTasks) {
      const result = await task.insert();
      results.push(result);
    }
    return results;
  }

  /**
   * Generate fallback element for media that failed.
   * 
   * @param {Object} media
   * @returns {HTMLElement}
   */
  generateFallback(media) {
    const fallback = document.createElement('div');
    fallback.classList.add('media-fallback');
    fallback.textContent = `[Media unavailable: ${media.type}]`;
    return fallback;
  }
}

export default MediaHandler;
