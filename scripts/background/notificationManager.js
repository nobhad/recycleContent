/**
 * @file        notificationManager.js
 * @description Manages browser notifications for the RecycleContent extension.
 *              Responsible for formatting, displaying, and clearing notifications
 *              based on system and user events.
 *
 * author       Noelle B.
 * @created     2025-05-21
 * @license     MIT
 *
 * @module      NotificationManager
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @class, @function, @param, and @returns tags.
 */


notificationManager = (() => {
    /**
     * @class NotificationManager
     * @description Manages browser notifications for the RecycleContent extension.
     *              Responsible for formatting, displaying, and clearing notifications
     *              based on system and user events.
     */
    class NotificationManager {
        constructor() {
            this.notifications = {};
        }
        /**
         * @function showNotification
         * @description Displays a notification with the given title and message.
         * @param {string} title - The title of the notification.
         * @param {string} message - The message of the notification.
         * @param {Object} options - Additional options for the notification.
         */
        showNotification(title, message, options = {}) {
            const notificationId = this.generateNotificationId();
            const notificationOptions = {
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: title,
                message: message,
                ...options
            };
            this.notifications[notificationId] = notificationOptions;
            browser.notifications.create(notificationId, notificationOptions);
        }
        /**
         * @function clearNotification
         * @description Clears a notification with the given ID.
         * @param {string} notificationId - The ID of the notification to clear.
         */
        clearNotification(notificationId) {
            if (this.notifications[notificationId]) {
                browser.notifications.clear(notificationId);
                delete this.notifications[notificationId];
            }
        }
        /**
         * @function generateNotificationId
         * @description Generates a unique ID for a notification.
         * @returns {string} A unique notification ID.
         */
        generateNotificationId() {
            return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        /**
         * @function clearAllNotifications
         * @description Clears all notifications managed by this NotificationManager.
         */
        clearAllNotifications() {
            for (const notificationId in this.notifications) {
                this.clearNotification(notificationId);
            }
        }
        /**
         * @function handleNotificationClick
         * @description Handles the click event for a notification.
         * @param {string} notificationId - The ID of the clicked notification.
         */
        handleNotificationClick(notificationId) {
            if (this.notifications[notificationId]) {
                // Perform action based on the notification
                console.log(`Notification clicked: ${notificationId}`);
                this.clearNotification(notificationId);
            }
        }
        /**
         * @function handleNotificationClose
         * @description Handles the close event for a notification.
         * @param {string} notificationId - The ID of the closed notification.
         */
        handleNotificationClose(notificationId) {
            if (this.notifications[notificationId]) {
                console.log(`Notification closed: ${notificationId}`);
                this.clearNotification(notificationId);
            }
        }
        /**
         * @function handleNotificationError
         * @description Handles errors that occur during notification display.
         * @param {string} error - The error message.
         */
        handleNotificationError(error) {
            console.error(`Notification error: ${error}`);
        }
    }
    return new NotificationManager();
}
)();

export default notificationManager;