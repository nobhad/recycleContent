/**
 * @file        exclusionList.js
 * @description Manages exclusion lists for message IDs in the RecycleContent extension.
 *              Handles retrieval, update, and persistent storage with in-memory caching
 *              and serialized storage for performance optimization.
 *              Includes logging of important events and error handling.
 *
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 *
 * @module      ExclusionListManager
 *
 * @note        This file includes complete JSDoc annotations with:
 *              @class, @function, @param, and @returns tags.
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';

/**
 * @class ExclusionListManager
 * Handles exclusion list retrieval, creation, updating, and persistent storage,
 * with in-memory caching and serialized storage. Logs key operations and errors.
 *
 * @property {Map<string, Array<string>>} cache - In-memory cache of exclusion lists.
 * @property {chrome.storage.StorageArea | undefined} storage - Reference to Chrome's local storage.
 */
class ExclusionListManager {
  constructor() {
    /**
     * In-memory cache mapping message IDs to exclusion lists.
     * @type {Map<string, Array<string>>}
     */
    this.cache = new Map();

    /**
     * Chrome local storage reference, or undefined if unavailable.
     * @type {chrome.storage.StorageArea|undefined}
     */
    this.storage = chrome?.storage?.local;
    if (!this.storage) {
      Logger.error('Chrome storage.local is not available.');
    }
  }

  /**
   * Retrieves the exclusion list for a given message ID from cache or storage.
   * Creates a new empty list if none exists.
   *
   * @async
   * @function
   * @param {string} messageId - The message ID associated with the exclusion list.
   * @returns {Promise<Array<string>>} The list of excluded buyer IDs.
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
      const result = await this.storage.get(key);
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
   * Updates the exclusion list for a given message ID with new buyers,
   * merges and deduplicates entries, persists the updated list,
   * and updates the cache.
   *
   * @async
   * @function
   * @param {string} messageId - The message ID associated with the exclusion list.
   * @param {Array<string>} newBuyers - List of new buyer IDs to exclude.
   * @returns {Promise<Array<string>>} The updated exclusion list.
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
   * Creates a new, empty exclusion list, stores it persistently,
   * and caches it.
   *
   * @private
   * @async
   * @function
   * @param {string} messageId - The message ID to associate with the new list.
   * @returns {Promise<Array<string>>} The newly created exclusion list.
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
   * Deserializes a stored exclusion list from JSON string.
   * If parsing fails or data is not an array, returns empty list.
   *
   * @private
   * @function
   * @param {string} data - Serialized exclusion list as a JSON string.
   * @returns {Array<string>} Deserialized exclusion list.
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
   * Serializes the exclusion list to a JSON string for storage.
   *
   * @private
   * @function
   * @param {Array<string>} list - Exclusion list to serialize.
   * @returns {string} Serialized exclusion list.
   */
  serializeList(list) {
    return JSON.stringify(list);
  }

  /**
   * Merges two lists of buyer IDs, deduplicating any duplicates.
   *
   * @private
   * @function
   * @param {Array<string>} existingList - The existing exclusion list.
   * @param {Array<string>} newList - New buyer IDs to add.
   * @returns {Array<string>} Merged and deduplicated list.
   */
  mergeAndDeduplicate(existingList, newList) {
    return Array.from(new Set([...existingList, ...newList]));
  }
}

export default ExclusionListManager;
