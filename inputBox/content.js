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

// content.js
/*console.log("🚀 content.js loaded");

// 1) Inject UI panels if not already present
(function setupPanels() {
  if (!document.getElementById("habitBox")) {
    const hb = document.createElement("div");
    hb.id = "habitBox";
    hb.style.cssText = `
      position: fixed; top:50%; left:50%;
      transform: translate(-50%,-50%);
      display: none; flex-direction: column; gap:6px;
      background: #fff; padding:12px; border:2px solid #00bcd4;
      border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);
      z-index:9999;
    `;
    hb.innerHTML = `
      <input id="habitInput" placeholder="Type & Sync to Gemini…" 
             style="width:300px;padding:6px;font-size:14px;" />
      <small style="color:#666;">Ctrl+Shift+K to toggle</small>
    `;
    document.body.appendChild(hb);
  }

  if (!document.getElementById("advBox")) {
    const ab = document.createElement("div");
    ab.id = "advBox";
    ab.style.cssText = `
      position: fixed; top:50%; left:50%;
      transform: translate(-50%,-50%);
      display: none; flex-direction: column; gap:6px;
      background: #fff; padding:12px; border:2px solid #555;
      border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);
      z-index:9999;
    `;
    ab.innerHTML = `
      <textarea id="advInput" rows="4" placeholder="CSS tweak or summarize prompt…" 
                style="width:300px;padding:6px;font-size:14px;"></textarea>
      <button id="advSend" style="padding:6px;">Send to Gemini API</button>
      <small style="color:#666;">Ctrl+Shift+A to toggle</small>
    `;
    document.body.appendChild(ab);
  }
})();

// 2) Habit Mode handlers
(function habitMode() {
  const input = document.getElementById("habitInput");
  if (!input) return;

  input.addEventListener("input", e => {
    const gem = document.querySelector('div[aria-label="Enter a prompt here"]');
    if (gem) {
      gem.innerText = e.target.value;
      gem.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const icon = document.querySelector("mat-icon.send-button-icon");
      const btn  = icon?.closest("button, [role='button']");
      if (btn) btn.click();
      else if (icon) icon.click();
    }
  });
})();

// 3) Advanced Mode handlers
(function advancedMode() {
  const sendBtn = document.getElementById("advSend");
  if (!sendBtn) return;

  sendBtn.addEventListener("click", async () => {
    let prompt = document.getElementById("advInput").value.trim();
    if (!prompt) return alert("Please enter a prompt.");

    if (/summarize/i.test(prompt)) {
      const pageText = Array.from(
        document.body.querySelectorAll("p, h1, h2, h3, li, span")
      ).map(el => el.innerText).join("\n").slice(0, 2000);
      prompt = `Summarize the following in 3 bullet points:\n\n${pageText}`;
    }

    const apiKey = await new Promise(r =>
      chrome.storage.sync.get("gemApiKey", res => r(res.gemApiKey))
    );
    if (!apiKey) {
      return alert("API key missing! Save it in Options.");
    }

    const MODEL    = "gemini-1.5-flash";
    const endpoint = 
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateText?key=${apiKey}`;

    try {
     // ── AFTER: proxy through background ──
     const result = await new Promise(resolve => {
      chrome.runtime.sendMessage(
        { action: "callGeminiAPI", prompt },
        response => resolve(response)
      );
    });
    
    
    if (result.error) {
      if (result.error === "missing_key") {
        return alert("⚠️ API key missing! Save it in Options.");
      }
    
      if (result.error === "bad_json") {
        console.error("⚠️ Bad JSON from Gemini:\n", result.raw);
        return alert("⚠️ Bad JSON response. See console for raw response.");
      }
    
      if (result.error === "empty_response") {
        return alert("⚠️ Empty response from Gemini.");
      }
    
      console.error("❌ API/network error:", result.error);
      return alert("❌ API/network error.");
    }
    
    
    const data = result.data;
    
  
      console.log("📝 Gemini response:", data);

      const reply = result.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (!reply) {
        return alert("⚠️ Empty response. Check console.");
      }

      if (reply.includes("{") && reply.includes("}")) {
        const style = document.createElement("style");
        style.innerText = reply;
        document.head.appendChild(style);
        alert("🎨 CSS applied!");
      } else {
        alert("🧠 Summary:\n\n" + reply);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network error. See console.");
    }
  });
})();

// 4) Listen for toolbar‑icon clicks
chrome.runtime.onMessage.addListener(msg => {
  if (msg.action === "toggleHabit") {
    document.getElementById("habitBox").style.display = "flex";
    document.getElementById("advBox").style.display   = "none";
  }
});

// 5) Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyK") {
    document.getElementById("habitBox").style.display = "flex";
    document.getElementById("advBox").style.display   = "none";
  }
  if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
    document.getElementById("advBox").style.display   = "flex";
    document.getElementById("habitBox").style.display = "none";
  }
});

*/


console.log("🚀 content.js loaded");

// Inject UI panels if not already present
(function setupPanels() {
  if (!document.getElementById("habitBox")) {
    const hb = document.createElement("div");
    hb.id = "habitBox";
    hb.style.cssText = `
      position: fixed; top:50%; left:50%;
      transform: translate(-50%,-50%);
      display: none; flex-direction: column; gap:6px;
      background: #fff; padding:12px; border:2px solid #00bcd4;
      border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);
      z-index:9999;
    `;
    hb.innerHTML = `
      <input id="habitInput" placeholder="Type & Sync to Gemini…" 
             style="width:300px;padding:6px;font-size:14px;" />
      <small style="color:#666;">Ctrl+Shift+K to toggle</small>
    `;
    document.body.appendChild(hb);
  }

  if (!document.getElementById("advBox")) {
    const ab = document.createElement("div");
    ab.id = "advBox";
    ab.style.cssText = `
      position: fixed; top:50%; left:50%;
      transform: translate(-50%,-50%);
      display: none; flex-direction: column; gap:6px;
      background: #fff; padding:12px; border:2px solid #555;
      border-radius:8px; box-shadow:0 4px 8px rgba(0,0,0,0.2);
      z-index:9999;
    `;
    ab.innerHTML = `
      <textarea id="advInput" rows="4" placeholder="Type CSS snippet or prompt…" 
                style="width:300px;padding:6px;font-size:14px;"></textarea>
      <button id="advSend" style="padding:6px;">Apply</button>
      <small style="color:#666;">Ctrl+Shift+A to toggle</small>
    `;
    document.body.appendChild(ab);
  }
})();

//Habit Mode handlers 
(function habitMode() {
  const input = document.getElementById("habitInput");
  if (!input) return;

  input.addEventListener("input", e => {
    const gem = document.querySelector('div[aria-label="Enter a prompt here"]');
    if (gem) {
      gem.innerText = e.target.value;
      gem.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const icon = document.querySelector("mat-icon.send-button-icon");
      const btn  = icon?.closest("button, [role='button']");
      if (btn) btn.click();
      else if (icon) icon.click();
    }
  });
})();

// Advanced Mode handlers ➞ CSS snippet injection + LLM fallback
(function advancedMode() {
  const sendBtn = document.getElementById("advSend");
  if (!sendBtn) return;

  sendBtn.addEventListener("click", () => {
    let prompt = document.getElementById("advInput").value.trim();
    if (!prompt) return alert("Please enter a prompt or CSS.");

    // If pasted raw CSS (contains a block), inject it directly
    if (/\{[\s\S]*\}/.test(prompt)) {
      const style = document.createElement("style");
      style.innerText = prompt;
      document.head.appendChild(style);
      return alert("🎨 CSS snippet applied!");
    }

    if (/summarize/i.test(prompt)) {
      const pageText = Array.from(
        document.body.querySelectorAll("p, h1, h2, h3, li, span")
      )
      .map(el => el.innerText)
      .join("\n")
      .slice(0, 2000);
      prompt = `Summarize the following in 3 bullet points:\n\n${pageText}`;
    }

    chrome.runtime.sendMessage(
      { action: "callLLM", prompt },
      response => {
        if (response.error) {
          console.error("LLM error:", response.error);
          return alert("❌ LLM Error: " + response.error);
        }

        const reply = response.data?.trim() || "";
        console.log("LLM raw reply:", reply);

        const cssMatch = reply.match(/```css\s*([\s\S]*?)```|{[\s\S]*}/i);
        if (cssMatch) {
          const cssText = cssMatch[1] || cssMatch[0];
          const style = document.createElement("style");
          style.innerText = cssText;
          document.head.appendChild(style);
          return alert("🎨 CSS applied via LLM!");
        }

        alert("🧠 LLM says:\n\n" + reply);
      }
    );
  });
})();

//Keyboard shortcuts
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyK") {
    document.getElementById("habitBox").style.display = "flex";
    document.getElementById("advBox").style.display   = "none";
  }
  if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
    document.getElementById("advBox").style.display   = "flex";
    document.getElementById("habitBox").style.display = "none";
  }
});
