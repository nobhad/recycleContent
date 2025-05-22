/**
 * messageHandler.test.js
 * 
 * author: Noelle Bhaduri
 * date: 2025-05-21
 * 
 * description:
 * unit tests for messageHandler.js covering processing and
 * dispatching of messages.
 * 
 * notes:
 * - tests message validation, parsing, and forwarding
 * - mocks messageProcessor and UI updates
 * 
 * future:
 * - add tests for new message types
 */


/**
 * @jest-environment jsdom
 */


import { handleMessage, handleBatch } from '../../scripts/services/messageHandler.js';
import MediaHandler from '../../scripts/services/mediaHandler';
import Logger from '../../scripts/common/logger.js';

let mediaHandler;

beforeEach(() => {
  mediaHandler = new MediaHandler();
  jest.spyOn(Logger, 'error').mockImplementation(() => {});
  document.createElement = jest.fn().mockImplementation(tag => {
    return {
      tagName: tag,
      classList: { add: jest.fn() },
      appendChild: jest.fn(),
      setAttribute: jest.fn(),
    };
  });
});

describe('messageHandler', () => {
  test('handleMessage processes a single message and returns expected structure', async () => {
    const result = await handleMessage('This is a test message.');

    expect(result).toHaveProperty('tokens');
    expect(result).toHaveProperty('excluded');
    expect(result).toHaveProperty('mediaAnalysis');
    expect(Array.isArray(result.tokens)).toBe(true);
  });

  test('handleBatch processes multiple messages', async () => {
    const messages = ['Hello world!', 'Another test.'];
    const results = await handleBatch(messages);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(messages.length);

    for (const result of results) {
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('excluded');
      expect(result).toHaveProperty('mediaAnalysis');
    }
  });

  test('handleMessage throws when input is not a string', async () => {
    await expect(handleMessage(42)).rejects.toThrow('message must be a string');
  });

  test('handleBatch throws when input is not an array', async () => {
    await expect(handleBatch('oops')).rejects.toThrow('messages must be an array of strings');
  });
});
