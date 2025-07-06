// pipManager.js - PiP Manager Class

(function (window) {
  "use strict";

  // Get utilities from global scope
  const { PIP_ICONS, createSVG, waitForElement, log } = window.YouTubePipUtils;

  /**
   * YouTube Picture-in-Picture Manager
   */
  class PipManager {
    constructor() {
      this.pipButton = null;
      this.isPipActive = false;
      this.buttonSelector =
        "#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-pip-button.ytp-button";

      this.colors = {
        active: "#ff0000",
        inactive: "#fff",
      };

      this.init();
    }

    /**
     * Initialize the PiP manager
     */
    async init() {
      try {
        log("Initializing PiP Manager...");
        await this.findPipButton();
        this.setupButton();
        this.attachEvents();
        log("PiP Manager initialized successfully");
      } catch (error) {
        log(`Failed to initialize PiP Manager: ${error.message}`, "error");
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

      const svgHtml = createSVG(pathData, { fill: "#ff0000" });
      this.pipButton.innerHTML = svgHtml;
    }

    /**
     * Toggle PiP state
     */
    togglePipState() {
      this.isPipActive = !this.isPipActive;
      this.updateButtonIcon();
      log(`PiP state toggled: ${this.isPipActive ? "Active" : "Inactive"}`);
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
      if (!this.pipButton) return;

      this.pipButton.addEventListener("click", () => {
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

      video.addEventListener("enterpictureinpicture", () => {
        this.isPipActive = true;
        this.updateButtonIcon();
        log("Entered PiP mode");
      });

      video.addEventListener("leavepictureinpicture", () => {
        this.isPipActive = false;
        this.updateButtonIcon();
        log("Left PiP mode");
      });
    }

    /**
     * Manually set PiP state
     * @param {boolean} isActive - Whether PiP is active
     */
    setPipState(isActive) {
      this.isPipActive = isActive;
      this.updateButtonIcon();
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
     * Destroy the PiP manager (cleanup)
     */
    destroy() {
      if (this.pipButton) {
        // Remove event listeners
        const video = document.querySelector("video");
        if (video) {
          video.removeEventListener(
            "enterpictureinpicture",
            this.handleEnterPip
          );
          video.removeEventListener(
            "leavepictureinpicture",
            this.handleLeavePip
          );
        }
      }
      log("PiP Manager destroyed");
    }
  }

  // Export to global scope
  window.YouTubePipManager = PipManager;
})(window);
