const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  appendMessage(message, "user");
  userInput.value = "";

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    appendMessage(data.reply, "ai");
  } catch (error) {
    appendMessage("Error: could not connect to SakhiAI server.", "ai");
  }
}

function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

document.getElementById("clearChat").onclick = () => {
  chatbox.innerHTML = "";
};
