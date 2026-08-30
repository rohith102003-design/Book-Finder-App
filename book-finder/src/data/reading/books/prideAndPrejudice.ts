import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'pp-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: First Impressions & Social Status',
    title: 'It is a Truth Universally Acknowledged',
    subtitle: 'The Bennet Family & Regency Marriage Economics',
    type: 'reading',
    estimatedMinutes: 6,
    content: [
      'Jane Austen’s 1813 classic opens with one of the most famous ironic lines in English literature: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife."',
      'Set in rural Hertfordshire, England, the story centers on the Bennet household at Longbourn. With five daughters—Jane, Elizabeth, Mary, Kitty, and Lydia—and an estate entailed away to a distant male cousin (Mr. Collins), the family faces financial ruin unless the daughters marry well.',
      'The arrival of the wealthy, genial Mr. Charles Bingley at nearby Netherfield Park sends Mrs. Bennet into a flurry of match-making excitement.'
    ]
  },
  {
    id: 'pp-l2',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: First Impressions & Social Status',
    title: 'The Meryton Assembly: Elizabeth and Mr. Darcy',
    subtitle: 'Pride Ignited and Prejudice Formed',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'At the local Meryton ball, Charles Bingley charms everyone with his amiable manners, dancing repeatedly with the beautiful and gentle eldest daughter, Jane Bennet.',
      'In contrast, Bingley’s companion, Mr. Fitzwilliam Darcy of Pemberley, possesses double Bingley’s wealth (£10,000 a year) but disgusts the room with his haughty, aloof demeanor. When Bingley suggests Darcy dance with Elizabeth Bennet, Darcy snubs her publicly within earshot: "She is tolerable; but not handsome enough to tempt me."',
      'Elizabeth laughs off the insult with spirited wit, but the slight sows the seed of her deep prejudice against Darcy’s aristocratic arrogance.'
    ]
  },
  {
    id: 'pp-l3',
    lessonNumber: 2,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Netherfield & George Wickham',
    title: 'The Stay at Netherfield: Elizabeth’s Fine Eyes',
    subtitle: 'Darcy’s Reluctant Fascination',
    type: 'character',
    estimatedMinutes: 5,
    content: [
      'When Jane falls ill after riding through the rain to Netherfield, Elizabeth walks three miles through mud to nurse her sister, arriving with petticoats six inches deep in dirt.',
      'While the snooty Bingley sisters (Caroline Bingley and Mrs. Hurst) mock Elizabeth’s lack of decorum, Darcy is secretly captivated by the brilliance of her dark eyes and the healthy glow of her spirited walk.',
      'During evening parlor conversations, Elizabeth and Darcy engage in sharp, intellectual fencing matches regarding human nature, pride, and the qualities of an "accomplished woman."'
    ]
  },
  {
    id: 'pp-l4',
    lessonNumber: 2,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Netherfield & George Wickham',
    title: 'Enter George Wickham: The Deceptive Slanderer',
    subtitle: 'Charming Manners Masquerading as Virtue',
    type: 'conflict',
    estimatedMinutes: 6,
    content: [
      'In the nearby town of Meryton, Elizabeth meets George Wickham, a handsome and charming militia officer. Wickham tells Elizabeth a harrowing tale of victimization: he claims Darcy cheated him out of a valuable church living promised to him by Darcy\'s late father out of pure spite.',
      'Preconditioned to believe the worst of Darcy, Elizabeth accepts Wickham’s story uncritically, failing to notice that Wickham’s charm is superficial and unverified.',
      'This illustrates Austen’s central theme: external social polish often masks moral rot, while awkward aloofness can conceal genuine integrity.'
    ]
  },
  {
    id: 'pp-l5',
    lessonNumber: 3,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Proposals & Departures',
    title: 'Mr. Collins’ Absurd Proposal & Charlotte Lucas’ Pragmatism',
    subtitle: 'Marriage as an Economic Contract',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Mr. Collins, a pompous, sycophantic clergyman under the patronage of Lady Catherine de Bourgh, arrives at Longbourn seeking a wife to make amends for the entailment. He proposes to Elizabeth in a comical, business-like speech, refusing to accept that her refusal is genuine.',
      'When Elizabeth firmly rejects him, Mr. Collins turns around within days and proposes to Elizabeth\'s sensible best friend, Charlotte Lucas.',
      'Charlotte accepts, explaining to an appalled Elizabeth that marriage for a twenty-seven-year-old woman without fortune is primarily an economic shield against poverty: "I am not romantic, you know; I never was. I ask only a comfortable home."'
    ]
  },
  {
    id: 'pp-l6',
    lessonNumber: 3,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Proposals & Departures',
    title: 'The Desertion of Netherfield & Heartbreak in London',
    subtitle: 'Interference in Jane and Bingley’s Romance',
    type: 'conflict',
    estimatedMinutes: 5,
    content: [
      'Without warning, the Netherfield party abruptly leaves for London for the winter, and Caroline Bingley sends a letter implying that Bingley will marry Darcy’s sister, Georgiana.',
      'Jane suffers quietly with patient grace, but Elizabeth furiously suspects that Darcy and Caroline orchestrated the departure to sever Bingley from the Bennet family\'s vulgar connections.',
      'Elizabeth’s resentment toward Darcy hardens into absolute condemnation.'
    ]
  },
  {
    id: 'pp-l7',
    lessonNumber: 4,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Rosings Park & The First Proposal',
    title: 'Rosings Park & Lady Catherine de Bourgh',
    subtitle: 'Aristocratic Tyranny Examined',
    type: 'worldbuilding',
    estimatedMinutes: 5,
    content: [
      'Elizabeth visits Charlotte and Mr. Collins at Hunsford parsonage, frequently dining at Rosings Park, the opulent estate of Lady Catherine de Bourgh (Darcy\'s overbearing aunt).',
      'Darcy arrives to visit his aunt, frequently seeking out Elizabeth\'s company on her morning walks through the park.',
      'Colonel Fitzwilliam (Darcy’s cousin) inadvertently reveals to Elizabeth that Darcy recently congratulated himself on saving a dear friend (Bingley) from the "inconveniences of a most imprudent marriage."'
    ]
  },
  {
    id: 'pp-l8',
    lessonNumber: 4,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Rosings Park & The First Proposal',
    title: 'The Cataclysmic First Proposal: "In Vain Have I Struggled"',
    subtitle: 'Pride and Prejudice Clash Head-On',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Alone at the parsonage, Elizabeth is startled when Darcy enters and bursts into a passionate, clumsy declaration of love: "In vain have I struggled. It will not do. My feelings will not be repressed. You must allow me to tell you how ardently I admire and love you."',
      'However, Darcy spends half the proposal detailing his revulsion at her inferior social standing and her family’s lack of propriety.',
      'Elizabeth fiercely rejects him, charging him with ruining Jane’s happiness and destroying Wickham’s prospects: "You could not have made me the offer of your hand in any possible way that would have tempted me to accept it... I had not known you a month before I felt that you were the last man in the world whom I could ever be prevailed on to marry."'
    ]
  },
  {
    id: 'pp-l9',
    lessonNumber: 5,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Letter & Pemberley',
    title: 'Darcy\'s Letter: The Painful Unveiling of Truth',
    subtitle: 'Till This Moment I Never Knew Myself',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'The following morning, Darcy silently delivers a long, dignified letter to Elizabeth explaining two matters: 1) He separated Bingley and Jane because he honestly believed Jane was indifferent to Bingley, and 2) Wickham is a degenerate gambler who squandered his inheritance and attempted to elope with Darcy\'s fifteen-year-old sister Georgiana for her £30,000 dowry.',
      'Reading and re-reading the letter, Elizabeth’s blind prejudice collapses. She realizes her pride in her own quick judgment blinded her to Wickham’s falsity and Darcy’s honor.',
      'In a famous epiphany, Elizabeth cries: "How despicably I have acted! I, who have prided myself on my discernment!... Till this moment I never knew myself."'
    ]
  },
  {
    id: 'pp-l10',
    lessonNumber: 5,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Letter & Pemberley',
    title: 'Pemberley Estate: The True Character of Fitzwilliam Darcy',
    subtitle: 'To Be Mistress of Pemberley Might Be Something!',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'Touring Derbyshire with her sensible aunt and uncle Gardiner, Elizabeth agrees to visit Pemberley, believing the master to be away. Pemberley is magnificent, standing in harmony with nature without ostentation.',
      'The housekeeper, Mrs. Reynolds, provides glowing, unsolicited testimony about Darcy: he is the kindest, most generous master and brother she has known since his childhood.',
      'Darcy unexpectedly returns early. Instead of being proud or resentful, he treats Elizabeth and the middle-class Gardiners with extraordinary warmth, gentleness, and respect, introducing Elizabeth to his sister Georgiana.'
    ]
  },
  {
    id: 'pp-l11',
    lessonNumber: 6,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Crisis, Redemption & Union',
    title: 'Lydia’s Disgrace & Darcy’s Secret Rescue',
    subtitle: 'Love Expressed Through Selfless Action',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Catastrophe strikes: sixteen-year-old Lydia Bennet elopes with Wickham from Brighton without marriage, threatening the entire Bennet family with permanent social ruin and ostracism.',
      'Hearing the news, Elizabeth breaks down before Darcy, despairing that her family’s degradation has destroyed any hope of reconciliation between them.',
      'Unknown to Elizabeth, Darcy tracks the fugitives down in the slums of London. Darcy uses his immense fortune and influence to pay off Wickham’s debts, buy Wickham an army commission, and force Wickham to marry Lydia, preserving the Bennet family name while demanding absolute secrecy so Elizabeth would never feel indebted to him.'
    ]
  },
  {
    id: 'pp-l12',
    lessonNumber: 6,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Crisis, Redemption & Union',
    title: 'Lady Catherine’s Visit & The Triumph of Mutual Respect',
    subtitle: 'An Equal Union of Minds and Hearts',
    type: 'resolution',
    estimatedMinutes: 6,
    content: [
      'Lady Catherine de Bourgh storms Longbourn to forbid Elizabeth from marrying Darcy. Elizabeth stands resolute, refusing to be bullied by aristocratic entitlement: "I am only resolved to act in that manner, which will, in my own opinion, constitute my happiness, without reference to you."',
      'When Lady Catherine reports Elizabeth’s defiance to Darcy, it gives him hope. Returning to Longbourn with Bingley (who promptly proposes to Jane), Darcy walks with Elizabeth and renews his proposal.',
      'Elizabeth accepts with joy. Both characters have humbled themselves: Darcy has conquered his aristocratic pride, and Elizabeth has overcome her hasty prejudice, creating one of the most balanced, intellectually equal marriages in world literature.'
    ],
    keyTakeaways: [
      'First impressions and quick intuitive judgments often deceive; true character reveals itself over time.',
      'Pride and prejudice are twin psychological traps that prevent authentic mutual understanding.',
      'Love requires humility, self-reflection, and the willingness to acknowledge one\'s flaws.',
      'Economic security is vital, but marrying without mutual respect and affection diminishes the human soul.'
    ],
    reflectionQuestion: 'How does the evolution of Elizabeth and Darcy’s relationship illustrate that self-knowledge is a prerequisite for genuine love?'
  }
];

export const prideAndPrejudiceContent: ReadingBookContent = {
  bookId: 'pride-and-prejudice',
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  genre: 'Classic Literature / Regency Romance / Satire',
  publishedYear: 1813,
  contentType: 'classic',
  sourceType: 'curated-guide',
  summary: 'Jane Austen’s witty and profound romantic masterpiece detailing the turbulent relationship between the spirited Elizabeth Bennet and the proud, aristocratic Mr. Darcy in 19th-century England.',
  aboutThisBook: [
    'Published in 1813, Jane Austen’s "Pride and Prejudice" is a triumph of English social satire, psychological nuance, and romantic literature. Set in Regency-era rural England, the novel follows Elizabeth Bennet, the sharp-witted and independent second daughter of an eccentric country family facing financial displacement due to strict legal inheritance laws.',
    'When the wealthy, amiable Mr. Bingley and his haughty companion Mr. Fitzwilliam Darcy arrive in Hertfordshire, Elizabeth and Darcy immediately clash: Darcy dismisses Elizabeth at a local ball, while Elizabeth forms an instant prejudice against Darcy’s aristocratic arrogance, exacerbated by the slanderous charm of the soldier George Wickham.',
    'As the characters journey between country estates, London, and the magnificent grounds of Pemberley, Austen unpacks the economic realities of 19th-century marriage while demonstrating that true mutual understanding requires shedding egoistic pride and hasty prejudice.'
  ],
  aboutBook: {
    setting: 'Regency-era England (Longbourn in Hertfordshire, Netherfield Park, Rosings Park in Kent, London, and Pemberley Estate in Derbyshire)',
    premise: 'A spirited, intelligent young woman and a wealthy, aloof aristocrat must overcome their respective flaws of prejudice and pride to recognize their profound compatibility.',
    keyCharacters: [
      'Elizabeth Bennet — The lively, perceptive heroine whose quick judgments lead to blindness',
      'Fitzwilliam Darcy — The master of Pemberley, whose noble character is masked by aristocratic aloofness',
      'Jane Bennet & Charles Bingley — Elizabeth and Darcy’s gentle, trusting counterparts',
      'Mr. & Mrs. Bennet — Elizabeth’s detached, cynical father and anxiety-ridden, match-making mother',
      'George Wickham — The charismatic militia officer who conceals deceit behind smooth manners',
      'Mr. Collins & Lady Catherine de Bourgh — The obsequious clergyman and his tyrannical aristocratic patroness'
    ],
    mainConflict: 'The personal friction and societal expectations between social classes that obstruct authentic communication, self-knowledge, and love.',
    centralThemes: [
      'The Fallibility of First Impressions — How superficial charm can mask villainy and awkwardness can conceal virtue',
      'Pride and Prejudice as Psychological Shields — True intimacy requires humbling oneself to self-examination',
      'Marriage as Economic Survival vs Spiritual Union — Balancing material security with mutual respect',
      'Individual Agency vs Social Expectation — Elizabeth’s refusal to marry without affection or integrity'
    ],
    whatToExpect: 'A witty 12-lesson study of Austen’s irony, dialogue mastery, character arcs, and historical Regency context.'
  },
  totalChapters: 6,
  totalLessons: lessons.length,
  chapters: [
    { id: 'pp-ch1', chapterNumber: 1, title: 'Chapter 1: First Impressions & Social Status', subtitle: 'The Bennet Family, Netherfield, and the Meryton Ball', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'pp-ch2', chapterNumber: 2, title: 'Chapter 2: Netherfield & George Wickham', subtitle: 'Elizabeth’s Fine Eyes and Wickham’s Slander', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'pp-ch3', chapterNumber: 3, title: 'Chapter 3: Proposals & Departures', subtitle: 'Mr. Collins’ Absurdity and the Netherfield Desertion', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'pp-ch4', chapterNumber: 4, title: 'Chapter 4: Rosings Park & The First Proposal', subtitle: 'Lady Catherine and the Cataclysmic First Proposal', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'pp-ch5', chapterNumber: 5, title: 'Chapter 5: The Letter & Pemberley', subtitle: 'Darcy’s Letter, Self-Realization, and Pemberley House', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'pp-ch6', chapterNumber: 6, title: 'Chapter 6: Crisis, Redemption & Union', subtitle: 'Lydia’s Disgrace, Darcy’s Rescue, and the Triumph of Love', lessons: lessons.filter(l => l.chapterNumber === 6) }
  ],
  lessons
};
