import React, { useState, useEffect } from "react";
import "./popup.css";

const PopupEnhanced = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    autoStart: false,
    showNotifications: true,
  });
  const [status, setStatus] = useState({
    isInitialized: false,
    isPipActive: false,
    isVideoPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings and status when popup opens
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load settings
      const result = await chrome.storage.sync.get(["pipSettings"]);
      if (result.pipSettings) {
        setSettings(result.pipSettings);
      }

      // Get current status from content script
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, {
            type: "GET_STATUS",
          });
          if (response) {
            setStatus(response);
          }
        } catch (error) {
          console.log("Content script not ready or not on YouTube");
        }
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (newSettings) => {
    setSettings(newSettings);

    try {
      await chrome.storage.sync.set({ pipSettings: newSettings });

      // Send message to content script
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "SETTINGS_CHANGED",
          settings: newSettings,
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const reinitializeExtension = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: "REINITIALIZE",
        });

        // Refresh status after a short delay
        setTimeout(loadInitialData, 1000);
      }
    } catch (error) {
      console.error("Failed to reinitialize:", error);
    }
  };

  const startPipManager = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: "START_PIP_MANAGER",
        });

        // Refresh status after a short delay
        setTimeout(loadInitialData, 1000);
      }
    } catch (error) {
      console.error("Failed to start PiP Manager:", error);
    }
  };

  const togglePip = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: "TOGGLE_PIP",
        });

        // Refresh status after a short delay
        setTimeout(loadInitialData, 500);
      }
    } catch (error) {
      console.error("Failed to toggle PiP:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="popup-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <h1>YouTube PiP</h1>
        <div className="status-indicators">
          <span
            className={`status-dot ${status.isVideoPage ? "green" : "gray"}`}
            title={
              status.isVideoPage ? "On YouTube video page" : "Not on video page"
            }
          ></span>
          <span
            className={`status-dot ${status.isInitialized ? "blue" : "gray"}`}
            title={
              status.isInitialized
                ? "PiP Manager active"
                : "PiP Manager inactive"
            }
          ></span>
          <span
            className={`status-dot ${status.isPipActive ? "red" : "gray"}`}
            title={status.isPipActive ? "PiP mode active" : "PiP mode inactive"}
          ></span>
        </div>
      </div>

      {/* Status Display */}
      <div className="status-section">
        <div className="status-item">
          <span>Video Page:</span>
          <span className={status.isVideoPage ? "status-yes" : "status-no"}>
            {status.isVideoPage ? "Yes" : "No"}
          </span>
        </div>
        <div className="status-item">
          <span>PiP Manager:</span>
          <span className={status.isInitialized ? "status-yes" : "status-no"}>
            {status.isInitialized ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="status-item">
          <span>PiP Mode:</span>
          <span className={status.isPipActive ? "status-yes" : "status-no"}>
            {status.isPipActive ? "On" : "Off"}
          </span>
        </div>
      </div>

      <div className="settings">
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-title">Enable Extension</span>
            <span className="setting-desc">Turn on/off PiP functionality</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={() => handleToggle("enabled")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-title">Auto Start PiP Manager</span>
            <span className="setting-desc">
              Automatically initialize on page load
            </span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.autoStart}
              onChange={() => handleToggle("autoStart")}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-title">Show Notifications</span>
            <span className="setting-desc">
              Display PiP status notifications
            </span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showNotifications}
              onChange={() => handleToggle("showNotifications")}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="actions">
        {status.isVideoPage && settings.enabled && !status.isInitialized && (
          <button className="btn btn-primary" onClick={startPipManager}>
            Start PiP Manager
          </button>
        )}

        {status.isInitialized && (
          <button className="btn btn-secondary" onClick={togglePip}>
            {status.isPipActive ? "Exit PiP" : "Enter PiP"}
          </button>
        )}

        <button className="btn btn-outline" onClick={reinitializeExtension}>
          Reinitialize
        </button>
      </div>

      <div className="footer">
        <p>Version 1.0.0</p>
        {!status.isVideoPage && (
          <p className="warning">Navigate to a YouTube video to use PiP</p>
        )}
      </div>
    </div>
  );
};

export default PopupEnhanced;
