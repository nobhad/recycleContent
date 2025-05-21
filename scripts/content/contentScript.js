/**
 * @file        contentScript.js
 * @description Injected into web pages by the RecycleContent extension.
 *              Handles DOM inspection, messaging with background scripts,
 *              and identifying recyclable content based on configured rules.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      ContentScript
 * 
 * @note        This file includes complete JSDoc annotations for injected behaviors,
 *              messaging, and dynamic content interaction.
 */

import './domObserver.js';
import './interfaceManager.js';
import './messageParser.js';

/**
 * Inspect the DOM and retrieve recyclable content elements.
 * 
 * @returns {string[]} Array of outerHTML strings of recyclable elements.
 */
function inspectContent() {
    const recyclableElements = document.querySelectorAll('.recyclable');
    return Array.from(recyclableElements).map(element => element.outerHTML);
}

/**
 * Message listener for commands from the background script.
 * 
 * @param {Object} request - Message object from the background script.
 * @param {Object} sender - Sender of the message.
 * @param {Function} sendResponse - Function to send response back.
 * @returns {boolean|undefined} Returns true if response is async, otherwise undefined.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkRecyclableContent") {
        const recyclableContent = inspectContent();
        sendResponse({ recyclableContent });
    }
    return false; // synchronous response
});

/**
 * Initialize content script behaviors.
 * Currently logs when the content script is loaded.
 */
function initialize() {
    console.log("Content script loaded and running.");
    // You can add additional startup code here if needed
}

// Run initialize immediately when this script loads
initialize();

export default initialize;
