// Background service worker for side panel management

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Open the side panel for the current tab
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});

// Enable side panel on all tabs
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Form Filler installed successfully!');

  // Set side panel behavior to be available on all sites
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));
});

// Listen for messages from content script or side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('Content Script Log:', request.message);
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

console.log('Background service worker loaded');
