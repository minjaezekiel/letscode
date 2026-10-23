/* letscode challenge content. See docs/CHALLENGES.md before adding one.
   Rules: deterministic output, self-contained question, and NO solution field. */

const CHALLENGES = [

  /* ================= BEGINNER ================= */

  {
    id: 'py-b-01',
    level: 'beginner',
    lang: 'python',
    title: 'Say hello',
    question:
      'Use print() to output these two lines, exactly as shown in the expected output.\n\n' +
      'Watch the punctuation: the apostrophe in "Let’s" is a plain single quote.',
    expectedOutput: "Hello, letscode!\nLet's write some Python.",
    starter: { py: '# Your code here\n' }
  },

  {
    id: 'py-b-02',
    level: 'beginner',
    lang: 'python',
    title: 'Even numbers to 10',
    question:
      'Print every even number from 2 up to and including 10, one per line.\n\n' +
      'Use a loop — don’t write five separate print() calls.',
    expectedOutput: '2\n4\n6\n8\n10',
    starter: { py: 'for n in range(1, 11):\n    # your code here\n    pass\n' }
  },

  {
    id: 'py-b-03',
    level: 'beginner',
    lang: 'python',
    title: 'Price with tax',
    question:
      'PRICE is in dollars and TAX_RATE is a fraction (0.15 means 15%).\n\n' +
      'Work out the total price including tax and print it as "Total: " followed ' +
      'by the amount with exactly two decimal places.\n\n' +
      'An f-string makes the formatting easy: f"{value:.2f}".',
    expectedOutput: 'Total: 46.00',
    starter: { py: 'PRICE = 40.00\nTAX_RATE = 0.15\n\n# your code here\n' }
  },

  {
    id: 'web-b-01',
    level: 'beginner',
    lang: 'web',
    title: 'Centre a card',
    question:
      'The HTML gives you one <div class="card">. Using CSS only, put it in the ' +
      'exact centre of the preview — centred both across and down the page.\n\n' +
      'Give the card a dark background, white text, 24px of padding inside it, ' +
      'and 12px rounded corners.',
    expectedOutput:
      'A dark rounded box sits in the middle of the preview, across and down.\n' +
      'The words "Hello, letscode" are white, with even space around them.',
    starter: {
      html: '<div class="card">Hello, letscode</div>\n',
      css: 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n.card {\n  /* your code here */\n}\n',
      js: ''
    }
  },

  {
    id: 'web-b-02',
    level: 'beginner',
    lang: 'web',
    title: 'Style a shopping list',
    question:
      'Add three more items to the list so it reads: Bread, Milk, Eggs, Coffee.\n\n' +
      'Then with CSS: remove the bullet points, give each item 8px of vertical ' +
      'padding, and put a 1px light grey line between items but NOT below the ' +
      'last one.',
    expectedOutput:
      'Four rows of text — Bread, Milk, Eggs, Coffee — with no bullets.\n' +
      'A thin grey line separates each row. There is no line under Coffee.',
    starter: {
      html: '<h2>Shopping</h2>\n<ul class="list">\n  <li>Bread</li>\n</ul>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\n.list {\n  /* your code here */\n}\n',
      js: ''
    }
  },

  {
    id: 'web-b-03',
    level: 'beginner',
    lang: 'web',
    title: 'Click counter',
    question:
      'Make the button count its own clicks.\n\n' +
      'The paragraph starts at "Clicked 0 times". Each click adds one and updates ' +
      'the text. Use "1 time" (singular) when the count is exactly one.',
    expectedOutput:
      'Before clicking:   Clicked 0 times\nAfter one click:   Clicked 1 time\nAfter four clicks: Clicked 4 times',
    starter: {
      html: '<button id="go">Click me</button>\n<p id="out">Clicked 0 times</p>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\nbutton {\n  font: inherit;\n  padding: 8px 16px;\n}\n',
      js: 'const go = document.getElementById("go");\nconst out = document.getElementById("out");\n\n// your code here\n'
    }
  },

  /* ================= INTERMEDIATE ================= */

  {
    id: 'py-i-01',
    level: 'intermediate',
    lang: 'python',
    title: 'Word frequency, top 3',
    question:
      'WORDS holds the words of a sentence.\n\n' +
      'Count how often each word appears, then print the three most common as ' +
      '"word: count", one per line, highest count first.\n\n' +
      'When two words have the same count, print the one that comes first ' +
      'alphabetically.',
    expectedOutput: 'the: 4\ndog: 2\nfox: 2',
    starter: {
      py: 'WORDS = ["the", "fox", "the", "dog", "the", "fox", "dog", "the"]\n\n# your code here\n'
    }
  },

  {
    id: 'py-i-02',
    level: 'intermediate',
    lang: 'python',
    title: 'FizzBuzz to 20',
    question:
      'Print the numbers 1 to 20, one per line, with two substitutions:\n\n' +
      'a multiple of 3 prints "Fizz", a multiple of 5 prints "Buzz", and a ' +
      'multiple of both prints "FizzBuzz".',
    expectedOutput:
      '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz',
    starter: { py: 'for n in range(1, 21):\n    # your code here\n    pass\n' }
  },

  {
    id: 'py-i-03',
    level: 'intermediate',
    lang: 'python',
    title: 'Group students by grade',
    question:
      'STUDENTS holds (name, score) pairs. Grades are A for 90 and above, ' +
      'B for 80–89, C for 70–79, and D for anything below 70.\n\n' +
      'Print one line per grade that has at least one student, in the order ' +
      'A, B, C, D. Each line is the grade letter, a colon and a space, then the ' +
      'names separated by ", " in the order they appear in STUDENTS.',
    expectedOutput: 'A: Ada, Barbara\nB: Grace\nC: Linus\nD: Ken',
    starter: {
      py: 'STUDENTS = [\n    ("Ada", 91),\n    ("Linus", 74),\n    ("Grace", 88),\n    ("Ken", 67),\n    ("Barbara", 95),\n]\n\n# your code here\n'
    }
  },

  {
    id: 'web-i-01',
    level: 'intermediate',
    lang: 'web',
    title: 'Responsive card grid',
    question:
      'Lay the six cards out as a grid that reflows on its own: as many columns ' +
      'as fit, each column at least 200px wide, with a 16px gap.\n\n' +
      'Do it with one CSS grid rule and no media queries. Then drag the preview ' +
      'pane narrower and watch the column count drop.',
    expectedOutput:
      'Six equal cards in a grid with even 16px gaps.\n' +
      'Wide preview: three or more per row. Narrow preview: two, then one.\n' +
      'No card is ever thinner than 200px, and nothing overflows sideways.',
    starter: {
      html: '<div class="grid">\n  <div class="card">One</div>\n  <div class="card">Two</div>\n  <div class="card">Three</div>\n  <div class="card">Four</div>\n  <div class="card">Five</div>\n  <div class="card">Six</div>\n</div>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 16px;\n}\n\n.grid {\n  /* your code here */\n}\n\n.card {\n  background: #eef1f6;\n  border-radius: 8px;\n  padding: 24px;\n}\n',
      js: ''
    }
  },

  {
    id: 'web-i-02',
    level: 'intermediate',
    lang: 'web',
    title: 'Validate a signup form',
    question:
      'Check the form when it is submitted, without reloading the page.\n\n' +
      'Show "Name is required" if the name is empty, "Email must contain an @" ' +
      'if the email has no @ in it, and "Password must be 8 characters or more" ' +
      'if the password is too short. Report every problem at once, one per line, ' +
      'in that order. If everything is fine, show "Welcome, <name>".\n\n' +
      'Also log the message to the console so it reaches the terminal.',
    expectedOutput:
      'Empty form:\n  Name is required\n  Email must contain an @\n  Password must be 8 characters or more\n\n' +
      'Name "Ada", email "ada@x.com", password "secret":\n  Password must be 8 characters or more\n\n' +
      'Name "Ada", email "ada@x.com", password "secret12":\n  Welcome, Ada',
    starter: {
      html: '<form id="form" novalidate>\n  <label>Name <input name="name"></label>\n  <label>Email <input name="email" type="text"></label>\n  <label>Password <input name="password" type="password"></label>\n  <button>Sign up</button>\n</form>\n<div id="msg" role="alert"></div>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 12px;\n}\n\n#msg {\n  margin-top: 16px;\n  white-space: pre-line;\n  color: #b3261e;\n}\n',
      js: 'const form = document.getElementById("form");\nconst msg = document.getElementById("msg");\n\n// your code here\n'
    }
  },

  {
    id: 'web-i-03',
    level: 'intermediate',
    lang: 'web',
    title: 'Live temperature converter',
    question:
      'As the user types a number of degrees Celsius, show the Fahrenheit value ' +
      'immediately — no button.\n\n' +
      'Format it as "<C>°C = <F>°F" with one decimal place. If the box is empty ' +
      'or not a number, show "Enter a number" instead.',
    expectedOutput:
      'Typing 100 shows:  100°C = 212.0°F\nTyping 37  shows:  37°C = 98.6°F\nTyping -40 shows:  -40°C = -40.0°F\nClearing the box:  Enter a number',
    starter: {
      html: '<label>Celsius <input id="c" type="number" step="any"></label>\n<p id="out">Enter a number</p>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n  font-size: 18px;\n}\n',
      js: 'const c = document.getElementById("c");\nconst out = document.getElementById("out");\n\n// your code here\n'
    }
  },

  /* ================= MASTER ================= */

  {
    id: 'py-m-01',
    level: 'master',
    lang: 'python',
    title: 'Flatten a nested list',
    question:
      'NESTED contains numbers and lists, nested to any depth.\n\n' +
      'Write flatten(items) so it returns a single flat list of the numbers in ' +
      'their original left-to-right order, whatever the depth. Then print the ' +
      'result space-separated on one line — print(*flatten(NESTED)) does that.\n\n' +
      'Recursion is the natural fit here.',
    expectedOutput: '1 2 3 4 5 6 7 8',
    starter: {
      py: 'NESTED = [1, [2, [3, [4, 5]], 6], [[7]], 8]\n\n\ndef flatten(items):\n    """Return a flat list of every number inside items, in order."""\n    # your code here\n\n\nprint(*flatten(NESTED))\n'
    }
  },

  {
    id: 'py-m-02',
    level: 'master',
    lang: 'python',
    title: 'Run-length encoding',
    question:
      'Write encode(text) which compresses runs of the same character into the ' +
      'character followed by how many times it repeats.\n\n' +
      '"aaabbbccccd" becomes "a3b3c4d1". A single character still gets its ' +
      'count, so "d" becomes "d1".\n\n' +
      'Print the encoding of each string in CASES, one per line.',
    expectedOutput: 'a3b3c4d1\nw1\nx1y1x1\nm4',
    starter: {
      py: 'CASES = ["aaabbbccccd", "w", "xyx", "mmmm"]\n\n\ndef encode(text):\n    """Return the run-length encoding of text."""\n    # your code here\n\n\nfor case in CASES:\n    print(encode(case))\n'
    }
  },

  {
    id: 'py-m-03',
    level: 'master',
    lang: 'python',
    title: 'Balanced brackets',
    question:
      'Write balanced(text) which returns True when every bracket in text is ' +
      'closed by its own matching kind, in the right order, and False otherwise.\n\n' +
      'It handles (), [] and {}. "([{}])" is balanced; "(]" and "((" are not.\n\n' +
      'Print one line per case in CASES, as the case, then ": ", then True or ' +
      'False. A stack is the clean way to do this.',
    expectedOutput: '()[]{}: True\n(]: False\n([{}]): True\n((: False\n{[()]}: True\n: True',
    starter: {
      py: 'CASES = ["()[]{}", "(]", "([{}])", "((", "{[()]}", ""]\n\n\ndef balanced(text):\n    """Return True if every bracket in text is matched and correctly nested."""\n    # your code here\n\n\nfor case in CASES:\n    print(f"{case}: {balanced(case)}")\n'
    }
  },

  {
    id: 'web-m-01',
    level: 'master',
    lang: 'web',
    title: 'Debounced search filter',
    question:
      'Filter the list as the user types, but debounce it: only run the filter ' +
      '300ms after the last keystroke, so typing a whole word runs it once.\n\n' +
      'The match is case-insensitive and matches anywhere in the name. Log ' +
      '"filtering: <query> (<n> shown)" each time the filter actually runs — ' +
      'that log is how you prove the debounce works.\n\n' +
      'Write the debounce yourself with setTimeout and clearTimeout. No libraries.',
    expectedOutput:
      'Typing "an" quickly logs exactly one line:\n  filtering: an (2 shown)\nand the list shows Banana and Mango.\n\n' +
      'Typing "z" logs:\n  filtering: z (0 shown)\nand the list is empty.',
    starter: {
      html: '<input id="q" placeholder="Search fruit" aria-label="Search fruit">\n<ul id="list"></ul>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\ninput {\n  font: inherit;\n  padding: 8px;\n  width: 100%;\n  max-width: 280px;\n}\n',
      js: 'const FRUIT = ["Apple", "Banana", "Cherry", "Mango", "Peach"];\nconst q = document.getElementById("q");\nconst list = document.getElementById("list");\n\nfunction render(items) {\n  list.innerHTML = "";\n  for (const name of items) {\n    const li = document.createElement("li");\n    li.textContent = name;\n    list.append(li);\n  }\n}\n\nrender(FRUIT);\n\n// your code here\n'
    }
  },

  {
    id: 'web-m-02',
    level: 'master',
    lang: 'web',
    title: 'Accessible accordion',
    question:
      'Turn the three sections into an accordion where only one panel is open at ' +
      'a time, using one click handler on the container rather than one per ' +
      'button (event delegation).\n\n' +
      'Keep it accessible: each button carries aria-expanded="true" or "false", ' +
      'a closed panel is hidden from assistive tech as well as from view, and ' +
      'the buttons are reachable and operable by keyboard.',
    expectedOutput:
      'At the start every panel is closed and every button says aria-expanded="false".\n\n' +
      'Clicking "Two" opens only panel two and its button becomes aria-expanded="true".\n' +
      'Clicking "Three" closes two and opens three.\n' +
      'Clicking "Three" again closes it, leaving nothing open.\n\n' +
      'Tab reaches each button and Enter or Space toggles it.',
    starter: {
      html: '<div id="acc">\n  <h3><button data-panel="p1">One</button></h3>\n  <div id="p1" class="panel">First panel.</div>\n  <h3><button data-panel="p2">Two</button></h3>\n  <div id="p2" class="panel">Second panel.</div>\n  <h3><button data-panel="p3">Three</button></h3>\n  <div id="p3" class="panel">Third panel.</div>\n</div>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\nh3 {\n  margin: 0;\n}\n\nbutton {\n  font: inherit;\n  width: 100%;\n  text-align: left;\n  padding: 12px;\n  background: #eef1f6;\n  border: 1px solid #c9d1de;\n  cursor: pointer;\n}\n\n.panel {\n  padding: 12px;\n  border: 1px solid #c9d1de;\n  border-top: 0;\n}\n',
      js: 'const acc = document.getElementById("acc");\n\n// your code here\n'
    }
  },

  {
    id: 'web-m-03',
    level: 'master',
    lang: 'web',
    title: 'Sortable table',
    question:
      'Make the table sort when a header is clicked: first click sorts ascending, ' +
      'clicking the same header again reverses it. Name sorts as text, age and ' +
      'score as numbers — so 9 comes before 10.\n\n' +
      'Sort the data and re-render the rows; don’t shuffle DOM nodes around. ' +
      'Set aria-sort to "ascending" or "descending" on the active header and ' +
      'remove it from the others.\n\n' +
      'Equal values keep their previous relative order (a stable sort).',
    expectedOutput:
      'Click "Age" once:   Ken 24, Ada 31, Grace 36, Linus 42\nClick "Age" again:  Linus 42, Grace 36, Ada 31, Ken 24\nClick "Name" once:  Ada, Grace, Ken, Linus\n\n' +
      'The clicked header carries aria-sort; the other two do not.',
    starter: {
      html: '<table id="t">\n  <thead>\n    <tr>\n      <th data-key="name" data-type="text">Name</th>\n      <th data-key="age" data-type="number">Age</th>\n      <th data-key="score" data-type="number">Score</th>\n    </tr>\n  </thead>\n  <tbody></tbody>\n</table>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 24px;\n}\n\ntable {\n  border-collapse: collapse;\n}\n\nth, td {\n  border: 1px solid #c9d1de;\n  padding: 8px 16px;\n  text-align: left;\n}\n\nth {\n  cursor: pointer;\n  background: #eef1f6;\n}\n',
      js: 'const ROWS = [\n  { name: "Ada", age: 31, score: 9 },\n  { name: "Linus", age: 42, score: 10 },\n  { name: "Grace", age: 36, score: 9 },\n  { name: "Ken", age: 24, score: 7 },\n];\n\nconst table = document.getElementById("t");\nconst tbody = table.querySelector("tbody");\n\nfunction render(rows) {\n  tbody.innerHTML = "";\n  for (const row of rows) {\n    const tr = document.createElement("tr");\n    tr.innerHTML = `<td>${row.name}</td><td>${row.age}</td><td>${row.score}</td>`;\n    tbody.append(tr);\n  }\n}\n\nrender(ROWS);\n\n// your code here\n'
    }
  }

];
