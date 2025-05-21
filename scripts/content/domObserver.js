/**
 * @file        domObserver.js
 * @description Observes changes in the DOM and triggers updates in the RecycleContent extension.
 *              Useful for detecting dynamic content and running handlers when new elements
 *              appear or disappear.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      DOMObserver
 * 
 * @note        This file includes complete JSDoc annotations with:
 *              @class, @function, @param, and @returns tags.
 */

/**
 * Class representing a DOM observer that monitors DOM mutations
 * and executes callbacks when specified elements are added or removed.
 * 
 * @class
 */
class DOMObserver {
    /**
     * Creates an instance of DOMObserver.
     * 
     * @param {string} targetSelector - The CSS selector of the element to observe within the DOM.
     * @param {function} onAdd - Callback function executed when new matching elements are added.
     *                           Receives an array of added elements as an argument.
     * @param {function} onRemove - Callback function executed when matching elements are removed.
     *                              Receives an array of removed elements as an argument.
     */
    constructor(targetSelector, onAdd, onRemove) {
      /**
       * The selector for elements to observe.
       * @type {string}
       */
      this.targetSelector = targetSelector;
  
      /**
       * Callback invoked when new matching elements are added to the DOM.
       * @type {function(Element[])}
       */
      this.onAdd = onAdd;
  
      /**
       * Callback invoked when matching elements are removed from the DOM.
       * @type {function(Element[])}
       */
      this.onRemove = onRemove;
  
      /**
       * Internal MutationObserver instance.
       * @private
       * @type {MutationObserver}
       */
      this.observer = null;
    }
  
    /**
     * Starts observing the DOM for changes matching the target selector.
     * 
     * @returns {void}
     */
    start() {
      if (this.observer) return; // already observing
  
      this.observer = new MutationObserver(mutations => {
        const addedElements = [];
        const removedElements = [];
  
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.matches(this.targetSelector)) {
              addedElements.push(node);
            }
          });
  
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.matches(this.targetSelector)) {
              removedElements.push(node);
            }
          });
        });
  
        if (addedElements.length > 0 && typeof this.onAdd === 'function') {
          this.onAdd(addedElements);
        }
  
        if (removedElements.length > 0 && typeof this.onRemove === 'function') {
          this.onRemove(removedElements);
        }
      });
  
      this.observer.observe(document.body, { childList: true, subtree: true });
    }
  
    /**
     * Stops observing the DOM.
     * 
     * @returns {void}
     */
    stop() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }
  
  export default DOMObserver;
  