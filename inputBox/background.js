// Listen for toolbar‑icon click ⇢ toggle Habit vs Advanced
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleMode" });
});
