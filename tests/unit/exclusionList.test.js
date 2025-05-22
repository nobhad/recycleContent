/**
 * exclusionList.test.js
 * 
 * author: Noelle Bhaduri
 * date: 2025-05-21
 * 
 * description:
 * Complete unit tests for exclusionList.js covering state, storage,
 * error handling, caching, and input validation.
 */

/**
 * @jest-environment jsdom
 */

import exclusionListManager from '../../scripts/services/exclusionList.js';
import Logger from '../../scripts/common/logger.js';

const STORAGE_KEY_PREFIX = 'exclusion_';

beforeEach(() => {
  // Clear cache and reset mocks
  exclusionListManager.cache.clear();

  jest.clearAllMocks();

  // Mock chrome.storage.local methods as jest.fn() each test
  chrome.storage.local.get = jest.fn().mockResolvedValue({});
  chrome.storage.local.set = jest.fn().mockResolvedValue();

  // Spy on Logger methods
  jest.spyOn(Logger, 'warn').mockImplementation(() => {});
  jest.spyOn(Logger, 'error').mockImplementation(() => {});
  jest.spyOn(Logger, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ExclusionListManager', () => {
  describe('getOrCreateList()', () => {
    test('returns empty array and caches it when storage has no data', async () => {
      expect.assertions(3);
      chrome.storage.local.get.mockResolvedValue({});

      const id = 'msg1';
      const list = await exclusionListManager.getOrCreateList(id);

      expect(list).toEqual([]);
      expect(exclusionListManager.cache.get(id)).toEqual([]);
      expect(chrome.storage.local.get).toHaveBeenCalledWith([`${STORAGE_KEY_PREFIX}${id}`]);
    });

    test('returns cached list without calling storage again', async () => {
      expect.assertions(2);
      const id = 'msg2';
      const cachedList = ['a', 'b'];
      exclusionListManager.cache.set(id, cachedList);

      const list = await exclusionListManager.getOrCreateList(id);

      expect(list).toEqual(cachedList);
      expect(chrome.storage.local.get).not.toHaveBeenCalled();
    });

    test('returns stored list if present and caches it', async () => {
      expect.assertions(2);
      const id = 'msg3';
      const storedList = ['x', 'y'];

      chrome.storage.local.get.mockResolvedValue({
        [`${STORAGE_KEY_PREFIX}${id}`]: JSON.stringify(storedList),
      });

      const list = await exclusionListManager.getOrCreateList(id);

      expect(list).toEqual(storedList);
      expect(exclusionListManager.cache.get(id)).toEqual(storedList);
    });

    test('handles storage.get errors gracefully and logs error', async () => {
      expect.assertions(2);
      const id = 'msgErrorGet';

      chrome.storage.local.get.mockRejectedValue(new Error('storage get failure'));

      const list = await exclusionListManager.getOrCreateList(id);

      expect(list).toEqual([]);
      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving exclusion list')
      );
    });
  });

  describe('updateList()', () => {
    test('merges and deduplicates new buyers correctly, persists and caches', async () => {
      expect.assertions(4);
      const id = 'msgMergeDedup';
      const initial = ['a', 'b', 'c'];
      const newBuyers = ['b', 'c', 'd'];

      jest.spyOn(exclusionListManager, 'getOrCreateList').mockResolvedValue(initial);

      const result = await exclusionListManager.updateList(id, newBuyers);

      const expected = ['a', 'b', 'c', 'd'];

      expect(result.sort()).toEqual(expected.sort());
      expect(exclusionListManager.cache.get(id).sort()).toEqual(expected.sort());
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          [`${STORAGE_KEY_PREFIX}${id}`]: JSON.stringify(expected),
        })
      );
      expect(exclusionListManager.getOrCreateList).toHaveBeenCalledWith(id);
    });

    test('returns input list and skips storage.set if storage is null', async () => {
      expect.assertions(2);
      const id = 'msgNoStorage';
      const buyers = ['x'];

      // Temporarily replace storage with null
      const originalStorage = exclusionListManager.storage;
      exclusionListManager.storage = null;

      jest.spyOn(exclusionListManager, 'getOrCreateList').mockResolvedValue([]);

      const result = await exclusionListManager.updateList(id, buyers);

      expect(result).toEqual(buyers);
      expect(exclusionListManager.cache.get(id)).toEqual(buyers);
      // no call to chrome.storage.local.set expected

      // Restore storage after test
      exclusionListManager.storage = originalStorage;
    });

    test('handles storage.set errors gracefully and logs error', async () => {
      expect.assertions(2);
      const id = 'msgErrorSet';
      const buyers = ['buyer1'];

      jest.spyOn(exclusionListManager, 'getOrCreateList').mockResolvedValue([]);

      chrome.storage.local.set.mockRejectedValue(new Error('storage set failure'));

      const result = await exclusionListManager.updateList(id, buyers);

      expect(result).toEqual(buyers);
      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringContaining('storage set failure')
      );
    });

    test('logs warning and returns existing list if newBuyers argument is invalid', async () => {
      expect.assertions(3);

      const id = 'msgInvalidNewBuyers';
      const existingList = ['existing'];

      // Mock the getOrCreateList to return the existing list
      jest.spyOn(exclusionListManager, 'getOrCreateList').mockResolvedValue(existingList);

      // Mock the logger warn method
      jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      // Call updateList with invalid newBuyers (not an array)
      const result = await exclusionListManager.updateList(id, 'notAnArray');

      expect(result).toEqual(existingList);

      // Adjusted expected warning message string:
      expect(Logger.warn).toHaveBeenCalledWith(
        'updateList called with non-array newBuyers'
      );

      expect(exclusionListManager.getOrCreateList).toHaveBeenCalledWith(id);
    });
  });

  describe('createNewList()', () => {
    test('creates, persists, and caches empty list', async () => {
      expect.assertions(3);
      const id = 'msgCreateNew';

      const result = await exclusionListManager.createNewList(id);

      expect(result).toEqual([]);
      expect(exclusionListManager.cache.get(id)).toEqual([]);
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          [`${STORAGE_KEY_PREFIX}${id}`]: JSON.stringify([]),
        })
      );
    });
  });

  describe('deserializeList()', () => {
    test('returns empty array and logs warning on invalid JSON string', () => {
      const badJson = '{invalid: json}';
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const result = exclusionListManager.deserializeList(badJson);

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse exclusion list'));

      warnSpy.mockRestore();
    });

    test('returns empty array and logs warning if parsed data is not an array', () => {
      const nonArrayJson = JSON.stringify({ key: 'value' });
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});

      const result = exclusionListManager.deserializeList(nonArrayJson);

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith('Deserialized data is not an array, returning empty list.');

      warnSpy.mockRestore();
    });
  });

  describe('mergeAndDeduplicate()', () => {
    test('merges two arrays removing duplicates correctly', () => {
      const existingList = ['a', 'b', 'c'];
      const newList = ['b', 'c', 'd', 'e'];

      const merged = exclusionListManager.mergeAndDeduplicate(existingList, newList);

      const expected = ['a', 'b', 'c', 'd', 'e'];

      expect(merged.sort()).toEqual(expected.sort());
    });
  });
});
