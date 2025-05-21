/**
 * @file        components.js
 * @description Defines reusable UI components for the RecycleContent extension,
 *              such as buttons, dialogs, and content containers used in the popup
 *              or injected interfaces.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Components
 * 
 * @note        Designed for modular use in content scripts and the popup interface.
 */

import Constants from '../common/constants.js';
import Templates from './templates.js';

/**
 * Class providing reusable UI components for the extension.
 * 
 * @class
 */
class Components {
  /**
   * Creates a styled button element.
   * 
   * @param {string} label - The text displayed on the button.
   * @param {Object} [options] - Optional configuration.
   * @param {string} [options.id] - Optional id attribute for the button.
   * @param {string[]} [options.classes] - Optional array of CSS class names.
   * @param {Function} [options.onClick] - Optional click event handler.
   * @returns {HTMLButtonElement} The created button element.
   */
  static createButton(label, options = {}) {
    const btn = document.createElement('button');
    btn.textContent = label;

    if (options.id) btn.id = options.id;
    if (options.classes) btn.classList.add(...options.classes);
    if (options.onClick) btn.addEventListener('click', options.onClick);

    return btn;
  }

  /**
   * Creates a modal dialog container element.
   * 
   * @param {string} title - The title of the dialog.
   * @param {HTMLElement|string} content - The dialog content as an element or HTML string.
   * @param {Object} [options] - Optional settings.
   * @param {string[]} [options.classes] - Optional additional classes for the dialog.
   * @returns {HTMLElement} The dialog container element.
   */
  static createDialog(title, content, options = {}) {
    const dialog = document.createElement('div');
    dialog.classList.add('rc-dialog', ...(options.classes || []));

    const header = document.createElement('header');
    header.className = 'rc-dialog-header';
    header.textContent = title;

    const body = document.createElement('section');
    body.className = 'rc-dialog-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    dialog.appendChild(header);
    dialog.appendChild(body);

    return dialog;
  }

  /**
   * Creates a generic content container element.
   * 
   * @param {string} [tagName='div'] - The tag name of the container element.
   * @param {Object} [options] - Optional attributes and content.
   * @param {string[]} [options.classes] - Array of class names to add.
   * @param {string|HTMLElement} [options.content] - Inner HTML or element to append.
   * @param {Object} [options.attrs] - Additional attributes to set on the element.
   * @returns {HTMLElement} The container element.
   */
  static createContainer(tagName = 'div', options = {}) {
    const container = document.createElement(tagName);
    if (options.classes) container.classList.add(...options.classes);
    if (options.content) {
      if (typeof options.content === 'string') {
        container.innerHTML = options.content;
      } else {
        container.appendChild(options.content);
      }
    }
    if (options.attrs) {
      for (const [key, val] of Object.entries(options.attrs)) {
        container.setAttribute(key, val);
      }
    }
    return container;
  }
}

export default Components;
