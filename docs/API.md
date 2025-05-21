# RecycleContent API Documentation

This document provides a comprehensive reference for the RecycleContent Chrome extension's API. The API is designed to facilitate interaction with OnlyFans mass messages, exclusion list management, and media handling.

## Table of Contents
- [Core Modules](#core-modules)
- [Data Models](#data-models)
- [Storage Schema](#storage-schema)
- [Events](#events)
- [Error Handling](#error-handling)
- [Extension Messaging](#extension-messaging)

---

## Core Modules

### ExclusionListManager

Manages the creation, retrieval, and updating of subscriber exclusion lists.

#### Methods

```javascript
// Get an existing list or create a new one
async getOrCreateList(messageId: string): Promise<ExclusionList>

// Update a list with new buyers
async updateList(messageId: string, newBuyers: Array<string>): Promise<ExclusionList>

// Merge multiple exclusion lists
async mergeLists(listIds: Array<string>, newListName: string): Promise<ExclusionList>

// Get all available exclusion lists
async getAllLists(): Promise<Array<ExclusionListMeta>>

// Delete an exclusion list
async deleteList(listId: string): Promise<boolean>

// Export an exclusion list to JSON
async exportList(listId: string): Promise<string>

// Import an exclusion list from JSON
async importList(jsonData: string, listName: string): Promise<ExclusionList>
```

### MediaHandler

Manages extraction and insertion of media content from OnlyFans messages.

#### Methods

```javascript
// Extract media elements from a message
async extractMediaFromMessage(messageId: string): Promise<Array<MediaElement>>

// Insert media elements into a message composition area
async insertMediaIntoNewMessage(messageId: string, targetContainer: HTMLElement): Promise<InsertionResult>

// Validate if media is still available
async validateMediaAvailability(media: MediaElement): Promise<boolean>

// Get cached media for a message
async getMediaElements(messageId: string): Promise<Array<MediaElement>>

// Clear media cache for a message
async clearMediaCache(messageId: string): Promise<void>
```

### DOMTargetManager

Provides reliable DOM targeting strategies for the OnlyFans interface.

#### Methods

```javascript
// Get a target element based on a descriptor
getTargetElement(descriptor: ElementDescriptor): HTMLElement | null

// Register a new element descriptor
registerElement(name: string, descriptor: ElementDescriptor): void

// Get all registered elements
getRegisteredElements(): Map<string, ElementDescriptor>

// Update targeting strategy for a named element
updateTargetingStrategy(name: string, strategy: SelectorStrategy): boolean

// Check if an element exists in the current page
elementExists(name: string): boolean

// Wait for an element to appear in the DOM
async waitForElement(name: string, timeout: number = 5000): Promise<HTMLElement>
```

### MessageProcessor

Handles message content extraction and preparation for recycling.

#### Methods

```javascript
// Extract content from an existing message
async extractMessageContent(messageId: string): Promise<MessageContent>

// Prepare a message for recycling
async prepareRecycledMessage(messageId: string, options: RecycleOptions): Promise<PreparedMessage>

// Send a recycled message
async sendRecycledMessage(preparedMessage: PreparedMessage): Promise<SendResult>

// Save a message as draft
async saveAsDraft(preparedMessage: PreparedMessage): Promise<DraftResult>

// Get sending history for a message
async getMessageHistory(messageId: string): Promise<MessageHistory>
```

---

## Data Models

### ExclusionList

```typescript
interface ExclusionList {
  id: string;                    // Unique identifier for the list
  name: string;                  // Human-readable name
  subscribers: Array<string>;    // Array of subscriber IDs
  messageIds: Array<string>;     // Messages associated with this list
  created: number;               // Creation timestamp
  updated: number;               // Last update timestamp
  meta: {                        // Additional metadata
    count: number;               // Number of subscribers in the list
    source: string;              // Source of the list (e.g., "recycled", "manual")
    version: number;             // Version number for tracking changes
  };
}
```

### MediaElement

```typescript
interface MediaElement {
  id: string;                    // Unique identifier for the media
  type: "image" | "video";       // Media type
  url: string;                   // Original URL
  thumbnailUrl?: string;         // Thumbnail URL if available
  metadata: {                    // Additional metadata
    width?: number;              // Width in pixels
    height?: number;             // Height in pixels
    duration?: number;           // Duration for videos (in seconds)
    fileSize?: number;           // File size in bytes
    mimeType?: string;           // MIME type
  };
  originalMessageId: string;     // ID of the message this media came from
}
```

### MessageContent

```typescript
interface MessageContent {
  id: string;                    // Message ID
  text: string;                  // Text content
  media: Array<MediaElement>;    // Media elements
  price?: number;                // Price of the message (if any)
  recipientCount?: number;       // Number of recipients
  purchaseCount?: number;        // Number of purchases
  sent: number;                  // Timestamp when originally sent
  stats: {                       // Performance stats
    views: number;               // View count
    revenue: number;             // Revenue generated
    conversionRate: number;      // Conversion rate
  };
}
```

### RecycleOptions

```typescript
interface RecycleOptions {
  useOriginalPrice: boolean;     // Keep the original price
  modifiedText?: string;         // Modified text content (or null to keep original)
  exclusionListId: string;       // ID of the exclusion list to use
  scheduleSend?: number;         // Timestamp to schedule sending (or null for immediate)
  includedMedia: Array<string>;  // IDs of media to include (all if empty)
}
```

---

## Storage Schema

RecycleContent uses Chrome's `storage.local` API with the following key structure:

### Exclusion Lists
- `exclusion_[messageId]`: Stores compressed exclusion list data
- `exclusion_meta`: Stores metadata about all exclusion lists for quick retrieval

### Media Cache
- `media_cache_[messageId]`: Stores cached media references
- `media_cache_index`: Index of all cached media for efficient lookup

### Message History
- `message_history_[messageId]`: Stores sending history for a message
- `message_stats`: Aggregated statistics for all recycled messages

### Settings
- `settings`: User configuration settings

### Example Storage Operations

```javascript
// Save an exclusion list
async function saveExclusionList(list) {
  const compressed = compressList(list);
  await chrome.storage.local.set({
    [`exclusion_${list.id}`]: compressed
  });
  
  // Update metadata index
  const metaResult = await chrome.storage.local.get('exclusion_meta');
  const meta = metaResult.exclusion_meta || {};
  meta[list.id] = {
    name: list.name,
    count: list.subscribers.length,
    updated: Date.now()
  };
  await chrome.storage.local.set({ exclusion_meta: meta });
}

// Retrieve an exclusion list
async function getExclusionList(listId) {
  const result = await chrome.storage.local.get(`exclusion_${listId}`);
  if (!result[`exclusion_${listId}`]) {
    return null;
  }
  return decompressList(result[`exclusion_${listId}`]);
}
```

---

## Events

The extension uses a custom event system to communicate between components:

### Extension Events

```javascript
// Subscribe to an event
RecycleContent.events.subscribe('exclusionListUpdated', (data) => {
  console.log(`List ${data.listId} was updated with ${data.addedCount} new subscribers`);
});

// Publish an event
RecycleContent.events.publish('exclusionListUpdated', {
  listId: 'list123',
  addedCount: 15
});
```

### Available Events

| Event Name | Description | Data Payload |
|------------|-------------|--------------|
| `exclusionListCreated` | A new exclusion list was created | `{ listId, name, count }` |
| `exclusionListUpdated` | An exclusion list was updated | `{ listId, addedCount, totalCount }` |
| `messageRecycled` | A message was successfully recycled | `{ messageId, sentTo, excludedCount }` |
| `mediaExtracted` | Media was extracted from a message | `{ messageId, mediaCount }` |
| `mediaInserted` | Media was inserted into a message | `{ messageId, mediaCount, success }` |
| `recycleStarted` | Message recycling process started | `{ messageId, timestamp }` |
| `recycleCompleted` | Message recycling process completed | `{ messageId, success, timestamp }` |
| `error` | An error occurred | `{ source, message, details }` |

---

## Error Handling

The extension uses a standardized error handling approach:

```javascript
try {
  // Operation that might fail
  await messageProcessor.prepareRecycledMessage(messageId, options);
} catch (error) {
  if (error instanceof RecycleContentError) {
    // Handle specific error types
    switch (error.code) {
      case 'MEDIA_UNAVAILABLE':
        // Handle media unavailable error
        break;
      case 'EXCLUSION_LIST_NOT_FOUND':
        // Handle missing exclusion list
        break;
      default:
        // Generic error handling
        console.error(`Error: ${error.message}`);
    }
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    RecycleContent.events.publish('error', {
      source: 'messageProcessor',
      message: 'Unexpected error occurred',
      details: error.toString()
    });
  }
}
```

### Error Types

| Error Code | Description |
|------------|-------------|
| `MEDIA_UNAVAILABLE` | Media content is no longer accessible |
| `EXCLUSION_LIST_NOT_FOUND` | The specified exclusion list doesn't exist |
| `STORAGE_ERROR` | Error accessing Chrome storage |
| `NETWORK_ERROR` | Network request failed |
| `DOM_ELEMENT_NOT_FOUND` | Required DOM element not found |
| `INVALID_MESSAGE_ID` | Invalid or malformed message ID |
| `PERMISSION_DENIED` | Permission denied for an operation |
| `INITIALIZATION_FAILED` | Failed to initialize a component |

---

## Extension Messaging

The extension uses Chrome's messaging API for communication between background scripts, content scripts, and popup:

### Message Format

```typescript
interface ExtensionMessage {
  action: string;                 // The action to perform
  payload?: any;                  // Data payload
  requestId?: string;             // For tracking requests/responses
  source: 'popup' | 'content' | 'background'; // Source component
}
```

### Example Usage

```javascript
// Send a message from popup to content script
async function requestMessageData(messageId) {
  const response = await chrome.tabs.sendMessage(tabId, {
    action: 'getMessageData',
    payload: { messageId },
    requestId: generateUniqueId(),
    source: 'popup'
  });
  
  return response.data;
}

// Listen for messages in content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getMessageData') {
    extractMessageData(message.payload.messageId)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.toString() }));
    return true; // Indicate async response
  }
});
```

### Common Messages

| Action | Description | Payload | Response |
|--------|-------------|---------|----------|
| `getMessageData` | Get data for a message | `{ messageId }` | Message content data |
| `initiateRecycle` | Start recycling a message | `{ messageId, options }` | Status of operation |
| `updateExclusionList` | Update an exclusion list | `{ listId, subscribers }` | Updated list data |
| `getStorageStats` | Get storage usage statistics | None | Storage stats |
| `clearCache` | Clear specific cache data | `{ type, id }` | Operation status |