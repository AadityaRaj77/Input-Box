document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("myInputBox");
    const saveBtn = document.getElementById("Save");
    const clearBtn = document.getElementById("Clear");
  
    if (!input || !saveBtn || !clearBtn) {
      console.error("❌ popup.js: Element(s) not found!", { input, saveBtn, clearBtn });
      return;
    }
  
    input.addEventListener("input", (e) => {
      const text = e.target.value;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "typeToGemini",
          text: text,
        });
      });
    });
    saveBtn.addEventListener("click", () => {
      const value = input.value;
      chrome.storage.sync.set({ savedPrompt: value }, () => {
        console.log("💾 Prompt saved:", value);
      });
    });
    clearBtn.addEventListener("click", () => {
      input.value = "";
      chrome.storage.sync.remove("savedPrompt", () => {
        console.log("🗑️ Prompt cleared");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "typeToGemini",
            text: "",
          });
        });
      });
    });
    chrome.storage.sync.get("savedPrompt", (result) => {
      if (result.savedPrompt) {
        input.value = result.savedPrompt;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "typeToGemini",
            text: result.savedPrompt,
          });
        });
      }
    });
  });
  