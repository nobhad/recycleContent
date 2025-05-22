/**
 * @jest-environment jsdom
 */

/**
 * @file templates.test.js
 * @description Unit tests for Templates module.
 */

import Templates from '../../scripts/ui/templates.js';

describe('Templates Module', () => {
  test('getButtonTemplate returns button HTML with token', () => {
    const template = Templates.getButtonTemplate();
    expect(template).toContain('<button');
    expect(template).toContain('{{label}}');
    expect(template).toContain('{{id}}');
  });

  test('getDialogTemplate returns dialog HTML with tokens', () => {
    const template = Templates.getDialogTemplate();
    expect(template).toContain('{{title}}');
    expect(template).toContain('{{content}}');
    expect(template).toContain('rc-dialog');
  });

  test('getStatusMessageTemplate returns status message with token', () => {
    const template = Templates.getStatusMessageTemplate();
    expect(template).toBe('Status: {{message}}');
  });

  test('fillTemplate replaces tokens with values', () => {
    const template = '<p>Hello, {{name}}!</p>';
    const result = Templates.fillTemplate(template, { name: 'Noelle' });
    expect(result).toBe('<p>Hello, Noelle!</p>');
  });

  test('fillTemplate leaves unknown tokens unchanged', () => {
    const template = '<p>{{greeting}}, {{name}}!</p>';
    const result = Templates.fillTemplate(template, { name: 'Noelle' });
    expect(result).toBe('<p>{{greeting}}, Noelle!</p>');
  });

  test('fillTemplate works with multiple tokens', () => {
    const template = '<div id="{{id}}">{{label}}</div>';
    const result = Templates.fillTemplate(template, { id: 'test-id', label: 'Click Me' });
    expect(result).toBe('<div id="test-id">Click Me</div>');
  });
});
