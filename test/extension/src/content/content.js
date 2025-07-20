// content.js - Content Script for YouTube PiP Extension

(function () {
  "use strict";

  // Get utilities and classes from global scope
  const {
    log,
    debounce,
    getSettings,
    isYouTubeVideoPage,
    waitForYouTubePlayer,
  } = window.YouTubePipUtils;
  const PipManager = window.YouTubePipManager;

  /**
   * YouTube PiP Extension Content Script
   */
  class YouTubePipExtension {
    constructor() {
      this.pipManager = null;
      this.isInitialized = false;
      this.settings = null;

      // Debounced initialization to handle page navigation
      this.debouncedInit = debounce(this.init.bind(this), 1000);
      this.debouncedCheckPage = debounce(this.checkPageChange.bind(this), 500);

      this.startExtension();
    }

    /**
     * Start the extension
     */
    async startExtension() {
      log("YouTube PiP Extension starting...");

      // Load initial settings
      await this.loadSettings();

      // Setup message listeners
      this.setupMessageListeners();

      // Initialize immediately if page is already loaded and extension is enabled
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.checkAndInit();
        });
      } else {
        this.checkAndInit();
      }

      // Handle YouTube's SPA navigation
      this.setupNavigationListener();
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
      try {
        this.settings = await getSettings();
        log(`Settings loaded: ${JSON.stringify(this.settings)}`);
      } catch (error) {
        log(`Failed to load settings: ${error.message}`, "error");
        this.settings = {
          enabled: true,
          autoStart: false,
          showNotifications: true,
        };
      }
    }

    /**
     * Check conditions and initialize if needed
     */
    async checkAndInit() {
      // Check if we're on a YouTube video page
      if (!isYouTubeVideoPage()) {
        log("Not on a YouTube video page, skipping initialization");
        return;
      }

      // Check if extension is enabled
      if (!this.settings?.enabled) {
        log("Extension is disabled, skipping initialization");
        return;
      }

      // Auto start or wait for manual trigger
      if (this.settings.autoStart) {
        this.debouncedInit();
      } else {
        log("Auto start disabled, PiP Manager available but not started");
        // Still make PiP Manager available for manual start
        await this.makePipManagerAvailable();
      }
    }

    /**
     * Make PiP Manager available without auto-starting
     */
    async makePipManagerAvailable() {
      try {
        // Wait for YouTube player to be ready
        await waitForYouTubePlayer();
        log("YouTube player ready, PiP Manager can be manually started");
      } catch (error) {
        log(`Failed to prepare PiP Manager: ${error.message}`, "error");
      }
    }

    /**
     * Initialize the extension
     */
    async init() {
      try {
        // Check if we're on a YouTube video page
        if (!isYouTubeVideoPage()) {
          log("Not on a YouTube video page, skipping initialization");
          return;
        }

        // Check if extension is enabled
        if (!this.settings?.enabled) {
          log("Extension is disabled, skipping initialization");
          return;
        }

        // Avoid multiple initializations
        if (this.isInitialized) {
          log("Extension already initialized");
          return;
        }

        log("Initializing YouTube PiP Extension...");

        // Wait for YouTube player
        await waitForYouTubePlayer();

        // Create PiP manager - it will auto-initialize
        this.pipManager = new PipManager();
        this.isInitialized = true;

        log("YouTube PiP Extension initialized successfully");
      } catch (error) {
        log(`Failed to initialize extension: ${error.message}`, "error");
        this.isInitialized = false;
      }
    }

    /**
     * Setup message listeners for popup communication
     */
    setupMessageListeners() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
          case "SETTINGS_CHANGED":
            this.handleSettingsChange(message.settings);
            break;
          case "REINITIALIZE":
            this.reinitialize();
            break;
          case "GET_STATUS":
            sendResponse({
              isInitialized: this.isInitialized,
              isPipActive: this.pipManager?.getPipState() || false,
              settings: this.settings,
            });
            break;
          case "TOGGLE_PIP":
            if (this.pipManager) {
              this.pipManager.togglePipState();
            }
            break;
          case "START_PIP_MANAGER":
            if (!this.isInitialized) {
              this.init();
            }
            break;
          default:
            log(`Unknown message type: ${message.type}`, "warn");
        }
      });
    }

    /**
     * Handle settings change from popup
     */
    async handleSettingsChange(newSettings) {
      log(`Settings changed: ${JSON.stringify(newSettings)}`);
      this.settings = newSettings;

      // If extension was disabled, cleanup
      if (!newSettings.enabled && this.isInitialized) {
        this.cleanup();
      }
      // If extension was enabled and we're on a video page, initialize
      else if (
        newSettings.enabled &&
        !this.isInitialized &&
        isYouTubeVideoPage()
      ) {
        if (newSettings.autoStart) {
          this.debouncedInit();
        }
      }
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
          log("Navigation detected, checking page...");
          this.debouncedCheckPage();
        }
      };

      // Check for navigation changes
      setInterval(checkForNavigation, 1000);

      // Also listen for popstate events
      window.addEventListener("popstate", () => {
        this.debouncedCheckPage();
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
     * Check page change and reinitialize if needed
     */
    async checkPageChange() {
      if (isYouTubeVideoPage()) {
        // We're on a video page
        if (
          this.settings?.enabled &&
          this.settings?.autoStart &&
          !this.isInitialized
        ) {
          log("Navigated to video page, initializing...");
          this.debouncedInit();
        }
      } else {
        // We're not on a video page, cleanup if needed
        if (this.isInitialized) {
          log("Left video page, cleaning up...");
          this.cleanup();
        }
      }
    }

    /**
     * Cleanup when leaving video page or disabling extension
     */
    cleanup() {
      if (this.pipManager) {
        this.pipManager.destroy();
        this.pipManager = null;
      }
      this.isInitialized = false;
      log("Extension cleaned up");
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
    async reinitialize() {
      log("Manual reinitialization requested");

      // Cleanup first
      this.cleanup();

      // Reload settings
      await this.loadSettings();

      // Reinitialize if conditions are met
      this.checkAndInit();
    }

    /**
     * Start PiP Manager manually (for manual control)
     */
    async startPipManager() {
      if (this.isInitialized) {
        log("PiP Manager already running");
        return;
      }

      if (!this.settings?.enabled) {
        log("Extension is disabled", "warn");
        return;
      }

      if (!isYouTubeVideoPage()) {
        log("Not on a YouTube video page", "warn");
        return;
      }

      await this.init();
    }

    /**
     * Stop PiP Manager manually
     */
    stopPipManager() {
      if (!this.isInitialized) {
        log("PiP Manager not running");
        return;
      }

      this.cleanup();
    }

    /**
     * Get extension status
     */
    getStatus() {
      return {
        isInitialized: this.isInitialized,
        isPipActive: this.pipManager?.getPipState() || false,
        settings: this.settings,
        isVideoPage: isYouTubeVideoPage(),
      };
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
      startPipManager: () => extensionInstance?.startPipManager(),
      stopPipManager: () => extensionInstance?.stopPipManager(),
      getStatus: () => extensionInstance?.getStatus(),
    };
  });

  log("Content script loaded");
})();
