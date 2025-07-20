import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./popup.css";

const Popup = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    autoStart: false,
    showNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings when popup opens
  useEffect(() => {
    chrome.storage.sync.get(["pipSettings"], (result) => {
      if (result.pipSettings) {
        setSettings(result.pipSettings);
      }
      setIsLoading(false);
    });
  }, []);

  // Save settings
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    chrome.storage.sync.set({ pipSettings: newSettings });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "SETTINGS_CHANGED",
          settings: newSettings,
        });
      }
    });
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const reinitializeExtension = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "REINITIALIZE",
        });
      }
    });
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
        <button className="btn btn-primary" onClick={reinitializeExtension}>
          Reinitialize Extension
        </button>
      </div>

      <div className="footer">
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};

// Render the popup
const root = ReactDOM.createRoot(document.getElementById("popup-root"));
root.render(<Popup />);
