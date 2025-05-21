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
 *              @class, @function, @param, and @returns tags.
 */

/**
 * Class representing a message queue with support for
 * retrying, ordering, and persisting queued messages.
 * 
 * @class
 */
class MessageQueue {
    /**
     * Creates an instance of MessageQueue.
     * 
     * @param {object} options - Configuration options.
     * @param {number} [options.retryLimit=3] - Number of retry attempts before dropping a message.
     * @param {string} [options.storageKey='messageQueue'] - Key for persisting queue in storage.
     */
    constructor({ retryLimit = 3, storageKey = 'messageQueue' } = {}) {
      /**
       * Internal queue storage.
       * @private
       * @type {Array<Object>}
       */
      this.queue = [];
  
      /**
       * Max retry attempts per message.
       * @private
       * @type {number}
       */
      this.retryLimit = retryLimit;
  
      /**
       * Storage key for persistence.
       * @private
       * @type {string}
       */
      this.storageKey = storageKey;
  
      this._loadFromStorage();
    }
  
    /**
     * Adds a message to the queue.
     * 
     * @param {Object} message - The message object to enqueue.
     * @param {string} message.id - Unique identifier for the message.
     * @param {any} message.payload - Payload data of the message.
     */
    enqueue(message) {
      if (!message || !message.id) {
        throw new Error('Message must have an id');
      }
      this.queue.push({ ...message, retryCount: 0 });
      this._saveToStorage();
    }
  
    /**
     * Retrieves the next message in the queue without removing it.
     * 
     * @returns {Object|null} The next message or null if queue is empty.
     */
    peek() {
      return this.queue.length > 0 ? this.queue[0] : null;
    }
  
    /**
     * Removes the next message from the queue.
     * 
     * @returns {Object|null} The removed message or null if queue was empty.
     */
    dequeue() {
      const message = this.queue.shift() || null;
      this._saveToStorage();
      return message;
    }
  
    /**
     * Handles retry logic for a failed message.
     * Increments retry count and either re-enqueues or discards the message.
     * 
     * @param {Object} message - The message that failed to process.
     */
    handleRetry(message) {
      if (!message) return;
      message.retryCount = (message.retryCount || 0) + 1;
      if (message.retryCount > this.retryLimit) {
        // Drop the message after exceeding retry limit
        this._removeMessageById(message.id);
      } else {
        // Re-enqueue message for retry
        this.queue.push(message);
      }
      this._saveToStorage();
    }
  
    /**
     * Removes a message from the queue by its id.
     * 
     * @private
     * @param {string} messageId - The ID of the message to remove.
     */
    _removeMessageById(messageId) {
      this.queue = this.queue.filter(msg => msg.id !== messageId);
    }
  
    /**
     * Saves the current queue to persistent storage.
     * 
     * @private
     */
    _saveToStorage() {
      try {
        const serialized = JSON.stringify(this.queue);
        localStorage.setItem(this.storageKey, serialized);
      } catch (error) {
        console.warn('Failed to save message queue to storage:', error);
      }
    }
  
    /**
     * Loads the queue from persistent storage.
     * 
     * @private
     */
    _loadFromStorage() {
      try {
        const serialized = localStorage.getItem(this.storageKey);
        if (serialized) {
          this.queue = JSON.parse(serialized);
        }
      } catch (error) {
        console.warn('Failed to load message queue from storage:', error);
        this.queue = [];
      }
    }
  
    /**
     * Clears all messages from the queue and storage.
     */
    clear() {
      this.queue = [];
      this._saveToStorage();
    }
  
    /**
     * Returns the current length of the queue.
     * 
     * @returns {number} Number of messages queued.
     */
    size() {
      return this.queue.length;
    }
  }
  
  export default MessageQueue;
  