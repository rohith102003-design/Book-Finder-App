import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: '1984-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Totalitarian State of Oceania',
    title: 'War is Peace, Freedom is Slavery, Ignorance is Strength',
    subtitle: 'Winston Smith in Airstrip One',
    type: 'reading',
    estimatedMinutes: 6,
    content: [
      'George Orwell’s dystopian masterpiece, published in 1949, opens on a cold, bright day in April as the clocks strike thirteen. Winston Smith, a low-ranking member of the Outer Party in London (the chief city of Airstrip One, the third most populous province of Oceania), returns to his dilapidated residence at Victory Mansions.',
      'Oceania is ruled by the omnipresent Party under the figurehead of Big Brother. The physical environment is grimy, decaying, and impoverished, dominated by four monolithic pyramid structures: the Ministry of Truth (Minitrue, responsible for news and propaganda), the Ministry of Peace (Minipax, responsible for perpetual war), the Ministry of Love (Miniluv, responsible for law and torture), and the Ministry of Plenty (Miniplenty, responsible for economic rations).',
      'Inside every room, a two-way device known as a telescreen broadcasts nonstop propaganda while secretly monitoring every facial expression, whisper, and movement for the dreaded Thought Police (Thinkpol).'
    ]
  },
  {
    id: '1984-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Totalitarian State of Oceania',
    title: 'The Diary & The Ultimate Taboo of Thoughtcrime',
    subtitle: 'DOWN WITH BIG BROTHER',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'Sitting in a small alcove just out of sight of the telescreen, Winston commits his first overt act of rebellion: he opens an unlined, cream-paper blank book purchased from an antique shop in the proletarian quarters.',
      'Winston dips his pen into real ink and writes the date: April 4th, 1984 (though he cannot even be certain of the year, as the Party continually alters historical chronology). Overwhelmed by pent-up horror, his hand scrawls across the page in jagged letters: "DOWN WITH BIG BROTHER."',
      'To write in a diary is to commit Thoughtcrime (crimethink)—the essential crime that contains all others in itself. In Oceania, the punishment for thoughtcrime is not merely execution, but "vaporization": the complete erasure of a person’s existence from all records and public memory.'
    ]
  },
  {
    id: '1984-l3',
    lessonNumber: 3,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: The Two Minutes Hate & Linguistic Control',
    title: 'The Two Minutes Hate & Emmanuel Goldstein',
    subtitle: 'Weaponizing Mass Psychology',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'Every day at the Ministry of Truth, workers are assembled for the "Two Minutes Hate." A massive screen projects the face of Emmanuel Goldstein, the Enemy of the People and leader of the clandestine Brotherhood.',
      'The crowd descends into frenzied animalistic shrieking, hurling abuse and objects at the screen. Winston observes how easily this collective rage can be manipulated, noticing a dark-haired girl from the Fiction Department staring at him with seeming hostility, and making momentary, electric eye contact with O\'Brien, an enigmatic member of the Inner Party.',
      'The Hate illustrates how totalitarian regimes redirect citizens’ natural frustrations and sexual repression into state-sanctioned hysteria directed at external scapegoats.'
    ]
  },
  {
    id: '1984-l4',
    lessonNumber: 4,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: The Two Minutes Hate & Linguistic Control',
    title: 'Newspeak & The Narrowing of Human Thought',
    subtitle: 'The Linguistic Destruction of Consciousness',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'In the Ministry cafeteria, Winston speaks with Syme, an intelligent philologist working on the Eleventh Edition of the Newspeak Dictionary. Syme explains the true objective of Newspeak: not to expand language, but to systematically destroy words.',
      'By eliminating synonyms, shades of meaning, and antonyms (e.g., replacing "bad" with "ungood", "great" with "plusgood" or "doubleplusgood"), the Party seeks to make thoughtcrime literally impossible because there will be no words left with which to formulate subversive concepts.',
      'Winston realizes that Syme is too intelligent and sees too clearly; despite his orthodoxy, Syme is destined to be vaporized—a stark illustration of how totalitarian systems eliminate intelligence in favor of blind conformity.'
    ]
  },
  {
    id: '1984-l5',
    lessonNumber: 5,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: The Mutability of the Past',
    title: 'Minitrue: Who Controls the Past Controls the Future',
    subtitle: 'Rewriting Reality Through the Memory Hole',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Winston’s daily job at the Ministry of Truth involves altering back issues of The Times newspaper. Whenever the Party’s economic forecasts prove wrong, or whenever a Party official falls out of favor, Winston rewrites historical articles so that Big Brother is always prophetically correct.',
      'Original documents are sucked into pneumatic tubes and dropped into fiery incinerators known as "memory holes." History is not preserved; it is an infinitely pliable canvas rewritten day by day.',
      'This illustrates the Party\'s core slogan: "Who controls the past controls the future: who controls the present controls the past." If human memory can be overridden by official documentation, then objective truth ceases to exist.'
    ]
  },
  {
    id: '1984-l6',
    lessonNumber: 6,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: The Mutability of the Past',
    title: 'Doublethink: Holding Contradictory Beliefs Simultaneously',
    subtitle: 'The Psychological Mechanics of Tyranny',
    type: 'concept',
    estimatedMinutes: 5,
    content: [
      'The psychological cornerstone of Oceania is Doublethink (in Oldspeak, reality control): the power of holding two contradictory beliefs in one’s mind simultaneously, and accepting both of them as true.',
      'To practice doublethink, one must tell deliberate lies while genuinely believing in them, forget any fact that has become inconvenient, and then forget that one has forgotten it.',
      'Doublethink allows the Party to preach "War is Peace" (perpetual war stabilizes the internal social structure), "Freedom is Slavery" (the solitary individual is always defeated, but collective submission endures), and "Ignorance is Strength" (popular ignorance prevents rebellion).'
    ]
  },
  {
    id: '1984-l7',
    lessonNumber: 7,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The Proles & Forbidden Love',
    title: 'If There is Hope, It Lies in the Proles',
    subtitle: 'The Human Spirit in the Slums of London',
    type: 'worldbuilding',
    estimatedMinutes: 5,
    content: [
      'Eighty-five percent of Oceania’s population comprises the "proles" (the working-class proletariat). Ignored by the Party as subhuman animals, the proles are left free from telescreens, given cheap gin, pornography, and state-run lotteries.',
      'Winston writes in his diary: "If there is hope, it lies in the proles." Unlike Party members whose emotions are robotic and controlled, the proles have preserved genuine human feeling: private loyalties, traditional folk songs, familial love, and natural grief.',
      'Yet the proles lack political consciousness: "Until they become conscious they will never rebel, and until after they have rebelled they cannot become conscious."'
    ]
  },
  {
    id: '1984-l8',
    lessonNumber: 8,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The Proles & Forbidden Love',
    title: 'Julia & The Note: "I Love You"',
    subtitle: 'The Erotic Rebellion Against the Party',
    type: 'character',
    estimatedMinutes: 6,
    content: [
      'In a corridor at Minitrue, the dark-haired girl falls and slips a folded slip of paper into Winston’s hand. In private, Winston unfolds the paper to read three words: "I love you."',
      'Her name is Julia. Unlike Winston, whose rebellion is intellectual and philosophical, Julia’s rebellion is practical, sensual, and visceral. She hates the Party because it denies human pleasure and forces unnatural sexual puritanism through organizations like the Junior Anti-Sex League.',
      'Meeting in the golden countryside outside London (the "Golden Country"), Winston and Julia make love beneath the open sky. For Winston, this act is not merely romance, but a conscious political strike: "It was a political act."'
    ]
  },
  {
    id: '1984-l9',
    lessonNumber: 9,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Sanctuary & The Trap',
    title: 'Mr. Charrington\'s Room & The Glass Paperweight',
    subtitle: 'A Fleeting Oasis of the Lost Past',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'Winston rents an upstairs room above Mr. Charrington’s antique shop in the prole quarter. The room has no telescreen, featuring an antique mahogany bed, a ticking clock, and a heavy glass paperweight containing a delicate pink sea coral.',
      'The glass paperweight becomes a potent symbol for Winston: a fragile, beautiful world of the uncorrupted past, frozen in time and protected by the curved glass of their private sanctuary.',
      'For several months, Winston and Julia live like husband and wife in their hidden room, brewing real coffee and listening to a prole woman singing while hanging laundry in the courtyard below.'
    ]
  },
  {
    id: '1984-l10',
    lessonNumber: 10,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Sanctuary & The Trap',
    title: 'O\'Brien & The Brotherhood',
    subtitle: 'The Illusory Conspiracy',
    type: 'conflict',
    estimatedMinutes: 6,
    content: [
      'Winston and Julia visit O\'Brien’s luxurious Inner Party apartment. O\'Brien turns off his telescreen—a staggering privilege reserved for the elite—and confirms the existence of the underground resistance movement known as the Brotherhood.',
      'Winston and Julia pledge themselves to the cause, declaring their willingness to commit murder, sabotage, and treason to undermine the Party, reserving only one boundary: they will never betray their love for each other.',
      'O\'Brien promises to send Winston a copy of Emmanuel Goldstein\'s forbidden book: *The Theory and Practice of Oligarchical Collectivism*.'
    ]
  },
  {
    id: '1984-l11',
    lessonNumber: 11,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The Book & The Shattering',
    title: 'The Theory and Practice of Oligarchical Collectivism',
    subtitle: 'The Anatomy of Power',
    type: 'concept',
    estimatedMinutes: 7,
    content: [
      'In the sanctuary above the antique shop, Winston reads Goldstein’s book to Julia. The book outlines the structural truth of human history: the cyclical struggle between the High, the Middle, and the Low classes.',
      'Goldstein explains that perpetual war among Oceania, Eurasia, and Eastasia is not designed to conquer territory, but to consume the surplus products of human labor without raising the general standard of living, preserving an unequal hierarchy.',
      'Winston understands the *how* of the Party\'s machinery, but still seeks to understand the *why*: what drives the Inner Party to pursue power with such cold fanaticism?'
    ]
  },
  {
    id: '1984-l12',
    lessonNumber: 12,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The Book & The Shattering',
    title: 'The Iron Voice: "You are the Dead"',
    subtitle: 'The Trap Snaps Shut',
    type: 'climax',
    estimatedMinutes: 5,
    content: [
      'As Winston gazes out the window at the singing prole woman, he whispers to Julia: "We are the dead." Suddenly, an iron voice behind the wall picture of St Clement\'s Danes echoes: "You are the dead."',
      'The picture crashes to the floor, revealing a hidden telescreen that had recorded their every word. Armed Thought Police storm the room, brutally beating Julia and arresting Winston.',
      'Mr. Charrington enters the room, transformed from an eccentric old prole into a cold, upright agent of the Thought Police. The glass paperweight is smashed against the hearthstone, shattering their fragile sanctuary into pieces.'
    ]
  },
  {
    id: '1984-l13',
    lessonNumber: 13,
    chapterNumber: 7,
    chapterTitle: 'Chapter 7: Inside the Ministry of Love',
    title: 'The Place Where There Is No Darkness',
    subtitle: 'The Systematic Deconstruction of the Self',
    type: 'climax',
    estimatedMinutes: 6,
    content: [
      'Winston is imprisoned in the windowless, white-tiled cells of the Ministry of Love, where fluorescent lights burn day and night without interruption—the literal fulfillment of O\'Brien’s earlier promise: "We shall meet in the place where there is no darkness."',
      'O\'Brien emerges not as a fellow rebel, but as Winston’s primary inquisitor and torturer. O\'Brien explains that the Party does not merely execute heretics; it cures them. The Spanish Inquisition failed because it created martyrs; the Party crushes the human spirit so thoroughly that not even the memory of dissent survives.',
      'Using an electric dial that inflicts escalating agony, O\'Brien forces Winston to practice doublethink regarding basic arithmetic: when O\'Brien holds up four fingers, Winston must genuinely see five fingers if the Party says so.'
    ]
  },
  {
    id: '1984-l14',
    lessonNumber: 14,
    chapterNumber: 7,
    chapterTitle: 'Chapter 7: Inside the Ministry of Love',
    title: 'Power for the Sake of Power: The Boot Stamping on a Face',
    subtitle: 'The Ultimate Philosophy of Oligarchical Collectivism',
    type: 'theme',
    estimatedMinutes: 6,
    content: [
      'When Winston asks why the Party seeks absolute power, O\'Brien delivers the terrifying philosophical core of the novel: "The Party seeks power entirely for its own sake. We are not interested in the good of others; we are interested solely in power, pure power."',
      'O\'Brien explains that true power is not power over things, but power over human minds: the power to inflict pain, humiliation, and to tear human consciousness to pieces and reassemble it in new shapes of the Party\'s choosing.',
      'O\'Brien summarizes the future of humanity in one of the most chilling lines in literature: "If you want a picture of the future, imagine a boot stamping on a human face—for ever."'
    ]
  },
  {
    id: '1984-l15',
    lessonNumber: 15,
    chapterNumber: 8,
    chapterTitle: 'Chapter 8: Room 101 & The Final Defeat',
    title: 'Room 101: The Worst Thing in the World',
    subtitle: 'The Ultimate Betrayal',
    type: 'climax',
    estimatedMinutes: 6,
    content: [
      'Though physically broken and intellectually compliant, Winston still retains one final fortress of individuality: deep within his heart, he has not betrayed Julia.',
      'O\'Brien transfers Winston to the dreaded Room 101. O\'Brien explains: "The thing that is in Room 101 is the worst thing in the world." For every individual, Room 101 contains their specific, unendurable terror. For Winston, that terror is carnivorous sewer rats.',
      'O\'Brien brings forth a wire cage containing two ravenous, squealing rats designed to clamp onto Winston’s face. In a frantic, primal panic where reason dissolves, Winston sacrifices his soul to escape the nightmare, screaming the only words that can save him: "Do it to Julia! Do it to Julia! Not me! Julia! I don\'t care what you do to her. Tear her face off, strip her to the bones. Not me! Julia! Not me!"'
    ]
  },
  {
    id: '1984-l16',
    lessonNumber: 16,
    chapterNumber: 8,
    chapterTitle: 'Chapter 8: Room 101 & The Final Defeat',
    title: 'The Chestnut Tree Café & He Loved Big Brother',
    subtitle: 'The Complete Victory of Totalitarianism',
    type: 'resolution',
    estimatedMinutes: 6,
    content: [
      'Released back into society as a hollow shell, Winston spends his empty days at the Chestnut Tree Café drinking Victory Gin and playing chess.',
      'He runs into Julia on a cold winter afternoon in the park. They look at each other with mutual detachment, both acknowledging that in Room 101, under the threat of absolute terror, they genuinely betrayed and transferred their suffering to one another. The emotional connection that made them human is irrevocably dead.',
      'A trumpet call announces a triumphant victory over Eurasian forces. Looking up at the colossal portrait of Big Brother on the wall, Winston feels tears of gin roll down his nose. The long struggle within him is finished: "He had won the victory over himself. He loved Big Brother."'
    ],
    keyTakeaways: [
      'Language is the foundational substrate of thought; narrowing language directly curtails the ability to conceive freedom.',
      'Totalitarianism seeks absolute control over subjective reality, history, and the emotional interiority of the individual.',
      'Fear and physical terror can dismantle human empathy unless society vigorously defends freedom of thought and truth.',
      'Objective truth (2 + 2 = 4) is the ultimate safeguard of human dignity.'
    ],
    reflectionQuestion: 'How does Orwell’s concept of Newspeak and Doublethink serve as a warning for modern media ecosystems and political discourse?'
  }
];

export const nineteenEightyFourContent: ReadingBookContent = {
  bookId: '1984-george-orwell',
  title: '1984',
  author: 'George Orwell',
  genre: 'Dystopian Fiction / Political Satire',
  publishedYear: 1949,
  contentType: 'fiction',
  sourceType: 'curated-guide',
  summary: 'George Orwell’s terrifying masterpiece detailing Winston Smith’s doomed rebellion against Big Brother, the Thought Police, and the psychological horrors of totalitarian reality control.',
  aboutThisBook: [
    'Published in 1949 as a warning against the rising totalitarian regimes of the twentieth century, George Orwell’s "1984" depicts a nightmarish superstate where individual consciousness, historical truth, and human affection are systematically extinguished by the ruling Party under Big Brother.',
    'Winston Smith, an Outer Party clerk working in the Ministry of Truth, spends his days rewriting history to match current propaganda. Secretly harboring forbidden doubts, Winston buys a blank diary to record his illegal thoughts, falls into a passionate subversive love affair with Julia, and seeks out an underground resistance movement known as the Brotherhood.',
    'Orwell’s profound masterpiece introduced enduring cultural concepts that define modern political analysis: Newspeak, Doublethink, Thoughtcrime, the Memory Hole, and the terrifying premise that whoever controls the records of the past dictates the reality of the present.'
  ],
  aboutBook: {
    setting: 'Airstrip One (London), Oceania — A grim, decaying, war-torn totalitarian society under omnipresent surveillance',
    premise: 'A disillusioned clerk rebels against a totalitarian regime through secret journaling and forbidden romance, only to find himself trapped in the Ministry of Love.',
    keyCharacters: [
      'Winston Smith — A thirty-nine-year-old Outer Party worker yearning for objective truth and human connection',
      'Julia — A pragmatic, sensual young woman who rebels against Party puritanism for personal pleasure',
      'O’Brien — An imposing, enigmatic member of the Inner Party who poses as a rebel before revealing his role as inquisitor',
      'Big Brother — The omnipresent, god-like figurehead whose face stares from posters and telescreens',
      'Emmanuel Goldstein — The demonized "Enemy of the People" and putative leader of the Brotherhood resistance'
    ],
    mainConflict: 'The struggle of an individual human consciousness to preserve private thoughts, memories, and empathy against a totalitarian system that demands total psychological surrender.',
    centralThemes: [
      'Linguistic Control (Newspeak) — How eliminating words curtails the capacity for critical thought',
      'Mutability of the Past & Doublethink — The psychological manipulation of holding two contradictory facts as true',
      'Surveillance & Loss of Privacy — Telescreens and Thought Police destroying the private sphere',
      'Power as an End in Itself — Totalitarianism seeking power solely to inflict suffering and dominate consciousness'
    ],
    whatToExpect: 'A compelling 16-lesson analytical guide detailing Orwell’s political philosophy, literary symbolism, and psychological warnings.'
  },
  totalChapters: 8,
  totalLessons: lessons.length,
  chapters: [
    { id: '1984-ch1', chapterNumber: 1, title: 'Chapter 1: The Totalitarian State of Oceania', subtitle: 'Airstrip One, Big Brother, and the Diary of Thoughtcrime', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: '1984-ch2', chapterNumber: 2, title: 'Chapter 2: The Two Minutes Hate & Linguistic Control', subtitle: 'Emmanuel Goldstein and the Narrowing of Language in Newspeak', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: '1984-ch3', chapterNumber: 3, title: 'Chapter 3: The Mutability of the Past', subtitle: 'The Ministry of Truth, Memory Holes, and Doublethink', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: '1984-ch4', chapterNumber: 4, title: 'Chapter 4: The Proles & Forbidden Love', subtitle: 'The Proletariat Slums and Julia’s Note of Defiance', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: '1984-ch5', chapterNumber: 5, title: 'Chapter 5: The Sanctuary & The Trap', subtitle: 'Mr. Charrington’s Antique Room and O\'Brien’s Conspiracy', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: '1984-ch6', chapterNumber: 6, title: 'Chapter 6: The Book & The Shattering', subtitle: 'Goldstein’s Manifesto, The Iron Voice, and the Shattered Paperweight', lessons: lessons.filter(l => l.chapterNumber === 6) },
    { id: '1984-ch7', chapterNumber: 7, title: 'Chapter 7: Inside the Ministry of Love', subtitle: 'The Place Where There Is No Darkness and Power for Power’s Sake', lessons: lessons.filter(l => l.chapterNumber === 7) },
    { id: '1984-ch8', chapterNumber: 8, title: 'Chapter 8: Room 101 & The Final Defeat', subtitle: 'The Caged Rats, The Betrayal of Julia, and Loving Big Brother', lessons: lessons.filter(l => l.chapterNumber === 8) }
  ],
  lessons
};
