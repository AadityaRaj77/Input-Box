chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "typeToGemini") {
      sendToGemini(message.text);
    }
  });
  
  function sendToGemini(text) {
    setTimeout(() => {
      const geminiInput = document.querySelector('div[aria-label="Enter a prompt here"]');
      if (geminiInput) {
        geminiInput.innerText = text;
        geminiInput.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("✅ Text sent to Gemini:", text);
      } else {
        console.log("❌ Gemini input box not found.");
      }
    }, 500); 
  }
  