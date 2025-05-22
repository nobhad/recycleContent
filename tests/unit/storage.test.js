/**
 * Unit tests for the Storage module.
 * 
 * This test suite verifies the functionality of the Storage module, which provides
 * methods for interacting with browser storage, manipulating lists, and performing
 * various utility operations. The tests use Jest as the testing framework and mock
 * the browser's storage API to simulate storage interactions.
 * 
 * Test Cases:
 * 
 * - `get`: Verifies that a value can be retrieved from storage using a key.
 * - `set`: Verifies that a value can be stored in storage with a key.
 * - `remove`: Verifies that a value can be removed from storage using a key.
 * - `clear`: Verifies that all storage can be cleared.
 * - `getAllKeys`: Verifies that all keys in storage can be retrieved.
 * - `getAllValues`: Verifies that all values in storage can be retrieved.
 * - `serializeList`: Verifies that a list can be serialized into a JSON string.
 * - `deserializeList`: Verifies that a JSON string can be deserialized into a list.
 * - `mergeLists`: Verifies that two lists can be merged, removing duplicates.
 * - `keyExists`: Verifies that the existence of a key in storage can be checked.
 * - `valueExists`: Verifies that the existence of a value in storage can be checked.
 * - `listContainsValue`: Verifies that a list contains a specific value.
 * - `isListEmpty`: Verifies that a list is empty.
 * - `isListNotEmpty`: Verifies that a list is not empty.
 * - `isListUnique`: Verifies that a list contains only unique values.
 * - `hasDuplicates`: Verifies that a list contains duplicate values.
 * - `isListSortedAscending`: Verifies that a list is sorted in ascending order.
 * - `isListSortedDescending`: Verifies that a list is sorted in descending order.
 * - `isListSortedInOrder`: Verifies that a list is sorted in a specified order.
 * - `isListSortedInReverseOrder`: Verifies that a list is sorted in reverse order of a specified order.
 * 
 * Mocking:
 * - The `global.browser` object is mocked to simulate the browser's storage API.
 * - The `jest.fn()` method is used to mock the `get`, `set`, `remove`, and `clear` methods of the storage API.
 * 
 * Dependencies:
 * - `Storage`: The module being tested.
 * - `Logger`: Used for logging warnings.
 */

/**
 * @jest-environment jsdom
 */

import Storage from '../../scripts/common/storage';
import Logger from '../../scripts/common/logger';

describe('Storage', () => {
    beforeEach(() => {
        jest.spyOn(Logger, 'warn').mockImplementation(() => {});
        // Mock browser.storage.local API
        global.browser = {
            storage: {
                local: {
                    get: jest.fn(),
                    set: jest.fn(),
                    remove: jest.fn(),
                    clear: jest.fn(),
                },
            },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Async storage methods tests
    test('get retrieves value by key', async () => {
        browser.storage.local.get.mockResolvedValue({ testKey: 'testValue' });
        const result = await Storage.get('testKey');
        expect(result).toBe('testValue');
        expect(browser.storage.local.get).toHaveBeenCalledWith('testKey');
    });

    test('set stores value by key', async () => {
        browser.storage.local.set.mockResolvedValue();
        await Storage.set('testKey', 'testValue');
        expect(browser.storage.local.set).toHaveBeenCalledWith({ testKey: 'testValue' });
    });

    test('remove deletes value by key', async () => {
        browser.storage.local.remove.mockResolvedValue();
        await Storage.remove('testKey');
        expect(browser.storage.local.remove).toHaveBeenCalledWith('testKey');
    });

    test('clear clears all storage', async () => {
        browser.storage.local.clear.mockResolvedValue();
        await Storage.clear();
        expect(browser.storage.local.clear).toHaveBeenCalled();
    });

    test('getAllKeys returns keys array', async () => {
        browser.storage.local.get.mockResolvedValue({ a: 1, b: 2 });
        const keys = await Storage.getAllKeys();
        expect(keys).toEqual(['a', 'b']);
    });

    test('getAllValues returns all values', async () => {
        const data = { a: 1, b: 2 };
        browser.storage.local.get.mockResolvedValue(data);
        const values = await Storage.getAllValues();
        expect(values).toEqual(data);
    });

    test('keyExists returns true if key exists', async () => {
        browser.storage.local.get.mockResolvedValue({ key1: 'val' });
        const exists = await Storage.keyExists('key1');
        expect(exists).toBe(true);
    });

    test('keyExists returns false if key does not exist', async () => {
        browser.storage.local.get.mockResolvedValue({ otherKey: 'val' });
        const exists = await Storage.keyExists('key1');
        expect(exists).toBe(false);
    });

    test('valueExists returns true if value matches', async () => {
        browser.storage.local.get.mockResolvedValue({ key1: 'val' });
        const exists = await Storage.valueExists('key1', 'val');
        expect(exists).toBe(true);
    });

    test('valueExists returns false if value does not match', async () => {
        browser.storage.local.get.mockResolvedValue({ key1: 'val' });
        const exists = await Storage.valueExists('key1', 'otherVal');
        expect(exists).toBe(false);
    });

    // Serialization / deserialization
    test('serializeList returns JSON string', () => {
        const list = ['a', 'b', 'c'];
        const json = Storage.serializeList(list);
        expect(json).toBe(JSON.stringify(list));
    });

    test('deserializeList returns parsed list on valid JSON', () => {
        const json = '["a", "b", "c"]';
        const list = Storage.deserializeList(json);
        expect(list).toEqual(['a', 'b', 'c']);
    });

    test('deserializeList returns empty array on invalid JSON', () => {
        const invalidJSON = '{invalid: true';
        const list = Storage.deserializeList(invalidJSON);
        expect(list).toEqual([]);
        expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse exclusion list'));
    });

    // List manipulation
    test('mergeLists merges two lists without duplicates', () => {
        const list1 = ['a', 'b'];
        const list2 = ['b', 'c'];
        const merged = Storage.mergeLists(list1, list2);
        expect(merged.sort()).toEqual(['a', 'b', 'c']);
    });

    // List checks
    test('listContainsValue returns true if value exists', () => {
        expect(Storage.listContainsValue(['a', 'b'], 'b')).toBe(true);
    });

    test('listContainsValue returns false if value does not exist', () => {
        expect(Storage.listContainsValue(['a', 'b'], 'c')).toBe(false);
    });

    test('isListEmpty returns true for empty list', () => {
        expect(Storage.isListEmpty([])).toBe(true);
    });

    test('isListEmpty returns false for non-empty list', () => {
        expect(Storage.isListEmpty(['a'])).toBe(false);
    });

    test('isListNotEmpty returns true for non-empty list', () => {
        expect(Storage.isListNotEmpty(['a'])).toBe(true);
    });

    test('isListNotEmpty returns false for empty list', () => {
        expect(Storage.isListNotEmpty([])).toBe(false);
    });

    test('isListUnique returns true if all values unique', () => {
        expect(Storage.isListUnique(['a', 'b', 'c'])).toBe(true);
    });

    test('isListUnique returns false if duplicates exist', () => {
        expect(Storage.isListUnique(['a', 'b', 'a'])).toBe(false);
    });

    test('hasDuplicates returns true if duplicates exist', () => {
        expect(Storage.hasDuplicates(['a', 'b', 'a'])).toBe(true);
    });

    test('hasDuplicates returns false if no duplicates', () => {
        expect(Storage.hasDuplicates(['a', 'b', 'c'])).toBe(false);
    });

    test('isListSortedAscending returns true for ascending list', () => {
        expect(Storage.isListSortedAscending(['a', 'b', 'c'])).toBe(true);
    });

    test('isListSortedAscending returns true for empty list', () => {
        expect(Storage.isListSortedAscending([])).toBe(true);
    });

    test('isListSortedAscending returns false for non-ascending list', () => {
        expect(Storage.isListSortedAscending(['b', 'a', 'c'])).toBe(false);
    });

    test('isListSortedDescending returns true for descending list', () => {
        expect(Storage.isListSortedDescending(['c', 'b', 'a'])).toBe(true);
    });

    test('isListSortedDescending returns true for empty list', () => {
        expect(Storage.isListSortedDescending([])).toBe(true);
    });

    test('isListSortedDescending returns false for non-descending list', () => {
        expect(Storage.isListSortedDescending(['a', 'c', 'b'])).toBe(false);
    });

    test('isListSortedInOrder ascending works', () => {
        expect(Storage.isListSortedInOrder(['a', 'b', 'c'], 'ascending')).toBe(true);
        expect(Storage.isListSortedInOrder(['c', 'b', 'a'], 'ascending')).toBe(false);
    });

    test('isListSortedInOrder descending works', () => {
        expect(Storage.isListSortedInOrder(['c', 'b', 'a'], 'descending')).toBe(true);
        expect(Storage.isListSortedInOrder(['a', 'b', 'c'], 'descending')).toBe(false);
    });

    test('isListSortedInOrder random works', () => {
        expect(Storage.isListSortedInOrder(['a', 'c', 'b'], 'random')).toBe(true);
        expect(Storage.isListSortedInOrder(['a', 'b', 'c'], 'random')).toBe(false);
    });

    test('isListSortedInOrder throws on invalid order', () => {
        expect(() => Storage.isListSortedInOrder([], 'invalid')).toThrow('Invalid order: invalid');
    });

    test('isListSortedInReverseOrder ascending works', () => {
        expect(Storage.isListSortedInReverseOrder(['c', 'b', 'a'], 'ascending')).toBe(true);
        expect(Storage.isListSortedInReverseOrder(['a', 'b', 'c'], 'ascending')).toBe(false);
    });

    test('isListSortedInReverseOrder descending works', () => {
        expect(Storage.isListSortedInReverseOrder(['a', 'b', 'c'], 'descending')).toBe(true);
        expect(Storage.isListSortedInReverseOrder(['c', 'b', 'a'], 'descending')).toBe(false);
    });

    test('isListSortedInReverseOrder random works', () => {
        expect(Storage.isListSortedInReverseOrder(['a', 'c', 'b'], 'random')).toBe(true);
        expect(Storage.isListSortedInReverseOrder(['a', 'b', 'c'], 'random')).toBe(false);
    });

    test('isListSortedInReverseOrder throws on invalid order', () => {
        expect(() => Storage.isListSortedInReverseOrder([], 'invalid')).toThrow('Invalid order: invalid');
    });
});
