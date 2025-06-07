// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Execute the content script in the active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      if (window.createStickyNote) {
        window.createStickyNote();
      }
    }
  });
});
