// background.js - Service Worker for YouTube PiP Extension

console.log("[YouTube PiP] Background script loaded");

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[YouTube PiP] Extension installed");

    // Set default settings
    chrome.storage.sync.set({
      pipSettings: {
        enabled: true,
        autoStart: false,
        showNotifications: true,
      },
    });
  } else if (details.reason === "update") {
    console.log("[YouTube PiP] Extension updated");
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[YouTube PiP] Background received message:", message);

  switch (message.type) {
    case "GET_SETTINGS":
      chrome.storage.sync.get(["pipSettings"], (result) => {
        sendResponse(
          result.pipSettings || {
            enabled: true,
            autoStart: false,
            showNotifications: true,
          }
        );
      });
      return true; // Keep message channel open for async response

    case "SAVE_SETTINGS":
      chrome.storage.sync.set({ pipSettings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;

    case "SHOW_NOTIFICATION":
      if (message.title && message.message) {
        // Could implement chrome.notifications here if needed
        console.log(
          `[YouTube PiP] Notification: ${message.title} - ${message.message}`
        );
      }
      break;

    default:
      console.warn("[YouTube PiP] Unknown message type:", message.type);
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when the page has finished loading
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("youtube.com/watch")
  ) {
    console.log("[YouTube PiP] YouTube video page detected");

    // Could inject additional logic here if needed
    chrome.tabs
      .sendMessage(tabId, {
        type: "PAGE_READY",
        url: tab.url,
      })
      .catch(() => {
        // Content script might not be ready yet, ignore error
      });
  }
});

// Handle context menu (optional feature)
chrome.runtime.onStartup.addListener(() => {
  console.log("[YouTube PiP] Extension startup");
});

console.log("[YouTube PiP] Background script initialized");
