/**
 * Unit tests for the MessageParser class.
 * 
 * Tests include:
 * - `normalize` method:
 *   - Ensures it returns an empty string for non-string input.
 *   - Verifies it removes punctuation and converts text to lowercase.
 * - `parse` method:
 *   - Confirms it excludes tokens specified in the exclusion list.
 *   - Checks it returns an empty array when no matches are found.
 * - `tagIDs` method:
 *   - Validates it assigns unique IDs to tokens.
 */

/**
 * @jest-environment jsdom
 */

import MessageParser from '../../scripts/content/messageParser';


describe('MessageParser', () => {
  test('normalize returns empty string for non-string input', () => {
    const parser = new MessageParser();
    expect(parser.normalize(123)).toBe('');
  });

  test('normalize removes punctuation and lowercases text', () => {
    const parser = new MessageParser();
    const result = parser.normalize('Hello, WORLD!');
    expect(result).toBe('hello world');
  });

  test('parse excludes tokens in exclusion list', () => {
    const parser = new MessageParser({ exclusionList: ['hello'] });
    const result = parser.parse('Hello world');
    expect(result).toEqual(['world']);
  });

  test('parse returns empty array when no matches', () => {
    const parser = new MessageParser({ pattern: /[0-9]+/g });
    const result = parser.parse('No numbers here!');
    expect(result).toEqual([]);
  });

  test('tagIDs assigns unique IDs to tokens', () => {
    const parser = new MessageParser();
    const result = parser.tagIDs(['apple', 'banana']);
    expect(result).toEqual([
      { token: 'apple', id: 'msg-1' },
      { token: 'banana', id: 'msg-2' }
    ]);
  });
});
