// Utility functions for YouTube PiP Extension

(function (window) {
  "use strict";

  // PiP Icons (SVG path data)
  const PIP_ICONS = {
    enter:
      "M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z",
    exit: "M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM16 13h2v2h-2zm0-6h2v2h-2z",
  };

  /**
   * Create SVG element from path data
   * @param {string} pathData - SVG path data
   * @param {Object} options - Options for SVG creation
   * @returns {string} SVG HTML string
   */
  function createSVG(pathData, options = {}) {
    const defaults = {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "#fff",
    };

    const config = { ...defaults, ...options };

    return `
      <svg width="${config.width}" height="${config.height}" viewBox="${config.viewBox}">
        <path d="${pathData}" fill="${config.fill}"></path>
      </svg>
    `;
  }

  /**
   * Wait for an element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>} Found element
   */
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within timeout`));
      }, timeout);
    });
  }

  /**
   * Debounce function to limit function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Logging utility with prefix
   * @param {string} message - Log message
   * @param {string} level - Log level (log, error, warn)
   */
  function log(message, level = "log") {
    const prefix = "[YouTube PiP]";
    console[level](`${prefix} ${message}`);
  }

  /**
   * Get extension settings from storage
   * @returns {Promise<Object>} Extension settings
   */
  async function getSettings() {
    try {
      const result = await chrome.storage.sync.get(["pipSettings"]);
      return (
        result.pipSettings || {
          enabled: true,
          autoStart: false,
          showNotifications: true,
        }
      );
    } catch (error) {
      log(`Failed to get settings: ${error.message}`, "error");
      return {
        enabled: true,
        autoStart: false,
        showNotifications: true,
      };
    }
  }

  /**
   * Save extension settings to storage
   * @param {Object} settings - Settings to save
   * @returns {Promise<void>}
   */
  async function saveSettings(settings) {
    try {
      await chrome.storage.sync.set({ pipSettings: settings });
      log("Settings saved successfully");
    } catch (error) {
      log(`Failed to save settings: ${error.message}`, "error");
    }
  }

  /**
   * Show notification if enabled
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  async function showNotification(title, message) {
    const settings = await getSettings();
    if (!settings.showNotifications) return;

    log(`${title}: ${message}`);
  }

  /**
   * Check if current page is YouTube video page
   * @returns {boolean} True if on YouTube video page
   */
  function isYouTubeVideoPage() {
    return (
      window.location.hostname === "www.youtube.com" &&
      window.location.pathname === "/watch" &&
      window.location.search.includes("v=")
    );
  }

  /**
   * Wait for YouTube player to be ready
   * @returns {Promise<Element>} YouTube player element
   */
  function waitForYouTubePlayer() {
    return waitForElement("#movie_player");
  }

  // Export utilities to global scope
  window.YouTubePipUtils = {
    PIP_ICONS,
    createSVG,
    waitForElement,
    debounce,
    log,
    getSettings,
    saveSettings,
    showNotification,
    isYouTubeVideoPage,
    waitForYouTubePlayer,
  };

  log("YouTube PiP Utils loaded");
})(window);
