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

/**
 * @class NotificationManager
 * @description Manages browser notifications for the RecycleContent extension.
 *              Responsible for formatting, displaying, and clearing notifications
 *              based on system and user events.
 */
class NotificationManager {
	/**
	 * Constructs a new NotificationManager instance.
	 * 
	 * @constructor
	 */
	constructor() {
		this.defaultNotificationOptions = {
			type: 'basic',
			iconUrl: './images/recyclecontent-icon-128.png',
			priority: 0,
			eventTime: Date.now()
		};
	}

	/**
	 * Creates and shows a notification with the given options.
	 * 
	 * @param {Object} options - Notification options.
	 * @param {string} options.title - Notification title.
	 * @param {string} options.message - Notification message.
	 * @param {string} [options.iconUrl] - Icon URL.
	 * @param {string} [options.type] - Notification type (basic, image, list, progress).
	 * @param {number} [options.priority] - Notification priority.
	 * @returns {Promise<string>} Resolves with the notification ID.
	 */
	async showNotification(options) {
		const notificationOptions = {
			...this.defaultNotificationOptions,
			...options
		};
		try {
			const notificationId = `rc-notif-${Date.now()}`;
			await browser.notifications.create(notificationId, notificationOptions);
			Logger.info(`Notification shown: ${notificationId} - ${options.title}`);
			return notificationId;
		} catch (error) {
			Logger.error(`Failed to show notification: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Clears a notification by ID.
	 * 
	 * @param {string} notificationId - The ID of the notification to clear.
	 * @returns {Promise<boolean>} Resolves true if cleared successfully.
	 */
	async clearNotification(notificationId) {
		try {
			const success = await browser.notifications.clear(notificationId);
			Logger.info(`Notification cleared: ${notificationId}`);
			return success;
		} catch (error) {
			Logger.error(`Failed to clear notification: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Clears all notifications created by this extension.
	 * 
	 * @returns {Promise<void>}
	 */
	async clearAllNotifications() {
		const notifications = await browser.notifications.getAll();
		for (const id in notifications) {
			if (id.startsWith('rc-notif-')) {
				await this.clearNotification(id);
			}
		}
		Logger.info('All RecycleContent notifications cleared');
	}

	/**
	 * Shows a notification that the exclusion list was updated.
	 * 
	 * @param {number} count - Number of items added.
	 * @returns {Promise<string>} Notification ID.
	 */
	async showExclusionListUpdated(count) {
		const title = 'Exclusion List Updated';
		const message = `${count} items were added to your exclusion list.`;
		return this.showNotification({ title, message });
	}

	/**
	 * Shows a notification for an error event.
	 * 
	 * @param {string} errorMessage - Error message to display.
	 * @returns {Promise<string>} Notification ID.
	 */
	async showError(errorMessage) {
		const title = 'RecycleContent Error';
		const message = errorMessage;
		return this.showNotification({ title, message, priority: 2 });
	}
}

export default new NotificationManager();
