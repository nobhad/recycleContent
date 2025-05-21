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

/**
 * Storage class provides a wrapper around browser storage APIs.
 */
class Storage {
	// Add methods and properties as needed
}

/**
 * Retrieves a value from storage.
 * 
 * @async
 * @function
 * @param {string} key - The key to retrieve from storage.
 * @returns {Promise<any>} The value associated with the key.
 */
Storage.prototype.get = async function(key) {
    const result = await browser.storage.local.get(key);
    return result[key];
}

/**
 * Sets a value in storage.
 * 
 * @async
 * @function
 * @param {string} key - The key to set in storage.
 * @param {any} value - The value to associate with the key.
 * @returns {Promise<void>}
 */
Storage.prototype.set = async function(key, value) {
    const obj = {};
    obj[key] = value;
    await browser.storage.local.set(obj);
}

/**
 * Removes a value from storage.
 * 
 * @async
 * @function
 * @param {string} key - The key to remove from storage.
 * @returns {Promise<void>}
 */
Storage.prototype.remove = async function(key) {
    await browser.storage.local.remove(key);
}

/**
 * Clears all data from storage.
 * 
 * @async
 * @function
 * @returns {Promise<void>}
 */
Storage.prototype.clear = async function() {
    await browser.storage.local.clear();
}

/**
 * Retrieves all keys from storage.
 * 
 * @async
 * @function
 * @returns {Promise<Array<string>>} An array of keys in storage.
 */
Storage.prototype.getAllKeys = async function() {
    const result = await browser.storage.local.get(null);
    return Object.keys(result);
}

/**
 * Retrieves all values from storage.
 * 
 * @async
 * @function
 * @returns {Promise<Object>} An object containing all key-value pairs in storage.
 */
Storage.prototype.getAllValues = async function() {
    const result = await browser.storage.local.get(null);
    return result;
}

/**
 * Serializes a list into a string format.
 * 
 * @function
 * @param {Array<string>} list - The list to serialize.
 * @returns {string} The serialized list.
 */
Storage.prototype.serializeList = function(list) {
    return JSON.stringify(list);
}

/**
 * Deserializes a string into a list.
 * 
 * @function
 * @param {string} data - The serialized list.
 * @returns {Array<string>} The deserialized list.
 */
Storage.prototype.deserializeList = function(data) {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Failed to parse exclusion list: ${error.message}`);
        return [];
    }
}

/**
 * Merges two lists and removes duplicates.
 * 
 * @function
 * @param {Array<string>} list1 - The first list.
 * @param {Array<string>} list2 - The second list.
 * @returns {Array<string>} The merged list without duplicates.
 */
Storage.prototype.mergeLists = function(list1, list2) {
    const merged = new Set([...list1, ...list2]);
    return Array.from(merged);
}

/**
 * Checks if a key exists in storage.
 * 
 * @async
 * @function
 * @param {string} key - The key to check.
 * @returns {Promise<boolean>} True if the key exists, false otherwise.
 */
Storage.prototype.keyExists = async function(key) {
    const result = await browser.storage.local.get(key);
    return key in result;
}

/**
 * Checks if a value exists in storage.
 * 
 * @async
 * @function
 * @param {string} key - The key to check.
 * @param {any} value - The value to check for.
 * @returns {Promise<boolean>} True if the value exists, false otherwise.
 */
Storage.prototype.valueExists = async function(key, value) {
    const result = await browser.storage.local.get(key);
    return result[key] === value;
}

/**
 * Checks if a list contains a specific value.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @param {string} value - The value to check for.
 * @returns {boolean} True if the value exists in the list, false otherwise.
 */
Storage.prototype.listContainsValue = function(list, value) {
    return list.includes(value);
}

/**
 * Checks if a list is empty.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list is empty, false otherwise.
 */
Storage.prototype.isListEmpty = function(list) {
    return list.length === 0;
}

/**
 * Checks if a list is not empty.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list is not empty, false otherwise.
 */
Storage.prototype.isListNotEmpty = function(list) {
    return list.length > 0;
}

/**
 * Checks if a list contains only unique values.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list contains only unique values, false otherwise.
 */
Storage.prototype.isListUnique = function(list) {
    const set = new Set(list);
    return set.size === list.length;
}

/**
 * Checks if a list contains duplicates.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list contains duplicates, false otherwise.
 */
Storage.prototype.hasDuplicates = function(list) {
    const set = new Set(list);
    return set.size < list.length;
}

/**
 * Checks if a list is sorted in ascending order.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list is sorted in ascending order, false otherwise.
 */
Storage.prototype.isListSortedAscending = function(list) {
    return list.every((value, index) => index === 0 || value >= list[index - 1]);
}

/**
 * Checks if a list is sorted in descending order.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @returns {boolean} True if the list is sorted in descending order, false otherwise.
 */
Storage.prototype.isListSortedDescending = function(list) {
    return list.every((value, index) => index === 0 || value <= list[index - 1]);
}

/**
 * Checks if a list is sorted in the specified order.
 * 
 * @function
 * @param {Array<string>} list - The list to check.
 * @param {string} order - The order to check for ('ascending', 'descending', 'random').
 * @returns {boolean} True if the list is sorted in the specified order, false otherwise.
 */
Storage.prototype.isListSortedInOrder = function(list, order) {
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
 * @function
 * @param {Array<string>} list - The list to check.
 * @param {string} order - The order to check for ('ascending', 'descending', 'random').
 * @returns {boolean} True if the list is sorted in the reverse of the specified order, false otherwise.
 */
Storage.prototype.isListSortedInReverseOrder = function(list, order) {
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

export default Storage;
