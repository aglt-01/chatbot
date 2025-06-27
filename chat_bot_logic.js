const chat = document.getElementById("chat");
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const sendIcon = document.getElementById('sendIcon');

let state = {
  started: false,
  name: null,
  numbers: null
};

let userTypingRow = null;

function addMessage(text, sender = "bot") {
  const row = document.createElement("div");
  row.className = "message-row";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = sender === "bot" ? "img/bot_avatar.png" : "img/user_avatar.png";
  avatar.alt = sender;

  const msg = document.createElement("div");
  msg.className = `chat-bubble ${sender}`;
  msg.textContent = text;

  row.appendChild(avatar);
  row.appendChild(msg);
  chat.prepend(row);
  chat.scrollTop = 0;
}

function showTyping(callback) {
  const row = document.createElement("div");
  row.className = "message-row";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = "img/bot_avatar.png";
  avatar.alt = "bot";

  const msg = document.createElement("div");
  msg.className = `chat-bubble bot`;

  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.innerHTML = "<span>.</span><span>.</span><span>.</span>";

  msg.appendChild(dots);
  row.appendChild(avatar);
  row.appendChild(msg);
  chat.prepend(row);
  chat.scrollTop = 0;

  setTimeout(() => {
    row.remove();
    callback();
  }, 1000);
}

function showTypingUser() {
  if (userTypingRow) return;

  const row = document.createElement("div");
  row.className = "message-row";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = "img/user_avatar.png";
  avatar.alt = "user";

  const msg = document.createElement("div");
  msg.className = `chat-bubble user`;

  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.innerHTML = "<span>.</span><span>.</span><span>.</span>";

  msg.appendChild(dots);
  row.appendChild(avatar);
  row.appendChild(msg);
  chat.prepend(row);
  chat.scrollTop = 0;

  userTypingRow = row;
}

function hideTypingUser() {
  if (userTypingRow) {
    userTypingRow.remove();
    userTypingRow = null;
  }
}

function handleBotResponse(inputText) {
  const trimmed = inputText.trim();

  if (trimmed === "/start") {
    state = { started: true, name: null, numbers: null };
    showTyping(() => addMessage("Привет, меня зовут Чат-бот, а как зовут тебя?"));
  }

  else if (trimmed.startsWith("/name:")) {
    if (!state.started) return addMessage("Введите команду /start, для начала общения");
    const name = trimmed.slice(6).trim();
    state.name = name;
    showTyping(() => addMessage(`Привет ${name}, приятно познакомиться. Я умею считать, введи числа которые надо посчитать`));
  }

  else if (trimmed.startsWith("/number:")) {
    if (!state.name) return addMessage("Введите команду /start, для начала общения");
    const nums = trimmed.slice(8).split(",").map(n => parseFloat(n.trim()));
    if (nums.length === 2 && nums.every(n => !isNaN(n))) {
      state.numbers = nums;
      showTyping(() => addMessage("Теперь введи действие: +, -, *, /"));
    } else {
      addMessage("Введите два корректных числа через запятую");
    }
  }

  else if (["+", "-", "*", "/"].includes(trimmed)) {
    if (!state.numbers) return addMessage("Сначала введите два числа командой /number:");
    const [a, b] = state.numbers;
    let result;
    switch (trimmed) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "*": result = a * b; break;
      case "/": result = b !== 0 ? (a / b).toFixed(2) : "деление на ноль"; break;
    }
    state.numbers = null;
    showTyping(() => addMessage(`Результат: ${result}`));
  }

  else if (trimmed === "/stop") {
    state = { started: false, name: null, numbers: null };
    showTyping(() => addMessage("Всего доброго, если хочешь поговорить пиши /start"));
  }

  else {
    showTyping(() => addMessage("Я не понимаю, введите другую команду!"));
  }
}


function updateSendButtonState() {
  const hasText = input.value.trim().length > 0;
  sendBtn.disabled = !hasText;
  sendBtn.classList.toggle("active", hasText);
  sendIcon.src = hasText ? "img/paper-plane-yellow.svg" : "img/paper-plane-grey.svg";
}


input.addEventListener("input", () => {
  updateSendButtonState();
  if (input.value.trim().length > 0) {
    showTypingUser();
  } else {
    hideTypingUser();
  }
});


sendBtn.addEventListener("mouseenter", () => {
  if (!sendBtn.disabled) {
    sendIcon.src = "img/paper-plane-yellow.svg";
  }
});

sendBtn.addEventListener("mouseleave", () => {
  updateSendButtonState();
});


sendBtn.addEventListener("click", () => {
  const value = input.value.trim();
  if (!value) return;
  hideTypingUser();
  addMessage(value, "user");
  handleBotResponse(value);
  input.value = "";
  updateSendButtonState();
});


input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !sendBtn.disabled) {
    e.preventDefault();
    sendBtn.click();
  }
});
