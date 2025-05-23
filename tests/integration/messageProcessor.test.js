/**
 * @file messageProcessor.test.js
 * @description Integration tests for messageProcessor.js ensuring correct parsing,
 * filtering, and processing of message content.
 * @author Noelle
 * @date 2025-05-21
 */

import MessageProcessor from '../../scripts/services/messageProcessor';
import MessageParser from '../../scripts/content/messageParser'; // or your mock

describe('Message Processor Integration Tests', () => {
  const parser = new MessageParser();
  const processor = new MessageProcessor({ parser });

  test('processes normal message', async () => {
    const message = 'Hello world';
    const result = await processor.process(message);
    expect(result.tokens).toContain('hello'); // lowercase match
  });

  test('handles invalid message gracefully', async () => {
    await expect(processor.process(null)).rejects.toThrow(TypeError);
  });
});
