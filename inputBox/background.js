// Listen for toolbar‑icon click ⇢ toggle Habit vs Advanced
/*console.log("📦 Background script loaded");

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleMode" });
});



// background.js

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "callGeminiAPI") {
    chrome.storage.sync.get("gemApiKey", async ({ gemApiKey }) => {
      if (!gemApiKey) return sendResponse({ error: "missing_key" });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${gemApiKey}`;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: msg.prompt }],
                role: "user"
              }
            ]
          })
        });

        const raw = await res.text();
        console.log("📦 Raw body:", raw);

        if (!raw || raw.trim() === "") {
          return sendResponse({ error: "empty_response" });
        }

        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          return sendResponse({ error: "bad_json", raw });
        }

        return sendResponse({ data: parsed });
      } catch (err) {
        console.error("❌ Fetch error:", err);
        return sendResponse({ error: err.message });
      }
    });

    return true;
  }
});*/

console.log("📦 Background script loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "callLLM") {
    chrome.storage.sync.get("groqApiKey", async ({ groqApiKey }) => {
      if (!groqApiKey) return sendResponse({ error: "missing_key" });

      const endpoint = "https://api.groq.com/openai/v1/chat/completions";
      const payload = {
        model: "llama3-8b-8192",        // or choose your preferred Groq model
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user",   content: msg.prompt }
        ],
        max_tokens: 512,
        temperature: 0.7
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`
          },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("📦 Groq raw response:", json);

        if (!json.choices || !json.choices.length) {
          return sendResponse({ error: "empty_response" });
        }

        // Groq’s chat API returns the assistant reply here:
        const reply = json.choices[0].message?.content?.trim();
        if (!reply) {
          return sendResponse({ error: "empty_response" });
        }

        return sendResponse({ data: reply });
      } catch (err) {
        console.error("❌ Groq fetch error:", err);
        return sendResponse({ error: err.message });
      }
    });

    return true;
  }
});
