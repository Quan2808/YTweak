// content.js - Content Script for YouTube PiP Extension

(function () {
  "use strict";

  // Get utilities and classes from global scope
  const { log, debounce } = window.YouTubePipUtils;
  const PipManager = window.YouTubePipManager;

  /**
   * YouTube PiP Extension Content Script
   */
  class YouTubePipExtension {
    constructor() {
      this.pipManager = null;
      this.isInitialized = false;

      // Debounced initialization to handle page navigation
      this.debouncedInit = debounce(this.init.bind(this), 1000);

      this.startExtension();
    }

    /**
     * Start the extension
     */
    startExtension() {
      log("YouTube PiP Extension starting...");

      // Initialize immediately if page is already loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.debouncedInit();
        });
      } else {
        this.debouncedInit();
      }

      // Handle YouTube's SPA navigation
      this.setupNavigationListener();
    }

    /**
     * Initialize the extension
     */
    async init() {
      try {
        // Check if we're on a YouTube video page
        if (!this.isYouTubeVideoPage()) {
          log("Not on a YouTube video page, skipping initialization");
          return;
        }

        // Avoid multiple initializations
        if (this.isInitialized) {
          log("Extension already initialized");
          return;
        }

        log("Initializing YouTube PiP Extension...");

        // Create PiP manager
        this.pipManager = new PipManager();
        this.isInitialized = true;

        log("YouTube PiP Extension initialized successfully");
      } catch (error) {
        log(`Failed to initialize extension: ${error.message}`, "error");
        this.isInitialized = false;
      }
    }

    /**
     * Check if current page is a YouTube video page
     * @returns {boolean} True if on video page
     */
    isYouTubeVideoPage() {
      return (
        window.location.pathname === "/watch" &&
        window.location.search.includes("v=")
      );
    }

    /**
     * Setup navigation listener for YouTube's SPA
     */
    setupNavigationListener() {
      // Listen for URL changes (YouTube SPA navigation)
      let currentUrl = window.location.href;

      const checkForNavigation = () => {
        if (currentUrl !== window.location.href) {
          currentUrl = window.location.href;
          log("Navigation detected, reinitializing...");

          // Reset initialization flag
          this.isInitialized = false;

          // Cleanup existing manager
          if (this.pipManager) {
            this.pipManager.destroy();
            this.pipManager = null;
          }

          // Reinitialize after navigation
          this.debouncedInit();
        }
      };

      // Check for navigation changes
      setInterval(checkForNavigation, 1000);

      // Also listen for popstate events
      window.addEventListener("popstate", () => {
        this.debouncedInit();
      });

      // Listen for pushstate/replacestate (YouTube navigation)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        originalPushState.apply(history, args);
        setTimeout(() => checkForNavigation(), 100);
      };

      history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => checkForNavigation(), 100);
      };
    }

    /**
     * Get the current PiP manager instance
     * @returns {PipManager|null} PiP manager instance
     */
    getPipManager() {
      return this.pipManager;
    }

    /**
     * Manually reinitialize the extension
     */
    reinitialize() {
      log("Manual reinitialization requested");
      this.isInitialized = false;

      if (this.pipManager) {
        this.pipManager.destroy();
        this.pipManager = null;
      }

      this.debouncedInit();
    }
  }

  // Wait for utilities to be available
  function waitForUtilities() {
    return new Promise((resolve) => {
      if (window.YouTubePipUtils && window.YouTubePipManager) {
        resolve();
        return;
      }

      const checkForUtilities = () => {
        if (window.YouTubePipUtils && window.YouTubePipManager) {
          resolve();
        } else {
          setTimeout(checkForUtilities, 100);
        }
      };

      checkForUtilities();
    });
  }

  // Initialize the extension when utilities are ready
  let extensionInstance = null;

  waitForUtilities().then(() => {
    // Initialize the extension
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        extensionInstance = new YouTubePipExtension();
      });
    } else {
      extensionInstance = new YouTubePipExtension();
    }

    // Export for potential external access
    window.YouTubePipExtension = {
      getInstance: () => extensionInstance,
      reinitialize: () => extensionInstance?.reinitialize(),
    };
  });
})();
