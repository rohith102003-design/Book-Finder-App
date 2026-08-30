import { Book } from '../../types/book';
import { ReadingBookContent, ReadingLesson, ReadingChapter, BookIntroduction } from '../../types/reading';
import { harryPotterContent } from './books/harryPotterPhilosophersStone';
import { theLordOfTheRingsContent } from './books/theLordOfTheRings';
import { nineteenEightyFourContent } from './books/nineteenEightyFour';
import { theHobbitContent } from './books/theHobbit';
import { atomicHabitsContent } from './books/atomicHabits';
import { cleanCodeContent } from './books/cleanCode';
import { duneContent } from './books/dune';
import { prideAndPrejudiceContent } from './books/prideAndPrejudice';

// Pre-registered curated reading guides
const CURATED_REGISTRY: Record<string, ReadingBookContent> = {
  // Harry Potter and the Philosopher's / Sorcerer's Stone
  'harry-potter': harryPotterContent,
  'harry-potter-and-the-philosopher-s-stone': harryPotterContent,
  'harry-potter-and-the-philosophers-stone': harryPotterContent,
  'harry-potter-and-the-sorcerer-s-stone': harryPotterContent,
  'harry-potter-and-the-sorcerers-stone': harryPotterContent,
  'OL82563W': harryPotterContent,
  'OL2279140W': harryPotterContent,
  'OL82565W': harryPotterContent,
  'OL2419838W': harryPotterContent,

  // The Lord of the Rings
  'the-lord-of-the-rings': theLordOfTheRingsContent,
  'lord-of-the-rings': theLordOfTheRingsContent,
  'the-fellowship-of-the-ring': theLordOfTheRingsContent,
  'fellowship-of-the-ring': theLordOfTheRingsContent,
  'OL27479W': theLordOfTheRingsContent,
  'OL27482W': theLordOfTheRingsContent,
  'OL14933414W': theLordOfTheRingsContent,

  // 1984
  '1984': nineteenEightyFourContent,
  'nineteen-eighty-four': nineteenEightyFourContent,
  '1984-george-orwell': nineteenEightyFourContent,
  'OL1168007W': nineteenEightyFourContent,
  'OL1168083W': nineteenEightyFourContent,

  // The Hobbit
  'the-hobbit': theHobbitContent,
  'hobbit': theHobbitContent,
  'the-hobbit-or-there-and-back-again': theHobbitContent,
  'OL262758W': theHobbitContent,

  // Dune
  'dune': duneContent,
  'dune-frank-herbert': duneContent,
  'dune-chronicles': duneContent,
  'OL2163351W': duneContent,
  'OL332306W': duneContent,

  // Atomic Habits
  'atomic-habits': atomicHabitsContent,
  'atomic-habits-tiny-changes-remarkable-results': atomicHabitsContent,
  'OL17930368W': atomicHabitsContent,
  'OL20140733W': atomicHabitsContent,

  // Clean Code
  'clean-code': cleanCodeContent,
  'clean-code-a-handbook-of-agile-software-craftsmanship': cleanCodeContent,
  'OL15183863W': cleanCodeContent,

  // Pride and Prejudice
  'pride-and-prejudice': prideAndPrejudiceContent,
  'pride-prejudice': prideAndPrejudiceContent,
  'OL66554W': prideAndPrejudiceContent,
  'OL24364628W': prideAndPrejudiceContent,
};

export function normalizeSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Universal Dynamic Reading Guide Generator
 * Synthesizes a structured multi-lesson Reading Guide for ANY book discovered across OpenLibrary.
 */
export function generateUniversalCompanion(book: Book): ReadingBookContent {
  const authorName = book.authors.length > 0 ? book.authors.join(', ') : 'Distinguished Author';
  const subjects = book.subjects.slice(0, 4).join(', ') || 'Literature & Thought';
  const bookSlug = normalizeSlug(book.title);
  const yearStr = book.firstPublishYear ? `published in ${book.firstPublishYear}` : 'in modern publishing';

  const dynamicLessons: ReadingLesson[] = [
    {
      id: `${bookSlug}-l1`,
      lessonNumber: 1,
      chapterNumber: 1,
      chapterTitle: 'Chapter 1: Foundational Premises & Context',
      title: `Introduction & Background to ${book.title}`,
      subtitle: `The Core Thesis by ${authorName}`,
      type: 'reading',
      estimatedMinutes: 5,
      content: [
        `"${book.title}" is an impactful work created by ${authorName}, ${yearStr}. It stands as a significant contribution exploring the landscape of ${subjects}.`,
        `The opening chapters introduce readers to the central premise, articulating foundational questions, thematic settings, and the primary tensions that motivate the work.`,
        `Whether addressing philosophical inquiry, narrative conflict, or technical methodologies, the introduction establishes the mental models necessary to engage critically with the text.`
      ]
    },
    {
      id: `${bookSlug}-l2`,
      lessonNumber: 2,
      chapterNumber: 1,
      chapterTitle: 'Chapter 1: Foundational Premises & Context',
      title: 'Core Principles & Initial Paradigms',
      subtitle: 'Deconstructing the Main Conceptual Framework',
      type: 'concept',
      estimatedMinutes: 5,
      content: [
        `Every enduring book builds upon a structured framework designed to challenge or expand traditional perspectives across ${subjects}.`,
        `Here, ${authorName} develops the core mechanisms and arguments that differentiate this work from standard treatments of the subject.`,
        'Understanding these foundational pillars early equips the reader to synthesize downstream arguments and recognize pivotal insights.'
      ]
    },
    {
      id: `${bookSlug}-l3`,
      lessonNumber: 3,
      chapterNumber: 2,
      chapterTitle: 'Chapter 2: Deep Dive & Core Developments',
      title: 'Pivotal Turning Points & Critical Analysis',
      subtitle: 'Navigating Complexity and Escalation',
      type: 'turning-point',
      estimatedMinutes: 6,
      content: [
        'As the exploration deepens, the narrative or analytical tension reaches a critical juncture where simplistic solutions no longer suffice.',
        `Through meticulous examples and focused development, ${authorName} demonstrates how interconnected forces produce unexpected outcomes in ${subjects}.`,
        'Take time to reflect on how each progressive development challenges common assumptions and reveals deeper nuances.'
      ]
    },
    {
      id: `${bookSlug}-l4`,
      lessonNumber: 4,
      chapterNumber: 2,
      chapterTitle: 'Chapter 2: Deep Dive & Core Developments',
      title: 'Character Motivations & Thematic Conflicts',
      subtitle: 'Examining Internal and External Forces',
      type: 'conflict',
      estimatedMinutes: 5,
      content: [
        'The heart of any profound work lies in the clash between competing values: tradition vs innovation, individual agency vs collective restraint, or idealism vs pragmatic reality.',
        `By analyzing these tensions within the context of ${subjects}, we gain a clearer understanding of the author’s primary ethical or intellectual message.`
      ]
    },
    {
      id: `${bookSlug}-l5`,
      lessonNumber: 5,
      chapterNumber: 3,
      chapterTitle: 'Chapter 3: Practical Applications & Synthesis',
      title: 'Translating Theory into Actionable Insight',
      subtitle: 'Real-World Methodologies and Perspectives',
      type: 'concept',
      estimatedMinutes: 6,
      content: [
        'Great books provide more than information—they provide cognitive tools for transformative thinking and informed action.',
        `Reflect on how the principles articulated by ${authorName} can be adapted to current personal, creative, or professional challenges.`,
        'Formulate a concrete strategy to apply these insights systematically in daily decision-making.'
      ]
    },
    {
      id: `${bookSlug}-l6`,
      lessonNumber: 6,
      chapterNumber: 3,
      chapterTitle: 'Chapter 3: Practical Applications & Synthesis',
      title: 'Conclusions, Lasting Impact & Final Reflection',
      subtitle: 'The Enduring Legacy of the Work',
      type: 'reflection',
      estimatedMinutes: 5,
      content: [
        `In the closing synthesis of "${book.title}", ${authorName} unites the disparate thematic threads into a compelling vision.`,
        'Completing this Reading Guide marks an intellectual milestone, broadening your understanding and equipping you with fresh perspectives.',
        'Carry these insights forward into your ongoing reading journey and daily practice.'
      ],
      keyTakeaways: [
        `Core principles and paradigms established by ${authorName}.`,
        `Key thematic connections across ${subjects}.`,
        'Actionable strategies for integrating these insights into ongoing practice.'
      ],
      reflectionQuestion: `What primary insight from "${book.title}" will most strongly influence your approach to ${subjects}?`
    }
  ];

  const dynamicChapters: ReadingChapter[] = [
    {
      id: `${bookSlug}-ch1`,
      chapterNumber: 1,
      title: 'Chapter 1: Foundational Premises & Context',
      subtitle: 'Introduction and Core Framework',
      lessons: dynamicLessons.filter(l => l.chapterNumber === 1)
    },
    {
      id: `${bookSlug}-ch2`,
      chapterNumber: 2,
      title: 'Chapter 2: Deep Dive & Core Developments',
      subtitle: 'Critical Turning Points and Thematic Conflicts',
      lessons: dynamicLessons.filter(l => l.chapterNumber === 2)
    },
    {
      id: `${bookSlug}-ch3`,
      chapterNumber: 3,
      title: 'Chapter 3: Practical Applications & Synthesis',
      subtitle: 'Actionable Insights and Final Reflection',
      lessons: dynamicLessons.filter(l => l.chapterNumber === 3)
    }
  ];

  const aboutThisBook = [
    `"${book.title}" is an impactful work authored by ${authorName}${book.firstPublishYear ? ` and published in ${book.firstPublishYear}` : ''}. It represents a significant contribution to the fields of ${subjects}.`,
    book.description || `The book develops an engaging exploration of core concepts, characters, and ideas, guiding readers through foundational premises, analytical developments, and transformative insights.`,
    `This educational Reading Guide is designed to provide an accessible chapter-by-chapter curriculum, synthesizing the primary arguments, context, and takeaways to help you master the material.`
  ];

  const aboutBook: BookIntroduction = {
    setting: subjects,
    premise: book.description ? book.description.slice(0, 200) + '...' : `An in-depth exploration of ${subjects} and core intellectual paradigms by ${authorName}.`,
    keyCharacters: [`Author & Perspectives by ${authorName}`],
    mainConflict: `Navigating the complexities, historical debates, and practical challenges across ${subjects}.`,
    centralThemes: subjects.split(', ').map(s => `Exploration of ${s}`),
    whatToExpect: `A structured ${dynamicLessons.length}-lesson educational companion walking through core premises, development, and practical synthesis.`
  };

  return {
    bookId: book.key.replace('/works/', ''),
    title: book.title,
    author: authorName,
    genre: subjects,
    publishedYear: book.firstPublishYear || undefined,
    coverUrl: book.coverUrl,
    contentType: 'general',
    sourceType: 'dynamic-companion',
    summary: book.description || `An educational Reading Guide exploring the core ideas, themes, and lasting significance of "${book.title}" by ${authorName}.`,
    aboutThisBook,
    aboutBook,
    totalChapters: dynamicChapters.length,
    totalLessons: dynamicLessons.length,
    chapters: dynamicChapters,
    lessons: dynamicLessons
  };
}

/**
 * Retrieve reading content for a book.
 * Checks curated registry first; falls back to dynamic companion generator.
 */
export function getReadingContentForBook(book: Book): ReadingBookContent {
  const cleanId = book.key.replace('/works/', '');
  const titleSlug = normalizeSlug(book.title);

  // 1. Direct clean work ID match
  if (CURATED_REGISTRY[cleanId]) {
    return CURATED_REGISTRY[cleanId];
  }

  // 2. Direct full key match
  if (CURATED_REGISTRY[book.key]) {
    return CURATED_REGISTRY[book.key];
  }

  // 3. Exact normalized title slug match
  if (CURATED_REGISTRY[titleSlug]) {
    return CURATED_REGISTRY[titleSlug];
  }

  // 4. Fuzzy title slug match
  for (const [key, content] of Object.entries(CURATED_REGISTRY)) {
    if (titleSlug.includes(key) || key.includes(titleSlug)) {
      return content;
    }
  }

  // 5. Dynamic companion generator fallback
  return generateUniversalCompanion(book);
}
