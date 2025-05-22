// tests/unit/background.test.js

// Mock the MessageProcessor module
jest.mock('../../scripts/services/messageProcessor.js');
const MessageProcessor = require('../../scripts/services/messageProcessor.js');

// Mock global chrome API
global.chrome = {
  runtime: {
    onMessage: { addListener: jest.fn() },
    onInstalled: { addListener: jest.fn() },
    onStartup: { addListener: jest.fn() },
    action: { onClicked: { addListener: jest.fn() } },
    onSuspend: { addListener: jest.fn() },
    onSuspendCanceled: { addListener: jest.fn() },
    onUpdateAvailable: { addListener: jest.fn() },
    onRestartRequired: { addListener: jest.fn() },
  },
  alarms: {
    create: jest.fn(),
    onAlarm: { addListener: jest.fn() },
  },
  storage: {
    local: { set: jest.fn() },
  },
};

// Reset modules before importing background to ensure fresh mock environment
jest.resetModules();
const BackgroundModule = require('../../scripts/background/background.js');
const background = BackgroundModule.default || BackgroundModule;

// Helper function to simulate sending a runtime message
async function simulateOnMessage(message) {
  if (!background.onMessageHandler) {
    throw new Error(
      'Please export onMessageHandler function from your background script for testing'
    );
  }
  const sendResponse = jest.fn();

  // Call the handler; it may return a Promise or undefined
  const result = background.onMessageHandler(message, null, sendResponse);

  if (result && typeof result.then === 'function') {
    await result;
  }

  // Wait a tick to allow async sendResponse calls to complete
  await new Promise((resolve) => setImmediate(resolve));

  return sendResponse;
}

describe('Background Service Worker Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('init() registers runtime.onMessage listener only once', () => {
    background.init();

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);

    // Calling init again should not add more listeners
    background.init();

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
  });

  test('handles runtime message successfully (async)', async () => {
    const message = { type: 'test' };
    MessageProcessor.handle.mockResolvedValue('processed');

    const sendResponse = await simulateOnMessage(message);

    expect(MessageProcessor.handle).toHaveBeenCalledWith(message);
    expect(sendResponse).toHaveBeenCalledWith({ status: 'success', data: 'processed' });
  });

  test('handles error during message processing', async () => {
    const message = { type: 'test' };
    MessageProcessor.handle.mockRejectedValue(new Error('processing failed'));

    const sendResponse = await simulateOnMessage(message);

    expect(sendResponse).toHaveBeenCalledWith({
      status: 'error',
      error: 'processing failed',
    });
  });

  test('responds with error for invalid message format', async () => {
    const message = { invalid: 'data' };
    // Assuming your handler rejects invalid messages

    const sendResponse = await simulateOnMessage(message);

    expect(sendResponse).toHaveBeenCalledWith({
      status: 'error',
      error: 'Invalid message format',
    });
  });

  test('registers alarm listener and triggers correct log', () => {
    background.setupAlarmListener();

    expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalled();
  });

  test('creates alarm correctly', () => {
    background.createAlarm('testAlarm', 5);

    expect(chrome.alarms.create).toHaveBeenCalledWith('testAlarm', {
      delayInMinutes: 5,
    });
  });

  test('runtime.onInstalled sets initial storage on install', () => {
    // Grab the callback registered for onInstalled
    const callback = chrome.runtime.onInstalled.addListener.mock.calls[0][0];

    const details = { reason: 'install' };
    const setMock = jest.fn();
    global.chrome.storage.local.set = setMock;

    callback(details);

    expect(setMock).toHaveBeenCalledWith({ firstInstall: true });
  });

  test('runtime.onStartup logs info and calls init', () => {
    const logSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    background.init = jest.fn();

    const callback = chrome.runtime.onStartup.addListener.mock.calls[0][0];
    callback();

    expect(logSpy).toHaveBeenCalledWith(
      '[RecycleContent][INFO] Background service worker started'
    );
    expect(background.init).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  test('runtime.action.onClicked opens options page', () => {
    const openOptionsSpy = jest.fn();
    background.openOptionsPage = openOptionsSpy;

    const callback = chrome.runtime.action.onClicked.addListener.mock.calls[0][0];
    callback();

    expect(openOptionsSpy).toHaveBeenCalled();
  });

  test('runtime.onSuspend and onSuspendCanceled log info', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    const onSuspendCb = chrome.runtime.onSuspend.addListener.mock.calls[0][0];
    const onSuspendCanceledCb = chrome.runtime.onSuspendCanceled.addListener.mock.calls[0][0];

    onSuspendCb();
    onSuspendCanceledCb();

    expect(infoSpy).toHaveBeenCalledWith(
      '[RecycleContent][INFO] Background service worker is suspending'
    );
    expect(infoSpy).toHaveBeenCalledWith(
      '[RecycleContent][INFO] Background service worker suspend canceled'
    );

    infoSpy.mockRestore();
  });

  test('runtime.onUpdateAvailable logs info', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    const cb = chrome.runtime.onUpdateAvailable.addListener.mock.calls[0][0];
    cb();

    expect(infoSpy).toHaveBeenCalledWith(
      '[RecycleContent][INFO] Update available for background service worker'
    );

    infoSpy.mockRestore();
  });

  test('runtime.onRestartRequired logs warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const cb = chrome.runtime.onRestartRequired.addListener.mock.calls[0][0];
    cb();

    expect(warnSpy).toHaveBeenCalledWith(
      '[RecycleContent][WARN] Background service worker restart required'
    );

    warnSpy.mockRestore();
  });

  test('setupAlarmListener logs error if alarms API unavailable', () => {
    // Temporarily remove alarms API
    const originalAlarms = global.chrome.alarms;
    delete global.chrome.alarms;

    jest.resetModules();

    // Re-import background after removing alarms
    const BackgroundNoAlarms = require('../../scripts/background/background.js').default;

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    BackgroundNoAlarms.setupAlarmListener();

    expect(errorSpy).toHaveBeenCalledWith(
      '[RecycleContent][ERROR] Chrome alarms API is not available.'
    );

    errorSpy.mockRestore();

    // Restore alarms API
    global.chrome.alarms = originalAlarms;
  });
});
