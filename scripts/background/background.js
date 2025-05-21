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
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @function, @listener, and @event tags.
 */
import './messageQueue.js';
import './notificationManager.js';
import MessageProcessor from '../services/messageProcessor.js';

/**
 * @constant {string} ALARM_NAME - Name of the recurring alarm.
 */
const ALARM_NAME = 'recycleContentAlarm';

/**
 * @class Background
 * @description Represents the background module for managing background processes.
 */
const Background = {
    /**
     * @function init
     * @description Initializes the background module, setting up event listeners and alarms.
     */
    init: function () {
        this.setupEventListeners();
        this.setupAlarms();
    },

    /**
     * @function setupEventListeners
     * @description Sets up event listeners for various browser events.
     */
    setupEventListeners: function () {
        // Listen for runtime messages
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('Message received:', message);

            if (!message || typeof message !== 'object') {
                sendResponse({ status: 'error', error: 'Invalid message format' });
                return false;
            }

            // Async handling scaffold
            (async () => {
                try {
                    const result = await MessageProcessor.handle(message);
                    sendResponse({ status: 'success', data: result });
                } catch (err) {
                    console.error('Message processing error:', err);
                    sendResponse({ status: 'error', error: err.message });
                }
            })();

            return true; // Keeps message channel open for async
        });
    },

    /**
     * @function setupAlarms
     * @description Sets up alarms for periodic tasks.
     */
    setupAlarms: function () {
        chrome.alarms.create(ALARM_NAME, { periodInMinutes: 15 });
    }
};

/**
 * @listener onAlarm
 * @description Handles alarm events.
 * @param {Alarm} alarm - The alarm that was triggered.
 */
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        try {
            console.log('RecycleContent alarm triggered');
            // TODO: Perform periodic background tasks here
        } catch (err) {
            console.error('Error in alarm handler:', err);
        }
    }
});

/**
 * @event onStartup
 * @description Handles the startup event of the extension.
 */
chrome.runtime.onStartup.addListener(() => {
    console.info('RecycleContent extension started');
    Background.init();
});

/**
 * @event onInstalled
 * @description Handles the installation event of the extension.
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.info('RecycleContent extension installed');

    if (details.reason === 'install') {
        chrome.storage.sync.set({
            exclusionList: [],
            userOptions: {}
        }, () => {
            console.info('Initial storage set up complete');
        });
    }

    Background.init();
});

/**
 * @event onSuspend
 * @description Handles the suspension event of the extension.
 */
chrome.runtime.onSuspend.addListener(() => {
    console.info('RecycleContent extension suspended');
    // TODO: Perform cleanup tasks here
});

/**
 * @event onSuspendCanceled
 * @description Handles the suspension canceled event of the extension.
 */
chrome.runtime.onSuspendCanceled.addListener(() => {
    console.info('RecycleContent extension suspension canceled');
    // TODO: Resume tasks or update UI accordingly
});

/**
 * @event onUpdateAvailable
 * @description Handles the update available event of the extension.
 * @param {Object} details - Details about the update.
 */
chrome.runtime.onUpdateAvailable.addListener((details) => {
    console.info('Update available:', details);
    // TODO: Notify users about the update or prepare for auto-reload
});

/**
 * @event onRestartRequired
 * @description Handles the restart required event of the extension.
 */
chrome.runtime.onRestartRequired.addListener(() => {
    console.warn('Restart required for update');
    // TODO: Notify users or reload
});

/**
 * @event onBrowserActionClicked
 * @description Handles the browser action button click event.
 */
chrome.action.onClicked.addListener(() => {
    console.info('Browser action button clicked');
    chrome.runtime.openOptionsPage();
});

/**
 * Initialize the background module immediately on load.
 */
Background.init();

export default Background;
