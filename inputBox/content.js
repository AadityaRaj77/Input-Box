/*console.log("content.js loaded");

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

// Floating box injection  listener
; (function () {
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


document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyK') {
    const box = document.getElementById('myFloatingBox');
    if (box) {
      box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    }
  }
});*/


chrome.storage.sync.get("gemApiKey", res => {
  console.log("content.js sees gemApiKey =", res.gemApiKey);
});


let mode = "habit";

function createBox(id, html, baseStyles) {
  if (document.getElementById(id)) return;
  const box = document.createElement("div");
  box.id = id;
  Object.assign(box.style, baseStyles, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    background: "#fff",
    padding: "12px",
    border: "2px solid #00bcd4",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    zIndex: "9999",
    display: "none",
    flexDirection: "column",
    gap: "8px"
  });
  box.innerHTML = html;
  document.body.appendChild(box);
}

// 1) Habit Mode box
createBox("habitBox", `
  <input id="habitInput" placeholder="Type & Sync to Gemini…" style="width:300px;padding:6px;font-size:14px;" />
  <small>CtrlShiftK to toggle</small>
`, { display: "flex", alignItems: "center" });

// 2) Advanced Mode box
createBox("advBox", `
  <textarea id="advInput" rows="4" placeholder="Enter CSS tweak or “summarize” prompt…" 
            style="width:300px;padding:6px;font-size:14px;"></textarea>
  <button id="advSend">Send to Gemini API</button>
  <small>CtrlShiftA to toggle</small>
`, { display: "flex", alignItems: "stretch" });

// Handlers
document.getElementById("habitInput").addEventListener("input", e => {
  const text = e.target.value;
  const gem = document.querySelector('div[aria-label="Enter a prompt here"]');
  if (gem) {
    gem.innerText = text;
    gem.dispatchEvent(new Event("input", { bubbles: true }));
  }
});
document.getElementById("habitInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const icon = document.querySelector("mat-icon.send-button-icon");
    const btn = icon?.closest("button, [role='button']");
    btn ? btn.click() : icon?.click();
  }
});

document.getElementById("advSend").addEventListener("click", async () => {
  let userPrompt = document.getElementById("advInput").value.trim();

  if (/summarize/i.test(userPrompt)) {
    const pageText = Array.from(document.body.querySelectorAll("p, h1, h2, h3, li, span"))
      .map(el => el.innerText)
      .join("\n")
      .slice(0, 2000);
    userPrompt = `Summarize the following:\n\n${pageText}`;
  }

  const apiKey = await new Promise(resolve =>
    chrome.storage.sync.get("gemApiKey", res => resolve(res.gemApiKey))
  );

  if (!apiKey) {
    alert("API key missing! Save it in Options.");
    return;
  }

  console.log("Using key:", apiKey);
  console.log("Sending prompt:", userPrompt);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }]
    })
  });

  const data = await res.json();
  console.log("API response:", data);

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!reply) {
    alert("Empty response from Gemini. Check console for full API response.");
    return;
  }

  if (reply.includes("{") && reply.includes("}")) {
    const style = document.createElement("style");
    style.innerText = reply;
    document.head.appendChild(style);
    alert("CSS Applied!");
  } else {
    alert("Summary:\n\n" + reply);
  }
});



chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === "toggleMode") {
    // Switch mode
    mode = mode === "habit" ? "advanced" : "habit";
    document.getElementById("habitBox").style.display = mode === "habit" ? "flex" : "none";
    document.getElementById("advBox").style.display = mode === "advanced" ? "flex" : "none";
    console.log("Switched to", mode);
  }
});

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyK") {
    chrome.runtime.sendMessage({ action: "toggleMode" });
  }
  if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
    chrome.runtime.sendMessage({ action: "toggleMode" });
  }
});

