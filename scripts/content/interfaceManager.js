/**
 * @file        interfaceManager.js
 * @description This module manages the user interface components for the RecycleContent extension.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      InterfaceManager
 * 
 * This module is part of the RecycleContent browser extension.
 * It provides functionality to retrieve, update, and store exclusion lists
 * for specific message IDs, optimizing performance with in-memory caching
 * and compressed storage.
 */


class InterfaceManager {
    constructor() {
        this.components = {};
    }

    // Register a new component
    registerComponent(name, component) {
        if (this.components[name]) {
            console.warn(`Component "${name}" is already registered.`);
            return;
        }
        this.components[name] = component;
    }

    // Render a component by name
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

    // Update a component by name
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

// Example usage
const interfaceManager = new InterfaceManager();

// Example component
const exampleComponent = {
    render: () => `<div>Hello, World!</div>`,
    update: (data) => console.log('Updating component with data:', data),
};

// Register and render the example component
interfaceManager.registerComponent('example', exampleComponent);
const container = document.getElementById('app');
if (container) {
    interfaceManager.renderComponent('example', container);
}

export default InterfaceManager;