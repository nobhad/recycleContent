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

/**
 * @class InterfaceManager
 * Manages the registration, rendering, and updating of UI components.
 *
 * @property {Object<string, Object>} components - Registry of UI components by name.
 */
class InterfaceManager {
    constructor() {
        /**
         * Internal component registry.
         * @type {Object<string, { render: Function, update?: Function }>}
         */
        this.components = {};
    }

    /**
     * Registers a new component with a unique name.
     *
     * @function
     * @param {string} name - Unique identifier for the component.
     * @param {Object} component - The component object with a render method and optionally an update method.
     */
    registerComponent(name, component) {
        if (this.components[name]) {
            console.warn(`Component "${name}" is already registered.`);
            return;
        }
        this.components[name] = component;
    }

    /**
     * Renders a registered component into the provided container.
     *
     * @function
     * @param {string} name - The name of the registered component to render.
     * @param {HTMLElement} container - The DOM element to render the component into.
     */
    renderComponent(name, container) {
        const component = this.components[name];
        if (!component) {
            console.error(`Component "${name}" is not registered.`);
            return;
        }

        if (typeof component.render === 'function') {
            container.innerHTML = component.render();
        } else {
            console.error(`Component "${name}" does not have a render method.`);
        }
    }

    /**
     * Updates a registered component with new data.
     *
     * @function
     * @param {string} name - The name of the component to update.
     * @param {*} data - Arbitrary data to pass to the component's update method.
     */
    updateComponent(name, data) {
        const component = this.components[name];
        if (!component) {
            console.error(`Component "${name}" is not registered.`);
            return;
        }

        if (typeof component.update === 'function') {
            component.update(data);
        } else {
            console.error(`Component "${name}" does not have an update method.`);
        }
    }
}

// Example usage (can be removed in production)
const interfaceManager = new InterfaceManager();

const exampleComponent = {
    render: () => `<div>Hello, World!</div>`,
    update: (data) => console.log('Updating component with data:', data),
};

interfaceManager.registerComponent('example', exampleComponent);

const container = document.getElementById('app');
if (container) {
    interfaceManager.renderComponent('example', container);
}

export default InterfaceManager;
