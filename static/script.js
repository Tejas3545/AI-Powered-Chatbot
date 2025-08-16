const chatBox = document.getElementById("chat-box");
const inputEl  = document.getElementById("user-input");

// conversation log for save/export/restore
let chatHistory = [];

// format hh:mm (24h)
function nowTime(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

// append a message bubble; returns the bubble element
function appendMessage(role, text, withTime=true){
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;

  if(withTime){
    const ts = document.createElement("span");
    ts.className = "time";
    ts.textContent = nowTime();
    bubble.appendChild(ts);
  }

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  chatHistory.push({ role: role === "user" ? "You" : "Bot", text, time: nowTime() });
  return bubble;
}

// typing animation into an existing bubble
async function typeInto(bubble, fullText, speed=18){
  bubble.classList.add("typing");
  // keep timestamp pinned; we'll update content before the timestamp node
  const ts = bubble.querySelector(".time");
  if(ts) bubble.removeChild(ts);

  let out = "";
  for(let i=0;i<fullText.length;i++){
    out += fullText[i];
    bubble.textContent = out;
    chatBox.scrollTop = chatBox.scrollHeight;
    await new Promise(r => setTimeout(r, speed));
  }

  // re-attach timestamp at end
  if(ts){
    bubble.appendChild(ts);
    ts.textContent = nowTime();
  }else{
    const nts = document.createElement("span");
    nts.className = "time";
    nts.textContent = nowTime();
    bubble.appendChild(nts);
  }
  bubble.classList.remove("typing");

  // also fix the last log entry text if this bubble came from a placeholder
  const last = chatHistory[chatHistory.length-1];
  if(last && last.role === "Bot") last.text = fullText;
}

// send on Enter
inputEl.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){ sendMessage(); }
});

async function sendMessage(){
  const msg = inputEl.value.trim();
  if(!msg) return;

  appendMessage("user", msg);
  inputEl.value = "";

  // placeholder bot bubble (will animate)
  const placeholder = appendMessage("bot", "…");

  try{
    const res = await fetch("/get", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    const reply = data && data.reply ? String(data.reply) : "…";
    await typeInto(placeholder, reply, 14); // animate the reply
  }catch(err){
    await typeInto(placeholder, "⚠️ Network error. Is the server running?", 14);
  }
}

// controls
function clearChat(){
  chatBox.innerHTML = "";
  chatHistory = [];
  localStorage.removeItem("savedChat");
}

function saveChat(){
  localStorage.setItem("savedChat", JSON.stringify(chatHistory));
  // small confirmation note
  appendMessage("bot","✅ Chat saved locally.");
}

function exportChat(){
  const lines = chatHistory.map(m => `[${m.time}] ${m.role}: ${m.text}`);
  const blob = new Blob([lines.join("\n")], { type:"text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "chat_history.txt"; a.click();
  URL.revokeObjectURL(url);
}

// restore saved chat on load
(function restore(){
  const saved = localStorage.getItem("savedChat");
  if(!saved) return;
  try{
    const arr = JSON.parse(saved);
    for(const m of arr){
      const role = m.role === "You" ? "user" : "bot";
      const bubble = appendMessage(role, m.text, false);
      const ts = document.createElement("span");
      ts.className = "time";
      ts.textContent = m.time || nowTime();
      bubble.appendChild(ts);
    }
    appendMessage("bot","📦 Restored saved chat.");
  }catch(_){}
})();
