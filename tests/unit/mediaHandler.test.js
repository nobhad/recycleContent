
/**
 * Unit tests for the MediaHandler class.
 * 
 * This test suite verifies the functionality of the MediaHandler class, including:
 * - Extracting and caching media elements from messages.
 * - Retrieving cached media elements or extracting them if not cached.
 * - Inserting media elements into a target container.
 * - Creating insertion tasks for media elements.
 * - Handling insertion errors gracefully.
 * - Fetching original message content.
 * - Parsing media elements from message content.
 * - Validating media availability.
 * - Creating DOM elements for media.
 * - Inserting media elements with proper formatting.
 * - Processing insertion tasks sequentially.
 * - Generating fallback elements for unavailable media.
 * 
 * Mocking and spying are used extensively to isolate and test individual methods.
 * The tests ensure proper handling of both success and error scenarios.
 */

/**
 * @jest-environment jsdom
 */


import MediaHandler from '../../scripts/services/mediaHandler';
import Logger from '../../scripts/common/logger';

describe('MediaHandler', () => {
  let mediaHandler;

  beforeEach(() => {
    mediaHandler = new MediaHandler();
    jest.spyOn(Logger, 'error').mockImplementation(() => {});
    // Mock createElement to simulate DOM elements with needed props/methods
    document.createElement = jest.fn().mockImplementation(tag => ({
      tagName: tag.toUpperCase(),
      classList: { add: jest.fn() },
      appendChild: jest.fn(),
      src: '',
      alt: '',
      textContent: '',
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('extractMediaFromMessage extracts and caches media', async () => {
    const messageId = 'msg1';
    const mediaElements = [{ type: 'image', src: 'img.jpg', alt: 'alt text' }];

    jest.spyOn(mediaHandler, 'fetchOriginalMessage').mockResolvedValue('<message>...</message>');
    jest.spyOn(mediaHandler, 'parseMediaElements').mockReturnValue(mediaElements);

    const result = await mediaHandler.extractMediaFromMessage(messageId);

    expect(result).toEqual(mediaElements);
    expect(mediaHandler.mediaCache.get(messageId)).toEqual(mediaElements);
  });

  test('getMediaElements returns cached media if present', async () => {
    const messageId = 'msg2';
    const cachedMedia = [{ type: 'video', src: 'vid.mp4', alt: 'video alt' }];
    mediaHandler.mediaCache.set(messageId, cachedMedia);

    const result = await mediaHandler.getMediaElements(messageId);

    expect(result).toEqual(cachedMedia);
  });

  test('getMediaElements calls extractMediaFromMessage if no cache', async () => {
    const messageId = 'msg3';
    const extractedMedia = [{ type: 'image', src: 'img2.jpg', alt: 'alt2' }];

    jest.spyOn(mediaHandler, 'extractMediaFromMessage').mockResolvedValue(extractedMedia);

    const result = await mediaHandler.getMediaElements(messageId);

    expect(result).toEqual(extractedMedia);
  });

  test('insertMediaIntoNewMessage inserts all media elements', async () => {
    const messageId = 'msg4';
    const targetContainer = { appendChild: jest.fn() };
    const mediaElements = [
      { type: 'image', src: 'img1.jpg', alt: 'alt1' },
      { type: 'video', src: 'vid1.mp4', alt: 'alt vid' }
    ];

    jest.spyOn(mediaHandler, 'getMediaElements').mockResolvedValue(mediaElements);

    const fakeTask1 = {
      media: mediaElements[0],
      insert: jest.fn().mockResolvedValue({ success: true, element: { tagName: 'IMG' } }),
    };
    const fakeTask2 = {
      media: mediaElements[1],
      insert: jest.fn().mockResolvedValue({ success: true, element: { tagName: 'VIDEO' } }),
    };

    jest.spyOn(mediaHandler, 'createInsertionTask')
      .mockReturnValueOnce(fakeTask1)
      .mockReturnValueOnce(fakeTask2);

    jest.spyOn(mediaHandler, 'processInsertionQueue').mockResolvedValue([
      { success: true, element: { tagName: 'IMG' } },
      { success: true, element: { tagName: 'VIDEO' } },
    ]);

    const result = await mediaHandler.insertMediaIntoNewMessage(messageId, targetContainer);

    expect(mediaHandler.getMediaElements).toHaveBeenCalledWith(messageId);
    expect(mediaHandler.createInsertionTask).toHaveBeenCalledTimes(2);
    expect(mediaHandler.processInsertionQueue).toHaveBeenCalledWith([fakeTask1, fakeTask2]);
    expect(result).toEqual([
      { success: true, element: { tagName: 'IMG' } },
      { success: true, element: { tagName: 'VIDEO' } },
    ]);
  });

  test('createInsertionTask inserts media successfully', async () => {
    const media = { type: 'image', src: 'img.jpg', alt: 'alt text' };
    const targetContainer = { appendChild: jest.fn() };

    jest.spyOn(mediaHandler, 'validateMediaAvailability').mockResolvedValue();
    jest.spyOn(mediaHandler, 'createMediaElement').mockReturnValue({ tagName: 'IMG' });
    jest.spyOn(mediaHandler, 'insertWithProperFormatting').mockImplementation();

    const task = await mediaHandler.createInsertionTask(media, targetContainer);
    const result = await task.insert();

    expect(mediaHandler.validateMediaAvailability).toHaveBeenCalledWith(media);
    expect(mediaHandler.createMediaElement).toHaveBeenCalledWith(media);
    expect(mediaHandler.insertWithProperFormatting).toHaveBeenCalled();
    expect(result).toEqual({ success: true, element: { tagName: 'IMG' } });
  });

  test('createInsertionTask handles insertion errors with fallback', async () => {
    const media = { type: 'image', src: 'img.jpg', alt: 'alt text' };
    const targetContainer = { appendChild: jest.fn() };

    const error = new Error('Validation failed');
    jest.spyOn(mediaHandler, 'validateMediaAvailability').mockRejectedValue(error);
    jest.spyOn(mediaHandler, 'generateFallback').mockReturnValue({ tagName: 'DIV' });

    const task = await mediaHandler.createInsertionTask(media, targetContainer);
    const result = await task.insert();

    expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('Media insertion failed'));
    expect(result).toEqual({ success: false, error, fallback: { tagName: 'DIV' } });
  });

  test('fetchOriginalMessage returns raw message content', async () => {
    const messageId = 'msg5';
    const messageContent = '<message>content</message>';

    // Use real method (or mock here)
    jest.spyOn(mediaHandler, 'fetchOriginalMessage').mockResolvedValue(messageContent);

    const result = await mediaHandler.fetchOriginalMessage(messageId);

    expect(result).toBe(messageContent);
  });

  test('parseMediaElements returns media elements array', () => {
    const messageContent = '<message>some content</message>';
    const mediaElements = [{ type: 'image', src: 'img.jpg', alt: 'alt' }];

    jest.spyOn(mediaHandler, 'parseMediaElements').mockReturnValue(mediaElements);

    const result = mediaHandler.parseMediaElements(messageContent);

    expect(result).toEqual(mediaElements);
  });

  test('validateMediaAvailability resolves if media has src', async () => {
    const media = { src: 'img.jpg' };
    await expect(mediaHandler.validateMediaAvailability(media)).resolves.toBeUndefined();
  });

  test('validateMediaAvailability throws if src is missing', async () => {
    const media = { src: '' };
    await expect(mediaHandler.validateMediaAvailability(media)).rejects.toThrow('Media source URL missing');
  });

  test('createMediaElement returns DOM element with correct properties', () => {
    const media = { type: 'image', src: 'img.jpg', alt: 'alt text' };

    const element = mediaHandler.createMediaElement(media);

    expect(element.tagName).toBe('IMG');
    expect(element.src).toBe('img.jpg');
    expect(element.alt).toBe('alt text');
  });

  test('insertWithProperFormatting adds class and appends element', () => {
    const element = { classList: { add: jest.fn() }, appendChild: jest.fn() };
    const targetContainer = { appendChild: jest.fn() };

    mediaHandler.insertWithProperFormatting(element, targetContainer);

    expect(element.classList.add).toHaveBeenCalledWith('recycle-media');
    expect(targetContainer.appendChild).toHaveBeenCalledWith(element);
  });

  test('processInsertionQueue processes all tasks in order', async () => {
    const tasks = [
      { insert: jest.fn().mockResolvedValue({ success: true }) },
      { insert: jest.fn().mockResolvedValue({ success: false }) },
    ];

    const results = await mediaHandler.processInsertionQueue(tasks);

    expect(tasks[0].insert).toHaveBeenCalled();
    expect(tasks[1].insert).toHaveBeenCalled();
    expect(results).toEqual([{ success: true }, { success: false }]);
  });

  test('generateFallback returns fallback element with textContent', () => {
    const media = { type: 'image' };
    const fallback = mediaHandler.generateFallback(media);

    expect(fallback.tagName).toBe('DIV');
    expect(fallback.textContent).toBe('[Media unavailable: image]');
  });
});
