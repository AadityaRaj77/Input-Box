console.log("content.js loaded"); 

chrome.runtime.onMessage.addListener((message) => {
  console.log("Message received in content.js:", message);  
  if (message.action === "typeToGemini") {
    sendToGemini(message.text);
  }
});

function sendToGemini(text) {
  console.log("sendToGemini called with:", text); 
  const geminiInput = document.querySelector('div[aria-label="Enter a prompt here"]');
  if (geminiInput) {
    geminiInput.innerText = text;
    geminiInput.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Text sent to Gemini:", text);
  } else {
    console.log("Gemini input box not found.");
  }
}

// Floating box injection + listener
;(function() {
  console.log("Injecting floating box"); 
  if (!document.getElementById('myFloatingBox')) {
    const floating = document.createElement('div');
    floating.id = 'myFloatingBox';
    floating.innerHTML = `<input id="floatingInput" placeholder="Type & Sync..." />`;
    document.body.appendChild(floating);
    console.log("Floating box injected");

    const input = floating.querySelector('#floatingInput');
    if (input) {
      input.addEventListener('input', (e) => {
        console.log("Floating input changed:", e.target.value);  
        sendToGemini(e.target.value);
      });
      console.log("Listener attached to floatingInput");
    } else {
      console.error("floatingInput element not found after injection!");
    }
  } else {
    console.log("myFloatingBox already exists");
  }
})();
