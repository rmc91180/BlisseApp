export interface RolePlayScenario {
  id: number;
  name: string;
  category: string;
  mood: string;
  intensity: 'Light' | 'Medium' | 'Intense';
  vibe: string;
  description: string;
  setup: string;
  howToPlay: string;
  tips: string[];
  pairsWellWith: string[];
}

export const rolePlayScenarios: RolePlayScenario[] = [
  // ============================================
  // ROMANTIC (5 scenarios)
  // ============================================
  {
    id: 401,
    name: "First Date Redux",
    category: "Romantic",
    mood: "passionate",
    intensity: "Light",
    vibe: "Recapturing that early spark",
    description: "Pretend you're meeting for the first time. Recreate the nervous excitement of a first date.",
    setup: "Get ready separately. Meet at a restaurant, bar, or even your living room set up like a date spot. Dress up. Act like strangers.",
    howToPlay: "Introduce yourselves. Ask getting-to-know-you questions. Flirt like you're trying to impress. Let the tension build naturally. End the night as new lovers.",
    tips: ["Really commit to not knowing each other", "Ask questions you already know answers to", "Compliment like you just met", "Let the seduction happen slowly"],
    pairsWellWith: ["Standing Ovation", "The Lift", "Against the Wall"]
  },
  {
    id: 402,
    name: "Strangers at a Bar",
    category: "Romantic",
    mood: "passionate",
    intensity: "Light",
    vibe: "Anonymous attraction",
    description: "You're strangers who lock eyes across a bar. The chemistry is undeniable.",
    setup: "Go to a bar (or set up a home bar). Enter separately. Sit apart at first. One approaches the other.",
    howToPlay: "Make eye contact. One approaches with a line. Flirt as strangers. Buy each other drinks. Let the pickup happen. Leave together.",
    tips: ["Don't break character", "Use different names if you want", "The pickup is part of the fun", "Act surprised by your chemistry"],
    pairsWellWith: ["Standing positions", "Urgent sex", "Hotel Fantasy"]
  },
  {
    id: 403,
    name: "Anniversary Surprise",
    category: "Romantic",
    mood: "unified",
    intensity: "Light",
    vibe: "Celebrating your love",
    description: "One partner plans a surprise romantic evening for the other.",
    setup: "One partner plans everything: dinner, ambiance, activities. The other is surprised. Make it feel special and intentional.",
    howToPlay: "The planner leads the evening. Rose petals, candles, favorite foods. The surprise continues into the bedroom. Everything is about them.",
    tips: ["Plan actual surprises", "Pay attention to their favorites", "Make them feel cherished", "The effort itself is romantic"],
    pairsWellWith: ["The Lotus", "Face-Off", "Slow positions"]
  },
  {
    id: 404,
    name: "Love Letter Come to Life",
    category: "Romantic",
    mood: "unified",
    intensity: "Light",
    vibe: "Words becoming actions",
    description: "Write a love letter describing what you want to do, then act it out.",
    setup: "One partner writes a detailed love letter/fantasy. The other reads it. Then you act out exactly what was written.",
    howToPlay: "Read the letter together or have them read it alone first. Then make every word come true. Follow the letter precisely.",
    tips: ["Be specific in the letter", "Include emotions, not just actions", "The anticipation while reading is part of it", "Keep the letter"],
    pairsWellWith: ["Whatever the letter describes", "Anticipation", "Deep connection"]
  },
  {
    id: 405,
    name: "Honeymoon Night",
    category: "Romantic",
    mood: "passionate",
    intensity: "Light",
    vibe: "Like it's your first night as a married couple",
    description: "Pretend it's your honeymoon night - whether you're married or not.",
    setup: "Set up the bedroom like a honeymoon suite. Champagne, flowers, special lingerie. Treat it like a momentous occasion.",
    howToPlay: "Act nervous and excited like newlyweds. Take your time. Make it feel like the first night of forever. Extra romantic, extra special.",
    tips: ["Treat it as truly special", "Don't rush anything", "Focus on connection", "Make it memorable"],
    pairsWellWith: ["Slow positions", "Face-to-face", "The Lotus"]
  },

  // ============================================
  // FANTASY (5 scenarios)
  // ============================================
  {
    id: 406,
    name: "The Photographer",
    category: "Fantasy",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Being directed and admired",
    description: "One is a photographer, the other is the model. Direction meets desire.",
    setup: "Set up a 'photo shoot' area. Have a phone or camera (doesn't have to be on). One directs poses. The poses get increasingly intimate.",
    howToPlay: "Start with innocent poses. 'Give me more.' 'That's perfect.' 'Now show me...' The photographer directs increasingly revealing poses. Things progress.",
    tips: ["Give genuine compliments", "Direction is part of the play", "The camera can be real or prop", "It's about being watched and admired"],
    pairsWellWith: ["Mirror positions", "The Vanity", "Visual positions"]
  },
  {
    id: 407,
    name: "Boss & Employee",
    category: "Fantasy",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Power dynamics at play",
    description: "An after-hours encounter between boss and employee. Professional boundaries blur.",
    setup: "Set up a home office. Dress professionally. Create a workplace scenario. The 'employee' stays late.",
    howToPlay: "The boss asks the employee to stay late. Tension builds. Eventually, professional boundaries are crossed. The desk is involved.",
    tips: ["Keep it clearly fantasy", "The power dynamic is the point", "The desk is a key prop", "Suits and professional attire help"],
    pairsWellWith: ["The Desk Job", "Furniture positions", "Commanding positions"]
  },
  {
    id: 408,
    name: "Massage Therapist",
    category: "Fantasy",
    mood: "flowing",
    intensity: "Medium",
    vibe: "Professional touch becomes personal",
    description: "One plays a massage therapist. The massage becomes... unprofessional.",
    setup: "Set up a massage table (or bed). Have oils ready. One partner lies down covered by sheets. The 'therapist' is dressed professionally.",
    howToPlay: "Start with a legitimate massage. Hands wander. 'Is this okay?' The sheet gets moved. Things progress beyond professional.",
    tips: ["Start with real massage techniques", "Build tension slowly", "The 'asking permission' adds to it", "Professional becomes intimate"],
    pairsWellWith: ["Massage techniques", "Lazy Dog", "Spooning"]
  },
  {
    id: 409,
    name: "Repair Person",
    category: "Fantasy",
    mood: "playful",
    intensity: "Light",
    vibe: "Classic fantasy with a wink",
    description: "The classic repair person/homeowner scenario. You know how this goes.",
    setup: "One answers the door in something revealing. The other is 'there to fix something.' The repair takes an unexpected turn.",
    howToPlay: "Play it up with the clichés. 'I can't pay you in cash, but...' The classic lines are part of the fun. Don't take it too seriously.",
    tips: ["Embrace the cheese", "It's meant to be fun and silly", "Laugh together", "Classic for a reason"],
    pairsWellWith: ["Kitchen Counter", "Furniture positions", "Spontaneous positions"]
  },
  {
    id: 410,
    name: "Room Service",
    category: "Fantasy",
    mood: "passionate",
    intensity: "Medium",
    vibe: "Hotel encounter with the delivery",
    description: "Room service delivers more than what was ordered. Hotel anonymity enables boldness.",
    setup: "Set up like a hotel room. One is the guest in a robe. The other 'delivers' room service. The encounter is spontaneous.",
    howToPlay: "Knock on the door. Deliver the 'room service.' One invites the other to stay. The hotel anonymity enables the fantasy.",
    tips: ["Hotel setting enables boldness", "Robes are key wardrobe", "The transaction becomes something else", "Anonymous encounter fantasy"],
    pairsWellWith: ["Hotel Fantasy setting", "Urgent positions", "The Lift"]
  },

  // ============================================
  // PLAYFUL (5 scenarios)
  // ============================================
  {
    id: 411,
    name: "Truth or Dare (Couples Edition)",
    category: "Playful",
    mood: "playful",
    intensity: "Light",
    vibe: "Nostalgic game, adult edition",
    description: "The childhood game with very grown-up truths and dares.",
    setup: "Sit together. Maybe have drinks. Take turns. The truths and dares escalate.",
    howToPlay: "Start mild: 'Truth - what's your secret fantasy?' or 'Dare - take off one piece of clothing.' Escalate from there. Let the game lead where it goes.",
    tips: ["Start milder, escalate", "Both should be comfortable with dares", "Truths can be revealing", "The game is foreplay"],
    pairsWellWith: ["Strip games", "Whatever comes up", "Any position"]
  },
  {
    id: 412,
    name: "Simon Says (Intimate)",
    category: "Playful",
    mood: "playful",
    intensity: "Light",
    vibe: "Playful commands and compliance",
    description: "The children's game, very much not for children. Simon says... do what I say.",
    setup: "One is Simon. They give commands. The other must comply (unless Simon doesn't say 'Simon says').",
    howToPlay: "'Simon says take off your shirt.' 'Simon says kiss me here.' Keep it light and fun. Forfeit for not following rules?",
    tips: ["Keep it playful", "The commands are the fun part", "Forfeits for mistakes", "Trade who's Simon"],
    pairsWellWith: ["Playful mood", "Any position", "Light dominance"]
  },
  {
    id: 413,
    name: "Would You Rather (Spicy)",
    category: "Playful",
    mood: "playful",
    intensity: "Light",
    vibe: "Learning preferences through choices",
    description: "Would you rather questions, all intimate and revealing. Then do the answers.",
    setup: "Take turns asking 'Would you rather...' questions. All options are intimate. Then act on their answers.",
    howToPlay: "'Would you rather be blindfolded or do the blindfolding?' 'Would you rather start on top or have me there?' Then make their choice happen.",
    tips: ["Both options should be good", "Learn real preferences", "Act on the answers", "Gets revealing quickly"],
    pairsWellWith: ["Learning each other", "Preferences discussion", "Any position"]
  },
  {
    id: 414,
    name: "Dice Decisions",
    category: "Playful",
    mood: "playful",
    intensity: "Light",
    vibe: "Leaving choices to chance",
    description: "Use dice to randomly determine what happens next. Surrender to chance.",
    setup: "Assign activities to numbers. Roll dice to determine what happens. Add more dice or options as you go.",
    howToPlay: "1-2 = kissing, 3-4 = oral, 5-6 = positions. Roll and do what the dice say. Add complexity: where, how long, which position specifically.",
    tips: ["Make your own rules", "All options should be good", "Add dice for complexity", "The randomness is freeing"],
    pairsWellWith: ["Any position", "Spontaneity", "Variety"]
  },
  {
    id: 415,
    name: "Spin the Bottle (Two Player)",
    category: "Playful",
    mood: "playful",
    intensity: "Light",
    vibe: "Nostalgic with a twist",
    description: "Just the two of you and a bottle. What it lands on determines the action.",
    setup: "Put a bottle on the floor. Sit around it. Write body parts or actions around it. Spin and do what it points to.",
    howToPlay: "Spin the bottle. Whatever it points toward: a body part to kiss, an action to do, a position to try. Take turns spinning.",
    tips: ["Make your own rules around the bottle", "Add zones for different actions", "Escalate the options", "Keep it fun"],
    pairsWellWith: ["Variety", "Playfulness", "Any position"]
  },

  // ============================================
  // ADVENTUROUS (5 scenarios)
  // ============================================
  {
    id: 416,
    name: "Blindfolded Surrender",
    category: "Adventurous",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Heightened senses through surrender",
    description: "One partner is blindfolded and surrenders control to the other.",
    setup: "Choose a comfortable blindfold. Establish safe word. One partner surrenders sight and control to the other.",
    howToPlay: "The blindfolded partner experiences everything heightened. They don't know what's coming. The other controls all sensation.",
    tips: ["Safe word is essential", "Heightens all other senses", "Go slowly to build anticipation", "Check in regularly"],
    pairsWellWith: ["Teasing", "Sensation play", "Any position"]
  },
  {
    id: 417,
    name: "Tied Up (Light)",
    category: "Adventurous",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Light restraint, big trust",
    description: "Very light restraint using soft materials like scarves or ties.",
    setup: "Use soft materials like silk scarves. Tie loosely - should be escapable. Establish safe word. Start very mild.",
    howToPlay: "One partner has wrists gently tied. The other has access to them. Light restraint heightens sensation and surrender.",
    tips: ["Keep it loose and safe", "Soft materials only", "Safe word essential", "Trust is paramount"],
    pairsWellWith: ["Teasing", "Oral play", "Commanding positions"]
  },
  {
    id: 418,
    name: "Temperature Play",
    category: "Adventurous",
    mood: "playful",
    intensity: "Medium",
    vibe: "Hot and cold sensations",
    description: "Using temperature contrasts for surprising sensations.",
    setup: "Have ice cubes and warm things ready. Warm towels from dryer. Warm drink and cold drink. Contrast temperatures on skin.",
    howToPlay: "Trail ice across skin, follow with warm breath. Alternate temperatures unpredictably. Focus on sensitive areas.",
    tips: ["Never too extreme either way", "The contrast is the excitement", "Wet spots feel colder", "Safe for most areas"],
    pairsWellWith: ["Sensation play", "Teasing", "Any position"]
  },
  {
    id: 419,
    name: "Public Adjacent",
    category: "Adventurous",
    mood: "dynamic",
    intensity: "Intense",
    vibe: "The thrill of almost being caught",
    description: "Intimate activities where there's a small risk of discovery. The thrill of the forbidden.",
    setup: "Find semi-private locations: car, balcony, private beach, dressing room. Somewhere with slight risk but not actual public exposure.",
    howToPlay: "The possibility of being caught adds adrenaline. Be smart about actual privacy laws. The thrill is the point.",
    tips: ["Never actually risk arrest", "The thrill, not the reality", "Private but feels risky", "Know the laws"],
    pairsWellWith: ["Standing positions", "Quick positions", "Urgency"]
  },
  {
    id: 420,
    name: "Power Exchange",
    category: "Adventurous",
    mood: "commanding",
    intensity: "Intense",
    vibe: "One leads, one follows completely",
    description: "One partner takes complete control while the other surrenders. Clear roles, clear boundaries.",
    setup: "Discuss limits thoroughly first. Establish safe word. One partner will direct everything. The other will follow.",
    howToPlay: "The dominant partner directs all action. The submissive partner follows. This is about trust and clear communication.",
    tips: ["Extensive discussion first", "Safe word essential", "Aftercare is crucial", "Not for everyone - and that's okay"],
    pairsWellWith: ["Whatever the dominant chooses", "Trust", "Communication"]
  }
];

export const rolePlayCategories = ['Romantic', 'Fantasy', 'Playful', 'Adventurous'];
export const rolePlayIntensities = ['Light', 'Medium', 'Intense'] as const;
