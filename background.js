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

// Listen for shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'create-sticky-note') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (window.createStickyNote) {
            window.createStickyNote();
          }
        }
      });
    });
  }
});
