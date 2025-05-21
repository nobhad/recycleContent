/**
 * @file        exclusionList.js
 * @description This module manages exclusion lists for message IDs in the RecycleContent extension.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      ExclusionListManager
 * 
 * This module is part of the RecycleContent browser extension.
 * It provides functionality to retrieve, update, and store exclusion lists
 * for specific message IDs, optimizing performance with in-memory caching
 * and compressed storage.
 */


class ExclusionListManager {
    constructor() {
      this.cache = new Map();
      this.storage = chrome.storage.local;
    }
  
    async getOrCreateList(messageId) {
      // Try cache first for instant access
      if (this.cache.has(messageId)) {
        return this.cache.get(messageId);
      }
      
      // Check storage
      const key = `exclusion_${messageId}`;
      const result = await this.storage.get(key);
      
      if (result[key]) {
        // Decompress and parse the list
        const list = this.decompressList(result[key]);
        // Cache the result
        this.cache.set(messageId, list);
        return list;
      }
      
      // Create new list if not found
      return this.createNewList(messageId);
    }
    
    async updateList(messageId, newBuyers) {
      const list = await this.getOrCreateList(messageId);
      const updated = this.mergeAndDeduplicate(list, newBuyers);
      
      // Compress for storage efficiency
      const compressed = this.compressList(updated);
      
      // Update storage and cache
      await this.storage.set({[`exclusion_${messageId}`]: compressed});
      this.cache.set(messageId, updated);
      
      return updated;
    }
  }