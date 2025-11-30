document.addEventListener("DOMContentLoaded", () => {
  // --- Important word fluctuation effect ---
  // Font weights available in EB Garamond
  const fontVariants = [
    { weight: 400, style: 'normal' },
    { weight: 500, style: 'normal' },
    { weight: 600, style: 'normal' },
    { weight: 700, style: 'normal' },
    { weight: 800, style: 'normal' },
    { weight: 400, style: 'italic' },
    { weight: 500, style: 'italic' },
    { weight: 600, style: 'italic' }
  ];

  function initImportantWords() {
    const importantWords = document.querySelectorAll(".important-word");
    const allLetterSpans = [];

    importantWords.forEach(el => {
      // Skip if already processed
      if (el.dataset.fluctuateInit) return;
      el.dataset.fluctuateInit = "true";

      const text = el.textContent;
      el.textContent = "";

      [...text].forEach(char => {
        if (char === " ") {
          // Preserve whitespace as text node (no animation needed)
          el.appendChild(document.createTextNode(" "));
        } else {
          const span = document.createElement("span");
          span.textContent = char;
          span.className = "important-word-letter";
          // Random animation delay between 0 and 2 seconds
          span.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
          // Set initial random font variant
          const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
          span.style.fontWeight = variant.weight;
          span.style.fontStyle = variant.style;
          el.appendChild(span);
          allLetterSpans.push(span);
        }
      });
    });

    // Cycle font variants randomly for each letter
    if (allLetterSpans.length > 0) {
      setInterval(() => {
        // Change a random subset of letters each cycle
        const numToChange = Math.max(1, Math.floor(allLetterSpans.length * 0.15));
        for (let i = 0; i < numToChange; i++) {
          const randomSpan = allLetterSpans[Math.floor(Math.random() * allLetterSpans.length)];
          const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
          randomSpan.style.fontWeight = variant.weight;
          randomSpan.style.fontStyle = variant.style;
        }
      }, 400);
    }
  }
  initImportantWords();

  // --- Matrix background on home.html ---
  const matrixEl = document.getElementById("matrixBg");
  if (matrixEl) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const computeDims = () => {
      const charWidth = 8;   // px approximation
      const charHeight = 14; // px approximation
      const cols = Math.max(40, Math.ceil(window.innerWidth / charWidth));
      const rows = Math.max(30, Math.ceil(window.innerHeight / charHeight));
      return { cols, rows };
    };

    let dims = computeDims();

    const randChar = () => chars[Math.floor(Math.random() * chars.length)];

    function buildMatrix() {
      dims = computeDims();
      const { cols, rows } = dims;
      let out = "";
      for (let r = 0; r < rows; r++) {
        let row = "";
        for (let c = 0; c < cols; c++) {
          row += randChar();
        }
        out += row + "\n";
      }
      matrixEl.textContent = out;
    }

    buildMatrix();
    window.addEventListener("resize", () => {
      buildMatrix();
    });
    setInterval(() => {
      // random flicker on a few positions
      const text = matrixEl.textContent.split("");
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < 0.02 && text[i] !== "\n") {
          text[i] = randChar();
        }
      }
      matrixEl.textContent = text.join("");
    }, 250);
  }

  
// --- Gallery lock state (home) ---
const galleryCard = document.getElementById("galleryCard");
if (galleryCard) {
  const unlocked = localStorage.getItem("galleryUnlocked") === "true";
  if (unlocked) {
    galleryCard.href = "gallery.html";
    galleryCard.classList.remove("locked");
  } else {
    galleryCard.href = "tictactoe.html";
    galleryCard.classList.add("locked");
  }
}

// --- Word game tile icon (home) ---
  const wordIcon = document.getElementById("wordgameIcon");
  if (wordIcon) {
    const setRandomChar = () => {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      wordIcon.textContent = chars[Math.floor(Math.random() * chars.length)];
    };
    setRandomChar();
    setInterval(setRandomChar, 180);
  }

  // --- Word game / story engine on wordgame.html ---
  const storyRoot = document.getElementById("wordgame-root");
  const textEl = document.getElementById("story-text");
  const inputsEl = document.getElementById("story-inputs");
  const choicesEl = document.getElementById("story-choices");

  if (storyRoot && textEl && inputsEl && choicesEl) {
    const storyState = {
      phase: "intro",
      user: { name: "", desc: "", place: "", object: "" },
      currentStoryId: null,
      currentNodeId: null
    };

    const stories = {
      doctor: {
        id: "doctor",
        title: "The Doctor Story",
        start: "doc_arrival",
        nodes: {
          doc_arrival: {
            text: `
You remember a time when you thought medicine might be your path.

The air in {{place}} was heavy the day you arrived. It felt like walking into a thought that someone forgot to finish.

The hospital sat at the edge of everything. Not clean, not dirty. Just working.

Dr. Wei Jinhai met you at the entrance. His posture was precise, like he had practiced standing still.

"Welcome," he said. "You're here to observe."

He studied your face for a moment.

"Do you know what you're doing?"

Before you answered, he added, almost under his breath:

"Traveling this far to figure that out is one way to do it."
            `,
            choices: [
              { label: "admit you don’t really know yet", next: "doc_ward" },
              { label: "say you’re prepared and hope it sounds true", next: "doc_ward" },
              { label: "ask why he took you on if he doubted you", next: "doc_ward" }
            ]
          },

          doc_ward: {
            text: `
You follow Dr. Wei down a narrow corridor.

The ward is quiet, except for the soft rhythm of machines and distant footsteps.

Patients rest behind thin curtains. Instruments stand in neat rows, waiting to be used.

"This place runs on patterns," Dr. Wei says. "Vitals, signs, shifts. You learn to read the room before you read the chart."

He adjusts a monitor. The numbers settle.

"The body volunteers for chaos," he adds. "Medicine is just us trying to keep up without pretending we're in control."
            `,
            choices: [
              { label: "ask how long it took him to learn that", next: "doc_delivery" },
              { label: "stay quiet and focus on every detail", next: "doc_delivery" },
              { label: "ask if he ever gets used to this environment", next: "doc_delivery" }
            ]
          },

          doc_delivery: {
            text: `
The first procedure you watch is a delivery.

The room starts out calm. The air feels thick but steady.

Dr. Wei checks the readings with small, careful movements.

"Most days are ordinary," he says, eyes on the monitors. "That's why people are surprised when they aren't."

For a while, everything follows the pattern he expects.

Then it doesn't.

A shift in the rhythm. A change in the patient's breathing. A low alarm. One of the nurses moves quickly, calling out numbers. The room adjusts around the moment.

You stay where you are, hands tense, eyes trying to follow too many things at once.

Dr. Wei's expression doesn't change much, but his focus sharpens.

He gives a short series of instructions. The team moves like they've practiced this exact emergency a hundred times, even if they haven't.

After a stretch of time that feels both long and short, the crisis eases. The sounds in the room soften.

Dr. Wei steps back, letting his shoulders settle.

"Medicine is not knowing everything," he says. "It's knowing what to do next when the part you thought you knew suddenly isn't enough."
            `,
            choices: [
              { label: "ask how he stays that calm when things go wrong", next: "doc_outside" },
              { label: "admit you froze and didn’t know what you would have done", next: "doc_outside" },
              { label: "stay silent and keep watching him work", next: "doc_outside" }
            ]
          },

          doc_outside: {
            text: `
Later, outside the hospital, the air feels different.

You sit on a worn bench. The sky over {{place}} is the color of a thought you can't finish.

Dr. Wei stands nearby, hands in his pockets, looking at nothing in particular.

"Some people come here to learn medicine," he says. "Some people come here to learn themselves. Both lessons are useful. Not everyone can carry both."

He is quiet for a moment.

"I've seen people stay for the wrong reasons," he adds. "And leave for the right ones."

He looks at you then—not judging, just measuring what you might do next.

"You don't have to decide everything today," he says. "But you do have to be honest when you do decide."
            `,
            choices: [
              { label: "tell him you don’t think this path is yours", next: "doc_end" },
              { label: "ask what he thinks you should do", next: "doc_end" },
              { label: "say nothing and stand up to leave", next: "doc_end" }
            ]
          },

          doc_end: {
            text: `
You remember leaving more clearly than you remember arriving.

You leave with no degree, no title, no proof you were ever there.

You leave with the knowledge that wanting to help is not the same as being built for that kind of work.

In the space where that path closes, something else becomes possible.

Dr. Wei's voice lingers at the edge of the memory:

"It was never about being right from the start. It was about being ready for what came after the moment you weren't."
            `,
            choices: [
              { label: "end chapter and return to the start", next: null }
            ]
          }
        }
      }
    };

    function escapeHtml(str) {
      return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderWithUserVars(text) {
      const u = storyState.user;
      let out = escapeHtml(text);

      const map = {
        "{{name}}": u.name || "you",
        "{{desc}}": u.desc || "someone still figuring things out",
        "{{place}}": u.place || "a place you chose once",
        "{{object}}": u.object || "an object you haven’t fully named yet"
      };

      Object.keys(map).forEach(key => {
        const value = escapeHtml(map[key]);
        const span = `<span class="story-var glitch-text-var">${value}</span>`;
        out = out.split(key).join(span);
      });

      out = out
        .split(/\\n\\s*\\n/g)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${p}</p>`)
        .join("");

      return out;
    }

    let glitchInterval = null;

    function initGlitch() {
      if (glitchInterval) {
        clearInterval(glitchInterval);
        glitchInterval = null;
      }

      const fontStacks = [
        "'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        "'IBM Plex Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
        "'Courier New', monospace",
        "Consolas, 'Liberation Mono', 'Courier New', monospace"
      ];

      const targets = document.querySelectorAll(".glitch-text-var");
      const spans = [];

      targets.forEach(el => {
        const text = el.textContent;
        el.textContent = "";
        [...text].forEach(ch => {
          const span = document.createElement("span");
          span.textContent = ch;
          span.className = "glitch-char";
          el.appendChild(span);
          spans.push(span);
        });
      });

      if (!spans.length) return;

      glitchInterval = setInterval(() => {
        spans.forEach(span => {
          if (Math.random() < 0.25) {
            const f = fontStacks[Math.floor(Math.random() * fontStacks.length)];
            span.style.fontFamily = f;
          }
        });
      }, 700);
    }

    function renderIntroForm() {
      storyState.phase = "intro";
      textEl.innerHTML = "<p>fill in a few fields to begin this run.</p>";
      inputsEl.innerHTML = `
        <label>name
          <input type="text" id="story-name" placeholder="your name or alias">
        </label>
        <label>describe yourself
          <textarea id="story-desc" rows="2" placeholder="a short description of you or your character"></textarea>
        </label>
        <label>a place
          <input type="text" id="story-place" placeholder="a real or imagined location">
        </label>
        <label>an object
          <input type="text" id="story-object" placeholder="something you could hold">
        </label>
      `;
      choicesEl.innerHTML = "";
      const startBtn = document.createElement("button");
      startBtn.className = "story-choice-btn";
      startBtn.textContent = "continue";
      startBtn.onclick = () => {
        const name = document.getElementById("story-name").value.trim();
        const desc = document.getElementById("story-desc").value.trim();
        const place = document.getElementById("story-place").value.trim();
        const object = document.getElementById("story-object").value.trim();
        storyState.user = { name, desc, place, object };
        startStory("doctor");
      };
      choicesEl.appendChild(startBtn);
    }

    function startStory(storyId) {
      storyState.phase = "play";
      storyState.currentStoryId = storyId;
      const story = stories[storyId];
      storyState.currentNodeId = story.start;
      renderCurrentNode();
    }

    function renderCurrentNode() {
      const story = stories[storyState.currentStoryId];
      const node = story.nodes[storyState.currentNodeId];
      inputsEl.innerHTML = "";
      choicesEl.innerHTML = "";

      textEl.innerHTML = renderWithUserVars(node.text);
      initGlitch();

      if (!node.choices || !node.choices.length) return;

      node.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.className = "story-choice-btn glitch-text-var";
        btn.textContent = choice.label;
        btn.onclick = () => {
          if (!choice.next) {
            // restart from intro
            renderIntroForm();
            return;
          }
          storyState.currentNodeId = choice.next;
          renderCurrentNode();
        };
        choicesEl.appendChild(btn);
      });
    }

    // initialize
    renderIntroForm();
  }

  // --- Tic-tac-toe gallery gate ---
  const tttBoard = document.getElementById("tttBoard");
  const tttStatus = document.getElementById("tttStatus");
  const tttModal = document.getElementById("tttWinModal");
  const tttWinOk = document.getElementById("tttWinOk");

  if (tttBoard && tttStatus && tttModal && tttWinOk) {
    // If already unlocked, go straight to gallery
    const alreadyUnlocked = localStorage.getItem("galleryUnlocked") === "true";
    if (alreadyUnlocked) {
      window.location.href = "gallery.html";
    } else {
      let board = Array(9).fill(null); // 'X' for player, 'O' for computer
      let gameOver = false;

      const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      function checkWinner(b) {
        for (const [a,b1,c] of wins) {
          if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
            return b[a];
          }
        }
        if (b.every(v => v)) return "draw";
        return null;
      }

      function updateStatus(msg) {
        tttStatus.textContent = msg || "";
      }

      function computerMove() {
        if (gameOver) return;
        const empties = board.map((v,i) => v ? null : i).filter(v => v !== null);
        if (!empties.length) return;
        const choice = empties[Math.floor(Math.random() * empties.length)];
        board[choice] = "O";
        const cell = tttBoard.querySelector('[data-index="' + choice + '"]');
        if (cell) cell.textContent = "O";

        const winner = checkWinner(board);
        if (winner === "O" || winner === "draw") {
          gameOver = true;
          // Losing or draw: kick back home with no unlock
          window.location.href = "home.html";
        }
      }

      function handleCellClick(e) {
        const cell = e.currentTarget;
        const idx = parseInt(cell.getAttribute("data-index"), 10);
        if (gameOver || board[idx]) return;

        board[idx] = "X";
        cell.textContent = "X";

        const winner = checkWinner(board);
        if (winner === "X") {
          gameOver = true;
          // Unlock gallery, show modal
          localStorage.setItem("galleryUnlocked", "true");
          tttModal.classList.remove("hidden");
          updateStatus("");
        } else if (winner === "draw") {
          // draw counts as loss: kick out
          gameOver = true;
          window.location.href = "home.html";
        } else {
          computerMove();
        }
      }

      tttBoard.querySelectorAll(".ttt-cell").forEach(cell => {
        cell.addEventListener("click", handleCellClick);
      });

      tttWinOk.addEventListener("click", () => {
        window.location.href = "home.html";
      });

      updateStatus("you are X. computer is O.");
    }
  }

  // --- Gallery gating on gallery.html ---
  const galleryImg = document.getElementById("galleryImage");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  if (galleryImg && prevBtn && nextBtn && Array.isArray(window.__GALLERY_IMAGES__)) {
    const unlocked = localStorage.getItem("galleryUnlocked") === "true";
    if (!unlocked) {
      window.location.href = "home.html";
    } else {
      let index = 0;
      const total = window.__GALLERY_IMAGES__.length;

      function updateImage() {
        const name = window.__GALLERY_IMAGES__[index];
        galleryImg.src = "images/" + name;
        galleryImg.alt = "image " + (index + 1) + " of " + total;
      }

      prevBtn.addEventListener("click", () => {
        index = (index - 1 + total) % total;
        updateImage();
      });

      nextBtn.addEventListener("click", () => {
        index = (index + 1) % total;
        updateImage();
      });

      updateImage();
    }
  }

});


// Fake reCAPTCHA logic

// Function triggered when client clicks [Verify]
function verifyCaptcha() {
    // On verify, go to main site
    window.location.href = "home.html";
}





let checkboxWindow = document.getElementById("fkrc-checkbox-window");
let checkboxBtn = document.getElementById("fkrc-checkbox");
let checkboxBtnSpinner = document.getElementById("fkrc-spinner");
let verifyWindow = document.getElementById("fkrc-verifywin-window");
let verifyWindowArrow = document.getElementById("fkrc-verifywin-window-arrow");
let verifyBtn = document.getElementById("fkrc-verifywin-verify-button");

function addCaptchaListeners() {
    if (checkboxBtn && verifyBtn) {
        document.addEventListener("click", function (event) {
            const path = event.path || (event.composedPath && event.composedPath()) || [];
            if (!path.includes(verifyWindow) && isVerifyWindowVisible()) {
                closeVerifyWindow();
            }
        });
        verifyBtn.addEventListener("click", function (event) {
            event.preventDefault();
            verifyBtn.disabled = true;
            verifyCaptcha();
        });
        checkboxBtn.addEventListener("click", function (event) {
            event.preventDefault();
            checkboxBtn.disabled = true;
            runClickedCheckboxEffects();
        });
    }
}
addCaptchaListeners();

function runClickedCheckboxEffects() {
    hideCaptchaCheckbox();
    setTimeout(function(){
        showCaptchaLoading();
    },500)
    setTimeout(function(){
        showVerifyWindow();
    },900)
}

function showCaptchaCheckbox() {
    checkboxBtn.style.width = "100%";
    checkboxBtn.style.height = "100%";
    checkboxBtn.style.borderRadius = "2px";
    checkboxBtn.style.margin = "21px 0 0 12px";
    checkboxBtn.style.opacity = "1";
}

function hideCaptchaCheckbox() {
    checkboxBtn.style.width = "4px";
    checkboxBtn.style.height = "4px";
    checkboxBtn.style.borderRadius = "50%";
    checkboxBtn.style.marginLeft = "25px";
    checkboxBtn.style.marginTop = "33px";
    checkboxBtn.style.opacity = "0";
}

function showCaptchaLoading() {
    checkboxBtnSpinner.style.visibility = "visible";
    checkboxBtnSpinner.style.opacity = "1";
}

function hideCaptchaLoading() {
    checkboxBtnSpinner.style.visibility = "hidden";
    checkboxBtnSpinner.style.opacity = "0";
}

function showVerifyWindow() {
    verifyWindow.style.display = "block";
    verifyWindow.style.visibility = "visible";
    verifyWindow.style.opacity = "1";
    verifyWindow.style.top = checkboxWindow.offsetTop - 80 + "px";
    verifyWindow.style.left =  checkboxWindow.offsetLeft + 54 + "px";

   if (verifyWindow.offsetTop < 5) {
       verifyWindow.style.top = "5px";
   }

   if (verifyWindow.offsetLeft + verifyWindow.offsetWidth > window.innerWidth-10 ) {
       verifyWindow.style.left =  checkboxWindow.offsetLeft - 8  + "px";
   } else {
       verifyWindowArrow.style.top = checkboxWindow.offsetTop + 24 + "px";
       verifyWindowArrow.style.left = checkboxWindow.offsetLeft + 45 + "px";
       verifyWindowArrow.style.visibility = "visible";
       verifyWindowArrow.style.opacity = "1";
   }
}

function closeVerifyWindow() {
    verifyWindow.style.display = "none";
    verifyWindow.style.visibility = "hidden";
    verifyWindow.style.opacity = "0";

    verifyWindowArrow.style.visibility = "hidden";
    verifyWindowArrow.style.opacity = "0";

    showCaptchaCheckbox();
    hideCaptchaLoading();
    checkboxBtn.disabled = false;
    verifyBtn.disabled = false;
}

function isVerifyWindowVisible() {
    return verifyWindow.style.display !== "none" && verifyWindow.style.display !== "";
}