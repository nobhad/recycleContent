/**
 * @file        exclusionList.js
 * @description Manages exclusion lists for message IDs in the RecycleContent extension.
 *              Provides in-memory caching and persistent storage with serialization.
 *              Logs key operations and handles errors gracefully.
 *
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 *
 * @module      ExclusionListManager
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';

/**
 * @class ExclusionListManager
 * @classdesc Manages retrieval, creation, update, and caching of exclusion lists.
 */
class ExclusionListManager {
  constructor() {
    /** @type {Map<string, Array<string>>} */
    this.cache = new Map();

    /** @type {chrome.storage.StorageArea | undefined} */
    this.storage = typeof chrome !== 'undefined' && chrome.storage?.local;
    if (!this.storage) {
      Logger.error('Chrome storage.local is not available.');
    }
  }

  /**
   * Get or create an exclusion list for a given message ID.
   * @param {string} messageId - ID to retrieve or initialize.
   * @returns {Promise<Array<string>>}
   */
  async getOrCreateList(messageId) {
    if (this.cache.has(messageId)) {
      Logger.debug(`Cache hit for messageId: ${messageId}`);
      return this.cache.get(messageId);
    }

    if (!this.storage) {
      Logger.warn('Storage unavailable, returning empty exclusion list.');
      return [];
    }

    const key = `exclusion_${messageId}`;
    try {
      const result = await this.storage.get([key]);
      if (result[key]) {
        const list = this.deserializeList(result[key]);
        this.cache.set(messageId, list);
        Logger.debug(`Loaded exclusion list for ${messageId} from storage.`);
        return list;
      }
    } catch (error) {
      Logger.error(`Error retrieving exclusion list for ${messageId}: ${error.message}`);
    }

    return this.createNewList(messageId);
  }

  /**
   * Add new buyer IDs to the exclusion list for a message ID.
   * @param {string} messageId
   * @param {Array<string>} newBuyers
   * @returns {Promise<Array<string>>}
   */
  async updateList(messageId, newBuyers) {
    if (!Array.isArray(newBuyers)) {
      Logger.warn('updateList called with non-array newBuyers');
      newBuyers = [];
    }

    const list = await this.getOrCreateList(messageId);
    const updated = this.mergeAndDeduplicate(list, newBuyers);
    const serialized = this.serializeList(updated);

    if (this.storage) {
      try {
        await this.storage.set({ [`exclusion_${messageId}`]: serialized });
        Logger.debug(`Exclusion list for ${messageId} updated in storage.`);
      } catch (error) {
        Logger.error(`Failed to update exclusion list for ${messageId}: ${error.message}`);
      }
    }

    this.cache.set(messageId, updated);
    return updated;
  }

  /**
   * Initialize and persist a new empty exclusion list.
   * @private
   * @param {string} messageId
   * @returns {Promise<Array<string>>}
   */
  async createNewList(messageId) {
    const list = [];
    const serialized = this.serializeList(list);

    if (this.storage) {
      try {
        await this.storage.set({ [`exclusion_${messageId}`]: serialized });
        Logger.debug(`Created new exclusion list for ${messageId} in storage.`);
      } catch (error) {
        Logger.error(`Failed to create exclusion list for ${messageId}: ${error.message}`);
      }
    }

    this.cache.set(messageId, list);
    return list;
  }

  /**
   * Deserialize stored exclusion list from JSON.
   * @private
   * @param {string} data
   * @returns {Array<string>}
   */
  deserializeList(data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      Logger.warn('Deserialized data is not an array, returning empty list.');
      return [];
    } catch (error) {
      Logger.warn(`Failed to parse exclusion list: ${error.message}`);
      return [];
    }
  }

  /**
   * Serialize exclusion list to JSON string.
   * @private
   * @param {Array<string>} list
   * @returns {string}
   */
  serializeList(list) {
    return JSON.stringify(list);
  }

  /**
   * Merge two lists, removing duplicates.
   * @private
   * @param {Array<string>} existingList
   * @param {Array<string>} newList
   * @returns {Array<string>}
   */
  mergeAndDeduplicate(existingList, newList) {
    return Array.from(new Set([...existingList, ...newList]));
  }
}

/** @type {ExclusionListManager} Singleton instance for managing exclusion lists. */
const exclusionListManager = new ExclusionListManager();

export default exclusionListManager;
