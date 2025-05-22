/**
 * @file constants.test.js
 * @description Unit tests for Constants module.
 */

import Constants from '../../scripts/common/constants.js';

describe('Constants Module', () => {
  test('defines STORAGE_KEY_SETTINGS', () => {
    expect(Constants.STORAGE_KEY_SETTINGS).toBe('RecycleContentSettings');
  });

  test('defines STORAGE_KEY_QUEUE', () => {
    expect(Constants.STORAGE_KEY_QUEUE).toBe('RecycleContentMessageQueue');
  });

  test('defines EVENT_DOM_UPDATED', () => {
    expect(Constants.EVENT_DOM_UPDATED).toBe('RecycleContentDOMUpdated');
  });

  test('defines MAX_RETRY_ATTEMPTS as a number', () => {
    expect(typeof Constants.MAX_RETRY_ATTEMPTS).toBe('number');
    expect(Constants.MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
  });

  test('defines API_ENDPOINT as a valid URL string', () => {
    expect(typeof Constants.API_ENDPOINT).toBe('string');
    expect(Constants.API_ENDPOINT).toMatch(/^https:\/\/api\.recyclecontent\.example\.com\/process$/);
  });

  test('defines EXCLUSION_PATTERN as a RegExp', () => {
    expect(Constants.EXCLUSION_PATTERN instanceof RegExp).toBe(true);
    expect(Constants.EXCLUSION_PATTERN.test('This is spam')).toBe(true);
    expect(Constants.EXCLUSION_PATTERN.test('This is clean')).toBe(false);
  });

  test('defines STATUS_RECYCLING_ON and OFF', () => {
    expect(Constants.STATUS_RECYCLING_ON).toBe('Recycling: ON');
    expect(Constants.STATUS_RECYCLING_OFF).toBe('Recycling: OFF');
  });
});

