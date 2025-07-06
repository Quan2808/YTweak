# YouTube PiP Button Enhancer

A Chrome extension that enhances the built-in Picture-in-Picture (PiP) button on YouTube with custom SVG icons and improved functionality.

## Features

- ✨ Custom SVG icons for enter/exit PiP mode
- 🔄 Dynamic icon switching based on PiP state
- 🎨 Color-coded button states (white for inactive, red for active)
- 🚀 Automatic initialization on page load and navigation
- 🔧 Modular architecture for easy maintenance
- 📱 Support for YouTube's SPA navigation

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be automatically active on YouTube pages

### File Structure

```
youtube-pip-enhancer/
├── manifest.json         # Extension manifest
├── content.js            # Main content script
├── pipManager.js         # PiP manager class
├── utils.js              # Utility functions
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## How It Works

### Architecture

The extension is built with a modular architecture:

1. **`utils.js`** - Contains reusable utility functions:

   - SVG creation and icon management
   - DOM element waiting functions
   - Debouncing utilities
   - Logging functions

2. **`pipManager.js`** - Core PiP functionality:

   - Button detection and setup
   - Icon state management
   - Event handling
   - PiP state synchronization

3. **`content.js`** - Main content script:
   - Extension initialization
   - YouTube navigation handling
   - Lifecycle management

### Key Features

#### Custom SVG Icons

- **Enter PiP**: Shows icon indicating PiP can be activated
- **Exit PiP**: Shows icon indicating PiP can be deactivated
- Icons change color based on state (white/red)

#### State Management

- Tracks PiP state automatically
- Syncs with native browser PiP events
- Handles YouTube's dynamic content loading

#### Navigation Support

- Detects YouTube's SPA navigation
- Reinitializes on page changes
- Handles both history API and popstate events

## Usage

1. Navigate to any YouTube video page
2. The PiP button will be automatically enhanced with custom icons
3. Click the button to toggle Picture-in-Picture mode
4. Icon color changes to indicate current state:
   - **White**: PiP inactive
   - **Red**: PiP active

## Development

### Extending the Extension

#### Adding New Icons

```javascript
// In utils.js
export const PIP_ICONS = {
  enter: "your-svg-path-data",
  exit: "your-svg-path-data",
  // Add new icons here
  custom: "custom-svg-path-data",
};
```

#### Customizing Colors

```javascript
// In pipManager.js constructor
this.colors = {
  active: "#ff0000", // Red for active
  inactive: "#fff", // White for inactive
  // Add custom colors
  hover: "#ffff00", // Yellow for hover
};
```

#### Adding Event Listeners

```javascript
// In pipManager.js
attachEvents() {
  // Existing events...

  // Add custom events
  this.pipButton.addEventListener('mouseenter', () => {
    // Custom hover behavior
  });
}
```

### Debugging

The extension includes comprehensive logging:

```javascript
// Enable debug logging
import { log } from "./utils.js";

// Use throughout your code
log("Debug message", "info");
log("Warning message", "warn");
log("Error message", "error");
```

### Testing

1. Load the extension in developer mode
2. Open browser console (F12)
3. Navigate to YouTube
4. Look for extension logs with prefix `[YouTube PiP Extension]`

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on YouTube
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0

- Initial release
- Custom SVG icons for PiP button
- Dynamic state management
- YouTube navigation support
- Modular architecture

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Ensure you're on a YouTube video page (`/watch`)
3. Try refreshing the page
4. Disable and re-enable the extension

For bugs and feature requests, please open an issue on the GitHub repository.
