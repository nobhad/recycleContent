/**
 * @file        notificationManager.js
 * @description Manages browser notifications for the RecycleContent extension.
 *              Responsible for formatting, displaying, and clearing notifications
 *              based on system and user events.
 *
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 *
 * @module      NotificationManager
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @class, @function, @param, and @returns tags.
 */

import Constants from '../common/constants.js';
import Logger from '../common/logger.js';
import Storage from '../common/storage.js'; // to persist notification states

const notificationManager = (() => {
    /**
     * @class NotificationManager
     * @description Manages browser notifications for the RecycleContent extension.
     *              Responsible for formatting, displaying, and clearing notifications
     *              based on system and user events.
     */
    class NotificationManager {
        constructor() {
            this.notifications = {};
            this.loadPersistedNotifications();
        }

        /**
         * @function loadPersistedNotifications
         * @description Loads persisted notification IDs from storage to memory.
         */
        async loadPersistedNotifications() {
            try {
                const savedNotifications = await Storage.get(Constants.STORAGE_NOTIFICATION_IDS) || {};
                this.notifications = savedNotifications;
                Logger.info('Loaded persisted notifications', this.notifications);
            } catch (err) {
                Logger.error('Failed to load persisted notifications:', err);
            }
        }

        /**
         * @function persistNotifications
         * @description Saves current notification IDs to storage.
         */
        async persistNotifications() {
            try {
                await Storage.set(Constants.STORAGE_NOTIFICATION_IDS, this.notifications);
                Logger.info('Persisted notifications:', this.notifications);
            } catch (err) {
                Logger.error('Failed to persist notifications:', err);
            }
        }

        /**
         * @function showNotification
         * @description Displays a notification with the given title and message.
         * @param {string} title - The title of the notification.
         * @param {string} message - The message of the notification.
         * @param {Object} options - Additional options for the notification.
         */
        async showNotification(title, message, options = {}) {
            const notificationId = this.generateNotificationId();
            const notificationOptions = {
                type: 'basic',
                iconUrl: Constants.DEFAULT_ICON_URL || 'icons/icon.png',
                title,
                message,
                ...options
            };
            this.notifications[notificationId] = notificationOptions;

            try {
                await browser.notifications.create(notificationId, notificationOptions);
                Logger.info(`Notification shown: ${notificationId}`, notificationOptions);
                await this.persistNotifications();
            } catch (err) {
                Logger.error('Failed to show notification:', err);
            }
        }

        /**
         * @function clearNotification
         * @description Clears a notification with the given ID.
         * @param {string} notificationId - The ID of the notification to clear.
         */
        async clearNotification(notificationId) {
            if (this.notifications[notificationId]) {
                try {
                    await browser.notifications.clear(notificationId);
                    delete this.notifications[notificationId];
                    Logger.info(`Notification cleared: ${notificationId}`);
                    await this.persistNotifications();
                } catch (err) {
                    Logger.error(`Failed to clear notification ${notificationId}:`, err);
                }
            }
        }

        /**
         * @function generateNotificationId
         * @description Generates a unique ID for a notification.
         * @returns {string} A unique notification ID.
         */
        generateNotificationId() {
            return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        }

        /**
         * @function clearAllNotifications
         * @description Clears all notifications managed by this NotificationManager.
         */
        async clearAllNotifications() {
            for (const notificationId in this.notifications) {
                await this.clearNotification(notificationId);
            }
        }

        /**
         * @function handleNotificationClick
         * @description Handles the click event for a notification.
         * @param {string} notificationId - The ID of the clicked notification.
         */
        handleNotificationClick(notificationId) {
            if (this.notifications[notificationId]) {
                Logger.info(`Notification clicked: ${notificationId}`);
                this.clearNotification(notificationId);
                // Additional action on click can go here
            }
        }

        /**
         * @function handleNotificationClose
         * @description Handles the close event for a notification.
         * @param {string} notificationId - The ID of the closed notification.
         */
        handleNotificationClose(notificationId) {
            if (this.notifications[notificationId]) {
                Logger.info(`Notification closed: ${notificationId}`);
                this.clearNotification(notificationId);
            }
        }

        /**
         * @function handleNotificationError
         * @description Handles errors that occur during notification display.
         * @param {string} error - The error message.
         */
        handleNotificationError(error) {
            Logger.error(`Notification error: ${error}`);
        }
    }

    return new NotificationManager();
})();

export default notificationManager;
