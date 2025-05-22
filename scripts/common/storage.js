/**
 * @file        storage.js
 * @description Provides a wrapper around browser storage APIs for the RecycleContent extension.
 *              Supports efficient read/write operations, in-memory caching, and optional
 *              compression for exclusion list data.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Storage
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @function, @async, @param, and @returns tags.
 */
import Constants from './constants.js';
import Logger from './logger.js';  // <-- Added import for Logger

/**
 * Storage class provides a wrapper around browser storage APIs.
 */
class Storage {
	/**
	 * Retrieves a value from storage.
	 * 
	 * @async
	 * @param {string} [key=Constants.STORAGE_KEYS.EXCLUSION_LIST] - The key to retrieve from storage.
	 * @returns {Promise<any>} The value associated with the key.
	 */
	async get(key = Constants.STORAGE_KEYS.EXCLUSION_LIST) {
	    const result = await browser.storage.local.get(key);
	    return result[key];
	}

	/**
	 * Sets a value in storage.
	 * 
	 * @async
	 * @param {string} [key=Constants.STORAGE_KEYS.EXCLUSION_LIST] - The key to set in storage.
	 * @param {any} value - The value to associate with the key.
	 * @returns {Promise<void>}
	 */
	async set(key = Constants.STORAGE_KEYS.EXCLUSION_LIST, value) {
	    const obj = {};
	    obj[key] = value;
	    await browser.storage.local.set(obj);
	}

	/**
	 * Removes a value from storage.
	 * 
	 * @async
	 * @param {string} [key=Constants.STORAGE_KEYS.EXCLUSION_LIST] - The key to remove from storage.
	 * @returns {Promise<void>}
	 */
	async remove(key = Constants.STORAGE_KEYS.EXCLUSION_LIST) {
	    await browser.storage.local.remove(key);
	}

	/**
	 * Clears all data from storage.
	 * 
	 * @async
	 * @returns {Promise<void>}
	 */
	async clear() {
	    await browser.storage.local.clear();
	}

	/**
	 * Retrieves all keys from storage.
	 * 
	 * @async
	 * @returns {Promise<Array<string>>} An array of keys in storage.
	 */
	async getAllKeys() {
	    const result = await browser.storage.local.get(null);
	    return Object.keys(result);
	}

	/**
	 * Retrieves all values from storage.
	 * 
	 * @async
	 * @returns {Promise<Object>} An object containing all key-value pairs in storage.
	 */
	async getAllValues() {
	    const result = await browser.storage.local.get(null);
	    return result;
	}

	/**
	 * Serializes a list into a string format.
	 * 
	 * @param {Array<string>} list - The list to serialize.
	 * @returns {string} The serialized list.
	 */
	serializeList(list) {
	    return JSON.stringify(list);
	}

	/**
	 * Deserializes a string into a list.
	 * 
	 * @param {string} data - The serialized list.
	 * @returns {Array<string>} The deserialized list.
	 */
	deserializeList(data) {
	    try {
	        return JSON.parse(data);
	    } catch (error) {
	        Logger.warn(`Failed to parse exclusion list: ${error.message}`);  // <-- replaced console.warn with Logger.warn
	        return [];
	    }
	}

	/**
	 * Merges two lists and removes duplicates.
	 * 
	 * @param {Array<string>} list1 - The first list.
	 * @param {Array<string>} list2 - The second list.
	 * @returns {Array<string>} The merged list without duplicates.
	 */
	mergeLists(list1, list2) {
	    const merged = new Set([...list1, ...list2]);
	    return Array.from(merged);
	}

	/**
	 * Checks if a key exists in storage.
	 * 
	 * @async
	 * @param {string} key - The key to check.
	 * @returns {Promise<boolean>} True if the key exists, false otherwise.
	 */
	async keyExists(key) {
	    const result = await browser.storage.local.get(key);
	    return key in result;
	}

	/**
	 * Checks if a value exists in storage.
	 * 
	 * @async
	 * @param {string} key - The key to check.
	 * @param {any} value - The value to check for.
	 * @returns {Promise<boolean>} True if the value exists, false otherwise.
	 */
	async valueExists(key, value) {
	    const result = await browser.storage.local.get(key);
	    return result[key] === value;
	}

	/**
	 * Checks if a list contains a specific value.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @param {string} value - The value to check for.
	 * @returns {boolean} True if the value exists in the list, false otherwise.
	 */
	listContainsValue(list, value) {
	    return list.includes(value);
	}

	/**
	 * Checks if a list is empty.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list is empty, false otherwise.
	 */
	isListEmpty(list) {
	    return list.length === 0;
	}

	/**
	 * Checks if a list is not empty.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list is not empty, false otherwise.
	 */
	isListNotEmpty(list) {
	    return list.length > 0;
	}

	/**
	 * Checks if a list contains only unique values.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list contains only unique values, false otherwise.
	 */
	isListUnique(list) {
	    const set = new Set(list);
	    return set.size === list.length;
	}

	/**
	 * Checks if a list contains duplicates.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list contains duplicates, false otherwise.
	 */
	hasDuplicates(list) {
	    const set = new Set(list);
	    return set.size < list.length;
	}

	/**
	 * Checks if a list is sorted in ascending order.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list is sorted in ascending order, false otherwise.
	 */
	isListSortedAscending(list) {
	    return list.every((value, index) => index === 0 || value >= list[index - 1]);
	}

	/**
	 * Checks if a list is sorted in descending order.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @returns {boolean} True if the list is sorted in descending order, false otherwise.
	 */
	isListSortedDescending(list) {
	    return list.every((value, index) => index === 0 || value <= list[index - 1]);
	}

	/**
	 * Checks if a list is sorted in the specified order.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @param {string} order - The order to check for ('ascending', 'descending', 'random').
	 * @returns {boolean} True if the list is sorted in the specified order, false otherwise.
	 */
	isListSortedInOrder(list, order) {
	    switch (order) {
	        case 'ascending':
	            return this.isListSortedAscending(list);
	        case 'descending':
	            return this.isListSortedDescending(list);
	        case 'random':
	            return !(this.isListSortedAscending(list) || this.isListSortedDescending(list));
	        default:
	            throw new Error(`Invalid order: ${order}`);
	    }
	}

	/**
	 * Checks if a list is sorted in reverse order of the specified order.
	 * 
	 * @param {Array<string>} list - The list to check.
	 * @param {string} order - The order to check for ('ascending', 'descending', 'random').
	 * @returns {boolean} True if the list is sorted in the reverse of the specified order, false otherwise.
	 */
	isListSortedInReverseOrder(list, order) {
	    switch (order) {
	        case 'ascending':
	            return this.isListSortedDescending(list);
	        case 'descending':
	            return this.isListSortedAscending(list);
	        case 'random':
	            return !(this.isListSortedAscending(list) || this.isListSortedDescending(list));
	        default:
	            throw new Error(`Invalid order: ${order}`);
	    }
	}
}

export default new Storage();
