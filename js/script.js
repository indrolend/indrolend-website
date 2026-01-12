document.addEventListener("DOMContentLoaded", () => {
  // --- Initialize Particle Page Transitions ---
  // Enable particle-based transitions for internal navigation
  if (typeof window.ParticleTransitionEngine !== 'undefined') {
    window.ParticleTransitionEngine.init({
      customBehaviors: window.ParticleTransitionEngine.behaviors
    });
  }

  // --- Ensure viewport starts at top on page load ---
  // Mobile browsers sometimes start mid-page after auto-deployment/reload
  // This ensures users see the header first, not the middle of the content
  window.scrollTo(0, 0);
  const homeContainer = document.querySelector(".home-container");
  if (homeContainer) {
    homeContainer.scrollTop = 0; // Reset internal scroll position if container is scrollable
  }

  // --- Home Page Fade-In Animation ---
  // Trigger fade-in animations when the home page loads
  const particlesBg = document.getElementById("particles-bg");
  if (particlesBg) {
    // Add fade-in class to particles background
    particlesBg.classList.add("fade-in");
    
    // Trigger fade-in for all elements with fade-in-element class
    const fadeElements = document.querySelectorAll(".fade-in-element");
    const ANIMATION_TRIGGER_DELAY = 50; // ms delay to ensure animation triggers after initial render
    fadeElements.forEach(el => {
      setTimeout(() => {
        el.classList.add("animate");
      }, ANIMATION_TRIGGER_DELAY);
    });
  }

  // --- Particles Background (replaces Matrix) ---
  const particlesCanvas = document.getElementById("particles-bg");
  if (particlesCanvas) {
    const ctx = particlesCanvas.getContext("2d");
    let particles = [];
    const particleCount = 60;
    const maxSpeed = 0.6; // Increased speed for better visual effect
    const particleColor = "rgba(94, 232, 125, 0.4)";
    const lineColor = "rgba(94, 232, 125, 0.1)";
    const connectionDistance = 120;
    
    // Mouse interaction settings (from particles.js)
    const mouse = {
      x: null,
      y: null
    };
    const repulseDistance = 150;
    const grabDistance = 150;
    const attractEnabled = false; // Set to true to enable particle-to-particle attraction
    const attractRotateX = 3000;
    const attractRotateY = 3000;
    const bounceEnabled = false; // Set to true to enable particle-to-particle bounce

    // Character pool: numbers (0-9), uppercase (A-Z), lowercase (a-z), symbols
    const charPool = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*?!+-=";

    function getRandomChar() {
      return charPool[Math.floor(Math.random() * charPool.length)];
    }

    function resizeCanvas() {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }

    function createParticle(x, y) {
      const size = Math.floor(Math.random() * 6 + 10); // Font size between 10-16px
      const vx = (Math.random() - 0.5) * maxSpeed;
      const vy = (Math.random() - 0.5) * maxSpeed;
      return {
        x: x !== undefined ? x : Math.random() * particlesCanvas.width,
        y: y !== undefined ? y : Math.random() * particlesCanvas.height,
        vx: vx,
        vy: vy,
        size: size,
        radius: size / 2, // Used for collision detection
        font: `${size}px "SF Mono", Menlo, Monaco, Consolas, monospace`, // Pre-cached font string
        char: getRandomChar(),
        // Each particle changes at its own random interval (300ms to 1500ms)
        changeInterval: Math.random() * 1200 + 300,
        lastChangeTime: performance.now()
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }

    function updateParticles() {
      const now = performance.now();
      particles.forEach((p, i) => {
        // Check for snake game target (Easter egg)
        let inSnakeGame = false;
        if (window.getSnakeParticleTarget && typeof window.getSnakeParticleTarget === 'function') {
          const target = window.getSnakeParticleTarget(p);
          if (target) {
            inSnakeGame = true;
            // Strong attraction to target during transitions
            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
              // Extremely strong attraction for instant snapping
              const attractionForce = 1.2;
              p.vx += (dx / distance) * attractionForce;
              p.vy += (dy / distance) * attractionForce;
              
              // Minimal dampening for maximum speed
              p.vx *= 0.95;
              p.vy *= 0.95;
              
              // Change char to square for game mode
              if (target.type === 'snake' && p.char !== '■') {
                p.char = '■';
              } else if (target.type === 'food' && p.char !== '●') {
                p.char = '●';
              }
            } else {
              // Very close to target - lock in place instantly
              p.vx *= 0.2;
              p.vy *= 0.2;
            }
          }
        }
        
        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls (gentler during snake game)
        if (inSnakeGame) {
          // Soft boundaries during game - wrap around instead
          if (p.x < 0) p.x = particlesCanvas.width;
          if (p.x > particlesCanvas.width) p.x = 0;
          if (p.y < 0) p.y = particlesCanvas.height;
          if (p.y > particlesCanvas.height) p.y = 0;
        } else {
          // Normal bounce when not in game
          if (p.x < 0 || p.x > particlesCanvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > particlesCanvas.height) p.vy *= -1;
        }

        // Change character at randomized intervals (only when not in snake game)
        if (!inSnakeGame && now - p.lastChangeTime >= p.changeInterval) {
          p.char = getRandomChar();
          p.lastChangeTime = now;
          // Randomize next change interval for natural variation
          p.changeInterval = Math.random() * 1200 + 300;
        }

        // Mouse repulse effect (from particles.js) - disabled during snake game
        // Physics formula: force = (1/r) * (-1 * (d/r)² + 1) * r * v
        // where r=repulseDistance, d=distance, v=velocity
        if (!inSnakeGame && mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < repulseDistance) {
            const normVec = { x: dx / distance, y: dy / distance };
            const velocity = 100;
            const repulseFactor = Math.max(0, Math.min(50, 
              (1 / repulseDistance) * (-1 * Math.pow(distance / repulseDistance, 2) + 1) * repulseDistance * velocity
            ));
            
            const newX = p.x + normVec.x * repulseFactor * 0.02;
            const newY = p.y + normVec.y * repulseFactor * 0.02;
            
            // Keep within bounds
            if (newX > 0 && newX < particlesCanvas.width) p.x = newX;
            if (newY > 0 && newY < particlesCanvas.height) p.y = newY;
          }
        }

        // Particle-to-particle interactions (disabled during snake game)
        if (!inSnakeGame) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Attract particles (from particles.js)
            if (attractEnabled && distance < connectionDistance) {
              const ax = dx / (attractRotateX * 1000);
              const ay = dy / (attractRotateY * 1000);
              p.vx -= ax;
              p.vy -= ay;
              p2.vx += ax;
              p2.vy += ay;
            }

            // Bounce particles off each other (from particles.js)
            if (bounceEnabled && distance <= p.radius + p2.radius) {
              p.vx = -p.vx;
              p.vy = -p.vy;
              p2.vx = -p2.vx;
              p2.vy = -p2.vy;
            }
          }
        }
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      // Check if we should hide particles during snake game play phase
      const gamePhase = window.getSnakeGamePhase && window.getSnakeGamePhase();
      const hideParticles = gamePhase === 'playing';
      
      if (hideParticles) {
        // Don't draw particles during active gameplay
        return;
      }

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Fade opacity based on distance (from particles.js)
            const opacity = (1 - distance / connectionDistance) * 0.1;
            if (opacity > 0) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(94, 232, 125, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw grab lines to cursor (from particles.js)
      if (mouse.x !== null && mouse.y !== null) {
        particles.forEach(p => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < grabDistance) {
            // Fade opacity based on distance
            const opacity = (1 - distance / grabDistance) * 0.4;
            if (opacity > 0) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(94, 232, 125, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        });
      }

      // Draw particles as characters
      ctx.fillStyle = particleColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      particles.forEach(p => {
        ctx.font = p.font;
        ctx.fillText(p.char, p.x, p.y);
      });
    }

    function animateParticles() {
      updateParticles();
      drawParticles();
      requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    // Expose reset function for Easter egg cleanup
    window.resetParticles = function() {
      const now = performance.now();
      particles.forEach(p => {
        p.char = getRandomChar();
        p.vx = (Math.random() - 0.5) * maxSpeed;
        p.vy = (Math.random() - 0.5) * maxSpeed;
        // Reset timing properties for consistent behavior
        p.lastChangeTime = now;
        p.changeInterval = Math.random() * 1200 + 300;
      });
    };

    // Mouse event listeners (from particles.js) - track on window level
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('click', (e) => {
      // Push mode: add new particles on click (from particles.js)
      const particlesToAdd = 4;
      for (let i = 0; i < particlesToAdd; i++) {
        particles.push(createParticle(e.clientX, e.clientY));
      }
    });

    window.addEventListener("resize", () => {
      resizeCanvas();
      initParticles();
    });
  }

  // --- App Cards Click Vibration Effects ---
  const appCards = document.querySelectorAll(".app-card");
  appCards.forEach(card => {
    // Add micro-interact class for button effects
    card.classList.add("micro-interact");

    // Vibration effect on click
    card.addEventListener("click", () => {
      card.classList.add("vibrating");
      setTimeout(() => card.classList.remove("vibrating"), 300);
    });
  });

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

  // Rainbow colors for button press effect
  const rainbowColors = [
    '#ff0000', // red
    '#ff7f00', // orange
    '#ffff00', // yellow
    '#00ff00', // green
    '#0000ff', // blue
    '#4b0082', // indigo
    '#9400d3'  // violet
  ];

  // Track which cards are hovered for faster font cycling
  const hoveredCards = new Set();

  function initImportantWords() {
    const importantWords = document.querySelectorAll(".important-word");
    const allLetterSpans = [];

    importantWords.forEach(el => {
      // Skip if already processed
      if (el.dataset.fluctuateInit) return;
      el.dataset.fluctuateInit = "true";

      const text = el.textContent;
      el.textContent = "";
      const letterSpansInWord = [];

      [...text].forEach((char, index) => {
        if (char === " ") {
          // Preserve whitespace as text node (no animation needed)
          el.appendChild(document.createTextNode(" "));
        } else {
          const span = document.createElement("span");
          span.textContent = char;
          span.className = "important-word-letter wavy-text-letter";
          span.dataset.originalColor = '';
          span.dataset.letterIndex = index;
          // Set animation delays: random for fluctuation, sequential for wavy effect
          const fluctuateDelay = (Math.random() * 2).toFixed(2);
          const wavyDelay = (index * 0.08).toFixed(2);
          span.style.animationDelay = `${fluctuateDelay}s, ${wavyDelay}s`;
          // Set initial random font variant
          const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
          span.style.fontWeight = variant.weight;
          span.style.fontStyle = variant.style;
          el.appendChild(span);
          allLetterSpans.push(span);
          letterSpansInWord.push(span);
        }
      });

      // Store letter spans on the element for easy access
      el._letterSpans = letterSpansInWord;
    });

    // Add button press interaction to app-cards (reusing appCards from above)
    appCards.forEach(card => {
      const importantWord = card.querySelector(".important-word");
      if (!importantWord || !importantWord._letterSpans) return;

      const letterSpans = importantWord._letterSpans;

      // Hover - track for faster font cycling
      card.addEventListener('mouseenter', () => {
        hoveredCards.add(card);
      });
      card.addEventListener('mouseleave', () => {
        hoveredCards.delete(card);
      });

      // Mouse/touch down - exploding firework effect with rainbow
      const activateEffect = (e) => {
        letterSpans.forEach((span, i) => {
          // Remove classes first to allow re-triggering
          span.classList.remove('rainbow-expand', 'exploding');
          
          // Force reflow to restart animation
          void span.offsetWidth;
          
          // Random explosion direction for firework effect
          const angle = (Math.PI * 2 * i) / letterSpans.length + (Math.random() - 0.5) * 0.5;
          const distance = 8 + Math.random() * 12; // 8-20px explosion distance
          const explodeX = Math.cos(angle) * distance;
          const explodeY = Math.sin(angle) * distance;
          
          span.style.setProperty('--explode-x', explodeX + 'px');
          span.style.setProperty('--explode-y', explodeY + 'px');
          span.classList.add('rainbow-expand', 'exploding');
          // Assign rainbow color based on position
          span.style.color = rainbowColors[i % rainbowColors.length];
        });
      };

      // Mouse/touch up - reset
      const deactivateEffect = () => {
        letterSpans.forEach(span => {
          span.classList.remove('rainbow-expand', 'exploding');
          span.style.color = '';
        });
      };

      // Mouse events
      card.addEventListener('mousedown', activateEffect);
      card.addEventListener('mouseup', deactivateEffect);
      card.addEventListener('mouseleave', deactivateEffect);

      // Touch events
      card.addEventListener('touchstart', activateEffect, { passive: true });
      card.addEventListener('touchend', deactivateEffect);
      card.addEventListener('touchcancel', deactivateEffect);
    });

    // Cycle font variants randomly for each letter
    // Normal speed cycle (every 400ms)
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

      // Fast font cycling for hovered cards (every 80ms - 5x faster)
      setInterval(() => {
        hoveredCards.forEach(card => {
          const importantWord = card.querySelector(".important-word");
          if (!importantWord || !importantWord._letterSpans) return;
          
          const letterSpans = importantWord._letterSpans;
          // Change more letters when hovered (40% instead of 15%)
          const numToChange = Math.max(1, Math.floor(letterSpans.length * 0.4));
          for (let i = 0; i < numToChange; i++) {
            const randomSpan = letterSpans[Math.floor(Math.random() * letterSpans.length)];
            const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
            randomSpan.style.fontWeight = variant.weight;
            randomSpan.style.fontStyle = variant.style;
          }
        });
      }, 80);
    }
  }
  initImportantWords();

  // --- (Matrix background removed, replaced by particles) ---

  
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

  // --- Tic-tac-toe gallery gate with advanced particle system ---
  const tttGameCanvas = document.getElementById("tttGameCanvas");

  if (tttGameCanvas) {
    // If already unlocked, go straight to gallery
    const alreadyUnlocked = localStorage.getItem("galleryUnlocked") === "true";
    if (alreadyUnlocked) {
      window.location.href = "gallery.html";
    } else {
      let board = Array(9).fill(null);
      let gameOver = false;
      let gameState = 'loading'; // 'loading', 'playing', 'celebrating', 'showing_message'

      const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      // Particle system
      const ctx = tttGameCanvas.getContext("2d");
      let particles = [];
      const guideDots = Array(9).fill(false);
      let clickRepulsion = null;
      let entranceComplete = false;
      
      // Constants for mobile detection and touch handling
      const MOBILE_BREAKPOINT_WIDTH = 768;
      const TOUCH_DEBOUNCE_MS = 300;
      
      // Detect mobile device for performance optimization
      // Primarily use screen width for layout decisions, with touch capability as secondary check
      function checkIsMobile() {
        const hasSmallScreen = window.innerWidth <= MOBILE_BREAKPOINT_WIDTH;
        const hasTouchCapability = navigator.maxTouchPoints > 0;
        return hasSmallScreen && hasTouchCapability;
      }
      
      let isMobile = checkIsMobile();
      
      function resizeCanvas() {
        tttGameCanvas.width = window.innerWidth;
        tttGameCanvas.height = window.innerHeight;
        
        // Update mobile detection on resize (handles device rotation)
        isMobile = checkIsMobile();
        
        // Update particle target positions when canvas resizes
        particles.forEach(p => {
          if (p.cellIndex != null) { // Check for both null and undefined
            const newCenter = getCellCenter(p.cellIndex);
            p.targetX = newCenter.x;
            p.targetY = newCenter.y;
          }
        });
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // Enhanced Particle class with micro-fluctuations
      class Particle {
        constructor(x, y, targetX, targetY, color, cellIndex, shape, isGuide = false) {
          this.x = x;
          this.y = y;
          this.targetX = targetX;
          this.targetY = targetY;
          this.vx = 0;
          this.vy = 0;
          this.color = color;
          this.radius = isGuide ? 3 : 2.5;
          this.cellIndex = cellIndex;
          this.shape = shape;
          this.isGuide = isGuide;
          this.returnForce = 0.04;
          this.damping = 0.88;
          this.maxSpeed = 10;
          // Micro fluctuations
          this.fluctuationPhase = Math.random() * Math.PI * 2;
          this.fluctuationSpeed = 0.02 + Math.random() * 0.03;
          this.fluctuationAmount = 0.3 + Math.random() * 0.7;
        }

        update() {
          // Micro fluctuations for "alive" effect - skip on mobile for performance
          if (!this.isGuide && gameState === 'playing' && !isMobile) {
            this.fluctuationPhase += this.fluctuationSpeed;
            const fluctX = Math.sin(this.fluctuationPhase) * this.fluctuationAmount;
            const fluctY = Math.cos(this.fluctuationPhase * 1.3) * this.fluctuationAmount;
            this.vx += fluctX * 0.01;
            this.vy += fluctY * 0.01;
          }

          // Click repulsion
          if (clickRepulsion) {
            const dx = this.x - clickRepulsion.x;
            const dy = this.y - clickRepulsion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100 && dist > 0) {
              const force = (100 - dist) / 100;
              const repel = clickRepulsion.strength * force;
              this.vx += (dx / dist) * repel;
              this.vy += (dy / dist) * repel;
            }
          }

          // Return to target
          const tdx = this.targetX - this.x;
          const tdy = this.targetY - this.y;
          this.vx += tdx * this.returnForce;
          this.vy += tdy * this.returnForce;

          // Damping
          this.vx *= this.damping;
          this.vy *= this.damping;

          // Speed limit
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
          }

          this.x += this.vx;
          this.y += this.vy;
        }

        draw() {
          ctx.save();
          ctx.fillStyle = this.color;
          ctx.shadowBlur = this.isGuide ? 8 : 15;
          ctx.shadowColor = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Calculate grid positions
      function getCellCenter(index) {
        const gridSize = Math.min(tttGameCanvas.width, tttGameCanvas.height) * 0.6;
        const cellSize = gridSize / 3;
        const startX = (tttGameCanvas.width - gridSize) / 2;
        const startY = (tttGameCanvas.height - gridSize) / 2;
        const row = Math.floor(index / 3);
        const col = index % 3;
        return {
          x: startX + col * cellSize + cellSize / 2,
          y: startY + row * cellSize + cellSize / 2
        };
      }

      function getCellIndex(x, y) {
        const gridSize = Math.min(tttGameCanvas.width, tttGameCanvas.height) * 0.6;
        const cellSize = gridSize / 3;
        const startX = (tttGameCanvas.width - gridSize) / 2;
        const startY = (tttGameCanvas.height - gridSize) / 2;
        const col = Math.floor((x - startX) / cellSize);
        const row = Math.floor((y - startY) / cellSize);
        if (col >= 0 && col < 3 && row >= 0 && row < 3) {
          return row * 3 + col;
        }
        return -1;
      }

      // Entrance animation - dots emerge from deep ocean
      function createEntranceAnimation() {
        gameState = 'loading';
        const bottomY = tttGameCanvas.height + 100;
        
        for (let i = 0; i < 9; i++) {
          const center = getCellCenter(i);
          const startX = center.x + (Math.random() - 0.5) * 50;
          
          setTimeout(() => {
            const particle = new Particle(
              startX, bottomY,
              center.x, center.y,
              'rgba(255, 255, 255, 0.6)',
              i, null, true
            );
            particle.returnForce = 0.02;
            particles.push(particle);
            guideDots[i] = true;
            
            if (i === 8) {
              setTimeout(() => {
                entranceComplete = true;
                gameState = 'playing';
              }, 2000);
            }
          }, i * 150);
        }
      }

      // Create X particles
      function createXParticles(index) {
        const center = getCellCenter(index);
        const size = Math.min(tttGameCanvas.width, tttGameCanvas.height) * 0.08;
        const color = 'rgba(109, 217, 232, 0.9)';
        // Reduce particle count on mobile for better performance
        const particleCount = isMobile ? 25 : 40;

        for (let i = 0; i < particleCount; i++) {
          const t = i / particleCount;
          let tx, ty;
          
          if (i < particleCount / 2) {
            tx = center.x - size/2 + size * (t * 2);
            ty = center.y - size/2 + size * (t * 2);
          } else {
            const t2 = (i - particleCount / 2) / (particleCount / 2);
            tx = center.x + size/2 - size * t2;
            ty = center.y - size/2 + size * t2;
          }
          particles.push(new Particle(center.x, center.y, tx, ty, color, index, 'X'));
        }
      }

      // Create O particles
      function createOParticles(index) {
        const center = getCellCenter(index);
        const radius = Math.min(tttGameCanvas.width, tttGameCanvas.height) * 0.05;
        const color = 'rgba(255, 140, 140, 0.9)';
        // Reduce particle count on mobile for better performance
        const particleCount = isMobile ? 22 : 35;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const tx = center.x + Math.cos(angle) * radius;
          const ty = center.y + Math.sin(angle) * radius;
          particles.push(new Particle(center.x, center.y, tx, ty, color, index, 'O'));
        }
      }


      // Rainbow explosion
      function createRainbowExplosion() {
        const colors = [
          'rgba(255, 0, 0, 0.9)',
          'rgba(255, 127, 0, 0.9)',
          'rgba(255, 255, 0, 0.9)',
          'rgba(0, 255, 0, 0.9)',
          'rgba(0, 0, 255, 0.9)',
          'rgba(75, 0, 130, 0.9)',
          'rgba(148, 0, 211, 0.9)'
        ];
        
        particles.forEach(p => {
          if (p.shape) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.returnForce = 0;
            p.damping = 0.95;
          }
        });
        
        // Redirect to home page after explosion animation
        setTimeout(() => {
          window.location.href = "home.html";
        }, 2000);
      }

      // Animation loop
      function animate() {
        // Use higher alpha during entrance for clean trails, then switch to lower for gameplay
        const alphaValue = gameState === 'loading' ? 0.5 : 0.15;
        ctx.fillStyle = `rgba(2, 6, 18, ${alphaValue})`;
        ctx.fillRect(0, 0, tttGameCanvas.width, tttGameCanvas.height);

        particles.forEach(p => {
          p.update();
          p.draw();
        });

        // Decay click repulsion
        if (clickRepulsion) {
          clickRepulsion.strength *= 0.92;
          if (clickRepulsion.strength < 0.1) {
            clickRepulsion = null;
          }
        }

        requestAnimationFrame(animate);
      }

      // Click handler
      function handleClick(x, y) {
        // During celebration, ignore clicks - auto-redirect will handle it
        if (gameState === 'celebrating') {
          return;
        }
        
        if (gameState !== 'playing' || gameOver) return;
        
        const idx = getCellIndex(x, y);
        if (idx === -1 || board[idx] || !guideDots[idx]) return;

        guideDots[idx] = false;
        particles = particles.filter(p => p.cellIndex !== idx || !p.isGuide);

        const center = getCellCenter(idx);
        clickRepulsion = { x: center.x, y: center.y, strength: 0.8 };

        board[idx] = "X";
        createXParticles(idx);

        const result = checkWinner(board);
        if (result) {
          handleGameEnd(result);
        } else {
          setTimeout(computerMove, 600);
        }
      }

      // Debounce flag and timeout ID to prevent multiple rapid taps
      let isProcessingTouch = false;
      let touchDebounceTimeout = null;

      tttGameCanvas.addEventListener('click', (e) => {
        handleClick(e.clientX, e.clientY);
      });

      tttGameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        // Prevent processing multiple touches at once
        if (isProcessingTouch) return;
        isProcessingTouch = true;
        
        const touch = e.touches[0];
        handleClick(touch.clientX, touch.clientY);
        
        // Clear any existing timeout before setting a new one
        clearTimeout(touchDebounceTimeout);
        
        // Reset after a short delay
        touchDebounceTimeout = setTimeout(() => {
          isProcessingTouch = false;
        }, TOUCH_DEBOUNCE_MS);
      }, { passive: false });

      function checkWinner(b) {
        for (const [a, b1, c] of wins) {
          if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
            return { winner: b[a], line: [a, b1, c] };
          }
        }
        if (b.every(v => v)) return { winner: "draw", line: null };
        return null;
      }

      function highlightWinningLine(line) {
        if (line) {
          line.forEach(idx => {
            particles.forEach(p => {
              if (p.cellIndex === idx && !p.isGuide) {
                p.radius = 3.5;
              }
            });
          });
        }
      }

      function computerMove() {
        if (gameOver) return;
        const empties = board.map((v, i) => v ? null : i).filter(v => v !== null);
        if (!empties.length) return;

        const choice = empties[Math.floor(Math.random() * empties.length)];
        guideDots[choice] = false;
        particles = particles.filter(p => p.cellIndex !== choice || !p.isGuide);

        const center = getCellCenter(choice);
        clickRepulsion = { x: center.x, y: center.y, strength: 0.8 };

        board[choice] = "O";
        createOParticles(choice);

        const result = checkWinner(board);
        if (result) {
          handleGameEnd(result);
        }
      }

      function handleGameEnd(result) {
        gameOver = true;
        
        if (result.winner === "X") {
          highlightWinningLine(result.line);
          setTimeout(() => {
            localStorage.setItem("galleryUnlocked", "true");
            gameState = 'celebrating';
            createRainbowExplosion();
          }, 1000);
        } else if (result.winner === "O") {
          highlightWinningLine(result.line);
          setTimeout(() => {
            window.location.href = "home.html";
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.href = "home.html";
          }, 1500);
        }
      }

      // Start
      animate();
      createEntranceAnimation();
    }
  }

  // --- Gallery gating on gallery.html ---
  const galleryFileName = document.getElementById("galleryFileName");
  const galleryFileLink = document.getElementById("galleryFileLink");
  const galleryCounter = document.getElementById("galleryCounter");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");

  if (galleryFileName && galleryFileLink && prevBtn && nextBtn && Array.isArray(window.__GALLERY_IMAGES__)) {
    const unlocked = localStorage.getItem("galleryUnlocked") === "true";
    if (!unlocked) {
      window.location.href = "home.html";
    } else {
      const images = window.__GALLERY_IMAGES__;
      let currentIndex = 0;

      function updateDisplay() {
        const name = images[currentIndex];
        galleryFileName.textContent = name;
        galleryFileLink.href = "../images/" + name;
        galleryCounter.textContent = (currentIndex + 1) + " / " + images.length;
        
        // Re-initialize important-word effect for the filename
        initGalleryFilename();
      }

      // Initialize fluctuating text effect for gallery filename with color cycling
      function initGalleryFilename() {
        const el = galleryFileName;
        // Clear previous spans
        el.dataset.fluctuateInit = "";
        const text = el.textContent;
        el.textContent = "";

        // Add color cycling class
        el.classList.add("color-cycle");

        [...text].forEach((char, index) => {
          if (char === " ") {
            el.appendChild(document.createTextNode(" "));
          } else {
            const span = document.createElement("span");
            span.textContent = char;
            span.className = "important-word-letter wavy-text-letter";
            span.style.animationDelay = (Math.random() * 2).toFixed(2) + "s, " + (index * 0.08).toFixed(2) + "s";
            const variant = fontVariants[Math.floor(Math.random() * fontVariants.length)];
            span.style.fontWeight = variant.weight;
            span.style.fontStyle = variant.style;
            el.appendChild(span);
          }
        });

        el.dataset.fluctuateInit = "true";
      }

      prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateDisplay();
      });

      nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateDisplay();
      });

      // Keyboard navigation
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          updateDisplay();
        } else if (e.key === "ArrowRight") {
          currentIndex = (currentIndex + 1) % images.length;
          updateDisplay();
        }
      });

      // Initialize
      updateDisplay();
    }
  }

  // --- Initialize Spotify Data ---
  // Check if spotify integration is loaded and initialize
  if (typeof window.initSpotifyData === 'function') {
    window.initSpotifyData();
  }
  
  // --- Initialize Spotify Analytics ---
  // Check if spotify analytics is loaded and initialize
  if (typeof window.initSpotifyAnalytics === 'function') {
    window.initSpotifyAnalytics();
  }
});


// Fake reCAPTCHA logic

// Function triggered when client clicks [Verify]
function verifyCaptcha() {
    // On verify, go to main site
    window.location.href = "pages/home.html";
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

// --- Glitchy Development History Button ---
// Show the glitchy button if all Asymptote Engine upgrades have been purchased
function checkGlitchyButton() {
  const glitchyBtn = document.getElementById('glitchy-dev-history-btn');
  if (glitchyBtn) {
    const allUpgradesPurchased = localStorage.getItem('asymptote_all_upgrades_purchased');
    if (allUpgradesPurchased === 'true') {
      glitchyBtn.style.display = 'inline-block';
    }
  }
}
checkGlitchyButton();