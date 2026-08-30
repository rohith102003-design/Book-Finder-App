import { ReadingBookContent, ReadingLesson } from '../../../types/reading';

const lessons: ReadingLesson[] = [
  {
    id: 'dune-l1',
    lessonNumber: 1,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Gom Jabbar & Departure from Caladan',
    title: 'The Litany Against Fear & The Test of Humanity',
    subtitle: 'Pain, Instinct, and Bene Gesserit Discipline',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'Frank Herbert’s 1965 science fiction epic begins on the lush oceanic world of Caladan. Fifteen-year-old Paul Atreides, son of Duke Leto Atreides and the Bene Gesserit Lady Jessica, faces a deadly trial administered by the Reverend Mother Gaius Helen Mohiam.',
      'The Reverend Mother holds the Gom Jabbar—a poison-tipped needle capable of killing instantly—at Paul\'s throat while forcing his hand into a nerve-induction box of searing agony. To survive, Paul recites the Bene Gesserit Litany: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me."',
      'The trial distinguishes conscious human beings from animals: an animal in a trap will chew off its own leg to escape immediate pain, while a human will endure agonizing suffering to remain still and assess the larger strategic trap.'
    ]
  },
  {
    id: 'dune-l2',
    lessonNumber: 2,
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: The Gom Jabbar & Departure from Caladan',
    title: 'The Kwisatz Haderach & Galactic Feudalism',
    subtitle: 'The Landsraad, Spacing Guild, and the Imperial Trap',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'The known universe is organized under the Imperium: a neo-feudal tripartite balance of power among the Padishah Emperor Shaddam IV, the Great Houses of the Landsraad, and the monopolistic Spacing Guild.',
      'For ninety generations, the secretive Bene Gesserit sisterhood has operated a selective genetic breeding program designed to produce the Kwisatz Haderach—a male super-being capable of bridging space and time and unlocking ancestral memories across both male and female genetic lines.',
      'Lady Jessica was instructed to bear a daughter to unite House Atreides with their blood enemies, House Harkonnen. Out of love for Duke Leto, Jessica chose to bear a son instead, inadvertently accelerating the arrival of the Kwisatz Haderach a generation early.'
    ]
  },
  {
    id: 'dune-l3',
    lessonNumber: 3,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Arrakis, Ecology, & The Spice Melange',
    title: 'Arrakis: Water Discipline & The Spice Economy',
    subtitle: 'He Who Controls the Spice Controls the Universe',
    type: 'worldbuilding',
    estimatedMinutes: 6,
    content: [
      'House Atreides relocates to Arrakis (Dune), a harsh, rainless desert planet that is the sole source of Spice Melange in the universe. Spice extends human life, provides heightened cognitive acuity, and enables Guild Navigators to fold space for interstellar travel.',
      'On Arrakis, water is the supreme currency, measure of wealth, and religious foundation. The native desert inhabitants, the Fremen, survive through strict "water discipline," wearing Stillsuits—complex, full-body filtration garments that recycle 99% of bodily moisture lost to sweat, urine, and breath.',
      'Duke Leto recognizes the immense danger: the Emperor has granted Arrakis to the Atreides not as a reward, but as a conspiracy with Baron Vladimir Harkonnen to annihilate the popular Duke using elite imperial Sardaukar shock troops.'
    ]
  },
  {
    id: 'dune-l4',
    lessonNumber: 4,
    chapterNumber: 2,
    chapterTitle: 'Chapter 2: Arrakis, Ecology, & The Spice Melange',
    title: 'Shai-Hulud: The Sandworms & Ecological Interdependence',
    subtitle: 'Dr. Pardot Kynes and the Transformation of a World',
    type: 'concept',
    estimatedMinutes: 6,
    content: [
      'The open desert is ruled by Shai-Hulud—colossal Sandworms hundreds of meters long who produce the spice and attack any rhythmic vibration on the sand surface. To cross the desert, Fremen travel with a rhythmic "sandwalk" that mimics natural wind shifting.',
      'Imperial Planetologist Dr. Liet-Kynes reveals the hidden ecological dream of Arrakis: through centuries of secret water caches and biological plantings, the Fremen are systematically terraforming the desert into a lush paradise.',
      'Herbert embeds deep ecological systems thinking: every organism, from the sand-plankton to the giant worm, plays an indispensable role in maintaining the planet\'s hyper-specialized equilibrium.'
    ]
  },
  {
    id: 'dune-l5',
    lessonNumber: 5,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Betrayal & The Fall of House Atreides',
    title: 'The Betrayal of Dr. Yueh & The Death of Duke Leto',
    subtitle: 'Suk Conditioning Broken by Hatred and Love',
    type: 'conflict',
    estimatedMinutes: 6,
    content: [
      'The Harkonnens strike in the dead of night, aided by an impossible betrayal: Dr. Wellington Yueh, a Suk doctor believed incapable of violence due to Imperial Conditioning, deactivates the city shield generators in a desperate gamble to free his captive wife Wanna.',
      'Duke Leto is paralyzed by Yueh, who implants a false poison gas tooth in the Duke\'s jaw. When brought before the grotesque Baron Harkonnen, Leto bites down on the capsule, killing the Baron\'s twisted Mentat Piter De Vries while the Baron narrowly escapes in his suspensor field.',
      'Duncan Idaho, Gurney Halleck, and the loyal Atreides troops fight to the death. Duncan sacrifices his life in a heroic last stand, allowing Paul and Jessica to escape into the deep desert aboard an ornithopter.'
    ]
  },
  {
    id: 'dune-l6',
    lessonNumber: 6,
    chapterNumber: 3,
    chapterTitle: 'Chapter 3: Betrayal & The Fall of House Atreides',
    title: 'Awakening into Prescience: The Spice Trance',
    subtitle: 'The Terrible Purpose & The Unfolding Future',
    type: 'turning-point',
    estimatedMinutes: 6,
    content: [
      'Sheltered in a storm-battered desert tent, the saturation of spice in the atmosphere triggers Paul’s latent prescience. For the first time, the veil of time parts before his inner vision.',
      'Paul perceives time not as a single line, but as an infinite nexus of shifting possibilities, viewing past, present, and future simultaneously. He foresees the terrible destiny awaiting him: a galactic religious jihad fought in his name across a thousand worlds.',
      'Horrified by this "Terrible Purpose," Paul vows to find a path through the future that averts the catastrophic bloodshed of holy war.'
    ]
  },
  {
    id: 'dune-l7',
    lessonNumber: 7,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The Fremen & Sietch Tabr',
    title: 'Paul Muad\'Dib & The Missionaria Protectiva',
    subtitle: 'Myth Made Flesh Among the Desert Tribes',
    type: 'character',
    estimatedMinutes: 6,
    content: [
      'Captured by Stilgar’s Fremen troop, Paul and Jessica are brought into Sietch Tabr. Jessica utilizes the Missionaria Protectiva—ancient religious myths planted by the Bene Gesserit across primitive worlds—to convince the Fremen that Paul is the Mahdi (the prophesied savior).',
      'Challenged to ritual mortal combat by Jamis, Paul fights with bare crysknife, reluctantly killing Jamis in fair combat. By Fremen law, Paul assumes Jamis’s quarters, responsibilities, and the secret name Usul ("the base of the pillar"), while choosing the public warrior name Muad\'Dib (the desert kangaroo mouse).',
      'Paul falls deeply in love with Chani, the fierce Fremen warrior daughter of Liet-Kynes, cementing his integration into the soul of the desert people.'
    ]
  },
  {
    id: 'dune-l8',
    lessonNumber: 8,
    chapterNumber: 4,
    chapterTitle: 'Chapter 4: The Fremen & Sietch Tabr',
    title: 'Riding the Maker & The Water of Life',
    subtitle: 'Mastering the Great Sandworms',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'To achieve full Fremen manhood and leadership, Paul undergoes the ultimate initiation: summoning and mounting a colossal Sandworm using Maker hooks, riding the beast across the desert plains.',
      'Lady Jessica drinks the Water of Life—the poisonous bile of a dying infant sandworm—transmuting the molecular poison inside her body into an enlightened elixir through biochemical control, becoming the new Reverend Mother. Her unborn daughter Alia is born in the womb fully conscious, possessed of ancestral memories.',
      'Paul also drinks the Water of Life, falling into a death-like coma for three weeks before awakening with complete, crystalline prescience across the universe.'
    ]
  },
  {
    id: 'dune-l9',
    lessonNumber: 9,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Battle of Arrakeen & Ascendance',
    title: 'The Great Storm & The Defeat of the Sardaukar',
    subtitle: 'The Shield Wall Blown by Atomic Fire',
    type: 'climax',
    estimatedMinutes: 7,
    content: [
      'When Emperor Shaddam IV and the Harkonnens land their fleets on Arrakis to crush the Fremen rebellion, a colossal Coriolis storm approaches. Paul detonates family atomics to breach the Shield Wall, allowing thousands of Fremen riding giant Sandworms to sweep over the Imperial lines.',
      'The dreaded Sardaukar shock troops are utterly routed by the fierce Fremen warriors. Inside the governor\'s palace, young Alia Atreides slays Baron Harkonnen with a Gom Jabbar needle.',
      'Paul confronts the Emperor\'s deadly champion, Feyd-Rautha Harkonnen, in a tense, unshielded knife duel, turning aside a hidden poison blade in Feyd\'s hip to strike him down and eradicate House Harkonnen forever.'
    ]
  },
  {
    id: 'dune-l10',
    lessonNumber: 10,
    chapterNumber: 5,
    chapterTitle: 'Chapter 5: The Battle of Arrakeen & Ascendance',
    title: 'The Ultimate Leverage: Controlling the Spice Cycle',
    subtitle: 'He Who Can Destroy a Thing Controls That Thing',
    type: 'resolution',
    estimatedMinutes: 6,
    content: [
      'Standing before the defeated Emperor and the Spacing Guild Navigators, Paul delivers the ultimate political masterstroke: he threatens to pour the Water of Death onto the spice beds, triggering a chain reaction that would permanently destroy all Sandworms and extinguish spice production forever.',
      'Faced with the permanent collapse of space travel and civilisation, the Spacing Guild immediately surrenders, forcing Emperor Shaddam IV to abdicate.',
      'Paul agrees to marry Princess Irulan for dynastic legitimacy, but vows that Chani will remain his only true wife, beloved and honored in history.'
    ]
  },
  {
    id: 'dune-l11',
    lessonNumber: 11,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Themes & Philosophical Synthesis',
    title: 'The Peril of Charismatic Leaders & Messianic Deception',
    subtitle: 'Herbert’s Warning Against Superheroes',
    type: 'theme',
    estimatedMinutes: 6,
    content: [
      'Herbert’s foundational thesis in Dune is a profound warning: "Beware of charismatic leaders." Paul is not a simple heroic savior; he is a tragic figure trapped by the very myth he weaponized.',
      'The religious fervor cultivated among the Fremen breaks free of Paul\'s rational control, unleashing the catastrophic galactic jihad that claims billions of lives across the stars.',
      'Dune illustrates how institutions, religions, and ecological systems can be manipulated, and how humanity\'s desperate longing for easy salvation through charismatic messiahs surrenders critical judgment to tyranny.'
    ]
  },
  {
    id: 'dune-l12',
    lessonNumber: 12,
    chapterNumber: 6,
    chapterTitle: 'Chapter 6: Themes & Philosophical Synthesis',
    title: 'Ecology, Survival & The Golden Path',
    subtitle: 'The Legacy of Science Fiction’s Greatest Epic',
    type: 'reflection',
    estimatedMinutes: 6,
    content: [
      'Dune remains one of the most intellectually ambitious works in modern literature, combining ecology, political science, religion, linguistics, and philosophy into a unified visionary masterpiece.',
      'The desert of Arrakis serves as a crucible: hard environments breed resilient, disciplined cultures, while decadent, resource-rich palaces cultivate fragility and betrayal.',
      'As Paul ascends the Golden Lion Throne, he stands at the precipice of galactic transformation—master of space and time, yet prisoner of his own prophetic sight.'
    ],
    keyTakeaways: [
      'Fear is the mind-killer: emotional self-regulation is the foundation of strategic mastery.',
      'Ecology is the holistic science of understanding complex, interconnected dependencies.',
      'Charismatic leaders and messianic narratives pose inherent dangers to collective critical thought.',
      'He who can destroy a vital resource wields ultimate structural power over those who depend upon it.'
    ],
    reflectionQuestion: 'How does Paul Atreides’ struggle with his "Terrible Purpose" challenge the traditional hero archetype in fantasy and science fiction?'
  }
];

export const duneContent: ReadingBookContent = {
  bookId: 'dune',
  title: 'Dune',
  author: 'Frank Herbert',
  genre: 'Science Fiction / Space Epic',
  publishedYear: 1965,
  contentType: 'fiction',
  sourceType: 'curated-guide',
  summary: 'Set on the desert planet Arrakis, young Paul Atreides navigates political betrayal, deadly ecology, the sacred spice melange, and his destiny as the Kwisatz Haderach in Frank Herbert’s seminal sci-fi epic.',
  aboutThisBook: [
    'First published in 1965, Frank Herbert’s "Dune" is widely celebrated as the pinnacle of modern science fiction world-building. Set thousands of years in the future across a feudal interstellar empire, the narrative centers on the desert planet Arrakis (Dune)—the sole source in the known universe of the spice melange, a substance that extends life, enhances cognition, and enables interstellar navigation.',
    'When Duke Leto Atreides takes stewardship of Arrakis under imperial decree, he steps directly into a deadly trap orchestrated by the decadent Padishah Emperor and House Harkonnen. Following a devastating betrayal, the Duke’s young son Paul and his mother Lady Jessica flee into the deep, unforgiving sands of Arrakis.',
    'Among the native desert nomads, the Fremen, Paul adopts the warrior identity Muad’Dib, masters the giant Sandworms, and fulfills ancient messianic prophecies, while wrestling with terrifying visions of a galactic jihad unleashed in his name.'
  ],
  aboutBook: {
    setting: 'Arrakis (Dune) — A harsh, water-scarce desert planet inhabited by colossal Sandworms and resilient Fremen tribes',
    premise: 'A young noble heir survives a lethal political betrayal in the desert of Arrakis, unites the native nomadic tribes, and seizes control of the galaxy’s most precious resource.',
    keyCharacters: [
      'Paul Atreides (Muad’Dib) — The ducal heir trained in combat, Mentat computation, and Bene Gesserit prescience',
      'Lady Jessica — Paul’s mother, an initiate of the secretive Bene Gesserit sisterhood',
      'Duke Leto Atreides — Paul’s noble father, who prioritizes the loyalty of his people above imperial politics',
      'Baron Vladimir Harkonnen — The ruthless, grotesque architect of House Atreides’ destruction',
      'Chani — The fierce Fremen warrior and daughter of planetologist Liet-Kynes who becomes Paul’s true love',
      'Stilgar — The pragmatic leader of Sietch Tabr who welcomes Paul and Jessica into the Fremen way',
      'Reverend Mother Mohiam — The imperial Truthsayer who tests Paul with the lethal Gom Jabbar needle'
    ],
    mainConflict: 'The struggle to control the universal monopoly of the spice melange amid interstellar feudal politics, indigenous rebellion, and the terrifying momentum of religious fanaticism.',
    centralThemes: [
      'The Danger of Charismatic Messiahs — Herbert’s warning that heroic leaders inevitably lead followers into fanaticism',
      'Planetary Ecology as Destiny — How environment, scarce water, and biological interdependence shape civilization',
      'Mastery Over Fear — The Bene Gesserit litany: "Fear is the mind-killer"',
      'Ultimate Leverage — He who can destroy a thing controls that thing'
    ],
    whatToExpect: 'A profound 12-lesson study of Herbert’s ecological systems, political philosophy, linguistic world-building, and psychological prescience.'
  },
  totalChapters: 6,
  totalLessons: lessons.length,
  chapters: [
    { id: 'dune-ch1', chapterNumber: 1, title: 'Chapter 1: The Gom Jabbar & Departure from Caladan', subtitle: 'The Litany Against Fear, Kwisatz Haderach, and the Imperial Trap', lessons: lessons.filter(l => l.chapterNumber === 1) },
    { id: 'dune-ch2', chapterNumber: 2, title: 'Chapter 2: Arrakis, Ecology, & The Spice Melange', subtitle: 'Water Discipline, Sandworms, and Dr. Liet-Kynes’ Ecological Dream', lessons: lessons.filter(l => l.chapterNumber === 2) },
    { id: 'dune-ch3', chapterNumber: 3, title: 'Chapter 3: Betrayal & The Fall of House Atreides', subtitle: 'Dr. Yueh’s Treachery, Duke Leto’s Death, and the Spice Trance', lessons: lessons.filter(l => l.chapterNumber === 3) },
    { id: 'dune-ch4', chapterNumber: 4, title: 'Chapter 4: The Fremen & Sietch Tabr', subtitle: 'Muad\'Dib, Chani, Riding the Sandworm, and the Water of Life', lessons: lessons.filter(l => l.chapterNumber === 4) },
    { id: 'dune-ch5', chapterNumber: 5, title: 'Chapter 5: The Battle of Arrakeen & Ascendance', subtitle: 'The Coriolis Storm, Defeat of the Sardaukar, and the Spice Monopoly', lessons: lessons.filter(l => l.chapterNumber === 5) },
    { id: 'dune-ch6', chapterNumber: 6, title: 'Chapter 6: Themes & Philosophical Synthesis', subtitle: 'The Peril of Messianic Leaders and the Ecological Legacy', lessons: lessons.filter(l => l.chapterNumber === 6) }
  ],
  lessons
};
