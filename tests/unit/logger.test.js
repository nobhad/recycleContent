/**
 * Unit tests for the Logger module.
 *
 * This test suite verifies the functionality of the Logger class, including:
 * - Setting valid and invalid log levels.
 * - Logging messages at different levels (error, warn, info, debug).
 * - Ensuring appropriate console methods are called with the correct arguments.
 *
 * Test Cases:
 * - `setLevel sets valid log level`: Ensures that the Logger correctly sets a valid log level.
 * - `setLevel warns on invalid log level`: Verifies that an invalid log level defaults to INFO and logs a warning.
 * - `setLevel warns when level is not a string`: Warns when non-string level is set.
 * - `setLevel trims and handles case-insensitive input`: Handles trimming and case.
 * - `setLevel accepts uppercase and mixed case`: Handles uppercase and mixed case inputs.
 * - `error logs message at error level`: Confirms error logs use console.error.
 * - `warn logs message at warn level`: Confirms warn logs use console.warn.
 * - `info logs message at info level`: Confirms info logs use console.info.
 * - `debug logs message at debug level`: Confirms debug logs use console.debug.
 *
 * Setup and Teardown:
 * - Before each test, spies are created for `console.error`, `console.warn`, `console.info`, and `console.debug`.
 * - After each test, all mocked console methods are restored.
 */

import Logger from '../../scripts/common/logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('setLevel sets valid log level', () => {
    Logger.setLevel('debug');
    expect(Logger.getLevel()).toBe('DEBUG');
  });

  test('setLevel warns on invalid log level', () => {
    Logger.setLevel('invalid');
    expect(Logger.getLevel()).toBe('INFO');
    expect(console.warn).toHaveBeenCalledWith('Logger: Invalid log level "invalid", defaulting to INFO');
  });

  test('setLevel warns when level is not a string', () => {
    Logger.setLevel('debug'); // set to a known value first
    Logger.setLevel(123);     // invalid input
    expect(Logger.getLevel()).toBe('DEBUG'); // should remain unchanged
    expect(console.warn).toHaveBeenCalledWith('Logger: Level must be a string, got number');
  });

  test('setLevel trims and handles case-insensitive input', () => {
    Logger.setLevel('  debug  ');
    expect(Logger.getLevel()).toBe('DEBUG');

    Logger.setLevel('Warn');
    expect(Logger.getLevel()).toBe('WARN');
  });

  test('setLevel accepts uppercase and mixed case', () => {
    Logger.setLevel('ERROR');
    expect(Logger.getLevel()).toBe('ERROR');

    Logger.setLevel('iNfO');
    expect(Logger.getLevel()).toBe('INFO');
  });

  test('error logs message at error level', () => {
    Logger.setLevel('error');
    Logger.error('Test error');
    expect(console.error).toHaveBeenCalledWith('[RecycleContent][ERROR]', 'Test error');
  });

  test('warn logs message at warn level', () => {
    Logger.setLevel('warn');
    Logger.warn('Test warn');
    expect(console.warn).toHaveBeenCalledWith('[RecycleContent][WARN]', 'Test warn');
  });

  test('info logs message at info level', () => {
    Logger.setLevel('info');
    Logger.info('Test info');
    expect(console.info).toHaveBeenCalledWith('[RecycleContent][INFO]', 'Test info');
  });

  test('debug logs message at debug level', () => {
    Logger.setLevel('debug');
    Logger.debug('Test debug');
    expect(console.debug).toHaveBeenCalledWith('[RecycleContent][DEBUG]', 'Test debug');
  });
});
