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
    mood: "blossoming",
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
    name: "After-Hours Performance Review",
    category: "Fantasy",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Power dynamics at play",
    description: "An after-hours office scenario where professional boundaries blur and tension takes over.",
    setup: "Set up a home office. Dress professionally. Create a workplace scenario. The 'employee' stays late.",
    howToPlay: "The boss asks the employee to stay late. Tension builds. Eventually, professional boundaries are crossed. The desk is involved.",
    tips: ["Keep it clearly fantasy", "The power dynamic is the point", "The desk is a key prop", "Suits and professional attire help"],
    pairsWellWith: ["The Desk Job", "Furniture positions", "Commanding positions"]
  },
  {
    id: 408,
    name: "Massage Therapist",
    category: "Fantasy",
    mood: "blossoming",
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
    name: "The Fixer Who Stayed",
    category: "Fantasy",
    mood: "playful",
    intensity: "Light",
    vibe: "Classic fantasy with a wink",
    description: "A playful home-visit scenario where the fix takes longer than expected and chemistry does the rest.",
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
  },

  // ============================================
  // ROMANTIC +2 (IDs 421–422)
  // ============================================
  {
    id: 421,
    name: "The Slow Dance Night",
    category: "Romantic",
    mood: "flowing",
    intensity: "Light",
    vibe: "Swaying together until the world fades away",
    description: "Put on your favorite slow songs, hold each other close, and let the music guide your bodies. No agenda, just presence.",
    setup: "Clear a small space in your living room. Dim the lights or use candles. Queue up a playlist of slow, romantic songs. One partner extends a hand and asks the other to dance.",
    howToPlay: "Hold each other close and sway. Whisper in each other's ears. Let your hands explore naturally as the songs play. Stay slow — the restraint builds desire. Let each song bring you closer until dancing is no longer enough.",
    tips: ["Pick songs that are meaningful to your relationship", "No phones once the music starts", "Let the tempo dictate your pace — slower is better", "Eye contact between songs is powerful"],
    pairsWellWith: ["The Lotus", "Face-Off", "Spooning"]
  },
  {
    id: 422,
    name: "Sunset Getaway",
    category: "Romantic",
    mood: "passionate",
    intensity: "Medium",
    vibe: "Escaping together to a world of your own",
    description: "Pretend you've just arrived at a private vacation villa. Tonight is the first night of your getaway — no responsibilities, no interruptions.",
    setup: "Transform your bedroom into a 'resort suite.' Use fresh sheets, tropical scents, maybe a fan for a warm breeze. Have fruit, chocolate, and drinks on the nightstand. Dress in vacation attire.",
    howToPlay: "Arrive at your 'villa' and explore it together. Unpack slowly. Comment on the view. Pour each other drinks and toast to your trip. Let the vacation mindset dissolve all inhibitions. You have all night and nowhere to be.",
    tips: ["Really commit to the getaway mindset", "Ambient sounds like ocean waves help set the scene", "Treat each other like it's a special trip", "The 'no schedule' feeling is freeing"],
    pairsWellWith: ["Standing Ovation", "The Lift", "Lazy Dog"]
  },

  // ============================================
  // FANTASY +3 (IDs 423–425)
  // ============================================
  {
    id: 423,
    name: "The Royalty Treatment",
    category: "Fantasy",
    mood: "commanding",
    intensity: "Medium",
    vibe: "Royal court indulgence",
    description: "One partner is royalty; the other is a devoted attendant whose sole purpose is to please the crown.",
    setup: "The 'royal' lounges on the bed like a throne. Wear something regal — a robe, a crown, jewelry. The attendant dresses to serve. Have grapes, wine, and anything decadent nearby.",
    howToPlay: "The royal gives gentle commands: 'Feed me a grape. Now fan me. Closer.' The attendant pampers and worships. Requests become more intimate. The royal rewards loyalty generously.",
    tips: ["The royal should be gracious, not harsh", "Pampering is genuine — use real massage, real treats", "Switch roles on another night for fairness", "A playful sense of entitlement adds fun"],
    pairsWellWith: ["The Lotus", "Oral play", "Slow positions"]
  },
  {
    id: 424,
    name: "Personal Trainer",
    category: "Fantasy",
    mood: "dynamic",
    intensity: "Medium",
    vibe: "Sweaty workout turns steamy",
    description: "One partner is a personal trainer pushing the other through a workout. The physical exertion and closeness leads somewhere unexpected.",
    setup: "Wear workout clothes. Clear a space. The 'trainer' has a plan: stretches, bodyweight exercises, hands-on form corrections. Have water and towels handy.",
    howToPlay: "The trainer guides exercises with lots of hands-on corrections. 'Deeper squat — let me spot you.' Stretching gets intimate. Hands linger longer than professional. The cool-down becomes a warm-up for something else entirely.",
    tips: ["The physical touch during 'corrections' is the spark", "Both of you will actually get a little warmed up", "Tight workout clothes help the visual", "The trainer's confidence is attractive — own it"],
    pairsWellWith: ["Standing positions", "The Wheelbarrow", "Against the Wall"]
  },
  {
    id: 425,
    name: "The Artist's Muse",
    category: "Fantasy",
    mood: "blossoming",
    intensity: "Light",
    vibe: "Being truly seen and admired",
    description: "One partner is an artist who needs to sketch or paint the other. The muse poses, the artist studies every detail with devoted attention.",
    setup: "Get a sketchpad and pencil (skill doesn't matter). Set up soft lighting. The muse wears something beautiful — or drapes a sheet. A chaise lounge or pile of pillows makes the perfect posing spot.",
    howToPlay: "The artist arranges the muse into poses, studying them intently. 'Turn your shoulder. Look at me. Beautiful.' The attention is intoxicating. The artist eventually puts down the pencil and shows appreciation with more than just words.",
    tips: ["The quality of the drawing is irrelevant — the attention is the point", "Describe aloud what you see and admire", "Let poses get progressively more revealing", "The muse's vulnerability is powerful"],
    pairsWellWith: ["The Vanity", "Face-to-face positions", "The Lotus"]
  },

  // ============================================
  // PLAYFUL +3 (IDs 426–428)
  // ============================================
  {
    id: 426,
    name: "The Dare Jar",
    category: "Playful",
    mood: "playful",
    intensity: "Medium",
    vibe: "Anticipation in every slip of paper",
    description: "Fill a jar with folded dares written by both of you. Take turns drawing and performing. You never know what's next.",
    setup: "Beforehand, each partner writes 10–15 dares on slips of paper and folds them into a jar. Dares should range from sweet to spicy. Sit together with drinks and the jar between you.",
    howToPlay: "Take turns pulling a dare from the jar. Read it aloud, then do it immediately. No skipping, no trading — what you pull, you play. Alternate until the jar is empty or you can't keep your hands off each other.",
    tips: ["Write dares at different intensity levels for good pacing", "Include some funny ones to keep it light", "The mystery of what's next is half the thrill", "Save a few of the best dares for a second round"],
    pairsWellWith: ["Any position", "Oral play", "Teasing"]
  },
  {
    id: 427,
    name: "Costume Night",
    category: "Playful",
    mood: "dynamic",
    intensity: "Light",
    vibe: "Becoming someone new together",
    description: "Each partner picks a character or costume and stays in character for the night. No rules except: commit fully.",
    setup: "Raid your closets or pick up something fun — wigs, hats, uniforms, vintage finds. Get dressed separately and reveal your characters to each other. Set the scene to match the vibe.",
    howToPlay: "Introduce your characters. Give them names and backstories. How do these two characters meet? What's their chemistry? Let the characters interact, flirt, and connect. The costumes come off when the characters can't resist anymore.",
    tips: ["The sillier the commitment, the more fun it is", "Stay in character even when you laugh", "Mix and match themes — a cowboy and a pirate is perfectly fine", "Accents are optional but encouraged"],
    pairsWellWith: ["Spontaneous positions", "Standing positions", "Laughter and connection"]
  },
  {
    id: 428,
    name: "Two Truths & a Lie (Intimate)",
    category: "Playful",
    mood: "blossoming",
    intensity: "Light",
    vibe: "Discovering hidden desires through a game",
    description: "Share two real fantasies and one fake. Your partner guesses the lie. Either way, you both learn something new.",
    setup: "Get comfortable together — couch, bed, blanket fort. Have drinks. Each round, one partner shares three intimate statements: two true, one made up. The stakes? The guesser's forfeit if they're wrong.",
    howToPlay: "Take turns sharing. 'I've always wanted to try... / My secret turn-on is... / I once dreamed about...' Your partner guesses which is the lie. Wrong guesses mean a forfeit chosen by the other. Right guesses earn a reward.",
    tips: ["Make the lie believable for maximum fun", "The truths are the real gift — listen closely", "Forfeits should be fun, not punishing", "You might discover something genuinely surprising"],
    pairsWellWith: ["Whatever desires surface", "Connection-building", "Any position"]
  },

  // ============================================
  // ADVENTUROUS +2 (IDs 429–430)
  // ============================================
  {
    id: 429,
    name: "Sensation Surprise",
    category: "Adventurous",
    mood: "grounded",
    intensity: "Medium",
    vibe: "A buffet of unexpected textures and feelings",
    description: "Gather different textured objects and sensations. One partner is blindfolded while the other trails surprise after surprise across their skin.",
    setup: "Collect an assortment: feather, silk scarf, ice cube, warm spoon, soft brush, cool chain, fuzzy fabric, fingertips. Lay them out where the blindfolded partner can't see. Have them lie comfortably.",
    howToPlay: "Blindfold your partner. Without warning, trail different textures across their body. They guess what it is. Alternate between expected and surprising. Mix gentle and firm. Let the unpredictability build arousal.",
    tips: ["Vary the pace — quick taps then long slow drags", "Warm or cool objects right before using them for extra contrast", "The inner arms, neck, and stomach are wonderfully sensitive", "Silence between sensations builds anticipation"],
    pairsWellWith: ["Temperature Play", "Blindfolded Surrender", "Spooning"]
  },
  {
    id: 430,
    name: "The Countdown",
    category: "Adventurous",
    mood: "passionate",
    intensity: "Intense",
    vibe: "Building tension with a ticking clock",
    description: "Set a timer. You cannot have full intimacy until it reaches zero. Everything else is allowed — and encouraged.",
    setup: "Set a visible timer for 20–30 minutes. The rule: absolutely everything is on the table except the final act. Kissing, touching, teasing, oral — all fair game. But you must wait for the countdown.",
    howToPlay: "Start the timer and start exploring each other. The only rule is you must wait. Tease relentlessly. Get as close to the edge as you dare. Watch the clock together. When it hits zero, there are no more rules.",
    tips: ["Longer timers mean more intensity at the end", "Taking turns being the teaser keeps it balanced", "Watching the clock together is part of the tension", "If you break early, add penalty time"],
    pairsWellWith: ["Any position", "Urgent positions", "Against the Wall"]
  },
  {
    id: 431,
    name: "Bookstore Crush",
    category: "Romantic",
    mood: "blossoming",
    intensity: "Light",
    vibe: "Slow flirting between shelves and stolen glances",
    description: "You keep running into each other in a cozy bookstore, each encounter a little bolder than the last.",
    setup: "Stack books, magazines, or journals around the room. One of you is browsing; the other notices a familiar face nearby. Dress softly, like you accidentally look very good today.",
    howToPlay: "Recommend each other books. Let your hands brush as you pass one over. Debate whether the ending was satisfying. Sit together to 'read' and let the conversation turn personal, then openly flirt once the chemistry is impossible to ignore.",
    tips: ["Keep the energy curious instead of rushed", "A compliment about taste is a good opener", "The slow burn is what makes this one work", "Shared blankets and tea make the scene feel even sweeter"],
    pairsWellWith: ["Face-Off", "The Lotus", "Couch Cocoon"]
  },
  {
    id: 432,
    name: "Chef's Table",
    category: "Playful",
    mood: "dynamic",
    intensity: "Medium",
    vibe: "A private tasting with lots of hands-on attention",
    description: "One partner is the chef, the other gets a front-row seat to a very personal tasting menu.",
    setup: "Use your kitchen or dining area as the stage. Put on an apron, prep a small tasting plate, and make the other sit close enough to watch every move. The chef is in charge of the experience.",
    howToPlay: "Serve tiny bites, pour sips, and narrate the experience like it is a special event. The chef adjusts posture, feeds by hand, and keeps finding reasons to step closer. The tasting becomes more playful and tactile with every course.",
    tips: ["Small bites keep the mood light and teasing", "Use texture and temperature to make it feel more immersive", "The chef should sound confident and a little indulgent", "A cleanup break can turn into part of the flirtation"],
    pairsWellWith: ["Kitchen Counter", "Living Room Picnic", "Playful teasing"]
  },
  {
    id: 433,
    name: "Airport Reunion",
    category: "Romantic",
    mood: "passionate",
    intensity: "Medium",
    vibe: "You've been apart too long and finally collide again",
    description: "One of you has just arrived after time away, and the reunion has that can't-wait-another-minute energy.",
    setup: "Use a weekender bag, coat, or travel outfit to set the scene. One partner arrives at the door while the other has clearly been waiting. Let the first hug do most of the talking.",
    howToPlay: "The traveler drops their bag, the waiting partner closes the distance, and the reunion unfolds in waves: holding, kissing, talking over each other, and not really wanting to make it past the doorway before things heat up.",
    tips: ["The first minute should feel almost breathless", "A little chaos helps this scenario feel real", "Keep the dialogue simple and emotional", "This works best when the physical reunion starts before the practical questions do"],
    pairsWellWith: ["Against the Wall", "Standing Ovation", "The Lift"]
  },
  {
    id: 434,
    name: "Private Spa Escape",
    category: "Fantasy",
    mood: "flowing",
    intensity: "Light",
    vibe: "A luxury reset with devoted attention",
    description: "One partner welcomes the other into a private spa suite where the entire evening is designed to relax, pamper, and slowly tempt.",
    setup: "Lay out robes, warm towels, oils, and water or tea. Dim the lights and make the bedroom or bathroom feel like a spa that closes only for the two of you. One is the host, the other is the guest of honor.",
    howToPlay: "The host narrates each step of the experience: robe, towel, warm hands, gentle massage, check-ins, and slow transitions. Keep the energy soft and indulgent, like the whole point is to take care of the guest until they completely melt.",
    tips: ["The slower and more attentive you are, the better this works", "Little luxuries like warm towels matter more than expensive props", "A calm voice makes the whole scene feel more immersive", "This can stay sweet or become more sensual without changing the setup"],
    pairsWellWith: ["The Full-Body Surrender", "Massage techniques", "Slow positions"]
  }
];

export const rolePlayCategories = ['Romantic', 'Fantasy', 'Playful', 'Adventurous'];
export const rolePlayIntensities = ['Light', 'Medium', 'Intense'] as const;
