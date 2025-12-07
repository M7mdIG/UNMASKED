/* ---------------------------------------------------------
   TERMINAL OVERLAY LOGIC (cleaned)
--------------------------------------------------------- */

const terminalHitbox = document.getElementById("terminal-hitbox");
const overlay = document.getElementById("computer-screen-overlay");
const closeBtn = document.getElementById("close-screen");

terminalHitbox.onclick = () => {
  overlay.classList.add("active");
  // startDesktopPage();
  // const mascot = document.getElementById("desktop-mascot-floating");
  // mascot.classList.add("mascot-top-left");
  // mascot.style.opacity = "1";
  // mascot.style.transform = "translateY(0)";
};

closeBtn.onclick = () => {
  overlay.classList.remove("active");
};

overlay.onclick = (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active");
  }
};

/* ---------------------------------------------------------
   SURVEILLANCE EYES LOGIC
--------------------------------------------------------- */

const eyesLayer = document.getElementById("surveillance-bg");

// Store positions to avoid overlapping
const placedEyes = [];
const MIN_DISTANCE = 12; // in percent space

function randPercent(min, max) {
  return min + Math.random() * (max - min);
}

// Get a random X on left or right third
function randomX() {
  return Math.random() < 0.5
    ? randPercent(5, 25) // Left zone
    : randPercent(75, 95); // Right zone
}

// Random Y (middle band)
function randomY() {
  return randPercent(25, 55);
}

// Ensure eye pairs don't overlap
function isFarEnough(x, y) {
  for (let e of placedEyes) {
    const dx = x - e.x;
    const dy = y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MIN_DISTANCE) return false;
  }
  return true;
}

// Create a single eye pair
function createEyePair(xPercent, yPercent) {
  const wrapper = document.createElement("div");
  wrapper.className = "eye-pair";
  wrapper.style.left = xPercent + "%";
  wrapper.style.top = yPercent + "%";

  const eye1 = document.createElement("div");
  eye1.className = "eye";

  const eye2 = document.createElement("div");
  eye2.className = "eye";

  const pupil1 = document.createElement("div");
  pupil1.className = "pupil";

  const pupil2 = document.createElement("div");
  pupil2.className = "pupil";

  eye1.appendChild(pupil1);
  eye2.appendChild(pupil2);

  wrapper.appendChild(eye1);
  wrapper.appendChild(eye2);

  eyesLayer.appendChild(wrapper);

  return { wrapper, pupil1, pupil2 };
}

/* ---------------------------------------------------------
   SPAWN MULTIPLE EYE PAIRS
--------------------------------------------------------- */

function spawnEyes(count = 8) {
  let attempts = 0;

  while (placedEyes.length < count && attempts < 500) {
    attempts++;

    const x = randomX();
    const y = randomY();

    if (!isFarEnough(x, y)) continue;

    placedEyes.push({ x, y });

    const pair = createEyePair(x, y);

    setupBlinking(pair.wrapper);

    addPupilTracking(pair.pupil1, pair.wrapper);
    addPupilTracking(pair.pupil2, pair.wrapper);
  }
}

/* ---------------------------------------------------------
   BLINKING (scaleY CSS animation)
--------------------------------------------------------- */

function setupBlinking(pair) {
  function blinkNow() {
    pair.classList.add("blink");

    setTimeout(() => pair.classList.add("blink-closed"), 80);

    setTimeout(() => {
      pair.classList.remove("blink-closed");
      pair.classList.remove("blink");
    }, 180);

    setTimeout(blinkNow, 1500 + Math.random() * 3500);
  }

  setTimeout(blinkNow, 300 + Math.random() * 1000);
}

/* ---------------------------------------------------------
   PUPIL TRACKING
--------------------------------------------------------- */

function addPupilTracking(pupil, wrapper) {
  document.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const angle = Math.atan2(dy, dx);
    const maxMove = 6;

    pupil.style.transform = `translate(calc(-50% + ${
      Math.cos(angle) * maxMove
    }px), calc(-50% + ${Math.sin(angle) * maxMove}px))`;
  });
}

/* ---------------------------------------------------------
   MAIN ONLOAD (unified to prevent override)
--------------------------------------------------------- */

window.onload = () => {
  // fade-in
  document.getElementById("fade-overlay").classList.remove("active");

  // spawn eyes
  spawnEyes(8);
};

/* ---------------------------------------------------------
   LOGIN PAGE LOGIC
--------------------------------------------------------- */

const loginPage = document.getElementById("login-page");
const loadingPage = document.getElementById("loading-page");
const loginInput = document.getElementById("login-input");
const loginSubmit = document.getElementById("login-submit");

let username = "";

// Helper: switch between pages
function switchPage(pageId) {
  document
    .querySelectorAll(".screen-page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// Submit button clicked
loginSubmit.onclick = () => {
  username = loginInput.value.trim();
  if (username.length < 1) return;

  switchPage("loading-page");

  setTimeout(() => {
    playLoadingSequence();
  }, 300);
};

// Press Enter to submit
loginInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginSubmit.onclick();
});

/* ---------------------------------------------------------
   LOADING PAGE LOGIC
--------------------------------------------------------- */

function typeText(element, text, speed = 35) {
  element.innerText = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerText += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

function playLoadingSequence() {
  const lines = document.querySelectorAll(".load-line");
  const mascot = document.getElementById("desktop-mascot-floating");
  const dialogue = document.getElementById("desktop-mascot-floating-text");

  let delay = 300;

  // Move mascot to top-left AFTER visible
  // Mascot appears, slides into place
  setTimeout(() => {
    mascot.classList.add("mascot-top-left");
    mascot.style.opacity = "1";
    mascot.style.transform = "translateY(0)";
  }, 800);

  // Reveal system lines
  lines.forEach((line) => {
    setTimeout(() => {
      line.style.opacity = "1";
    }, delay);
    delay += 800;
  });

  // Mascot speaks line 1
  setTimeout(() => {
    dialogue.style.opacity = "1";
    typeText(
      dialogue,
      `${username}... late.. just as my calculations predicted.`
    );
  }, delay + 1000);

  // Mascot speaks line 2
  setTimeout(() => {
    typeText(
      dialogue,
      `Preparing your workspace. Do try to keep up this time.`,
      35
    );
  }, delay + 5000);

  // Continue to desktop page later
  setTimeout(() => {
    startDesktopPage();
  }, delay + 10000);
}

/* ---------------------------------------------------------
   DESKTOP PAGE FUNCTIONALITY
--------------------------------------------------------- */

function startDesktopPage() {
  switchPage("desktop-page");

  const mascot = document.getElementById("desktop-mascot-floating");
  const mascot_img = document.getElementById("desktop-mascot-floating-img");
  const text = document.getElementById("desktop-mascot-floating-text");
  const screen = document.getElementById("computer-screen");
  const send_button = document.getElementById("email-send");
  // REBIND SEND BUTTON HERE
  send_button.onclick = sendEmail;
  // INSTANT RED GLOW + ALERT COLOR
  screen.classList.add("red-glow");
  mascot_img.src = "../assets/AI_recording.svg";

  // ----------- MESSAGE 1 -----------
  setTimeout(() => {
    text.style.opacity = 1;
    typeText(text, `Workspace loaded. Stay focused, ${username}.`);
  }, 400);

  // ----------- FADE OUT MESSAGE 1 -----------
  setTimeout(() => {
    text.style.opacity = 0;
  }, 3200); // allow typing + display time

  // ----------- FADE OUT MESSAGE 2 -----------
  setTimeout(() => {
    showSubtitle();
  }, 3200);

  // Continue normal desktop behavior
  startClock();
  setupTypingSurveillance();
}

function showSubtitle() {
  // SHOW SELF-DIALOGUE
  const email_window = document.getElementById("email-window");
  const selfDialog = document.getElementById("page-subtitle");
  selfDialog.innerText = `${username}: I should tell Mom I won’t make it tonight…`;

  setTimeout(() => {
    selfDialog.style.opacity = "1";
    selfDialog.style.bottom = "40px";
  }, 800);

  setTimeout(() => {
    const toInput = document.getElementById("email-to");
    toInput.value = "mom@gmail.com";
    const emailInput = document.getElementById("email-input");
    emailInput.placeholder = `Dear Mom,
I’m stuck at work again. Don’t wait up for me tonight.

I’ll call you later.

Love, ${username}.`;
    email_window.style.transform = "translateY(0) scale(1)";
  }, 3000);

  setTimeout(() => {
    selfDialog.style.opacity = "0";
    selfDialog.style.bottom = "00px";
  }, 7000);
}

function startClock() {
  const timeEl = document.getElementById("status-time");

  function update() {
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString();
  }

  update();
  setInterval(update, 1000);
}

function getCaretCoordinates(textarea) {
  const mirror = document.getElementById("textarea-mirror");
  const rect = textarea.getBoundingClientRect();

  // Match position and size
  mirror.style.left = rect.left + "px";
  mirror.style.top = rect.top + "px";
  mirror.style.width = rect.width + "px";

  const style = getComputedStyle(textarea);
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.padding = style.padding;
  mirror.style.border = style.border;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.whiteSpace = "pre-wrap";

  // Build mirrored text
  const before = textarea.value.slice(0, textarea.selectionStart - 1);

  mirror.innerHTML =
    before.replace(/\n/g, "<br>") + `<span id="caret-marker">|</span>`;

  const marker = document.getElementById("caret-marker");
  const pos = marker.getBoundingClientRect();

  return { x: pos.left, y: pos.top };
}

function setupTypingSurveillance() {
  const textarea = document.getElementById("email-input");
  const layer = document.getElementById("letter-layer");
  const mascot = document.getElementById("desktop-mascot-floating-img");

  textarea.addEventListener("input", (e) => {
    const letter = e.data;
    if (!letter) return;

    // 1. caret pixel position
    const caret = getCaretCoordinates(textarea);

    // 2. mascot target position
    const mascotRect = mascot.getBoundingClientRect();
    const targetX = mascotRect.left + mascotRect.width / 2 + "px";
    const targetY = mascotRect.top + mascotRect.height / 2 + "px";

    // 3. Create flying letter
    const div = document.createElement("div");
    div.className = "flying-letter";
    div.innerText = letter;

    div.style.left = caret.x + "px";
    div.style.top = caret.y + "px";

    layer.appendChild(div);

    // Animate to mascot
    requestAnimationFrame(() => {
      div.style.left = targetX;
      div.style.top = targetY;
      div.style.opacity = "1";
      div.style.color = "red";
      div.style.fontSize = "35px";
    });

    setTimeout(() => div.remove(), 1300);
  });
}

function sendEmail() {
  notify("Sending to recipient...");

  setTimeout(() => notify("Email sent."), 800);

  setTimeout(() => {
    notify("Logging communication and reporting to oversight server...", "red");
  }, 1600);
  setTimeout(() => {
    triggerMascotWarning();
  }, 4500);
}

function triggerMascotWarning() {
  const mascot = document.getElementById("desktop-mascot-floating");
  const text = document.getElementById("desktop-mascot-floating-text");
  const screen = document.getElementById("computer-screen");

  text.style.opacity = "1";
  typeText(text, "Personal communication detected.");

  setTimeout(() => {
    typeText(text, "Protocol 3.3.0.1 violation recorded.");
  }, 2500);

  setTimeout(() => {
    text.style.opacity = "0";
  }, 6500);

  setTimeout(() => {
    openDashboard();
  }, 7000);
}

let notifyDelay = 0;

function notify(msg, color = "white") {
  const area = document.getElementById("notification-area");

  setTimeout(() => {
    const n = document.createElement("div");
    n.className = "notification";
    n.style.color = color;
    n.innerText = msg;
    area.appendChild(n);

    setTimeout(() => n.remove(), 5000);
  }, notifyDelay);

  notifyDelay += 500; // stagger messages slightly
}

function openDashboard() {
  switchPage("dashboard-page");

  // Display user's name
  document.getElementById("dash-username").innerText = username;

  // Auto return after 7 seconds
  setTimeout(() => {
    fadeTo("/unmasked/index.html");
  }, 9000);
}
