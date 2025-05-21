/**
 * @file        mediaHandler.js
 * @description Manages media elements such as images, videos, and attachments
 *              within messages processed by the RecycleContent extension.
 *              Handles source extraction, media validation, and fallback behavior.
 * 
 * @author      Noelle B.
 * @created     2025-05-21
 * @license     MIT
 * 
 * @module      MediaHandler
 * 
 * @note        Ensures proper handling of embedded and external media content.
 */

class MediaHandler {
    constructor() {
      this.mediaCache = new Map();
    }
    
    async extractMediaFromMessage(messageId) {
      const message = await this.fetchOriginalMessage(messageId);
      const mediaElements = this.parseMediaElements(message);
      
      // Cache media references
      this.mediaCache.set(messageId, mediaElements);
      return mediaElements;
    }
    
    async insertMediaIntoNewMessage(messageId, targetContainer) {
      const mediaElements = await this.getMediaElements(messageId);
      
      // Create insertion queue to handle insertion in stages
      const insertionQueue = mediaElements.map(media => 
        this.createInsertionTask(media, targetContainer)
      );
      
      // Process queue with error handling
      return this.processInsertionQueue(insertionQueue);
    }
    
    async createInsertionTask(media, targetContainer) {
      return {
        media,
        insert: async () => {
          try {
            // Check media availability
            await this.validateMediaAvailability(media);
            
            // Create appropriate DOM element based on media type
            const element = this.createMediaElement(media);
            
            // Insert into target with proper event handlers
            this.insertWithProperFormatting(element, targetContainer);
            
            return { success: true, element };
          } catch (error) {
            return { success: false, error, fallback: this.generateFallback(media) };
          }
        }
      };
    }
  }

export default MediaHandler;