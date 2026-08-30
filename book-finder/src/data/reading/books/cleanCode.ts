import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'clean-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Philosophy of Clean Code',
    title: 'There Will Be Code & The Total Cost of Owning a Mess',
    subtitle: 'The Professional Duty of the Software Craftsman',
    type: 'reading',
    estimatedMinutes: 6,
    content: [
      'Robert C. Martin ("Uncle Bob") opens with a foundational premise: code represents the ultimate detailed specification of our requirements. As systems grow in complexity, the ratio of time spent reading code versus writing new code is over 10 to 1.',
      'When teams rush to meet deadlines by taking shortcuts, they accumulate technical debt that turns into "the grand redesign in the sky"—where velocity slows down exponentially until every new feature introduces cascading bugs.',
      'Clean code is code that was written by someone who cared. It is elegant, direct, readable like well-written prose, and leaves no ambiguity for the next maintainer.'
    ]
  },
  {
    id: 'clean-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Philosophy of Clean Code',
    title: 'The Boy Scout Rule',
    subtitle: 'Leave the Campground Cleaner Than You Found It',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Software rot does not happen overnight; it happens through thousands of small compromises. The Boy Scout Rule is the primary defense against systemic decay: "Always check in a module a little cleaner than when you checked it out."',
      'If every engineer renames one confusing variable, breaks down one oversized function, or deletes one dead block of commented-out code during their daily commits, the codebase inevitably improves over time rather than degrading.',
      'Continuous micro-refactoring makes the codebase an evolving, living system that stays resilient against changes in business requirements.'
    ]
  },
  {
    id: 'clean-l3',
    lessonNumber: 2,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Meaningful Names',
    title: 'Use Intention-Revealing & Searchable Names',
    subtitle: 'Names Should Answer All the Big Questions',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'The name of a variable, function, or class should tell you why it exists, what it does, and how it is used. If a name requires a comment to explain it, then the name does not reveal its intent.',
      'Avoid single-letter variables like `d` or `x` (except for basic loop counters in small scopes). Prefer `elapsedTimeInDays`, `daysSinceCreation`, or `fileAgeInDays` over `d`.',
      'Use searchable names: finding `MAX_CLASSES_PER_STUDENT` in a codebase with grep is effortless, whereas finding the magic number `7` produces thousands of false positives.'
    ]
  },
  {
    id: 'clean-l4',
    lessonNumber: 2,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Meaningful Names',
    title: 'Pronounceable & Domain-Accurate Concept Names',
    subtitle: 'One Word per Abstract Concept',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Programming is a social activity. If you cannot pronounce a variable or class name in conversation with your team, you hinder communication. Avoid cryptic abbreviations like `genymdhms` (generation year, month, date, hour, minute, second); use `generationTimestamp`.',
      'Pick one word per abstract concept and stick with it across the entire codebase. Do not use `fetch`, `retrieve`, and `get` interchangeably across different service classes for equivalent read operations.',
      'Classes should have noun or noun-phrase names (`Customer`, `Account`, `AddressParser`). Methods should have verb or verb-phrase names (`postPayment`, `deletePage`, `saveOrder`).'
    ]
  },
  {
    id: 'clean-l5',
    lessonNumber: 3,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Functions',
    title: 'Small! And Do One Thing (Single Responsibility)',
    subtitle: 'The First and Second Rules of Functions',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. Functions should rarely exceed 20 lines of code.',
      'Functions should do one thing. They should do it well. They should do it only. If a function contains sections that can be extracted into separate methods with descriptive names, it is doing more than one thing.',
      'A function does "one thing" if all its statements are at the same level of abstraction, one level below the operation described by the function name.'
    ]
  },
  {
    id: 'clean-l6',
    lessonNumber: 3,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Functions',
    title: 'Function Arguments & The Stepdown Rule',
    subtitle: 'Niladic, Monadic, Dyadic, and Triadic Functions',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'The ideal number of arguments for a function is zero (niladic). Next comes one (monadic), followed by two (dyadic). Three arguments (triadic) should be avoided where possible, and more than three (polyadic) requires special justification.',
      'Never pass boolean flag arguments into functions (`render(boolean isSuite)`). A flag argument loudly proclaims that the function does more than one thing: it does one thing if true, and another if false. Split it into two functions (`renderForSuite()` and `renderForSingleTest()`).',
      'The Stepdown Rule: we want code to read like a top-down narrative. Every function should be followed by the functions at the next level of abstraction.'
    ]
  },
  {
    id: 'clean-l7',
    lessonNumber: 4,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Comments & Formatting',
    title: 'Comments Do Not Make Up for Bad Code',
    subtitle: 'Explain Yourself in Code, Not Prose',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'The proper use of comments is to compensate for our failure to express ourselves in code. Comments are not pure good; they are at best a necessary evil. Why? Because comments lie. Code changes and evolves, but comments are rarely maintained and quickly become misinformation.',
      'Instead of writing a comment explaining what a complex conditional check does (`// check to see if the employee is eligible for full benefits`), extract the check into a well-named boolean method: `if (employee.isEligibleForFullBenefits())`.',
      'Good comments include: legal notices, informative regex explanations, clarification of intent for obscure library constraints, or warnings of severe consequences.'
    ]
  },
  {
    id: 'clean-l8',
    lessonNumber: 4,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Comments & Formatting',
    title: 'Code Formatting: The Newspaper Metaphor',
    subtitle: 'Vertical and Horizontal Density',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Code formatting is about communication. A source file should be structured like a high-quality newspaper article: at the top, you expect a headline that tells you what the story is about, followed by a high-level synopsis, and gradually detailed specifics toward the bottom.',
      'Vertical formatting: use vertical whitespace to separate distinct concepts (imports, variables, methods). Concepts that are closely related should be kept vertically close together.',
      'Horizontal formatting: keep line length within comfortable bounds (typically 80 to 120 characters) so readers do not have to scroll horizontally.'
    ]
  },
  {
    id: 'clean-l9',
    lessonNumber: 5,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: Error Handling & Boundaries',
    title: 'Use Exceptions Rather Than Return Codes',
    subtitle: 'Separating Happy Paths from Error Scenarios',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Returning error codes clutters the caller with defensive boilerplate checks, obscuring the primary business logic. Throwing descriptive exceptions separates the algorithm from the error recovery mechanism.',
      'Write your `try-catch-finally` statement first when writing code that could fail. This defines the transaction boundary and sets expectations for callers.',
      'Don\'t pass or return null. Returning null requires every caller to insert defensive null checks, creating millions of potential NullPointerExceptions. Return empty collections, special case objects, or Optional wrappers instead.'
    ]
  },
  {
    id: 'clean-l10',
    lessonNumber: 5,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: Error Handling & Boundaries',
    title: 'Third-Party Boundaries & Learning Tests',
    subtitle: 'Encapsulating External Dependencies',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Third-party libraries are designed to be broad and satisfy many use cases, whereas your application needs specific, constrained capabilities. Wrap third-party APIs behind clean adapter interfaces that match your domain language.',
      'Learning Tests: when adopting a new library or dependency, write unit tests to verify your understanding of how the third-party code behaves under various inputs. This documents your assumptions and alerts you instantly when upgrading versions breaks compatibility.'
    ]
  },
  {
    id: 'clean-l11',
    lessonNumber: 6,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Unit Tests & Code Smells',
    title: 'The Three Laws of TDD & The F.I.R.S.T. Principles',
    subtitle: 'Test Code is Just as Important as Production Code',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Test-Driven Development (TDD) enforces three laws: 1) You may not write production code until you have written a failing unit test, 2) You may not write more of a unit test than is sufficient to fail, and 3) You may not write more production code than is sufficient to pass the test.',
      'Clean tests follow the F.I.R.S.T. rules: Fast (tests must run in milliseconds so you run them constantly), Independent (tests should not depend on other tests), Repeatable (tests must pass in any environment without network dependency), Self-Validating (tests have a boolean output: pass or fail), and Timely (written right before the production code).',
      'Having a robust suite of clean unit tests eliminates the fear of refactoring, allowing codebases to remain flexible and continuously improve.'
    ]
  },
  {
    id: 'clean-l12',
    lessonNumber: 6,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Unit Tests & Code Smells',
    title: 'Common Code Smells & The Path to Mastery',
    subtitle: 'Rigidity, Fragility, Immobility, and Viscosity',
    type: 'reflection',
    estimatedMinutes: 6,
    content: [
      'Uncle Bob categorizes common software architecture smells: Rigidity (the tendency for software to be difficult to change because every change forces a cascade of other changes), Fragility (the tendency for software to break in places that have no conceptual relationship to the edit), and Immobility (inability to reuse software in other projects because of entanglement).',
      'True professional mastery in software engineering is not demonstrated by how clever your code is, but by how clear, maintainable, and understandable it remains years after it was written.',
      'Clean code is an ongoing craft requiring discipline, continuous practice, and pride in professional workmanship.'
    ],
    keyTakeaways: [
      'The Boy Scout Rule: always check in code cleaner than you found it.',
      'Functions should do one thing, be small, and operate at a single level of abstraction.',
      'Clean tests follow F.I.R.S.T. and enable fearless refactoring.',
      'Clear, self-documenting code always triumphs over clever or cryptic syntax.'
    ],
    reflectionQuestion: 'What is one specific refactoring practice from Clean Code you will immediately adopt in your daily programming workflow?'
  }
];

export const cleanCodeContent: ReadingBookContent = {
  bookId: 'clean-code',
  title: 'Clean Code',
  author: 'Robert C. Martin',
  genre: 'Software Engineering / Computer Science',
  publishedYear: 2008,
  contentType: 'technical',
  sourceType: 'curated-guide',
  summary: 'A handbook of agile software craftsmanship detailing practical principles, patterns, and code smells to transform messy legacy code into robust, maintainable, and elegant software.',
  aboutThisBook: [
    'Written by legendary software craftsman Robert C. Martin ("Uncle Bob"), "Clean Code: A Handbook of Agile Software Craftsmanship" is the essential handbook for professional programmers seeking to elevate their code from functional chaos to elegant, maintainable engineering.',
    'Uncle Bob emphasizes that the ratio of time spent reading code versus writing new code is over 10 to 1. Rushing out software with low-quality shortcuts creates mounting technical debt, leading to declining velocity and fragile systems. Clean code is code that looks like it was written by someone who cared deeply about clarity, intent, and craft.',
    'Through real-world code refactorings, this guide demonstrates how to choose intention-revealing names, structure functions that do one thing well, eliminate misleading comments, implement robust error handling, and master Test-Driven Development (TDD).'
  ],
  aboutBook: {
    setting: 'Software Craftsmanship, Agile Methodologies & Enterprise Codebases',
    premise: 'A disciplined, practical guide to writing readable, maintainable, and robust software that stands the test of time and changes gracefully.',
    keyCharacters: [
      'Robert C. Martin (Uncle Bob) — Software pioneer, Agile Manifesto co-author, and clean code evangelist',
      'The Next Maintainer — The future engineer (often yourself in six months) who must read and evolve the code'
    ],
    mainConflict: 'The tension between the short-term rush to deliver quick features and the long-term imperative to maintain sustainable velocity and zero-defect architecture.',
    centralThemes: [
      'The Boy Scout Rule — Always leave the campground (codebase) cleaner than you found it',
      'Small Functions with Single Responsibility — Every function should do one thing and do it only',
      'Self-Documenting Code — Clean logic and clear naming over noisy, obsolete comments',
      'The F.I.R.S.T. Testing Principles — Fast, Independent, Repeatable, Self-Validating, and Timely tests'
    ],
    whatToExpect: 'A 12-lesson software craftsmanship guide breaking down naming conventions, function architecture, formatting rules, and code smell eradication.'
  },
  totalChapters: 6,
  totalLessons: lessons.length,
  chapters: [
    { id: 'clean-ch1', chapterNumber: 1, title: 'Chapter 1: The Philosophy of Clean Code', subtitle: 'Total Cost of Mess and the Boy Scout Rule', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'clean-ch2', chapterNumber: 2, title: 'Chapter 2: Meaningful Names', subtitle: 'Intention-Revealing and Searchable Domain Concepts', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'clean-ch3', chapterNumber: 3, title: 'Chapter 3: Functions', subtitle: 'Single Responsibility, Stepdown Rule, and Arguments', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'clean-ch4', chapterNumber: 4, title: 'Chapter 4: Comments & Formatting', subtitle: 'Self-Documenting Code and the Newspaper Metaphor', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'clean-ch5', chapterNumber: 5, title: 'Chapter 5: Error Handling & Boundaries', subtitle: 'Exceptions Over Return Codes and Encapsulating Dependencies', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'clean-ch6', chapterNumber: 6, title: 'Chapter 6: Unit Tests & Code Smells', subtitle: 'F.I.R.S.T. Testing Principles and Eliminating Fragility', lessons: lessons.filter(l => l.chapterNumber === 6) }
  ],
  lessons
};
