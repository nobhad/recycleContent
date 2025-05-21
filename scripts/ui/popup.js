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

import Components from './components.js';
import Constants from '../common/constants.js';
import Logger from '../common/logger.js';
import Storage from '../common/storage.js'; // wrapper around chrome.storage

class Popup {
  constructor() {
    Logger.info('Popup: initializing');
    this.init();
  }

  init() {
    // Instead of using static HTML button, create it dynamically with your Components helper
    this.statusElement = document.getElementById('status');

    // Clear old button if it exists (optional)
    const oldBtn = document.getElementById('toggleRecycle');
    if (oldBtn) oldBtn.remove();

    // Create button with Components helper
    this.toggleButton = Components.createButton('Loading...', {
      id: 'toggleRecycle',
      classes: ['rc-toggle-btn'],
      onClick: () => this.toggleRecycle()
    });

    // Append the button to a container or directly to body/popup
    // Here assuming there is a container with id 'buttonContainer'
    const container = document.getElementById('buttonContainer') || document.body;
    container.appendChild(this.toggleButton);

    // Load initial state and update UI
    this.loadState();
  }

  async loadState() {
    try {
      const result = await Storage.get(['isRecycling']);
      const isRecycling = result.isRecycling ?? false;
      Logger.info(`Popup: loaded recycling state: ${isRecycling}`);
      this.updateStatus(isRecycling);
    } catch (error) {
      Logger.error('Popup: failed to load state', error);
    }
  }

  updateStatus(isActive) {
    if (this.statusElement) {
      this.statusElement.textContent = isActive
        ? Constants.STATUS_RECYCLING_ON || 'Recycling: ON'
        : Constants.STATUS_RECYCLING_OFF || 'Recycling: OFF';
    }
    if (this.toggleButton) {
      this.toggleButton.textContent = isActive ? 'Stop Recycling' : 'Start Recycling';
    }
  }

  async toggleRecycle() {
    try {
      const result = await Storage.get(['isRecycling']);
      const current = result.isRecycling ?? false;
      const newState = !current;

      await Storage.set({ isRecycling: newState });
      Logger.info(`Popup: toggled recycling to ${newState}`);

      this.updateStatus(newState);

      chrome.runtime.sendMessage({ action: 'toggleRecycle', state: newState });
    } catch (error) {
      Logger.error('Popup: failed to toggle recycling', error);
    }
  }
}

export default Popup;
