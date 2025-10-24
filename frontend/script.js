const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const typingIndicator = document.getElementById("typingIndicator");
let isFirstMessage = true;
let conversationHistory = [];

// Enhanced send message function with typing indicator
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Hide empty state and suggestions on first message
  if (isFirstMessage) {
    const emptyState = chatbox.querySelector('.empty-state');
    const suggestions = chatbox.querySelector('.topic-suggestions');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    if (suggestions) {
      suggestions.style.display = 'none';
    }
    isFirstMessage = false;
  }

  // Show user message
  appendMessage(message, "user");
  userInput.value = "";
  userInput.disabled = true;

  // Show typing indicator
  showTypingIndicator();

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message,
        conversationHistory: conversationHistory 
      }),
    });

    const data = await res.json();
    
    // Hide typing indicator before showing response
    hideTypingIndicator();
    
    // Add slight delay for better UX
    setTimeout(() => {
      appendMessage(data.reply, "ai");
      userInput.disabled = false;
      userInput.focus();
    }, 300);
    
  } catch (error) {
    hideTypingIndicator();
    appendMessage("❌ Sorry, I'm having trouble connecting right now. Please try again in a moment.", "ai");
    userInput.disabled = false;
    userInput.focus();
  }
}

// Enhanced message append with formatting support
function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  
  const timestamp = new Date().toISOString();
  
  if (sender === 'ai') {
    // Format AI responses with proper structure
    msgDiv.innerHTML = formatAIResponse(text);
    
    // Add timestamp for AI messages
    const timeDisplay = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    msgDiv.setAttribute('data-time', timeDisplay);
  } else {
    // Keep user messages as plain text for security
    msgDiv.textContent = text;
  }
  
  // Save to conversation history
  conversationHistory.push({
    text: text,
    sender: sender,
    timestamp: timestamp
  });
  
  // Save to localStorage (privacy-first: only in browser)
  saveToLocalStorage();
  
  chatbox.appendChild(msgDiv);
  
  // Smooth scroll to bottom
  setTimeout(() => {
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

// Format AI responses with proper structure
function formatAIResponse(text) {
  // Escape HTML to prevent XSS, then apply formatting
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Format bold text (**text** or __text__)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Format italic text (*text* or _text_)
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Format numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<div class="list-item numbered">$1</div>');
  
  // Format bullet points (-, *, +)
  formatted = formatted.replace(/^[-*+]\s+(.+)$/gm, '<div class="list-item bullet">• $1</div>');
  
  // Format paragraphs (double line breaks)
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = '<p>' + formatted + '</p>';
  
  // Clean up empty paragraphs
  formatted = formatted.replace(/<p><\/p>/g, '');
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');
  
  // Format single line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

// Typing indicator functions
function showTypingIndicator() {
  typingIndicator.style.display = 'flex';
}

function hideTypingIndicator() {
  typingIndicator.style.display = 'none';
}

// Local storage functions (privacy-first)
function saveToLocalStorage() {
  try {
    localStorage.setItem('sakhiai-chat-history', JSON.stringify(conversationHistory));
  } catch (error) {
    console.log('Could not save to localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('sakhiai-chat-history');
    if (saved) {
      conversationHistory = JSON.parse(saved);
      restoreChat();
    }
  } catch (error) {
    console.log('Could not load from localStorage:', error);
    conversationHistory = [];
  }
}

function restoreChat() {
  if (conversationHistory.length > 0) {
    // Hide empty state and suggestions
    const emptyState = chatbox.querySelector('.empty-state');
    const suggestions = chatbox.querySelector('.topic-suggestions');
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    if (suggestions) {
      suggestions.style.display = 'none';
    }
    isFirstMessage = false;
    
    // Restore messages
    conversationHistory.forEach(msg => {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message", msg.sender);
      
      if (msg.sender === 'ai') {
        msgDiv.innerHTML = formatAIResponse(msg.text);
        const timeDisplay = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        msgDiv.setAttribute('data-time', timeDisplay);
      } else {
        msgDiv.textContent = msg.text;
      }
      
      chatbox.appendChild(msgDiv);
    });
    
    // Scroll to bottom
    setTimeout(() => {
      chatbox.scrollTop = chatbox.scrollHeight;
    }, 100);
  }
}

// Send suggestion function
function sendSuggestion(suggestion) {
  userInput.value = suggestion;
  sendMessage();
}

// Enhanced clear chat function
function clearChat() {
  chatbox.innerHTML = `
    <div class="empty-state">
      👋 Hi there! I'm SakhiAI, here to support and chat with you. How can I help today?
    </div>
    <div class="topic-suggestions" id="topicSuggestions">
      <p class="suggestions-title">💡 Quick topics to get started:</p>
      <div class="suggestion-buttons">
        <button class="suggestion-btn" onclick="sendSuggestion('How can I manage stress better?')">💆‍♀️ Stress Management</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Tips for work-life balance?')">⚖️ Work-Life Balance</button>
        <button class="suggestion-btn" onclick="sendSuggestion('How to build confidence?')">💪 Building Confidence</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Career advice for women?')">🚀 Career Advice</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Self-care tips for busy women?')">🌸 Self-Care</button>
        <button class="suggestion-btn" onclick="sendSuggestion('How to set healthy boundaries?')">🛡️ Setting Boundaries</button>
      </div>
    </div>
  `;
  conversationHistory = [];
  localStorage.removeItem('sakhiai-chat-history');
  isFirstMessage = true;
  userInput.focus();
}

// Event listeners
document.getElementById("clearChat").onclick = clearChat;

// Enhanced Enter key support (multiple event listeners for better compatibility)
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    // Don't call sendMessage here to avoid double sending
  }
});

// Theme toggle functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Update button icon
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Save preference
  localStorage.setItem('sakhiai-theme', newTheme);
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem('sakhiai-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }
}

// Daily affirmations
const affirmations = [
  "You are stronger than you think! 💪",
  "Your dreams are valid and achievable! ✨",
  "You deserve love, respect, and happiness! 💖",
  "Every challenge makes you wiser! 🌟",
  "You have the power to create positive change! 🌈",
  "Your voice matters and deserves to be heard! 🎤",
  "You are enough, just as you are! 🌸",
  "Today is full of new possibilities! 🌅",
  "You are capable of amazing things! 🚀",
  "Your kindness makes the world brighter! ☀️",
  "You are worthy of all good things! 🎁",
  "Your journey is unique and beautiful! 🦋",
  "You have overcome challenges before! 🏆",
  "Your potential is limitless! ⭐",
  "You bring joy to others just by being you! 😊"
];

function showDailyAffirmation() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem('sakhiai-affirmation-date');
  const savedAffirmation = localStorage.getItem('sakhiai-daily-affirmation');
  
  let todaysAffirmation;
  
  if (savedDate === today && savedAffirmation) {
    // Show same affirmation for the day
    todaysAffirmation = savedAffirmation;
  } else {
    // Get new affirmation for today
    const dayIndex = new Date().getDate() % affirmations.length;
    todaysAffirmation = affirmations[dayIndex];
    
    // Save for today
    localStorage.setItem('sakhiai-affirmation-date', today);
    localStorage.setItem('sakhiai-daily-affirmation', todaysAffirmation);
  }
  
  const affirmationText = document.getElementById('affirmationText');
  if (affirmationText) {
    affirmationText.textContent = todaysAffirmation;
  }
}

// Auto-focus input on page load and restore chat history
window.addEventListener('load', () => {
  loadTheme();
  showDailyAffirmation();
  loadFromLocalStorage();
  userInput.focus();
  
  // Add theme toggle event listener
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});
