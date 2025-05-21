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

// Main contentScript function (if needed for future expansion)
const contentScript = () => {
    console.log("Content script loaded and running.");
};

/**
 * Inspect the DOM and return recyclable content elements.
 * @returns {string[]} Array of outerHTML strings of recyclable elements.
 */
function inspectContent() {
    const recyclableElements = document.querySelectorAll('.recyclable');
    return Array.from(recyclableElements).map(element => element.outerHTML);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkRecyclableContent") {
        const recyclableContent = inspectContent();
        sendResponse({ recyclableContent });
    }
});

export default contentScript;
