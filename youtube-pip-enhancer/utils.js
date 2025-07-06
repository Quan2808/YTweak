// utils.js - Utility functions for extension

(function (window) {
  "use strict";

  /**
   * SVG path data for PiP icons
   */
  const PIP_ICONS = {
    enter:
      "M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-1 2h-6v4h6v-4zM6.707 6.293l2.25 2.25L11 6.5V12H5.5l2.043-2.043-2.25-2.25 1.414-1.414z",
    exit: "M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-1 2h-6v4h6v-4zm-8.5-8L9.457 9.043l2.25 2.25-1.414 1.414-2.25-2.25L6 12.5V7h5.5z",
  };

  /**
   * Creates an SVG element with the given path and attributes
   * @param {string} pathData - SVG path data
   * @param {Object} attributes - SVG attributes
   * @returns {string} SVG HTML string
   */
  function createSVG(pathData, attributes = {}) {
    const defaultAttributes = {
      width: "100%",
      height: "100%",
      fill: "#fff",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      transform: "matrix(1, 0, 0, -1, 0, 0)",
      "stroke-width": "0.00024000000000000003",
    };

    const mergedAttributes = { ...defaultAttributes, ...attributes };

    const attributeString = Object.entries(mergedAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    return `
      <svg ${attributeString} style="transform: scale(0.62, -0.62); transition: all 0.7s">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path fill-rule="nonzero" d="${pathData}"></path>
          </g>
        </g>
      </svg>
    `;
  }

  /**
   * Waits for an element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>} Promise that resolves with the element
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Logs messages with a consistent format
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  function log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const prefix = "[YouTube PiP Extension]";

    switch (level) {
      case "warn":
        console.warn(`${prefix} ${timestamp}: ${message}`);
        break;
      case "error":
        console.error(`${prefix} ${timestamp}: ${message}`);
        break;
      default:
        console.log(`${prefix} ${timestamp}: ${message}`);
    }
  }

  // Export to global scope
  window.YouTubePipUtils = {
    PIP_ICONS,
    createSVG,
    waitForElement,
    debounce,
    log,
  };
})(window);
