# Coding Standards

These guidelines apply to all projects to ensure clean, maintainable code that anyone can understand.

## Keep Things Organized (Separation of Concerns)

Each file and function should have one clear job - like having separate drawers for socks and shirts.

**In practice:**
- **HTML files** handle structure and content
- **CSS files** handle how things look
- **JavaScript files** handle how things work
- Each function does one specific task with a clear name

**Example:**
```javascript
// Good - one function, one job
function calculateTotal(items) { ... }
function displayTotal(total) { ... }

// Avoid - one function doing too many things
function calculateAndDisplayTotal(items) { ... }
```

## Don't Repeat Yourself (DRY Principle)

If you're writing the same code in multiple places, pull it out into a reusable function. Think of it like creating a recipe instead of writing out the same cooking steps every time.

**In practice:**
- Write code once, use it everywhere
- Create helper functions for common tasks
- If you copy-paste code, that's a sign to create a reusable function

**Example:**
```javascript
// Good - write once, use many times
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Then use it anywhere you need it
const videoTime = formatTime(125);
const audioTime = formatTime(87);

// Avoid - repeating the same logic
const videoMinutes = Math.floor(125 / 60);
const videoSecs = Math.floor(125 % 60);
// ... then doing it all again for audio
```

## Write for Humans (Clear Comments)

Comments should explain what's happening and why, using everyday language. Imagine explaining the code to someone who's never programmed before.

**Comment structure:**
1. **Section headers** - What is this group of code responsible for?
2. **Why explanations** - Why are we doing this?
3. **What descriptions** - What does this specific part do?

**In practice:**
```javascript
// ============================================
// AUDIO PLAYER CONTROLS
// This section handles play, pause, and skip
// ============================================

// Get the audio element so we can control it
const audio = document.querySelector('audio');

// When someone clicks play, start the music
playButton.addEventListener('click', () => {
  audio.play();
});

// Remember the volume setting so it stays the same next time
// We use localStorage (browser memory) to save this
function saveVolume(level) {
  localStorage.setItem('volume', level);
}
```

**Guidelines for comments:**
- Use plain language, no jargon
- Explain the "why" not just the "what"
- Use section dividers (=====) to break up different parts
- If someone without coding experience reads it, they should get the general idea

## File Organization

**Structure your files logically:**
- Group related functions together
- Put helper functions at the bottom or in a separate file
- Use clear, descriptive file names

**Example structure:**
```
/project
  index.html          ← Structure
  styles.css          ← Appearance
  script.js           ← Behavior
  /utils
    helpers.js        ← Reusable functions
```

## Naming Conventions

Use names that clearly describe what something does:
- `playButton` not `btn1`
- `calculatePlaybackTime()` not `calc()`
- `currentTrackIndex` not `idx`

Think of it like labeling moving boxes - future you (and others) will thank you for being specific.
