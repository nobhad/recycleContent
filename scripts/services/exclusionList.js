/**
 * @file        exclusionList.js
 * @description Manages exclusion lists for message IDs in the RecycleContent extension.
 *              Handles retrieval, update, and persistent storage with in-memory caching
 *              and serialized storage for performance optimization.
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

/**
 * @class ExclusionListManager
 * Handles exclusion list retrieval, creation, and updating using
 * in-memory caching and serialized browser storage.
 *
 * @property {Map<string, Array<string>>} cache - In-memory cache of exclusion lists.
 * @property {chrome.storage.StorageArea} storage - Reference to Chrome's local storage.
 */
class ExclusionListManager {
  constructor() {
    this.cache = new Map();
    this.storage = chrome.storage.local;
  }

  /**
   * Retrieves the exclusion list for a given message ID from cache or storage.
   * Creates a new list if none exists.
   *
   * @async
   * @function
   * @param {string} messageId - The message ID associated with the exclusion list.
   * @returns {Promise<Array<string>>} The list of excluded buyer IDs.
   */
  async getOrCreateList(messageId) {
    if (this.cache.has(messageId)) {
      return this.cache.get(messageId);
    }

    const key = `exclusion_${messageId}`;
    const result = await this.storage.get(key);

    if (result[key]) {
      const list = this.deserializeList(result[key]);
      this.cache.set(messageId, list);
      return list;
    }

    return this.createNewList(messageId);
  }

  /**
   * Updates the exclusion list for a given message ID with new buyers,
   * merges and deduplicates, and persists the list.
   *
   * @async
   * @function
   * @param {string} messageId - The message ID associated with the exclusion list.
   * @param {Array<string>} newBuyers - List of new buyer IDs to exclude.
   * @returns {Promise<Array<string>>} The updated exclusion list.
   */
  async updateList(messageId, newBuyers) {
    const list = await this.getOrCreateList(messageId);
    const updated = this.mergeAndDeduplicate(list, newBuyers);
    const serialized = this.serializeList(updated);

    await this.storage.set({ [`exclusion_${messageId}`]: serialized });
    this.cache.set(messageId, updated);

    return updated;
  }

  /**
   * Creates a new, empty exclusion list and stores it.
   *
   * @private
   * @function
   * @param {string} messageId - The message ID to associate with the new list.
   * @returns {Promise<Array<string>>} The newly created exclusion list.
   */
  async createNewList(messageId) {
    const list = [];
    const serialized = this.serializeList(list);

    await this.storage.set({ [`exclusion_${messageId}`]: serialized });
    this.cache.set(messageId, list);

    return list;
  }

  /**
   * Deserializes a stored exclusion list.
   *
   * @private
   * @function
   * @param {string} data - Serialized exclusion list as a JSON string.
   * @returns {Array<string>} Deserialized exclusion list.
   */
  deserializeList(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to parse exclusion list: ${error.message}`);
      return [];
    }
  }

  /**
   * Serializes the exclusion list to a storable format.
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
   * Merges and deduplicates two lists of buyer IDs.
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
