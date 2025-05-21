# RecycleContent

## Description  
RecycleContent is a Chrome extension designed exclusively for OnlyFans creators to help recycle mass message content without resending duplicate content to subscribers who have already purchased it. It intelligently automates message reuse while managing subscriber exclusion lists and preserving all original media assets, giving creators complete control over content recycling workflow.

---

## Table of Contents  
- [Description](#description)  
- [Features](#features)  
- [Installation](#installation)  
- [Permissions](#permissions)  
- [Usage](#usage)  
- [Architecture & Best Practices](#architecture--best-practices)  
  - [Managing Exclusion Lists Efficiently](#managing-exclusion-lists-efficiently)  
  - [Safely Re-inserting Images and Videos](#safely-re-inserting-images-and-videos)  
  - [DOM Targeting Strategies for OnlyFans Interface](#dom-targeting-strategies-for-onlyfans-interface)  
  - [Performance Optimization](#performance-optimization)  
  - [Security Considerations](#security-considerations)  
- [Directory Structure](#directory-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Troubleshooting](#troubleshooting)  
- [Contact](#contact)  

---

# Features

- **Content Recycling**  
  Effortlessly resend previously sent mass messages including all original text, images, videos, and pricing, preserving content integrity.

- **Smart Exclusion Lists**  
  Automatically generate and maintain subscriber exclusion lists locally to prevent sending duplicate content to subscribers who already purchased it.

- **Manual Control Over Sending**  
  Provides creators full manual control to review, edit, and send recycled messages without auto-scheduling, ensuring flexibility and precision.

- **Seamless OnlyFans Integration**  
  Injects scripts directly into the OnlyFans creator dashboard for a smooth and native user experience.

- **Modular, Maintainable Codebase**  
  Utilizes a modular architecture separating content scripts, background scripts, and UI logic for easier maintenance and extension.

- **Optimized Performance**  
  Local caching, efficient DOM manipulation, and background processing ensure responsive and smooth operation even with large subscriber lists.

- **Comprehensive Testing**  
  Includes unit, integration, and end-to-end tests to ensure reliability and stability.

- **Robust Media Handling**  
  Preserves all original media assets with fallback handling and lazy loading to maintain message quality and load times.

---

# Installation  

1. Open `chrome://extensions` in Chrome.  
2. Enable **Developer mode** in the top-right corner.  
3. Click **Load unpacked** and select the project directory.  
4. Pin the extension to your toolbar for easy access.  
5. Navigate to your OnlyFans creator dashboard to start using the extension.

---

# Permissions

This extension requires the following Chrome permissions:

- `storage` — Save and manage exclusion lists, message caches, and user preferences locally.  
- `activeTab` — Inject scripts only into the active OnlyFans tab.  
- `scripting` — Programmatically inject and execute scripts on OnlyFans pages (Manifest V3 requirement).  
- `notifications` (optional) — Show user feedback for success or errors.

> **Note:** Permissions are minimal and focused on extension functionality while respecting user privacy.

---

# Usage

1. Navigate to your OnlyFans creator dashboard in Chrome.  
2. Click the **RecycleContent** extension icon.  
3. Browse your previously sent mass messages.  
4. Click **Recycle** on a message to resend.  
5. The extension fetches the original content and exclusion list.  
6. Review/edit the recycled message, text, media, pricing, and exclusion list.  
7. Click **Prepare Message** to finalize.  
8. Choose to **Send Immediately** or **Schedule for Later** (if supported).

---

## Architecture & Best Practices  

### Managing Exclusion Lists Efficiently  

- Indexed storage with `chrome.storage.local` for O(1) lookups.  
- Compressed formats to reduce size and load time.  
- Incremental updates and versioning for reliability.  
- Background synchronization to avoid UI blocking.  
- Deduplication and smart caching for performance.

**Example snippet:**

```javascript
class ExclusionListManager {
  constructor() {
    this.cache = new Map();
    this.storage = chrome.storage.local;
  }

  async getOrCreateList(messageId) {
    if (this.cache.has(messageId)) {
      return this.cache.get(messageId);
    }
    const key = `exclusion_${messageId}`;
    const result = await this.storage.get(key);
    if (result[key]) {
      const list = this.decompressList(result[key]);
      this.cache.set(messageId, list);
      return list;
    }
    return this.createNewList(messageId);
  }

  async updateList(messageId, newBuyers) {
    const list = await this.getOrCreateList(messageId);
    const updated = this.mergeAndDeduplicate(list, newBuyers);
    const compressed = this.compressList(updated);
    await this.storage.set({[`exclusion_${messageId}`]: compressed});
    this.cache.set(messageId, updated);
    return updated;
  }
}

```

### Safely Re-inserting Images and Videos  
- **Media Proxy Service**: Implement a proxy service to handle media loading and error cases
- **Staged Insertion Strategy**: Insert media in stages, ensuring each element is properly loaded before proceeding
- **Format Detection**: Automatically detect and handle different media formats (images, videos, etc.)
- **Fallback Pipeline**: Implement cascading fallbacks when original media becomes unavailable
- **Lazy Loading**: Use lazy loading techniques for media to improve performance
- **Original Reference Preservation**: Store references to original media to maintain attribution
- **Metadata Retention**: Preserve and restore all metadata associated with original media

**Implementation Example**:
```javascript
// mediaHandler.js
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
```

### DOM Targeting Strategies for OnlyFans Interface  
- **Selector Resilience**: Use data-attribute selectors instead of class-based selectors when possible
- **Component-based Targeting**: Target based on component structure rather than specific element selectors
- **Mutation Observers**: Implement observers to detect interface changes and dynamically adapt
- **Layered Selectors**: Use multiple selector strategies with fallbacks for robustness
- **Periodic Validation**: Regularly validate selector effectiveness against OnlyFans updates
- **Interface Mapping**: Maintain a component map that correlates logical interface elements to their DOM representations
- **Event Delegation**: Use event delegation for dynamic elements to reduce the need for reattaching handlers

**Implementation Example**:
```javascript
// domTargeting.js
class DOMTargetManager {
  constructor() {
    this.selectorStrategies = [
      // Primary strategy: data attributes if available
      element => `[data-message-id="${element.id}"]`,
      // Fallback: structural patterns
      element => {
        const parentContainer = element.closest('.message-container');
        return parentContainer ? 
          `.message-container:nth-child(${this.getElementIndex(parentContainer)})` : 
          null;
      },
      // Last resort: complex attribute selectors
      element => `[id^="message-"][data-timestamp="${element.dataset.timestamp}"]`
    ];
    
    // Set up mutation observer to track DOM changes
    this.setupMutationObserver();
  }
  
  getTargetElement(descriptor) {
    // Try different strategies until one works
    for (const strategy of this.selectorStrategies) {
      const selector = strategy(descriptor);
      if (!selector) continue;
      
      const element = document.querySelector(selector);
      if (element) return element;
    }
    
    // Fall back to progressive disclosure search
    return this.findElementByProgressiveDisclosure(descriptor);
  }
  
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      // Check if relevant parts of the interface have changed
      const significant = this.evaluateMutationSignificance(mutations);
      if (significant) {
        // Update internal mappings and selectors as needed
        this.rebuildInterfaceMap();
      }
    });
    
    // Start observing with appropriate options
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-message-id']
    });
  }
}
```

### Performance Optimization
- **Resource Loading Prioritization**: Prioritize loading critical resources first
- **Throttling and Debouncing**: Implement throttling for frequent operations and debouncing for event handlers
- **Batch Processing**: Group operations into batches to reduce overhead
- **Memory Management**: Implement proper cleanup routines to prevent memory leaks
- **Lazy Initialization**: Initialize components only when needed
- **Web Worker Offloading**: Use Web Workers for CPU-intensive tasks
- **Request Caching**: Cache API requests to reduce network overhead

### Security Considerations
- **Content Security Policy**: Implement a robust CSP to prevent XSS attacks
- **Data Validation**: Validate all input data before processing
- **Secure Storage**: Encrypt sensitive data in local storage
- **Permission Minimization**: Request only essential permissions
- **Cross-Origin Protection**: Implement proper CORS handling
- **Code Isolation**: Isolate extension code from page context
- **Regular Security Audits**: Conduct security audits regularly

---

## Directory Structure   
```
RecycleContent/
├── README.md
├── LICENSE.txt
├── manifest.json
├── babel.config.json
├── package.json
├── package-lock.json
├── eslint.config.mjs
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   ├── background/
│   │   ├── background.js         # Main background service worker
│   │   ├── messageQueue.js       # Message processing queue
│   │   └── notificationManager.js # Handles extension notifications
│   ├── content/
│   │   ├── contentScript.js      # Main content script injected into OnlyFans
│   │   ├── domObserver.js        # Watches for DOM changes
│   │   ├── interfaceManager.js   # Manages interface interactions
│   │   └── messageParser.js      # Parses message content
│   ├── common/
│   │   ├── storage.js            # Storage abstraction layer
│   │   ├── logger.js             # Logging utility
│   │   └── constants.js          # Shared constants
│   ├── services/
│   │   ├── exclusionList.js      # Exclusion list management
│   │   ├── mediaHandler.js       # Media processing and insertion
│   │   └── messageProcessor.js   # Message content processing
│   └── ui/
│       ├── popup.js              # Extension popup logic
│       ├── components.js         # Reusable UI components
│       └── templates.js          # HTML templates
├── styles/
│   ├── popup.css                 # Styles for extension popup
│   └── injected.css              # Styles injected into OnlyFans
├── tests/
│   ├── unit/
│   │   ├── exclusionList.test.js
│   │   ├── mediaHandler.test.js
│   │   └── storage.test.js
│   ├── integration/
│   │   ├── contentScript.test.js
│   │   └── messageProcessor.test.js
│   └── e2e/
│       └── workflow.test.js
└── docs/
    ├── API.md                    # API documentation
    ├── DEVELOPMENT.md            # Development guide
    └── ARCHITECTURE.md           # Architecture documentation
```

---

## Contributing  
Contributions, bug reports, and feature requests are welcome! Please submit pull requests or open issues on GitHub.

### How to Contribute

1. **Fork the repository** to your own GitHub account  
2. **Clone your fork** locally:  
   ```bash
   git clone https://github.com/yourusername/RecycleContent.git
   ```
3. **Create a new branch** for your feature:  
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install dependencies**:  
   ```bash
   npm install
   ```
5. **Make your changes** and commit them:  
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Run tests** to ensure your changes don't break existing functionality:  
   ```bash
   npm test
   ```
7. **Push to your branch**:  
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request** from your forked repository

### Code Style
All code should follow the project's ESLint configuration. Run linting before submitting:
```bash
npm run lint
```

---

## License  
This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.

---

## Troubleshooting  

### Common Issues and Solutions
- **Exclusion lists not updating**: Clear the extension storage by going to `chrome://extensions`, finding RecycleContent, and clicking "Clear Data"
- **Media not displaying**: Verify the original message still contains accessible media and try refreshing the page
- **Extension not appearing on OnlyFans**: Ensure you're on the creator dashboard and the extension has proper permissions
- **Send button inactive**: Check that all required fields are populated and the exclusion list is properly loaded
- **Performance issues**: Try reducing the size of your exclusion lists by archiving older ones

### Debugging
Enable debug logging in the extension settings to help identify issues:
1. Click the extension icon
2. Go to Settings
3. Enable "Debug Mode"
4. Check the browser console for detailed logs

---

## Contact  
For bugs or feature requests, please open a GitHub issue or contact the maintainer directly at [maintainer@example.com](mailto:maintainer@example.com).

---

## Roadmap
- **Multi-platform Support**: Extend to Firefox and other browsers
- **Enhanced Analytics**: Track recycled content performance
- **AI Content Suggestions**: Smart suggestions for content recycling timing
- **Bulk Operations**: Process multiple messages simultaneously
- **Cloud Sync**: Optional cloud backup for exclusion lists