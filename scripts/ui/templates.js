/**
 * @file        templates.js
 * @description Provides HTML and text templates used for rendering components,
 *              messages, and dynamic UI sections in the RecycleContent extension.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      Templates
 * 
 * @note        Templates support substitution tokens and content customization.
 */
import Constants from '../common/constants.js'; // if templates use constants for IDs or classes

/**
 * Class containing static methods and properties for managing
 * reusable templates with token substitution.
 * 
 * @class
 */
class Templates {
  /**
   * Returns a template string for a button element.
   * Supports substitution tokens like {{label}} and {{id}}.
   * 
   * Optionally, uses a constant ID if requested.
   * 
   * @param {boolean} useConstantId - Whether to use constant for ID.
   * @returns {string} HTML string for a button.
   */
  static getButtonTemplate(useConstantId = false) {
    const id = useConstantId ? Constants.STORAGE_KEY_SETTINGS : '{{id}}';
    return `<button id="${id}" class="rc-button">{{label}}</button>`;
  }

  /**
   * Returns a template string for a dialog box.
   * Supports tokens like {{title}} and {{content}}.
   * 
   * @returns {string} HTML string for a dialog container.
   */
  static getDialogTemplate() {
    return `
      <div class="rc-dialog">
        <header class="rc-dialog-header">{{title}}</header>
        <section class="rc-dialog-content">{{content}}</section>
        <footer class="rc-dialog-footer">
          <button class="rc-dialog-close">Close</button>
        </footer>
      </div>`;
  }

  /**
   * Returns a simple status message template.
   * Token: {{message}}
   * 
   * @returns {string} Text string for status messages.
   */
  static getStatusMessageTemplate() {
    return `Status: {{message}}`;
  }

  /**
   * Performs token substitution on a template string.
   * 
   * @param {string} template - Template string containing tokens like {{token}}.
   * @param {Object<string, string>} data - Key-value pairs for substitution.
   * @returns {string} The template with tokens replaced by corresponding values.
   */
  static fillTemplate(template, data) {
    return template.replace(/{{(\w+)}}/g, (match, token) => {
      return token in data ? data[token] : match;
    });
  }
}

export default Templates;
