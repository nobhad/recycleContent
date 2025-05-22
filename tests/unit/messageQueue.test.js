/**
 * @jest-environment jsdom
 */

jest.mock('../../scripts/common/logger.js', () => ({
    __esModule: true,
    default: {
      warn: jest.fn(),
    }
  }));
  
  global.chrome = {
    storage: {
      local: {
        set: jest.fn((data) => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ messageQueue: null })),
      }
    }
  };
  
  import MessageQueue from '../../scripts/background/messageQueue.js';
  import Logger from '../../scripts/common/logger.js';
  
  describe('MessageQueue', () => {
    let queue;
    const testMessage = { id: 'msg-1', content: 'Hello' };
  
    beforeEach(() => {
      jest.clearAllMocks();
      queue = new MessageQueue({ retryLimit: 2 });
    });
  
    test('enqueue adds a new message', async () => {
      const result = await queue.enqueue(testMessage);
      expect(result).toBe(true);
      expect(queue.size()).toBe(1);
    });
  
    test('enqueue prevents duplicate messages', async () => {
      await queue.enqueue(testMessage);
      const result = await queue.enqueue(testMessage);
      expect(result).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith(expect.stringContaining('already in queue'));
      expect(queue.size()).toBe(1);
    });
  
    test('peek returns the first message without removing it', async () => {
      await queue.enqueue(testMessage);
      const peeked = queue.peek();
      expect(peeked.id).toBe('msg-1');
      expect(queue.size()).toBe(1);
    });
  
    test('dequeue removes and returns the first message', async () => {
      await queue.enqueue(testMessage);
      const dequeued = await queue.dequeue();
      expect(dequeued.id).toBe('msg-1');
      expect(queue.size()).toBe(0);
    });
  
    test('handleRetry requeues message if under retry limit', async () => {
      await queue.enqueue(testMessage);
      const dequeued = await queue.dequeue();
      const dropped = await queue.handleRetry(dequeued);
      expect(dropped).toBe(false);
      expect(queue.size()).toBe(1);
      expect(queue.peek().retryCount).toBe(1);
    });
  
    test('handleRetry drops message if over retry limit', async () => {
      const onDrop = jest.fn();
      queue = new MessageQueue({ retryLimit: 1, eventHandlers: { onDrop } });
  
      await queue.enqueue(testMessage);
      const msg = await queue.dequeue();
      msg.retryCount = 2;
  
      const dropped = await queue.handleRetry(msg);
      expect(dropped).toBe(true);
      expect(queue.size()).toBe(0);
      expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ id: 'msg-1' }));
    });
  
    test('clear empties the queue', async () => {
      await queue.enqueue(testMessage);
      await queue.clear();
      expect(queue.size()).toBe(0);
    });
  
    test('size returns correct queue length', async () => {
      expect(queue.size()).toBe(0);
      await queue.enqueue(testMessage);
      expect(queue.size()).toBe(1);
    });
  });
  