/**
 * @jest-environment jsdom
 */

/**
 * @file notificationManager.test.js
 * @description Unit tests for NotificationManager module.
 */

jest.mock('../../scripts/common/logger.js', () => ({
    __esModule: true,
    default: {
      info: jest.fn(),
      error: jest.fn()
    }
  }));
  
  global.browser = {
    notifications: {
      create: jest.fn(() => Promise.resolve('mock-notif-id')),
      clear: jest.fn(() => Promise.resolve(true)),
      getAll: jest.fn(() => Promise.resolve({
        'rc-notif-123': {},
        'rc-notif-456': {},
        'other-notif': {}
      }))
    }
  };
  
  import NotificationManager from '../../scripts/background/notificationManager.js';
  import Logger from '../../scripts/common/logger.js';
  
  describe('NotificationManager', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('showNotification creates a notification and logs info', async () => {
      const id = await NotificationManager.showNotification({
        title: 'Test Title',
        message: 'Test Message'
      });
  
      expect(browser.notifications.create).toHaveBeenCalled();
      expect(id).toMatch(/^rc-notif-/);
      expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining('Notification shown'));
    });
  
    test('showNotification logs and throws on error', async () => {
      browser.notifications.create.mockRejectedValueOnce(new Error('fail'));
      await expect(NotificationManager.showNotification({ title: 'X', message: 'Y' }))
        .rejects.toThrow('fail');
      expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to show notification'));
    });
  
    test('clearNotification clears a notification and logs info', async () => {
      const result = await NotificationManager.clearNotification('rc-notif-123');
      expect(result).toBe(true);
      expect(browser.notifications.clear).toHaveBeenCalledWith('rc-notif-123');
      expect(Logger.info).toHaveBeenCalledWith('Notification cleared: rc-notif-123');
    });
  
    test('clearNotification logs and throws on error', async () => {
      browser.notifications.clear.mockRejectedValueOnce(new Error('clear fail'));
      await expect(NotificationManager.clearNotification('bad-id')).rejects.toThrow('clear fail');
      expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to clear notification'));
    });
  
    test('clearAllNotifications clears only rc-notif-* notifications', async () => {
      const spy = jest.spyOn(NotificationManager, 'clearNotification');
      await NotificationManager.clearAllNotifications();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith('rc-notif-123');
      expect(spy).toHaveBeenCalledWith('rc-notif-456');
      expect(Logger.info).toHaveBeenCalledWith('All RecycleContent notifications cleared');
    });
  
    test('showExclusionListUpdated shows a formatted update notification', async () => {
      const id = await NotificationManager.showExclusionListUpdated(3);
      expect(browser.notifications.create).toHaveBeenCalled();
      expect(id).toMatch(/^rc-notif-/);
    });
  
    test('showError shows an error notification with priority', async () => {
      const id = await NotificationManager.showError('Something went wrong');
      expect(browser.notifications.create).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          title: 'RecycleContent Error',
          message: 'Something went wrong',
          priority: 2
        })
      );
      expect(id).toMatch(/^rc-notif-/);
    });
  });
  