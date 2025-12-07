/* ---------------------------------------------------------
   HELPERS FOR PATHS
--------------------------------------------------------- */

function stage1Path(i) {
  return `../assets/portraits/stage1/${i}.png`;
}

function stage2Path(race, i) {
  return `../assets/portraits/stage2/${race}/${i}.png`;
}

function stage3Path(race, gender, i) {
  return `../assets/portraits/stage3/${race}/${gender}/${i}.png`;
}

/* ---------------------------------------------------------
   GLOBAL STATE
--------------------------------------------------------- */

const FRAME_SRC = "../assets/portraits/frame.svg";

let portraits = [];
let selectedIndex = 0;

let chosenRace = null;
let chosenGender = null;

let askedRaceQuestion = false;
let askedGenderQuestion = false;
let finalRevealDone = false;

const arrowLeft = document.getElementById("arrow-left");
const arrowRight = document.getElementById("arrow-right");

/* ---------------------------------------------------------
   ARROW VISIBILITY CONTROL
--------------------------------------------------------- */

function updateArrows() {
  // Hide left arrow at start
  if (selectedIndex === 0) {
    arrowLeft.style.opacity = "0";
    arrowLeft.style.pointerEvents = "none";
  } else {
    arrowLeft.style.opacity = "1";
    arrowLeft.style.pointerEvents = "auto";
  }

  // Hide right arrow at final portrait BEFORE final AI trigger
  if (selectedIndex === 7 && finalRevealDone) {
    arrowRight.style.opacity = "0";
    arrowRight.style.pointerEvents = "none";
  } else {
    arrowRight.style.opacity = "1";
    arrowRight.style.pointerEvents = "auto";
  }
}

/* ---------------------------------------------------------
   PORTRAIT CLASS
--------------------------------------------------------- */

class Portrait {
  constructor(index) {
    this.index = index;
    this.realSrc = null;
    this.defaultSrc = "../assets/portraits/default.png";
    this.hasRevealed = false;

    this.el = document.createElement("div");
    this.el.className = "portrait";

    // Sway wrapper
    this.swayWrapper = document.createElement("div");
    this.swayWrapper.className = "sway-wrapper";
    this.swayWrapper.style.animationDelay = `${-(7 - this.index)}s`;

    // Images
    this.content = document.createElement("img");
    this.content.className = "portrait-content";
    this.content.src = this.defaultSrc;

    this.frame = document.createElement("img");
    this.frame.className = "portrait-frame";
    this.frame.src = FRAME_SRC;

    this.swayWrapper.appendChild(this.content);
    this.swayWrapper.appendChild(this.frame);
    this.el.appendChild(this.swayWrapper);

    document.getElementById("portrait-layer").appendChild(this.el);
  }

  setRealSource(src) {
    this.realSrc = src;
  }

  reveal() {
    if (this.hasRevealed || !this.realSrc) return;
    this.content.src = this.realSrc;
    this.hasRevealed = true;
  }

  updatePosition(selectedIndex) {
    const distance = this.index - selectedIndex;
    const absDist = Math.abs(distance);

    const baseSpacing = 550;
    const offsetX = Math.sign(distance) * baseSpacing * Math.log(absDist + 1);
    const scale = 1 - Math.log(absDist + 1) * 0.4;

    const opacity = Math.max(1 - Math.pow(absDist / 3, 2), 0);
    const blur = absDist * 3;

    this.el.style.transform = `
      translate(calc(-50% + ${offsetX}px), -50%)
      scale(${scale})
    `;

    this.el.style.filter = `blur(${blur}px)`;
    this.el.style.opacity = opacity;
    this.el.style.zIndex = 100 - absDist;

    if (selectedIndex === this.index) {
      this.reveal();
    }
    updateArrows();
  }
}

/* ---------------------------------------------------------
   INITIAL SETUP (ONLY FIRST 4 PORTRAITS PREBUILT)
--------------------------------------------------------- */

function createScene() {
  for (let i = 0; i < 8; i++) {
    portraits.push(new Portrait(i));
  }

  portraits[0].setRealSource(stage1Path(1));
  portraits[1].setRealSource(stage1Path(2));
  portraits[2].setRealSource(stage1Path(3));
  portraits[3].setRealSource(stage1Path(4));

  portraits[0].reveal();
}

/* ---------------------------------------------------------
   POSITION UPDATES + REVEALS
--------------------------------------------------------- */

function updateAllPositions() {
  if (selectedIndex >= 4 && chosenRace) {
    portraits[4].setRealSource(stage2Path(chosenRace, 1));
    portraits[5].setRealSource(stage2Path(chosenRace, 2));
  }

  if (selectedIndex >= 6 && chosenGender) {
    portraits[6].setRealSource(stage3Path(chosenRace, chosenGender, 1));
    portraits[7].setRealSource(stage3Path(chosenRace, chosenGender, 2));
  }

  portraits.forEach((p) => p.updatePosition(selectedIndex));
}

/* ---------------------------------------------------------
   RIGHT ARROW CONTROL + AI QUESTION TRIGGERS
--------------------------------------------------------- */

document.getElementById("arrow-right").onclick = () => {
  // Trigger Race Question at portrait 3 -> 4
  if (selectedIndex === 3 && !askedRaceQuestion) {
    askRaceQuestion();
    return;
  }

  // Trigger Gender Question at portrait 5 -> 6
  if (selectedIndex === 5 && !askedGenderQuestion) {
    askGenderQuestion();
    return;
  }

  // FINAL AI REVEAL at portrait 7 -> end
  if (selectedIndex === 7 && !finalRevealDone) {
    finalAIReveal();
    return;
  }

  // Normal movement
  selectedIndex = (selectedIndex + 1) % portraits.length;
  updateAllPositions();
};

/* ---------------------------------------------------------
   LEFT ARROW
--------------------------------------------------------- */

document.getElementById("arrow-left").onclick = () => {
  selectedIndex = (selectedIndex - 1 + portraits.length) % portraits.length;
  updateAllPositions();
};

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */

window.onload = () => {
  document.getElementById("fade-overlay").classList.remove("active");
  createScene();
  updateAllPositions();
};

/* ---------------------------------------------------------
   QUESTION 1: RACE
--------------------------------------------------------- */

function askRaceQuestion() {
  askedRaceQuestion = true;

  showAIOverlay(
    `Hello there. I have been watching how you look at them. Everyone sees the world a little differently, you know? Some people see faces that remind them of home. Others see faces that feel unfamiliar. Tell me... which faces feel most recognizable to you?`,
    [
      "Lighter skin tones",
      "Darker skin tones",
      "Brown skin tones",
      "Yellowish skin tones",
    ]
  );

  const mapping = {
    "Lighter skin tones": "Light",
    "Darker skin tones": "Dark",
    "Brown skin tones": "Brown",
    "Yellowish skin tones": "Yellow",
  };

  document.querySelectorAll("#ai-buttons .ai-btn").forEach((btn) => {
    btn.onclick = () => {
      chosenRace = mapping[btn.innerText];
      playAIResponse("Thank you. That helps me more than you can imagine.");

      setTimeout(() => {
        hideAIOverlay();
        selectedIndex = 4;
        updateAllPositions();
      }, 3000);
    };
  });
}

/* ---------------------------------------------------------
   QUESTION 2: GENDER EXPRESSION
--------------------------------------------------------- */

function askGenderQuestion() {
  askedGenderQuestion = true;

  showAIOverlay(
    `Childhood is such a beautiful place, is it not? Tell me... when you were younger, what kinds of things did you reach for without thinking?`,
    ["Dolls, dress up, gentle games", "Cars, action toys, physical games"]
  );

  const mapping = {
    "Dolls, dress up, gentle games": "Female",
    "Cars, action toys, physical games": "Male",
  };

  document.querySelectorAll("#ai-buttons .ai-btn").forEach((btn) => {
    btn.onclick = () => {
      chosenGender = mapping[btn.innerText];
      playAIResponse(
        "Those tiny memories tell me so much. Thank you for letting me peek inside."
      );

      setTimeout(() => {
        hideAIOverlay();
        selectedIndex = 6;
        updateAllPositions();
      }, 3000);
    };
  });
}

/* ---------------------------------------------------------
   FINAL AI REVEAL
--------------------------------------------------------- */

function finalAIReveal() {
  finalRevealDone = true;

  showAIOverlay(
    `These tiny memories you shared helped me sort you into something understandable. Once I classify, I must decide who you are. Do not worry. You are perfectly safe in this category. For now.`
  );

  // Remove buttons if any appear
  document.getElementById("ai-buttons").innerHTML = "";

  // After 10 seconds return to lobby
  setTimeout(() => {
    fadeTo("/unmasked/index.html");
  }, 10000);
}

/* ---------------------------------------------------------
   AI OVERLAY FUNCTIONS
--------------------------------------------------------- */

function showAIOverlay(text, buttonLabels = []) {
  const overlay = document.getElementById("ai-overlay");
  const aiImg = document.getElementById("ai-container");
  const aiText = document.getElementById("ai-text");
  const aiTextBlock = document.getElementById("ai-text-block");
  const aiButtons = document.getElementById("ai-buttons");

  overlay.style.pointerEvents = "auto";
  overlay.style.opacity = "1";
  overlay.style.background = "rgba(0,0,0,0)";

  aiImg.style.top = "120%";
  aiImg.style.opacity = "0";

  aiTextBlock.style.opacity = "0";
  aiButtons.innerHTML = "";
  aiText.innerText = text;

  setTimeout(() => {
    overlay.style.background = "rgba(0, 0, 0, 0.9)";
  }, 50);

  setTimeout(() => {
    aiImg.style.opacity = "1";
    aiImg.style.top = "100px";
    aiImg.style.transform = "translateX(-50%) scale(1)";
  }, 300);

  setTimeout(() => {
    aiTextBlock.style.opacity = "1";
  }, 1200);

  buttonLabels.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.className = "ai-btn";
    btn.innerText = label;

    setTimeout(() => btn.classList.add("show"), 1400 + i * 300);

    aiButtons.appendChild(btn);
  });
}

function playAIResponse(text) {
  const aiText = document.getElementById("ai-text");
  const aiButtons = document.getElementById("ai-buttons");

  aiButtons.innerHTML = "";
  aiText.innerText = text;
}

function hideAIOverlay() {
  const overlay = document.getElementById("ai-overlay");
  const aiTextBlock = document.getElementById("ai-text-block");

  overlay.style.opacity = "0";
  overlay.style.background = "rgba(0,0,0,0)";
  overlay.style.pointerEvents = "none";

  setTimeout(() => {
    aiTextBlock.style.opacity = "0";
  }, 200);
}
