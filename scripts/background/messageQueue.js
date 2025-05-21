/**
 * @file        messageQueue.js
 * @description Handles the queuing and dispatch of messages in the RecycleContent extension.
 *              Supports retry logic, ordering, and persistence across browser sessions.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      MessageQueue
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @class, @function, and internal methods for queue operations and persistence.
 */

import Logger from '../common/logger.js';

/**
 * @class MessageQueue
 * @description Represents a persistent FIFO message queue with retry logic.
 */
class MessageQueue {
  /**
   * @constructor
   * @param {Object} options - Configuration options.
   * @param {number} options.retryLimit - Max number of retry attempts per message.
   * @param {string} options.storageKey - Key used for persistent storage.
   * @param {Object} options.eventHandlers - Optional event hooks for queue events.
   */
  constructor({
    retryLimit = 3,
    storageKey = 'messageQueue',
    eventHandlers = {}
  } = {}) {
    this.queue = [];
    this.retryLimit = retryLimit;
    this.storageKey = storageKey;
    this.eventHandlers = eventHandlers;

    this._loadFromStorage().catch(error => {
      Logger.warn('failed to load message queue during initialization:', error);
    });
  }

  /**
   * @function enqueue
   * @description Adds a message to the queue if not already present.
   * @param {Object} message - The message to enqueue. Must include a unique `id`.
   * @returns {Promise<boolean>} Whether the message was successfully enqueued.
   */
  async enqueue(message) {
    if (!message || !message.id) {
      throw new Error('message must have an id');
    }

    if (this.queue.find(msg => msg.id === message.id)) {
      Logger.warn(`message with id "${message.id}" already in queue. skipping enqueue.`);
      return false;
    }

    this.queue.push({ ...message, retryCount: 0 });
    await this._saveToStorage();

    if (typeof this.eventHandlers.onEnqueue === 'function') {
      this.eventHandlers.onEnqueue(message);
    }

    return true;
  }

  /**
   * @function peek
   * @description Returns the first message in the queue without removing it.
   * @returns {Object|null} The message at the front of the queue.
   */
  peek() {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  /**
   * @function dequeue
   * @description Removes and returns the first message from the queue.
   * @returns {Promise<Object|null>} The dequeued message.
   */
  async dequeue() {
    const message = this.queue.shift() || null;
    await this._saveToStorage();
    return message;
  }

  /**
   * @function handleRetry
   * @description Increments retry count and requeues or drops the message.
   * @param {Object} message - The message to retry.
   * @returns {Promise<boolean>} True if message was dropped, false if requeued.
   */
  async handleRetry(message) {
    if (!message) return false;

    message.retryCount = (message.retryCount || 0) + 1;

    if (message.retryCount > this.retryLimit) {
      this._removeMessageById(message.id);
      await this._saveToStorage();

      if (typeof this.eventHandlers.onDrop === 'function') {
        this.eventHandlers.onDrop(message);
      }

      return true;
    } else {
      this.queue.unshift(message);
      await this._saveToStorage();
      return false;
    }
  }

  /**
   * @function _removeMessageById
   * @description Internal method to remove a message by ID.
   * @param {string} messageId - The ID of the message to remove.
   * @private
   */
  _removeMessageById(messageId) {
    this.queue = this.queue.filter(msg => msg.id !== messageId);
  }

  /**
   * @function _saveToStorage
   * @description Persists the queue to Chrome or localStorage.
   * @returns {Promise<void>}
   * @private
   */
  async _saveToStorage() {
    try {
      const serialized = JSON.stringify(this.queue);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ [this.storageKey]: serialized });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, serialized);
      } else {
        Logger.warn('no supported storage api found for saving message queue.');
      }
    } catch (error) {
      Logger.warn('failed to save message queue to storage:', error);
    }
  }

  /**
   * @function _loadFromStorage
   * @description Loads queue from persistent storage.
   * @returns {Promise<void>}
   * @private
   */
  async _loadFromStorage() {
    try {
      let serialized = null;

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const result = await chrome.storage.local.get(this.storageKey);
        serialized = result[this.storageKey] || null;
      } else if (typeof localStorage !== 'undefined') {
        serialized = localStorage.getItem(this.storageKey);
      } else {
        Logger.warn('no supported storage api found for loading message queue.');
      }

      if (serialized) {
        this.queue = JSON.parse(serialized);
      }
    } catch (error) {
      Logger.warn('failed to load message queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * @function clear
   * @description Clears all messages from the queue.
   * @returns {Promise<void>}
   */
  async clear() {
    this.queue = [];
    await this._saveToStorage();
  }

  /**
   * @function size
   * @description Returns the number of messages in the queue.
   * @returns {number}
   */
  size() {
    return this.queue.length;
  }
}

export default MessageQueue;
