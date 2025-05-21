/**
 * @file        popup.js
 * @description Controls the behavior and rendering of the extension's popup UI,
 *              allowing users to interact with RecycleContent settings, status,
 *              and controls in a lightweight overlay.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Popup
 * 
 * @note        Connects to background scripts and storage for dynamic state display.
 */

/**
 * Class responsible for rendering and managing the extension popup UI.
 * Handles user interactions, displays current status and settings,
 * and communicates with background scripts for updates.
 * 
 * @class
 */
class Popup {
    /**
     * Initializes the popup by setting up event listeners and rendering UI elements.
     */
    constructor() {
      this.init();
    }
  
    /**
     * Initializes event handlers and fetches initial data to render the popup.
     * 
     * @returns {void}
     */
    init() {
      // Example: cache DOM elements
      this.statusElement = document.getElementById('status');
      this.toggleButton = document.getElementById('toggleRecycle');
  
      // Bind event listeners
      if (this.toggleButton) {
        this.toggleButton.addEventListener('click', () => this.toggleRecycle());
      }
  
      // Load initial state from storage or background
      this.loadState();
    }
  
    /**
     * Loads the current RecycleContent extension state from storage or background script.
     * Updates the popup UI accordingly.
     * 
     * @returns {void}
     */
    loadState() {
      // Example: get state from chrome.storage or send a message to background
      chrome.storage.local.get(['isRecycling'], (result) => {
        const isRecycling = result.isRecycling ?? false;
        this.updateStatus(isRecycling);
      });
    }
  
    /**
     * Updates the status display in the popup based on recycling state.
     * 
     * @param {boolean} isActive - Whether the recycling feature is active.
     * @returns {void}
     */
    updateStatus(isActive) {
      if (this.statusElement) {
        this.statusElement.textContent = isActive ? 'Recycling: ON' : 'Recycling: OFF';
        this.toggleButton.textContent = isActive ? 'Stop Recycling' : 'Start Recycling';
      }
    }
  
    /**
     * Toggles the recycling feature on or off.
     * Sends message to background script and updates popup UI.
     * 
     * @returns {void}
     */
    toggleRecycle() {
      chrome.storage.local.get(['isRecycling'], (result) => {
        const current = result.isRecycling ?? false;
        const newState = !current;
  
        chrome.storage.local.set({ isRecycling: newState }, () => {
          this.updateStatus(newState);
          // Optionally send message to background script
          chrome.runtime.sendMessage({ action: 'toggleRecycle', state: newState });
        });
      });
    }
  }
  
  export default Popup;
  