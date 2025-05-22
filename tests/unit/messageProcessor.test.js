/**
 * @file messageProcessor.test.js
 * @description Unit tests for MessageProcessor module.
 */


import MessageProcessor from '../../scripts/services/messageProcessor';
import MessageParser from '../../scripts/content/messageParser'; // adjust path as needed

describe('Message Processor Integration Tests', () => {
  const parser = new MessageParser(); // assuming it has a .parse() method
  const processor = new MessageProcessor({ parser });

  test('processes normal message', async () => {
    const message = 'Hello world';
    const result = await processor.process(message);
    expect(result).toBeDefined();
    expect(result.tokens).toBeInstanceOf(Array);
  });

  test('handles invalid message gracefully', async () => {
    await expect(processor.process(null)).rejects.toThrow(TypeError);
  });
});
