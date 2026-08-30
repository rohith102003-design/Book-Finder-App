import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'hobbit-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: An Unexpected Party',
    title: 'The World of the Shire & Bilbo Baggins',
    subtitle: 'From the Comfort of Bag End to the Call of Adventure',
    type: 'reading',
    estimatedMinutes: 6,
    content: [
      'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.',
      'Bilbo Baggins comes from the respectable Baggins family on his father’s side and the adventurous Took family on his mother’s side. He values routine, second breakfasts, and peace above all else.',
      'His tranquil morning pipe is interrupted when Gandalf the wizard appears, offering Bilbo an adventure that threatens his quiet, respectable life.'
    ]
  },
  {
    id: 'hobbit-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: An Unexpected Party',
    title: 'The Dwarven Song & The Quest for Erebor',
    subtitle: 'Awakening the Tookish Spirit',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Thirteen dwarves, led by Thorin Oakenshield, flood into Bag End. They sing of ancient halls, dwarven gold, and the dragon Smaug who destroyed their mountain kingdom of Erebor.',
      'The solemn music stirs the Took side in Bilbo, awakening an ancient longing to see high mountains and hear the roaring pines.',
      'Despite his fears, Bilbo signs a contract as the company\'s official "burglar", stepping out of his comfort zone into the vast, perilous world.'
    ]
  },
  {
    id: 'hobbit-l3',
    lessonNumber: 3,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Roast Mutton & Rivendell',
    title: 'The Stone-Trolls: Bert, Tom & William',
    subtitle: 'The First Trial of the Wild',
    type: 'conflict',
    estimatedMinutes: 5,
    content: [
      'Cold, wet, and hungry in the desolate wilderness, the dwarves spot a camp-fire. Bilbo is sent ahead to scout and discovers three enormous, uncouth trolls roasting mutton.',
      'Attempting to prove his skill as a burglar, Bilbo tries to pick William\'s pocket, leading to his capture and the entrapment of all thirteen dwarves in turn.',
      'Gandalf saves the company through wit and mimicry, keeping the trolls arguing until dawn turns them into solid stone. In their cave, they discover the legendary elven swords: Glamdring, Orcrist, and Sting.'
    ]
  },
  {
    id: 'hobbit-l4',
    lessonNumber: 4,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Roast Mutton & Rivendell',
    title: 'Rivendell & The Moon-Runes of Elrond',
    subtitle: 'The Last Homely House East of the Sea',
    type: 'worldbuilding',
    estimatedMinutes: 5,
    content: [
      'The company rests in the hidden valley of Rivendell, welcomed by Lord Elrond and singing Elves. Elrond inspects their ancient blades and examines Thorin\'s secret map of the Lonely Mountain.',
      'Holding the parchment under the crescent moon, Elrond discovers secret silver Moon-runes written by King Thrór: "Stand by the grey stone when the thrush knocks, and the setting sun with the last light of Durin\'s Day will shine upon the key-hole."',
      'This prophecy provides the single vital clue that will eventually unlock the hidden side-door of the Lonely Mountain.'
    ]
  },
  {
    id: 'hobbit-l5',
    lessonNumber: 5,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Over Hill and Under Hill',
    title: 'Thunder-Battles & The Great Goblin',
    subtitle: 'Captured in the Misty Mountains',
    type: 'conflict',
    estimatedMinutes: 6,
    content: [
      'Climbing the treacherous Misty Mountains during a violent thunderstorm, the company shelters in a dry cave. In the dead of night, a fissure opens in the rock wall, and goblins swarm from the shadows.',
      'Brought before the Great Goblin in the underground caverns, Thorin and the dwarves are interrogated. Gandalf flashes forth in blinding lightning, slaying the Great Goblin with Glamdring the Foe-hammer.',
      'In the panicked subterranean flight through pitch-black tunnels, Dori drops Bilbo, who hits his head on a rock and falls unconscious into the dark abyss.'
    ]
  },
  {
    id: 'hobbit-l6',
    lessonNumber: 6,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Over Hill and Under Hill',
    title: 'Riddles in the Dark: Bilbo and Gollum',
    subtitle: 'The Discovery of the Magic Ring',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Waking in total darkness on the cold subterranean stone, Bilbo\'s hand encounters a small, cold metal ring on the floor. Unthinkingly, he slips it into his pocket.',
      'At the edge of an underground lake, he meets Gollum, a slimy, corrupted creature who eats blind fish and goblins. They enter an ancient riddle contest: if Bilbo wins, Gollum shows the exit; if Gollum wins, he eats Bilbo.',
      'After matching riddles on time, wind, mountains, and dark, Bilbo asks: "What have I got in my pocket?" When Gollum fails to answer and discovers his "Precious" ring is missing, Bilbo realizes the ring grants invisibility. Leaping over Gollum, Bilbo is gripped by pity and chooses mercy over slaughter, sparing Gollum’s life.'
    ]
  },
  {
    id: 'hobbit-l7',
    lessonNumber: 7,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Out of the Frying-Pan into the Fire',
    title: 'Wargs, Burning Pines & The Great Eagles',
    subtitle: 'Rescued from the Brink of Death',
    type: 'conflict',
    estimatedMinutes: 5,
    content: [
      'Rejoining the dwarves on the other side of the mountains, Bilbo earns their newfound respect by slipping past their watchman unseen using the magic ring.',
      'At twilight, a pack of terrifying wild Wargs (giant wolves) and goblin riders surround the company, forcing them into tall pine trees. Gandalf hurls pinecones ignited with blue, red, and green fire to keep the beasts at bay.',
      'As the goblins set the trees ablaze to burn them alive, the Lord of the Eagles and his flock sweep down from the sky, snatching the companions in their great talons and carrying them safely to their aerie atop the Carrock.'
    ]
  },
  {
    id: 'hobbit-l8',
    lessonNumber: 8,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Out of the Frying-Pan into the Fire',
    title: 'Beorn the Skin-changer & The Threshold of Mirkwood',
    subtitle: 'The Great Bear of the Anduin Vales',
    type: 'character',
    estimatedMinutes: 5,
    content: [
      'Gandalf introduces the company to Beorn, a colossal, fierce man who can transform into an enormous black bear. Beorn despises goblins and grants the company shelter, ponies, and provisions.',
      'At the gloomy eaves of Mirkwood forest, Gandalf announces he must leave them on urgent business in the South (later revealed as driving the Necromancer from Dol Guldur).',
      'Gandalf leaves them with one solemn, vital command: "Do not leave the path! If you do, it is a thousand to one that you will never find it again."'
    ]
  },
  {
    id: 'hobbit-l9',
    lessonNumber: 9,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: Mirkwood & The Lonely Mountain',
    title: 'Giant Spiders, Sting & The Wood-elves',
    subtitle: 'Bilbo Takes Command',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'Straying from the path after succumbing to hunger and the lure of Elven feast fires, the dwarves are captured and cocooned in spiderwebs by monstrous giant spiders.',
      'Using his invisibility ring and throwing stones with deadly precision, Bilbo slays numerous spiders, naming his elven dagger "Sting." He lures the spider swarm away and rescues all twelve dwarves single-handedly.',
      'When the dwarves are subsequently captured by the suspicious Wood-elf King Thranduil, Bilbo sneaks into the elven palace, orchestrates an ingenious escape inside empty wine barrels down the Forest River, and guides them safely to Lake-town (Esgaroth).'
    ]
  },
  {
    id: 'hobbit-l10',
    lessonNumber: 10,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: Mirkwood & The Lonely Mountain',
    title: 'Inside the Mountain: Conversing with Smaug',
    subtitle: 'Riddles with the Golden Terror',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'On Durin\'s Day, the setting sun illuminates the secret key-hole, and Thorin unlocks the side-door of Erebor. Bilbo creeps down the long dark tunnel alone, emerging into the immense cavern where Smaug sleeps atop mountains of gold and gems.',
      'Bilbo steals a two-handled golden cup. When Smaug awakens in fiery fury, Bilbo converses with the dragon using witty riddles: "I am the clue-finder, the web-cutter, the stinging fly... I was chosen for the lucky number."',
      'Flattering Smaug into displaying his diamond-encrusted underbelly, Bilbo spots an unprotected patch in the hollow of the left breast. A listening thrush overhears Bilbo recounting the flaw and flies to Lake-town, informing Bard the Bowman, who slays Smaug with his ancestral Black Arrow.'
    ]
  },
  {
    id: 'hobbit-l11',
    lessonNumber: 11,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The Clouds Burst & The Journey Home',
    title: 'The Arkenstone, Dragon-sickness & The Battle of Five Armies',
    subtitle: 'Greed, Honor, and Reconciliation',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Entering the treasury, Bilbo discovers the Arkenstone of Thrain, the radiant Heart of the Mountain, and keeps it secret. When Lake-town men and Wood-elves demand a fair share of the treasure to rebuild their ruined city, Thorin is overcome by "dragon-sickness" and barricades the gates.',
      'To prevent a catastrophic war between allies, Bilbo bravely sneaks out at night and delivers the Arkenstone to Bard and the Elvenking as a bargaining chip to force peace.',
      'Before conflict breaks out, a colossal army of Goblins and Wargs led by Bolg descends upon the mountain. In the epic Battle of Five Armies, Men, Elves, Dwarves, Eagles, and Beorn unite to destroy the goblin host. Thorin is mortally wounded, making peace with Bilbo before dying: "If more of us valued food and cheer and song above hoarded gold, it would be a merrier world."'
    ]
  },
  {
    id: 'hobbit-l12',
    lessonNumber: 12,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: The Clouds Burst & The Journey Home',
    title: 'There and Back Again: The Transformed Hobbit',
    subtitle: 'The Domestic Hero Who Looked Beyond the Horizon',
    type: 'reflection',
    estimatedMinutes: 6,
    content: [
      'Bilbo returns to Bag End with two small chests of gold and silver, the mithril shirt, Sting, and the magic ring. He arrives just as his greedy relatives, the Sackville-Bagginses, are auctioning off his furniture believing him dead.',
      'Though Bilbo loses his reputation for ordinary respectability among narrow-minded Shire folk, he gains the lifelong friendship of Elves, Dwarves, and Wizards.',
      'Bilbo has achieved true wisdom: he has proven that even the smallest, most unassuming creature can alter the fate of an entire world through courage, humility, and moral integrity.'
    ],
    keyTakeaways: [
      'Courage is not fearlessness, but acting with moral integrity despite terrifying odds.',
      'Greed and hoarding blind individuals to community and honor, whereas generosity restores peace.',
      'Pity and mercy preserve the soul, laying the groundwork for epic historical redemption.',
      'Personal growth requires leaving familiar comforts to discover latent inner strength.'
    ],
    reflectionQuestion: 'In what ways does Bilbo’s humble domestic origin make him a more enduring and relatable hero than traditional mighty warriors?'
  }
];

export const theHobbitContent: ReadingBookContent = {
  bookId: 'the-hobbit',
  title: 'The Hobbit',
  author: 'J.R.R. Tolkien',
  genre: 'High Fantasy / Children’s Classic',
  publishedYear: 1937,
  contentType: 'fantasy',
  sourceType: 'curated-guide',
  summary: 'The delightful, timeless adventure of Bilbo Baggins, who is swept from his comfortable hobbit-hole by Gandalf and thirteen dwarves into an epic quest to reclaim the Lonely Mountain from the dragon Smaug.',
  aboutThisBook: [
    'First published in 1937, J.R.R. Tolkien’s "The Hobbit, or There and Back Again" serves as the enchanting gateway into Middle-earth. The story introduces Bilbo Baggins, a respectable hobbit who enjoys a quiet domestic life in the comfort of Bag End, second breakfasts, and complete predictability.',
    'Bilbo’s peaceful existence is upended when the wizard Gandalf and thirteen dispossessed dwarves arrive unannounced. Led by Thorin Oakenshield, the company recruits Bilbo as their "burglar" on a perilous expedition to reclaim the ancestral dwarven fortress of Erebor and its immense hoard of treasure from the ferocious dragon Smaug.',
    'Along the journey, Bilbo encounters stone-trolls, goblins, giant spiders, wood-elves, and the mysterious creature Gollum, in whose subterranean lake Bilbo discovers a fateful magic ring of invisibility that changes the course of Middle-earth history forever.'
  ],
  aboutBook: {
    setting: 'Middle-earth (The Shire, Rivendell, The Misty Mountains, Mirkwood Forest, Lake-town & The Lonely Mountain)',
    premise: 'A comfort-loving hobbit is thrust into a dangerous quest with thirteen dwarves to outwit trolls, goblins, spiders, and a dragon to reclaim a stolen homeland.',
    keyCharacters: [
      'Bilbo Baggins — A timid hobbit who discovers remarkable bravery, wit, and moral independence',
      'Gandalf the Grey — The enigmatic wizard guiding the company through perils of the wild',
      'Thorin Oakenshield — The proud, exiled dwarf king consumed by honor and ancestral heritage',
      'Gollum — The wretched, corrupted creature guarding his "Precious" ring in the dark caverns',
      'Smaug the Magnificent — The cunning, greedy dragon slumbering atop the golden mountain hoard',
      'Bard the Bowman — The grim, noble descendant of Dale who stands to defend his people'
    ],
    mainConflict: 'The dwarven quest to reclaim their stolen inheritance while overcoming mortal perils, internal greed ("dragon-sickness"), and the gathering shadows of war.',
    centralThemes: [
      'The Transformation of the Everyday Hero — Stepping outside comfort zones to discover latent bravery',
      'The Poison of Greed vs The Value of Simple Cheer — Thorin’s dragon-sickness juxtaposed with Bilbo’s humility',
      'Wit and Strategy over Brute Force — Riddles, stealth, and diplomacy triumphing over monsters',
      'Mercy as a Defining Virtue — Sparing Gollum out of pity rather than bloodlust'
    ],
    whatToExpect: 'A charming, action-packed 12-lesson reading guide exploring Tolkien’s folklore, mythical creatures, and Bilbo’s journey into wisdom.'
  },
  totalChapters: 6,
  totalLessons: lessons.length,
  chapters: [
    { id: 'hobbit-ch1', chapterNumber: 1, title: 'Chapter 1: An Unexpected Party', subtitle: 'From Bag End to the Call of Adventure', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'hobbit-ch2', chapterNumber: 2, title: 'Chapter 2: Roast Mutton & Rivendell', subtitle: 'Stone-Trolls and the Moon-Runes of Elrond', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'hobbit-ch3', chapterNumber: 3, title: 'Chapter 3: Over Hill and Under Hill', subtitle: 'Thunder-Battles and Riddles in the Dark', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'hobbit-ch4', chapterNumber: 4, title: 'Chapter 4: Out of the Frying-Pan into the Fire', subtitle: 'Burning Pines, Great Eagles, and Beorn', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'hobbit-ch5', chapterNumber: 5, title: 'Chapter 5: Mirkwood & The Lonely Mountain', subtitle: 'Giant Spiders, Sting, and Smaug’s Golden Lair', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'hobbit-ch6', chapterNumber: 6, title: 'Chapter 6: The Clouds Burst & The Journey Home', subtitle: 'The Battle of Five Armies and There and Back Again', lessons: lessons.filter(l => l.chapterNumber === 6) }
  ],
  lessons
};
