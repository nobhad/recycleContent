/**
 * @file        constants.js
 * @description Defines static values used throughout the RecycleContent extension.
 *              Centralizes configuration flags, key names, and other shared literals
 *              to improve consistency and maintainability.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Constants
 * 
 * @note        This file includes exported constant definitions used across modules.
 */

/**
 * @constant {object} Constants
 * @property {string} STORAGE_KEY_SETTINGS - Key name for extension settings storage.
 * @property {string} STORAGE_KEY_QUEUE - Key name for message queue storage.
 * @property {string} EVENT_DOM_UPDATED - Event name dispatched on DOM changes.
 * @property {number} MAX_RETRY_ATTEMPTS - Maximum retry attempts for message processing.
 * @property {string} API_ENDPOINT - URL of backend API for content processing.
 * @property {RegExp} EXCLUSION_PATTERN - Regex pattern to exclude certain messages.
 * @property {string} STATUS_RECYCLING_ON - Display text for recycling active status.
 * @property {string} STATUS_RECYCLING_OFF - Display text for recycling inactive status.
 */
const Constants = {
  STORAGE_KEY_SETTINGS: 'RecycleContentSettings',
  STORAGE_KEY_QUEUE: 'RecycleContentMessageQueue',

  EVENT_DOM_UPDATED: 'RecycleContentDOMUpdated',

  MAX_RETRY_ATTEMPTS: 3,

  API_ENDPOINT: 'https://api.recyclecontent.example.com/process',

  // Matches any message containing keywords that should exclude it from processing.
  EXCLUSION_PATTERN: /(spam|advertisement|unsubscribe|click here)/i,

  // Status display text constants used in UI
  STATUS_RECYCLING_ON: 'Recycling: ON',
  STATUS_RECYCLING_OFF: 'Recycling: OFF',
};

export default Constants;
