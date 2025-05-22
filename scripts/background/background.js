/**
 * @file        background.js
 * @description Manages background processes for the RecycleContent extension.
 *              Handles event listeners, alarms, and communication between internal modules.
 *
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 *
 * @module      Background
 */

import './messageQueue.js';
import './notificationManager.js';
import MessageProcessor from '../services/messageProcessor.js';

const ALARM_NAME = 'recycleContentAlarm';

let initialized = false;
let alarmListenerRegistered = false;

/**
 * Handles incoming runtime messages.
 * @param {object} message - The message sent.
 * @param {object} sender - The sender of the message.
 * @param {function} sendResponse - Function to send response asynchronously.
 * @returns {boolean} true to keep message channel open for async response.
 */
async function onMessageHandler(message, sender, sendResponse) {
  console.log('Message received:', message);

  if (!message || typeof message !== 'object') {
    sendResponse({ status: 'error', error: 'Invalid message format' });
    return false;
  }

  try {
    const result = await MessageProcessor.handle(message);
    sendResponse({ status: 'success', data: result });
  } catch (err) {
    console.error('Message processing error:', err);
    sendResponse({ status: 'error', error: err.message });
  }

  return true; // Keep channel open for async response
}

const Background = {
  init: function () {
    if (initialized) return;
    initialized = true;

    this.setupEventListeners();
    this.setupAlarms();
    this.setupRuntimeListeners();
    this.setupAlarmListener();
  },

  setupEventListeners: function () {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      // Use the exported onMessageHandler for testability
      chrome.runtime.onMessage.addListener(onMessageHandler);
    }
  },

  setupAlarms: function () {
    if (typeof chrome !== 'undefined' && chrome.alarms?.create) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 60 });
    }
  },

  setupRuntimeListeners: function () {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    chrome.runtime.onStartup?.addListener(() => {
      console.info('RecycleContent extension started');
      Background.init();
    });

    chrome.runtime.onInstalled?.addListener((details) => {
      console.info('RecycleContent extension installed');
      if (details.reason === 'install') {
        chrome.storage?.sync?.set?.(
          {
            exclusionList: [],
            userOptions: {},
          },
          () => {
            console.info('Initial storage set up complete');
          }
        );
      }
      Background.init();
    });

    chrome.runtime.onSuspend?.addListener(() => {
      console.info('RecycleContent extension suspended');
    });

    chrome.runtime.onSuspendCanceled?.addListener(() => {
      console.info('RecycleContent extension suspension canceled');
    });

    chrome.runtime.onUpdateAvailable?.addListener((details) => {
      console.info('Update available:', details);
    });

    chrome.runtime.onRestartRequired?.addListener(() => {
      console.warn('Restart required for update');
    });

    chrome.action?.onClicked?.addListener(() => {
      console.info('Browser action button clicked');
      chrome.runtime.openOptionsPage?.();
    });
  },

  setupAlarmListener: function () {
    if (alarmListenerRegistered) return;

    if (typeof chrome !== 'undefined' && chrome.alarms?.onAlarm?.addListener) {
      chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === ALARM_NAME) {
          try {
            console.log('RecycleContent alarm triggered');
            // TODO: Add alarm handling logic here
          } catch (e) {
            console.error('Alarm handling error:', e);
          }
        }
      });
      alarmListenerRegistered = true;
    } else {
      console.error('[RecycleContent][ERROR] Chrome alarms API is not available.');
    }
  },
};

// Initialize background on load
Background.init();

export default Background;

// Export onMessageHandler separately for testing
export { onMessageHandler };
