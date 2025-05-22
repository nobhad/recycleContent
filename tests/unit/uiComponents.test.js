/**
 * @jest-environment jsdom
 */

/**
 * uiComponents.test.js
 * 
 * author: Noelle Bhaduri
 * date: 2025-05-21
 * 
 * description:
 * Unit tests for UI components in components.js verifying rendering,
 * state management, and user interaction handling.
 * 
 * notes:
 * - tests component creation and event handlers
 * - uses jsdom for DOM environment
 * 
 * future:
 * - add accessibility and responsiveness tests
 */

import Components from '../../scripts/ui/components.js';

describe('UI Components Unit Tests', () => {
  test('creates button element', () => {
    const btn = Components.createButton('Click me');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toBe('Click me');
  });

  test('creates modal dialog element', () => {
    const modal = Components.createDialog('Title', 'Content');
    expect(modal.classList.contains('rc-dialog')).toBe(true);
    expect(modal.querySelector('.rc-dialog-header').textContent).toBe('Title');
    expect(modal.querySelector('.rc-dialog-body').textContent).toBe('Content');
  });

  test('creates container with default options', () => {
    const container = Components.createContainer();
    expect(container.tagName).toBe('DIV');
    expect(container.classList.length).toBe(0);
    expect(container.innerHTML).toBe('');
  });

  test('creates container with custom tag, classes, content, and attributes', () => {
    const content = document.createElement('span');
    content.textContent = 'Hello';
    const container = Components.createContainer('section', {
      classes: ['custom-class'],
      content,
      attrs: { 'data-role': 'test' }
    });

    expect(container.tagName).toBe('SECTION');
    expect(container.classList.contains('custom-class')).toBe(true);
    expect(container.getAttribute('data-role')).toBe('test');
    expect(container.querySelector('span').textContent).toBe('Hello');
  });

  test('createButton applies id, classes, and onClick handler', () => {
    const handleClick = jest.fn();
    const btn = Components.createButton('Submit', {
      id: 'submit-btn',
      classes: ['btn', 'btn-primary'],
      onClick: handleClick
    });

    expect(btn.id).toBe('submit-btn');
    expect(btn.classList.contains('btn')).toBe(true);
    expect(btn.classList.contains('btn-primary')).toBe(true);

    // Simulate click
    btn.click();
    expect(handleClick).toHaveBeenCalled();
  });
});
