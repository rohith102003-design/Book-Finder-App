import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'lotr-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: A Long-Expected Party',
    title: 'The Pastoral Peace of the Shire & Bilbo\'s Farewell',
    subtitle: 'The Innocence of Middle-earth',
    type: 'reading',
    estimatedMinutes: 6,
    content: [
      'J.R.R. Tolkien’s epic high fantasy begins in the peaceful, pastoral region of the Shire, home to the comfort-loving, unassuming Hobbits. Bilbo Baggins prepares to celebrate his "eleventy-first" (111th) birthday alongside his adopted nephew and heir, Frodo Baggins, who turns 33 (the Hobbit coming of age).',
      'The grand birthday feast features marvelous fireworks crafted by the wizard Gandalf the Grey. In a theatrical climax to his speech, Bilbo puts on a golden magic ring, vanishes into thin air before his astonished guests, and returns to Bag End to pack his belongings for a quiet retirement in Rivendell.',
      'Before departing, Bilbo struggles intensely with leaving the Ring behind for Frodo. The ring exerts an unnerving psychological grip on Bilbo, who refers to it with unsettling affection as "my precious." Only through Gandalf’s stern, compassionate intervention does Bilbo become the first bearer in history to surrender the One Ring willingly.'
    ]
  },
  {
    id: 'lotr-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: A Long-Expected Party',
    title: 'The Shadow of the Past & The Origin of the One Ring',
    subtitle: 'Ancient Evil Stirring in Mordor',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'Seventeen years pass quietly in the Shire. Gandalf returns with grave, terrifying news uncovered after years of research in the archives of Minas Tirith and the tracking of the creature Gollum.',
      'Gandalf casts the golden band into the fireplace of Bag End; untouched by the flames, glowing fiery Elvish script appears around its circumference: "One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them."',
      'Gandalf reveals the cosmic history: the Dark Lord Sauron forged the One Ring in the fires of Mount Doom during the Second Age, pouring into it much of his own malice and power to dominate the other Rings of Power. Sauron has re-emerged in the land of Mordor, and his terrifying servants, the Nine Ringwraiths (Nazgûl), have crossed the River Anduin hunting for "Baggins" and the "Shire."'
    ]
  },
  {
    id: 'lotr-l3',
    lessonNumber: 3,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Flight from the Shire',
    title: 'The Departure & The Pursuit of the Black Riders',
    subtitle: 'Leaving the Warm Hearth for the Unknown',
    type: 'conflict',
    estimatedMinutes: 6,
    content: [
      'Realizing that remaining in the Shire endangers all he loves, Frodo resolves to carry the Ring to the Elven sanctuary of Rivendell. Accompanied by his devoted gardener Samwise Gamgee and joined by cousins Pippin and Merry, Frodo sets out under the guise of moving to Buckland.',
      'The journey immediately becomes a tense, claustrophobic survival pursuit. Faceless Black Riders mounted on black horses sniff the air along country lanes, their chilling hissing breath signaling the proximity of the shadow realm.',
      'A pivotal encounter with wandering High Elves led by Gildor Inglorion shields the hobbits and teaches them the enduring grace of the Eldar. Gildor names Frodo "Elf-friend," a rare honor that foreshadows Frodo\'s spiritual journey into the ancient grief and beauty of Middle-earth.'
    ]
  },
  {
    id: 'lotr-l4',
    lessonNumber: 4,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Flight from the Shire',
    title: 'The Old Forest, Tom Bombadil & The Barrow-downs',
    subtitle: 'Primal Nature & Ancient Tombs',
    type: 'worldbuilding',
    estimatedMinutes: 5,
    content: [
      'Cutting through the ancient Old Forest to evade the road, the hobbits are ensnared by Old Man Willow, an ancient, malevolent tree spirit. They are rescued by the singing, enigmatic Tom Bombadil, the "Master of Wood, Water, and Hill."',
      'Bombadil represents pristine, unfallen nature: when Frodo hands him the One Ring, Tom slips it on his finger and does not vanish, nor does the Ring hold any sway or temptation over him. In Bombadil\'s realm, Goldberry and Tom offer hospitality and spiritual renewal.',
      'Crossing the fog-drenched Barrow-downs, the hobbits are trapped in a tomb by an undead Barrow-wight. Frodo demonstrates immense courage, hacking at the wight’s crawling arm and calling upon Bombadil, who scatters the darkness and equips the hobbits with ancient Westernesse daggers.'
    ]
  },
  {
    id: 'lotr-l5',
    lessonNumber: 5,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Strider & Weathertop',
    title: 'The Prancing Pony & The Enigma of Strider',
    subtitle: 'From Weather-beaten Ranger to Heir of Kings',
    type: 'character',
    estimatedMinutes: 6,
    content: [
      'At the village of Bree, the hobbits lodge at the Inn of the Prancing Pony. During a lively tavern evening, Frodo accidentally slips the Ring onto his finger while falling, vanishing instantly in front of the startled crowd.',
      'In the shadows sits a tall, weathered ranger known as Strider. In private, Strider reveals a delayed letter from Gandalf containing the famous poem: "All that is gold does not glitter, Not all those who wander are lost; The old that is strong does not wither, Deep roots are not reached by the frost. From the ashes a fire shall be woken, A light from the shadows shall spring; Renewed shall be blade that was broken, The crownless again shall be king."',
      'Strider is revealed as Aragorn son of Arathorn, the thirty-ninth direct descendant of Isildur and rightful heir to the throne of Gondor and Arnor, serving as their guide through the perilous wilderness.'
    ]
  },
  {
    id: 'lotr-l6',
    lessonNumber: 6,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Strider & Weathertop',
    title: 'The Ambush at Weathertop & The Morgul-blade',
    subtitle: 'Wounded by the Witch-king',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'Resting in the ruins of the watchtower of Amon Sûl (Weathertop), the party is surrounded in the dead of night by five Nazgûl. Paralyzed by supernatural dread, Frodo succumbs to the Ring’s temptation and puts it on.',
      'Entering the wraith-world, Frodo sees the Ringwraiths not as hooded figures, but as pale kings in grey robes with gleaming swords and burning eyes. The Witch-king of Angmar lunges forward and stabs Frodo in the left shoulder with a Morgul-blade before Aragorn charges brandishing flaming brands.',
      'The blade dissolves into dust, leaving a poisonous splinter slowly working its way toward Frodo’s heart to turn him into a wraith. Aragorn uses the healing herb Athelas (Kingsfoil) to slow the dark sorcery as they race desperately toward Rivendell.'
    ]
  },
  {
    id: 'lotr-l7',
    lessonNumber: 7,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Rivendell & The Council of Elrond',
    title: 'Flight to the Ford of Bruinen & The Sanctuary of Imladris',
    subtitle: 'Elven Grace Against Mordor’s Fury',
    type: 'reading',
    estimatedMinutes: 5,
    content: [
      'Aided by the Elven lord Glorfindel and his swift white stallion Asfaloth, Frodo outruns the full assembly of the Nine Ringwraiths to the Ford of Bruinen at the border of Rivendell.',
      'Standing defiant on the riverbank, the wounded Frodo raises his sword and refuses the summons of the Black Riders. Lord Elrond and Gandalf command the waters of the Bruinen to rise in a roaring flood resembling white horses, sweeping the Nazgûl away and drowning their mounts.',
      'Frodo awakens days later in the Last Homely House East of the Sea, where Elrond surgically removes the Morgul-shard, saving Frodo’s life and welcoming him into the timeless beauty of Rivendell.'
    ]
  },
  {
    id: 'lotr-l8',
    lessonNumber: 8,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: Rivendell & The Council of Elrond',
    title: 'The Council of Elrond: The Fate of Middle-earth',
    subtitle: 'The Great Decision & The Fellowship of the Ring',
    type: 'turning-point',
    estimatedMinutes: 7,
    content: [
      'Delegates from the free peoples assemble in council: Elves, Dwarves, Men, and Wizards. Gandalf recounts the treachery of Saruman the White, who has fallen to corruption in his tower of Orthanc, seduced by his desire for the Ring.',
      'Boromir, proud captain of Gondor, argues that the Ring should be used as a weapon to defend his besieged city. Elrond and Aragorn counter that the Ring cannot be wielded for good; any attempt to master it inevitably corrupts the user into another Dark Lord.',
      'The council concludes that the Ring cannot be hidden or destroyed by craft; it must be cast into the fires of the Crack of Doom in the heart of Mordor. In a quiet, heroic moment, Frodo speaks: "I will take the Ring, though I do not know the way."',
      'Elrond forms the Fellowship of the Ring, nine companions to match the Nine Nazgûl: Frodo, Sam, Merry, Pippin, Gandalf, Aragorn, Legolas the Elf, Gimli the Dwarf, and Boromir of Gondor.'
    ]
  },
  {
    id: 'lotr-l9',
    lessonNumber: 9,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Mines of Moria',
    title: 'The Caradhras Pass & The Doors of Durin',
    subtitle: 'Speak Friend and Enter',
    type: 'conflict',
    estimatedMinutes: 5,
    content: [
      'Attempting to cross the Misty Mountains over the Redhorn Gate on Mount Caradhras, the Fellowship is turned back by an unnatural, howling blizzard. Forced to seek a subterranean route, they head toward the ancient dwarven kingdom of Khazad-dûm (Moria).',
      'At the West-gate, flanked by ancient holly trees, Gandalf deciphers the glowing Ithildin Elvish inscription: "Pedo mellon a minno" (Speak, friend, and enter). Realizing the password is the simple Elvish word for friend ("Mellon"), the stone doors swing open.',
      'Just as they cross the threshold, the Watcher in the Water attacks from the stagnant pool, seizing Frodo before being driven back by Aragorn and Boromir, smashing the rock doors behind them and sealing the Fellowship inside the black depths.'
    ]
  },
  {
    id: 'lotr-l10',
    lessonNumber: 10,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Mines of Moria',
    title: 'The Chamber of Mazarbul & The Balrog of Morgoth',
    subtitle: 'You Shall Not Pass!',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Journeying through endless columned halls, the party discovers the tomb of Balin, Lord of Moria. The surviving record book chillingly chronicles the dwarven colony’s doom: "We cannot get out. The end comes... Drums, drums in the deep. They are coming."',
      'Orcs and a cave troll attack the chamber. Frodo is speared by an orc chieftain but survives unharmed thanks to Bilbo’s secret gift: an ancient mithril coat of mail as light as a feather and harder than dragon scales.',
      'Fleeing toward the Bridge of Khazad-dûm, they encounter a creature of ancient horror: a Balrog of Morgoth, cloaked in shadow and flame. On the narrow stone span, Gandalf stands alone to bar the demon: "I am a servant of the Secret Fire, wielder of the flame of Anor... You cannot pass!"',
      'Gandalf smashes his staff into the bridge, breaking the span. As the Balrog plunges into the abyss, its fiery whip lashes out, dragging Gandalf over the brink. Gandalf cries his final charge: "Fly, you fools!" and falls into the darkness.'
    ]
  },
  {
    id: 'lotr-l11',
    lessonNumber: 11,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Lothlórien & The Golden Wood',
    title: 'Lothlórien & Lady Galadriel',
    subtitle: 'Timeless Grace & The Mirror of Vision',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'Grief-stricken, the eight surviving companions enter Lothlórien, the golden forest shielded by the Elven Ring Nenya, wielded by Lady Galadriel and Lord Celeborn. Time in Lórien feels suspended in ancient, unfallen majesty.',
      'Galadriel tests the hearts of each companion, looking deeply into their desires and fears. Gimli the Dwarf is captivated by her sublime grace, dissolving centuries of bitter enmity between Elves and Dwarves.',
      'At the Mirror of Galadriel, Frodo gazes into the water basin and sees the searching, lidless Great Eye of Sauron rimmed with fire. Frodo offers her the One Ring; in a moment of temptation, Galadriel imagines herself as a beautiful, terrible queen, before willingly rejecting the Ring: "I pass the test. I will diminish, and go into the West, and remain Galadriel."'
    ]
  },
  {
    id: 'lotr-l12',
    lessonNumber: 12,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Lothlórien & The Golden Wood',
    title: 'Gifts of the Elves & The Great River Anduin',
    subtitle: 'Tokens of Light Against the Gathering Dark',
    type: 'reading',
    estimatedMinutes: 5,
    content: [
      'Upon their departure, the Elves bestow vital provisions: Elven cloaks that blend into natural surroundings, lightweight lembas bread, and Elven ropes.',
      'Galadriel gives individual gifts of great destiny: to Aragorn, an Elven scabbard and the green Elessar gemstone; to Gimli, three golden strands of her hair at his humble request; and to Frodo, the Phial of Galadriel containing the captured light of Eärendil’s star: "May it be a light to you in dark places, when all other lights go out."',
      'Traveling down the Great River Anduin in Elven boats, the Fellowship passes the Argonath (Pillars of the Kings)—monumental stone statues of Isildur and Anárion towering over the water, reminding Aragorn of his ancient heritage.'
    ]
  },
  {
    id: 'lotr-l13',
    lessonNumber: 13,
    chapterNumber: 7,
    chapterTitle: 'Chapter 7: The Breaking of the Fellowship',
    title: 'The Fall and Redemption of Boromir',
    subtitle: 'Temptation, Madness, and Honorable Sacrifice',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'Camping at Parth Galen beneath the hill of Amon Hen, the Fellowship reaches the critical crossroads: whether to turn east toward Mordor or south to Minas Tirith. Frodo wanders into the woods alone to make the agonizing decision.',
      'Boromir confronts Frodo, his mind warped by the Ring’s whispering promise of power to save his people. Boromir attempts to seize the Ring by force; Frodo slips the Ring on, vanishes, and escapes up the slopes of Amon Hen.',
      'Realizing his madness, Boromir weeps in profound remorse. When a warband of Saruman’s Uruk-hai attacks, Boromir sounds the Great Horn of Gondor and fights valiantly, slaying dozens of orcs with arrows piercing his chest to protect Merry and Pippin before succumbing to his wounds.'
    ]
  },
  {
    id: 'lotr-l14',
    lessonNumber: 14,
    chapterNumber: 7,
    chapterTitle: 'Chapter 7: The Breaking of the Fellowship',
    title: 'The Solitary Quest & Samwise\'s Devotion',
    subtitle: 'The Splintering of Nine Paths',
    type: 'resolution',
    estimatedMinutes: 6,
    content: [
      'From the Seat of Seeing atop Amon Hen, Frodo witnesses war erupting across Middle-earth and feels the searching mind of Sauron nearly finding him. He realizes the Ring’s corrupting influence will destroy his friends if they stay together.',
      'Frodo resolves to journey to Mordor completely alone. Rushing to the river shore to take a boat, he is intercepted by Samwise Gamgee, who plunges into the deep water unable to swim, nearly drowning rather than letting his master leave without him.',
      'Frodo pulls Sam aboard, weeping in gratitude. The Fellowship is broken: Boromir is dead, Merry and Pippin are captured, Aragorn, Legolas, and Gimli embark on the Three Hunters\' chase, while Frodo and Sam turn their faces toward the barren hills of Emyn Muil and the darkness of Mordor.'
    ]
  },
  {
    id: 'lotr-l15',
    lessonNumber: 15,
    chapterNumber: 8,
    chapterTitle: 'Chapter 8: Philosophical Themes & Middle-earth Lore',
    title: 'Pity, Fate and the Corruption of Power',
    subtitle: 'The Metaphysics of Tolkien’s Legendarium',
    type: 'theme',
    estimatedMinutes: 6,
    content: [
      'A foundational philosophical theme across The Lord of the Rings is the transformative power of pity. Gandalf reminds Frodo that Bilbo’s choice not to kill Gollum when he had the chance was the defining moral act that preserved Bilbo\'s soul: "The pity of Bilbo may rule the fate of many."',
      'Unlike modern grimdark fantasy where power is neutral, Tolkien posits that the desire to dominate is inherently corrosive. Even the wisest beings—Gandalf, Galadriel, Aragorn—must refuse the Ring because good intentions combined with supreme coercive power inevitably produce tyranny.',
      'True victory in Middle-earth is achieved not through overwhelming military might, but through small, humble acts of loyalty, sacrifice, and moral endurance demonstrated by the least powerful creatures.'
    ]
  },
  {
    id: 'lotr-l16',
    lessonNumber: 16,
    chapterNumber: 8,
    chapterTitle: 'Chapter 8: Philosophical Themes & Middle-earth Lore',
    title: 'Hope (Estel), Sorrow & The Long Defeat',
    subtitle: 'The Bittersweet Triumph of High Fantasy',
    type: 'reflection',
    estimatedMinutes: 6,
    content: [
      'Tolkien distinguished between mundane optimism ("Amdir") and transcendent hope ("Estel")—a steadfast trust in ultimate goodness even when every earthly calculation predicts defeat.',
      'The Elves represent the poignant sorrow of time: even if Sauron is overthrown, the magic of the Three Elven Rings will fade, and the Elves must abandon Middle-earth to cross the Sea to the Undying Lands, leaving the mortal world behind.',
      'This blend of heroic struggle, profound loss, and eucatastrophe (the sudden joyful turn of grace) elevates The Lord of the Rings into one of the most enduring mythic achievements in human literature.'
    ],
    keyTakeaways: [
      'Power that relies on domination corrupts the user regardless of good intentions.',
      'Humble loyalty, friendship, and moral perseverance achieve what military might cannot.',
      'Pity and mercy are cosmic forces that reshape history in unforeseen ways.',
      'True courage is walking into the dark for love of what lies behind you.'
    ],
    reflectionQuestion: 'How does the friendship between Frodo and Sam demonstrate that emotional resilience is as vital to heroism as physical strength?'
  }
];

export const theLordOfTheRingsContent: ReadingBookContent = {
  bookId: 'the-lord-of-the-rings',
  title: 'The Lord of the Rings',
  author: 'J.R.R. Tolkien',
  genre: 'Epic Fantasy / Mythopoeia',
  publishedYear: 1954,
  contentType: 'fantasy',
  sourceType: 'curated-guide',
  summary: 'The monumental mythic epic of Frodo Baggins, the Fellowship of the Ring, and the desperate quest to destroy the One Ring in the fires of Mount Doom to save Middle-earth from the Dark Lord Sauron.',
  aboutThisBook: [
    'Set across the vast, ancient landscapes of Middle-earth, J.R.R. Tolkien’s "The Lord of the Rings" is one of the most influential literary achievements of the twentieth century. It follows the unassuming Hobbit Frodo Baggins, who inherits the One Ring—an instrument of absolute dominion forged by the Dark Lord Sauron.',
    'To prevent Sauron from plunging the free peoples of Middle-earth into eternal darkness, an alliance known as the Fellowship of the Ring is formed: Hobbits, Men, an Elf, a Dwarf, and a Wizard. Together, they embark on an impossible journey to cast the Ring back into the volcanic fires of Mount Doom, the only place it can be destroyed.',
    'Tolkien’s work transcends standard fantasy storytelling by exploring profound philosophical questions: the corrosive nature of coercive power, the redemptive potency of pity and mercy, the beauty of steadfast loyalty, and the bittersweet passage of an enchanted age into history.'
  ],
  aboutBook: {
    setting: 'Middle-earth (The Shire, Rivendell, Moria, Lothlórien, Rohan, Gondor, and Mordor)',
    premise: 'A humble Hobbit inherits the One Ring of Power and must undertake a perilous journey across Middle-earth to destroy it in the volcanic fires where it was forged.',
    keyCharacters: [
      'Frodo Baggins — The humble Ring-bearer tasked with carrying the burden of supreme evil',
      'Samwise Gamgee — Frodo’s steadfast gardener and the emotional anchor of the quest',
      'Gandalf the Grey — The wise Istari wizard orchestrating the resistance against Sauron',
      'Aragorn son of Arathorn — The exiled Ranger of the North and rightful heir to Gondor’s throne',
      'Boromir of Gondor — A proud warrior captain tempted by the Ring to save his besieged city',
      'Legolas & Gimli — An Elf and Dwarf whose blossoming friendship dissolves centuries of racial strife',
      'Sauron & The Nazgûl — The Dark Lord of Mordor and his terrifying Ringwraith captains'
    ],
    mainConflict: 'The free peoples of Middle-earth fight for survival against Sauron’s overwhelming legions, while the true war is fought internally within the soul of the Ring-bearer against the corrupting will of the One Ring.',
    centralThemes: [
      'The Corrosive Nature of Power — Why even the wisest must refuse absolute dominion',
      'The Power of Pity & Mercy — How Bilbo and Frodo’s mercy toward Gollum reshapes destiny',
      'Transcendent Hope (Estel) — Persisting in righteousness even in the face of apparent defeat',
      'Sacrifice and Fellowship — How small, loyal individuals accomplish what mighty armies cannot'
    ],
    whatToExpect: 'An immersive, educational journey through Tolkien’s world-building, narrative pacing, moral philosophy, and mythological foundations.'
  },
  totalChapters: 8,
  totalLessons: lessons.length,
  chapters: [
    { id: 'lotr-ch1', chapterNumber: 1, title: 'Chapter 1: A Long-Expected Party', subtitle: 'The Shire, Bilbo’s Birthday, and the Shadow of the Past', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'lotr-ch2', chapterNumber: 2, title: 'Chapter 2: Flight from the Shire', subtitle: 'The Black Riders, Tom Bombadil, and the Barrow-downs', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'lotr-ch3', chapterNumber: 3, title: 'Chapter 3: Strider & Weathertop', subtitle: 'Bree, The Heir of Isildur, and the Morgul-blade', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'lotr-ch4', chapterNumber: 4, title: 'Chapter 4: Rivendell & The Council of Elrond', subtitle: 'The Ford of Bruinen, The Great Decision, and Nine Walkers', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'lotr-ch5', chapterNumber: 5, title: 'Chapter 5: The Mines of Moria', subtitle: 'The Doors of Durin, The Tomb of Balin, and the Balrog', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'lotr-ch6', chapterNumber: 6, title: 'Chapter 6: Lothlórien & The Golden Wood', subtitle: 'Galadriel’s Mirror, The Elven Gifts, and the Great River', lessons: lessons.filter(l => l.chapterNumber === 6) },
    { id: 'lotr-ch7', chapterNumber: 7, title: 'Chapter 7: The Breaking of the Fellowship', subtitle: 'Boromir’s Redemption, Parth Galen, and the Splintered Path', lessons: lessons.filter(l => l.chapterNumber === 7) },
    { id: 'lotr-ch8', chapterNumber: 8, title: 'Chapter 8: Philosophical Themes & Middle-earth Lore', subtitle: 'Pity, The Corrosive Nature of Power, and Eucatastrophe', lessons: lessons.filter(l => l.chapterNumber === 8) }
  ],
  lessons
};
