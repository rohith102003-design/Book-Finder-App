import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'atomic-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Fundamentals of Atomic Habits',
    title: 'The Aggregation of Marginal Gains: 1% Better Every Day',
    subtitle: 'The Mathematical Power of Small Improvements',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'James Clear begins by examining the British Cycling team under performance director Dave Brailsford. By breaking down everything that goes into riding a bicycle and improving every element by just 1%—from tire aerodynamics and lighter bike seats to the optimal hand-washing gel and massage pillows—the team transformed from century-long underperformers into multi-Olympic gold medalists.',
      'Habits are the compound interest of self-improvement. Just as money multiplies through compound interest, the effects of your habits multiply as you repeat them.',
      'If you can get 1% better each day for one year, you will end up thirty-seven times better by the time you’re done (1.01³⁶⁵ ≈ 37.78). Conversely, if you get 1% worse each day for one year, your performance will decline nearly to zero (0.99³⁶⁵ ≈ 0.03).'
    ]
  },
  {
    id: 'atomic-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Fundamentals of Atomic Habits',
    title: 'Forget Goals, Focus on Systems',
    subtitle: 'You Fall to the Level of Your Systems',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Almost every person sets goals: winners and losers in any arena share the exact same goals. Goal setting suffers from severe survivorship bias because we only look at the winners and assume their goal was what produced the victory.',
      'Goals are about the results you want to achieve; systems are about the processes that lead to those results. If you are a coach, your goal might be to win a championship; your system is what your team does at practice each day.',
      'Achieving a goal only changes your life for the moment. If you clean your messy room, you have a clean room for now. But if you maintain the same sloppy habits that led to a messy room in the first place, you will soon be looking at a fresh pile of clutter. Fix the inputs and the outputs will fix themselves.'
    ]
  },
  {
    id: 'atomic-l3',
    lessonNumber: 3,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Identity-Based Habits',
    title: 'The Three Layers of Behavior Change',
    subtitle: 'Outcomes, Processes, and Identity',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Behavior change consists of three concentric layers: Outcome change (changing your results, like losing weight or publishing a book), Process change (changing your habits and systems, like implementing a new gym routine), and Identity change (changing your beliefs, worldview, and self-image).',
      'Most people start by focusing on *what* they want to achieve (outcome-based habits). The alternative is to build *identity-based habits*: starting with *who* you wish to become.',
      'Consider two people resisting a cigarette: when offered a smoke, the first person says, "No thanks, I’m trying to quit." The second person says, "No thanks, I’m not a smoker." It’s a small difference, but the second statement signals a fundamental shift in identity.'
    ]
  },
  {
    id: 'atomic-l4',
    lessonNumber: 4,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Identity-Based Habits',
    title: 'Every Action is a Vote for Your Identity',
    subtitle: 'How Habits Shape Self-Image',
    type: 'exercise',
    estimatedMinutes: 5,
    content: [
      'Your identity emerges out of your habits. No one is born with pre-set beliefs; every belief you have about yourself is learned and conditioned through evidence.',
      'Each time you write a page, you are a writer. Each time you play a violin, you are a musician. Each time you encourage your colleagues, you are a leader.',
      'You don’t need a unanimous vote to win an election; you just need a majority. You don’t need to be perfect; you just need the majority of your daily votes cast for your chosen identity.'
    ]
  },
  {
    id: 'atomic-l5',
    lessonNumber: 5,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: The 1st Law — Make It Obvious',
    title: 'The Habit Loop & The Habits Scorecard',
    subtitle: 'Cue, Craving, Response, and Reward',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Every habit can be broken down into a neurological feedback loop comprising four stages: Cue (triggers a brain response), Craving (the motivational force), Response (the actual action), and Reward (satisfies the craving and teaches us what to remember).',
      'To build good habits, we follow the Four Laws of Behavior Change: 1) Make it Obvious, 2) Make it Attractive, 3) Make it Easy, and 4) Make it Satisfying.',
      'Before you can change a habit, you must become aware of it. Use a Habits Scorecard: list all your daily routines from morning to night and score each behavior as positive (+), negative (-), or neutral (=).'
    ]
  },
  {
    id: 'atomic-l6',
    lessonNumber: 6,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: The 1st Law — Make It Obvious',
    title: 'Implementation Intentions & Habit Stacking',
    subtitle: 'Designing Precise Triggers for Action',
    type: 'exercise',
    estimatedMinutes: 5,
    content: [
      'Hundreds of studies demonstrate that people who make a concrete plan for *when* and *where* they will perform a new habit are 2 to 3 times more likely to follow through. The formula is: "I will [BEHAVIOR] at [TIME] in [LOCATION]."',
      'Habit Stacking is a special form of implementation intention: pairing a new habit with an existing, automatic routine. The formula is: "After [CURRENT HABIT], I will [NEW HABIT]."',
      'For example: "After I pour my morning cup of coffee, I will meditate for sixty seconds." This piggybacks on existing neural pathways.'
    ]
  },
  {
    id: 'atomic-l7',
    lessonNumber: 7,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The 2nd Law — Make It Attractive',
    title: 'Dopamine-Driven Feedback Loops & Temptation Bundling',
    subtitle: 'Anticipation and the Brain’s Reward Circuit',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Habits are a dopamine-driven feedback loop. Neuroscientists have discovered that dopamine spikes not when you receive a reward, but in the *anticipation* of the reward.',
      'Temptation Bundling links an action you *want* to do with an action you *need* to do. For example, an engineering student who wanted to watch Netflix hooked his stationary exercise bike to his laptop so Netflix would only play when he pedaled above a certain speed.',
      'Combine Habit Stacking with Temptation Bundling: 1) After [CURRENT HABIT], I will [HABIT I NEED]. 2) After [HABIT I NEED], I will [HABIT I WANT].'
    ]
  },
  {
    id: 'atomic-l8',
    lessonNumber: 8,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The 2nd Law — Make It Attractive',
    title: 'The Role of Family, Friends & Social Norms',
    subtitle: 'The Invisible Gravity of the Tribe',
    type: 'theme',
    estimatedMinutes: 5,
    content: [
      'Humans are herd animals. We want to fit in, bond with others, and earn the respect of our peers. We imitate the habits of three social groups: 1) The Close (family and friends), 2) The Many (the tribe and cultural crowd), and 3) The Powerful (those with status and prestige).',
      'One of the most effective strategies for building better habits is to join a culture where: 1) Your desired behavior is the normal behavior, and 2) You already have something in common with the group.',
      'When you surround yourself with people who read daily, exercise regularly, or write code, their standard becomes your baseline.'
    ]
  },
  {
    id: 'atomic-l9',
    lessonNumber: 9,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The 3rd Law — Make It Easy',
    title: 'The Law of Least Effort & Environment Design',
    subtitle: 'Friction is the Supreme Lever of Behavior',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Human behavior follows the Law of Least Effort: when deciding between two similar options, people naturally gravitate toward the option requiring the least amount of physical energy.',
      'To build a good habit, reduce the friction associated with it. If you want to draw more, place your sketchbook and pencils directly on your desk, open and ready.',
      'To break a bad habit, increase the friction. If you waste hours on social media, delete the apps from your phone, log out after every session, or place your phone in another room during work hours.'
    ]
  },
  {
    id: 'atomic-l10',
    lessonNumber: 10,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The 3rd Law — Make It Easy',
    title: 'The Two-Minute Rule: Standardize Before You Optimize',
    subtitle: 'Gateway Habits That Defeat Inertia',
    type: 'exercise',
    estimatedMinutes: 5,
    content: [
      'When you start a new habit, it should take less than two minutes to do. "Read before bed" becomes "Read one page." "Do thirty minutes of yoga" becomes "Unroll my yoga mat." "Fold the laundry" becomes "Fold one pair of socks."',
      'The point is not to do the entire task in two minutes; the point is to master the art of showing up. You cannot optimize a habit that does not exist.',
      'Once you establish the ritual of showing up for two minutes, continuing the practice becomes vastly easier.'
    ]
  },
  {
    id: 'atomic-l11',
    lessonNumber: 11,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The 4th Law — Make It Satisfying',
    title: 'The Cardinal Rule of Behavior Change & Habit Tracking',
    subtitle: 'What is Rewarded is Repeated; What is Punished is Avoided',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'The human brain evolved in an Immediate Return Environment, where survival required prioritizing immediate rewards over delayed benefits. Modern society is a Delayed Return Environment, where the rewards of good habits (saving money, eating well, studying) take months to appear.',
      'To make a habit stick, add a small piece of immediate satisfaction right after performing it.',
      'Habit Tracking is one of the most powerful satisfying tools: crossing an X on a calendar provides visual proof of your progress, signaling accomplishment and keeping your streak alive.'
    ]
  },
  {
    id: 'atomic-l12',
    lessonNumber: 12,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The 4th Law — Make It Satisfying',
    title: 'Never Miss Twice & The Goldilocks Rule',
    subtitle: 'Mastery and the Plateau of Latent Potential',
    type: 'reflection',
    estimatedMinutes: 6,
    content: [
      'The secret to long-term consistency is the rule: "Never miss twice." Missing one workout is an accident; missing two in a row is the start of a new, negative habit.',
      'The Goldilocks Rule states that humans experience peak motivation when working on tasks right on the edge of their current abilities—not too hard, not too easy, but just right (around 4% beyond current capacity).',
      'The greatest threat to success is not failure, but boredom. Anyone can work hard when they feel motivated; the mark of true professionals is that they show up and execute even when the routine feels mundane.'
    ],
    keyTakeaways: [
      'You do not rise to the level of your goals; you fall to the level of your systems.',
      'True behavior change is identity change: every action is a vote for who you want to be.',
      'The 4 Laws: Make it Obvious, Make it Attractive, Make it Easy, and Make it Satisfying.',
      'Never miss twice: consistency and showing up matter far more than intermittent perfection.'
    ],
    reflectionQuestion: 'Which of the 4 Laws of Behavior Change currently represents the biggest opportunity to upgrade your daily routines?'
  }
];

export const atomicHabitsContent: ReadingBookContent = {
  bookId: 'atomic-habits',
  title: 'Atomic Habits',
  author: 'James Clear',
  genre: 'Self-Help / Psychology / Productivity',
  publishedYear: 2018,
  contentType: 'self-help',
  sourceType: 'curated-guide',
  summary: 'An easy and proven way to build good habits and break bad ones through 1% daily marginal gains, identity-based behavior, and the 4 Laws of Behavior Change by James Clear.',
  aboutThisBook: [
    'Published in 2018 by habit expert James Clear, "Atomic Habits" has become the world’s definitive guide on personal transformation and behavioral psychology. Clear demystifies why small changes make a monumental difference over time, using the core premise that habits are the compound interest of self-improvement.',
    'Rather than relying on fleeting willpower or high-pressure goal setting, Clear argues that you do not rise to the level of your goals; you fall to the level of your systems. By understanding the four-stage neurological feedback loop—Cue, Craving, Response, and Reward—anyone can systematically design an environment where good habits become effortless and bad habits become impossible.',
    'The guide provides an actionable blueprint anchored by the Four Laws of Behavior Change: Make it Obvious, Make it Attractive, Make it Easy, and Make it Satisfying, combined with identity-based change where every action serves as a vote for who you want to become.'
  ],
  aboutBook: {
    setting: 'Modern Behavioral Science & Applied Human Psychology',
    premise: 'A comprehensive framework for breaking negative routines and building positive habits through 1% micro-improvements, identity alignment, and environment design.',
    keyCharacters: [
      'James Clear — Author and behavioral researcher who synthesized cognitive neuroscience into practical life systems',
      'Dave Brailsford — Performance director of British Cycling who proved the power of the "Aggregation of Marginal Gains"'
    ],
    mainConflict: 'The tension between our short-term evolutionary craving for immediate dopamine rewards and our long-term aspirations for compounding mastery, health, and fulfillment.',
    centralThemes: [
      'Systems Over Goals — Focus on the trajectory of daily inputs rather than temporary outcome milestones',
      'Identity-Based Behavior Change — Changing *who* you believe you are rather than merely *what* you want to achieve',
      'The 4 Laws of Behavior Change — Obvious cues, attractive rewards, easy execution, and immediate satisfaction',
      'Environment Design as the Invisible Hand — Reducing friction for virtues and increasing friction for vices'
    ],
    whatToExpect: 'An actionable 12-lesson masterclass in behavioral mechanics, habit stacking formulas, the two-minute rule, and consistency strategies.'
  },
  totalChapters: 6,
  totalLessons: lessons.length,
  chapters: [
    { id: 'atomic-ch1', chapterNumber: 1, title: 'Chapter 1: The Fundamentals of Atomic Habits', subtitle: 'Marginal Gains and System vs Goal Architecture', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'atomic-ch2', chapterNumber: 2, title: 'Chapter 2: Identity-Based Habits', subtitle: 'The 3 Layers of Change and Voting for Self-Image', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'atomic-ch3', chapterNumber: 3, title: 'Chapter 3: The 1st Law — Make It Obvious', subtitle: 'The Habit Loop, Scorecards, and Habit Stacking', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'atomic-ch4', chapterNumber: 4, title: 'Chapter 4: The 2nd Law — Make It Attractive', subtitle: 'Dopamine Anticipation and the Power of the Social Tribe', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'atomic-ch5', chapterNumber: 5, title: 'Chapter 5: The 3rd Law — Make It Easy', subtitle: 'Least Effort, Environment Friction, and the 2-Minute Rule', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'atomic-ch6', chapterNumber: 6, title: 'Chapter 6: The 4th Law — Make It Satisfying', subtitle: 'Immediate Rewards, Habit Tracking, and Never Missing Twice', lessons: lessons.filter(l => l.chapterNumber === 6) }
  ],
  lessons
};
