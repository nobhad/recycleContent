/**
 * @file        interfaceManager.js
 * @description This module manages the user interface components for the RecycleContent extension.
 *              It provides methods to register, render, and update modular UI components.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      InterfaceManager
 * 
 * @note        This file uses in-memory registration for UI components and assumes
 *              that each component follows a basic interface:
 *              - render(): string
 *              - update(data): void
 */

import Logger from '../common/logger.js';

/**
 * Manages the registration, rendering, and updating of UI components.
 * 
 * @class
 */
class InterfaceManager {
  /**
   * Creates an instance of InterfaceManager.
   */
  constructor() {
    /**
     * Internal registry of UI components by their unique names.
     * @type {Object<string, { render: function(): string, update?: function(*): void }>}
     */
    this.components = {};
  }

  /**
   * Registers a new UI component under a unique name.
   * 
   * @param {string} name - Unique identifier for the component.
   * @param {{ render: function(): string, update?: function(*): void }} component - The component object.
   * @returns {void}
   */
  registerComponent(name, component) {
    if (this.components[name]) {
      Logger.warn(`Component "${name}" is already registered.`);
      return;
    }
    this.components[name] = component;
    Logger.debug(`Component "${name}" registered.`);
  }

  /**
   * Renders a registered component inside a container element.
   * 
   * @param {string} name - The component name.
   * @param {HTMLElement} container - The container element where the component will be rendered.
   * @returns {void}
   */
  renderComponent(name, container) {
    const component = this.components[name];
    if (!component) {
      Logger.error(`Component "${name}" is not registered.`);
      return;
    }

    if (typeof component.render === 'function') {
      container.innerHTML = component.render();
      Logger.debug(`Component "${name}" rendered.`);
    } else {
      Logger.error(`Component "${name}" does not have a render method.`);
    }
  }

  /**
   * Updates a registered component with provided data.
   * 
   * @param {string} name - The component name.
   * @param {*} data - Data to pass to the component's update method.
   * @returns {void}
   */
  updateComponent(name, data) {
    const component = this.components[name];
    if (!component) {
      Logger.error(`Component "${name}" is not registered.`);
      return;
    }

    if (typeof component.update === 'function') {
      component.update(data);
      Logger.debug(`Component "${name}" updated.`);
    } else {
      Logger.error(`Component "${name}" does not have an update method.`);
    }
  }
}

// Example usage (can be removed in production)
const interfaceManager = new InterfaceManager();

const exampleComponent = {
  render: () => `<div>Hello, World!</div>`,
  update: (data) => Logger.debug('Updating component with data:', data),
};

interfaceManager.registerComponent('example', exampleComponent);

const container = document.getElementById('app');
if (container) {
  interfaceManager.renderComponent('example', container);
}

export default InterfaceManager;
