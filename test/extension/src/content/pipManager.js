// PiP Manager Class

(function (window) {
  "use strict";

  // Get utilities from global scope
  const { PIP_ICONS, createSVG, waitForElement, log, showNotification } =
    window.YouTubePipUtils;

  /**
   * YouTube Picture-in-Picture Manager
   */
  class PipManager {
    constructor() {
      this.pipButton = null;
      this.isPipActive = false;
      this.isInitialized = false;
      this.buttonSelector =
        "#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-pip-button.ytp-button";

      this.colors = {
        active: "#ff0000",
        inactive: "#fff",
      };

      this.eventHandlers = {
        enterPip: this.handleEnterPip.bind(this),
        leavePip: this.handleLeavePip.bind(this),
      };

      // Auto-initialize
      this.init();
    }

    /**
     * Initialize the PiP manager
     */
    async init() {
      if (this.isInitialized) {
        log("PiP Manager already initialized");
        return;
      }

      try {
        log("Initializing PiP Manager...");
        await this.findPipButton();
        this.setupButton();
        this.attachEvents();
        this.isInitialized = true;
        await showNotification("PiP Manager", "Initialized successfully");
        log("PiP Manager initialized successfully");
      } catch (error) {
        log(`Failed to initialize PiP Manager: ${error.message}`, "error");
        await showNotification("PiP Manager", "Failed to initialize");
      }
    }

    /**
     * Find the PiP button in the DOM
     */
    async findPipButton() {
      try {
        this.pipButton = await waitForElement(this.buttonSelector);
        log("PiP button found");
      } catch (error) {
        throw new Error(`PiP button not found: ${error.message}`);
      }
    }

    /**
     * Setup the PiP button with custom SVG
     */
    setupButton() {
      if (!this.pipButton) {
        throw new Error("PiP button not available");
      }

      // Remove existing styles
      this.pipButton.removeAttribute("style");

      // Set the initial SVG
      this.updateButtonIcon();

      log("PiP button setup completed");
    }

    /**
     * Update the button icon based on current state
     */
    updateButtonIcon() {
      if (!this.pipButton) return;

      const pathData = this.isPipActive ? PIP_ICONS.exit : PIP_ICONS.enter;
      const fillColor = this.isPipActive
        ? this.colors.active
        : this.colors.inactive;

      const svgHtml = createSVG(pathData, { fill: fillColor });
      this.pipButton.innerHTML = svgHtml;
    }

    /**
     * Toggle PiP state manually
     */
    async togglePipState() {
      const video = document.querySelector("video");
      if (!video) {
        log("Video element not found", "error");
        return;
      }

      try {
        if (this.isPipActive) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } catch (error) {
        log(`Failed to toggle PiP: ${error.message}`, "error");
      }
    }

    /**
     * Handle enter PiP event
     */
    async handleEnterPip() {
      this.isPipActive = true;
      this.updateButtonIcon();
      await showNotification("Picture-in-Picture", "Entered PiP mode");
      log("Entered PiP mode");
    }

    /**
     * Handle leave PiP event
     */
    async handleLeavePip() {
      this.isPipActive = false;
      this.updateButtonIcon();
      await showNotification("Picture-in-Picture", "Left PiP mode");
      log("Left PiP mode");
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
      if (!this.pipButton) return;

      // Button click handler
      this.pipButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.togglePipState();
      });

      // Listen for actual PiP events to sync state
      this.listenForPipEvents();

      log("Event listeners attached");
    }

    /**
     * Listen for native PiP events to sync button state
     */
    listenForPipEvents() {
      const video = document.querySelector("video");
      if (!video) return;

      video.addEventListener(
        "enterpictureinpicture",
        this.eventHandlers.enterPip
      );
      video.addEventListener(
        "leavepictureinpicture",
        this.eventHandlers.leavePip
      );
    }

    /**
     * Manually set PiP state
     * @param {boolean} isActive - Whether PiP is active
     */
    async setPipState(isActive) {
      this.isPipActive = isActive;
      this.updateButtonIcon();
      await showNotification(
        "PiP State",
        `Set to ${isActive ? "Active" : "Inactive"}`
      );
      log(`PiP state set to: ${isActive ? "Active" : "Inactive"}`);
    }

    /**
     * Get current PiP state
     * @returns {boolean} Current PiP state
     */
    getPipState() {
      return this.isPipActive;
    }

    /**
     * Update button colors
     * @param {Object} colors - Color configuration
     */
    updateColors(colors) {
      this.colors = { ...this.colors, ...colors };
      this.updateButtonIcon();
      log("Button colors updated");
    }

    /**
     * Check if PiP Manager is initialized
     * @returns {boolean} Initialization status
     */
    isReady() {
      return this.isInitialized;
    }

    /**
     * Force reinitialize the manager
     */
    async reinitialize() {
      log("Reinitializing PiP Manager...");
      this.destroy();
      this.isInitialized = false;
      await this.init();
    }

    /**
     * Destroy the PiP manager (cleanup)
     */
    destroy() {
      if (this.pipButton) {
        // Remove click event listener
        this.pipButton.removeEventListener("click", this.togglePipState);
      }

      // Remove video event listeners
      const video = document.querySelector("video");
      if (video) {
        video.removeEventListener(
          "enterpictureinpicture",
          this.eventHandlers.enterPip
        );
        video.removeEventListener(
          "leavepictureinpicture",
          this.eventHandlers.leavePip
        );
      }

      this.pipButton = null;
      this.isPipActive = false;
      this.isInitialized = false;

      log("PiP Manager destroyed");
    }
  }

  // Export to global scope
  window.YouTubePipManager = PipManager;

  log("PiP Manager class loaded");
})(window);
