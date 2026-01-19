-- Seed: jQuery blog post
-- Adds the first blog post about jQuery and its influence on modern web development

INSERT INTO blog_posts (
  slug,
  title,
  excerpt,
  content,
  category,
  tags,
  status,
  source,
  author_name
) VALUES (
  'jquery-shaped-modern-web',
  'JQuery: Understanding the Library That Shaped Modern Web Development',
  'If you''ve built anything with React, Vue, or even vanilla JavaScript in the last few years, you''ve benefited from JQuery. Even if you''ve never written a single $ in your life.',
  $content$If you've built anything with React, Vue, or even vanilla JavaScript in the last few years, you've benefited from JQuery. Even if you've never written a single `$` in your life.

I'm going to be honest: I don't have production JQuery experience. I came up through React and Next.js. But when I saw JQuery listed on a job posting recently, I realized I should understand what it actually does and why it mattered. Here's what I learned.

### What Problem Did JQuery Solve?

Back in 2006, browsers were a mess. Internet Explorer, Firefox, Safari, and early Chrome all handled JavaScript differently. Simple things like selecting an element or making an AJAX request required completely different code for each browser.

Here's what selecting an element looked like before JQuery:

```javascript
// Vanilla JS in 2006 - different browsers, different methods
var element;
if (document.getElementById) {
  element = document.getElementById('myElement');
} else if (document.all) {
  element = document.all['myElement']; // IE
} else if (document.layers) {
  element = document.layers['myElement']; // Netscape
}
```

And here's what JQuery made possible:

```javascript
// JQuery - works everywhere
var element = $('#myElement');
```

One line. Every browser. That's why developers loved it.

### The Core Ideas That Still Matter

JQuery introduced patterns we now take for granted:

**1. CSS-style selectors for JavaScript**

```javascript
// JQuery pioneered this
$('.menu-item')
$('#header')
$('nav > ul > li')

// Modern JS adopted it
document.querySelector('.menu-item')
document.querySelectorAll('nav > ul > li')
```

**2. Method chaining**

```javascript
// JQuery made this intuitive
$('#box')
  .addClass('active')
  .fadeIn(300)
  .css('color', 'blue');

// This pattern influenced how we write fluent APIs today
```

**3. Simple AJAX**

```javascript
// JQuery AJAX - clean and simple
$.ajax({
  url: '/api/data',
  method: 'GET',
  success: function(data) {
    console.log(data);
  }
});

// Compare to modern fetch (which JQuery helped inspire)
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Why React/Vue/Next.js Replaced It

JQuery is great at manipulating the DOM directly. Click a button, change some text, show a modal. But as web apps got more complex, this approach had problems:

```javascript
// JQuery approach: You track state in the DOM
$('#counter').text(parseInt($('#counter').text()) + 1);

// React approach: You track state in JavaScript, DOM updates automatically
const [count, setCount] = useState(0);
// When count changes, the UI re-renders
```

The shift was from "tell the DOM what to do" to "describe what the UI should look like given the current state." Frameworks handle the DOM updates for you.

### When JQuery Still Makes Sense

JQuery isn't dead. It's still on millions of websites. It makes sense when:

- You're maintaining a legacy codebase
- You need small enhancements on a static site
- You're working with WordPress or similar CMS platforms
- The project doesn't need a full framework

If I joined a team with JQuery code, I'd be comfortable reading it, maintaining it, and knowing when to use it versus when to suggest a migration.

### What I Took Away

Learning about JQuery taught me:

1. **New frameworks solve old problems differently.** React didn't invent component-based thinking. JQuery plugins were doing modular code years earlier.

2. **The web platform caught up.** Features like `querySelector`, `fetch`, and `classList` were directly influenced by what JQuery proved developers needed.

3. **Understanding history helps you make better decisions.** When someone says "just use JQuery for this," I now understand what they mean and when it's actually the right call.

---

I wrote this post because I believe in being honest about what I know and curious about what I don't. I don't have years of JQuery experience, but I understand its purpose, its patterns, and its place in web development history.

If you're hiring and you value developers who learn continuously and admit what they're still figuring out, let's talk.$content$,
  'tutorial',
  ARRAY['javascript', 'jquery', 'web-history', 'learning'],
  'draft',
  'original',
  'Abe Reyes'
)
ON CONFLICT (slug) DO NOTHING;
