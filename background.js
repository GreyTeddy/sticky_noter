// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }).then(() => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (window.createStickyNote) {
          window.createStickyNote();
        }
      }
    });
  });
});
