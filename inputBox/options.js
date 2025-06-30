// options.js
/*console.log("🚀 Options page loaded");
const input  = document.getElementById("apiKeyInput");
const save   = document.getElementById("saveBtn");
const status = document.getElementById("status");

// Load existing key
chrome.storage.sync.get("gemApiKey", res => {
  console.log("Loaded:", res);
  if (res.gemApiKey) {
    input.value = res.gemApiKey;
    status.textContent = "✅ Key loaded.";
  }
});

// Save on click
save.addEventListener("click", () => {
  const key = input.value.trim();
  if (!key) {
    status.textContent = "❌ Enter a valid key.";
    return;
  }
  chrome.storage.sync.set({ gemApiKey: key }, () => {
    console.log("Saved:", key);
    status.textContent = "✅ API key saved!";
  });
});
*/


console.log("🚀 Options page loaded");
const gemInput  = document.getElementById("gemApiInput");
const groqInput = document.getElementById("groqApiInput");
const saveBtn   = document.getElementById("saveBtn");
const status    = document.getElementById("status");

chrome.storage.sync.get(["gemApiKey", "groqApiKey"], res => {
  if (res.gemApiKey)  gemInput.value  = res.gemApiKey;
  if (res.groqApiKey) groqInput.value = res.groqApiKey;
  status.textContent = "✅ Keys loaded.";
});

saveBtn.addEventListener("click", () => {
  const gem = gemInput.value.trim();
  const groq = groqInput.value.trim();
  if (!groq) {
    status.textContent = "❌ Groq key is required.";
    return;
  }
  chrome.storage.sync.set(
    { gemApiKey: gem, groqApiKey: groq },
    () => {
      console.log("Saved keys:", { gem, groq });
      status.textContent = "✅ Keys saved!";
      setTimeout(() => status.textContent = "", 3000);
    }
  );
});

