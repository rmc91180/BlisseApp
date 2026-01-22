export interface ForeplayIdea {
  id: number;
  name: string;
  category: string;
  mood: string;
  duration: 'Quick' | 'Medium' | 'Extended';
  vibe: string;
  description: string;
  howTo: string;
  tips: string[];
  pairsWellWith: string[];
}

export const foreplayIdeas: ForeplayIdea[] = [
  // ============================================
  // TOUCH (12 ideas)
  // ============================================
  {
    id: 101,
    name: "Sensual Massage",
    category: "Touch",
    mood: "flowing",
    duration: "Extended",
    vibe: "Relaxing tension into arousal",
    description: "A full-body massage that gradually transitions from relaxing to sensual, awakening the body slowly.",
    howTo: "Start with shoulders and back using warm oil. Work slowly down the body, gradually including more sensitive areas. Focus on what makes your partner respond.",
    tips: ["Warm the oil in your hands first", "Ask about pressure preferences", "Pay attention to breathing changes", "Don't rush to erogenous zones"],
    pairsWellWith: ["Spooning", "Lazy Dog", "The Lotus"]
  },
  {
    id: 102,
    name: "Neck & Ear Focus",
    category: "Touch",
    mood: "passionate",
    duration: "Quick",
    vibe: "Targeting highly sensitive zones",
    description: "Focus entirely on the neck and ears - kissing, breathing, nibbling, and whispering.",
    howTo: "Start with soft kisses on the neck. Breathe warmly on the ear. Alternate between gentle kisses, light nibbles, and warm breath. Mix in whispers.",
    tips: ["Light touch is often more effective", "The spot behind the ear is magical", "Warm breath before kisses", "Pay attention to their reactions"],
    pairsWellWith: ["Spooning", "Lazy Dog", "The Caboose"]
  },
  {
    id: 103,
    name: "The Slow Tease",
    category: "Touch",
    mood: "commanding",
    duration: "Extended",
    vibe: "Building desire through denial",
    description: "Deliberately slow, teasing touches that approach but don't quite reach where your partner wants.",
    howTo: "Touch everywhere except where they most want. Get close, then move away. Let them express desire. Make them wait. Finally give in when tension peaks.",
    tips: ["Watch their body language", "Verbal teasing adds to it", "Have them tell you what they want", "The payoff is worth the wait"],
    pairsWellWith: ["Cowgirl", "The Anvil", "Any position"]
  },
  {
    id: 104,
    name: "Body Worship",
    category: "Touch",
    mood: "unified",
    duration: "Extended",
    vibe: "Adoring every inch",
    description: "One partner lies back while the other kisses and appreciates every part of their body.",
    howTo: "Start at the top of the head. Kiss and caress every part of the body, verbalizing appreciation. Take your time. Cover absolutely everything.",
    tips: ["Verbalize what you love about each part", "Include often-neglected areas", "This is about them receiving", "No rushing"],
    pairsWellWith: ["Missionary", "The Seashell", "Any position"]
  },
  {
    id: 105,
    name: "Feather Touch",
    category: "Touch",
    mood: "flowing",
    duration: "Medium",
    vibe: "Barely-there sensations",
    description: "Using a feather or very light fingertip touches to create tingling, teasing sensations.",
    howTo: "Using a feather or the lightest possible fingertip touch, trace patterns across skin. Focus on inner arms, sides, thighs, and stomach.",
    tips: ["Lighter than you think is better", "Vary the pattern unpredictably", "Watch for goosebumps", "Combine with blindfolding"],
    pairsWellWith: ["Missionary", "Cowgirl", "The Waterfall"]
  },
  {
    id: 106,
    name: "Mutual Exploration",
    category: "Touch",
    mood: "unified",
    duration: "Extended",
    vibe: "Learning each other's bodies",
    description: "Take turns showing each other exactly how you like to be touched.",
    howTo: "One partner guides the other's hand, showing pressure, speed, and location preferences. Then switch. No assumptions - direct instruction.",
    tips: ["This is about learning, not performance", "Be specific with guidance", "Positive feedback helps", "Try things you've never mentioned before"],
    pairsWellWith: ["Face-Off", "The Spider", "The Lotus"]
  },
  {
    id: 107,
    name: "Hand Exploration",
    category: "Touch",
    mood: "flowing",
    duration: "Quick",
    vibe: "Finding pleasure in hands and arms",
    description: "Focused exploration of hands, arms, and fingers - surprisingly sensual.",
    howTo: "Take your partner's hand. Kiss each finger. Explore palm with lips. Work up the arm. Discover sensitivity in unexpected places.",
    tips: ["The inside of the wrist is very sensitive", "Between fingers often forgotten", "Gentle sucking on fingers", "Inner arm from wrist to elbow"],
    pairsWellWith: ["Face-Off", "The Lotus", "Intimate positions"]
  },
  {
    id: 108,
    name: "Scalp Massage",
    category: "Touch",
    mood: "flowing",
    duration: "Medium",
    vibe: "Relaxation through the head",
    description: "A focused scalp massage that melts stress and builds intimacy.",
    howTo: "Have them lie with head in your lap. Use fingertips to massage the entire scalp. Vary pressure. Include temples and behind ears.",
    tips: ["Fingertips, not fingernails", "Include the hairline", "Temples are very sensitive", "Can lead naturally to neck kisses"],
    pairsWellWith: ["Relaxation", "Stress relief", "Slow buildup"]
  },
  {
    id: 109,
    name: "Back Tracing",
    category: "Touch",
    mood: "flowing",
    duration: "Medium",
    vibe: "Light touches down the spine",
    description: "Using fingertips to trace patterns on the back, focusing on the spine and sides.",
    howTo: "Have them lie face down. Use single fingertips to trace slowly down the spine and across the back. Vary patterns and pressure.",
    tips: ["Very light touch works best", "Trace the spine slowly", "Include the sides", "Watch for shivers"],
    pairsWellWith: ["Lazy Dog", "Rear entry positions", "Relaxation"]
  },
  {
    id: 110,
    name: "Inner Thigh Teasing",
    category: "Touch",
    mood: "passionate",
    duration: "Quick",
    vibe: "Getting close but not quite there",
    description: "Focusing touch on the inner thighs without going higher.",
    howTo: "Kiss, stroke, and caress the inner thighs. Get close to where they want you but don't go there yet. Build anticipation.",
    tips: ["The closer you get, the more they'll want", "Alternate legs", "Use lips and fingertips", "Make them wait"],
    pairsWellWith: ["Oral play", "Teasing", "Building anticipation"]
  },
  {
    id: 111,
    name: "Foot Massage",
    category: "Touch",
    mood: "grounded",
    duration: "Medium",
    vibe: "Grounding through the feet",
    description: "A thorough foot massage that relaxes the whole body.",
    howTo: "Use lotion or oil. Work the arches, balls of feet, and each toe. Apply firm pressure to avoid tickling. Include ankles.",
    tips: ["Firm pressure prevents tickling", "Work the arches thoroughly", "Include between the toes", "Surprisingly relaxing for many"],
    pairsWellWith: ["Full body massage", "Relaxation", "Stress relief"]
  },
  {
    id: 112,
    name: "The Full Body Trace",
    category: "Touch",
    mood: "flowing",
    duration: "Extended",
    vibe: "One continuous stroke everywhere",
    description: "One continuous touch that travels across the entire body without lifting.",
    howTo: "Starting at one point, trace a continuous line across the entire body without lifting your fingers. Cover everywhere in one flowing movement.",
    tips: ["Never lift your fingers", "Cover the whole body", "Vary pressure as you go", "Can take 10+ minutes"],
    pairsWellWith: ["Meditation", "Deep connection", "Slow buildup"]
  },

  // ============================================
  // SENSATION (10 ideas)
  // ============================================
  {
    id: 113,
    name: "Ice & Heat Play",
    category: "Sensation",
    mood: "playful",
    duration: "Medium",
    vibe: "Surprising temperature contrasts",
    description: "Alternating between ice cubes and warm touches creates surprising sensations.",
    howTo: "Have ice cubes and warm water nearby. Trail ice across skin, then follow with warm breath or kisses. Focus on neck, chest, inner arms, thighs.",
    tips: ["Don't leave ice in one spot too long", "Warm breath feels amazing after cold", "Watch for goosebumps", "Keep towels handy"],
    pairsWellWith: ["Missionary", "Cowgirl", "The Seashell"]
  },
  {
    id: 114,
    name: "Blindfolded Touch",
    category: "Sensation",
    mood: "commanding",
    duration: "Medium",
    vibe: "Heightened senses through surrender",
    description: "One partner is blindfolded while the other explores with various touches.",
    howTo: "Gently blindfold your partner with a soft scarf. Use different textures - fingers, feathers, silk, lips. Vary pressure and location unpredictably.",
    tips: ["Establish a safe word", "Start gently to build trust", "Silence builds anticipation", "Describe what you're going to do... or don't"],
    pairsWellWith: ["The Chairman", "Doggy Style", "Lazy Dog"]
  },
  {
    id: 115,
    name: "Temperature Contrast",
    category: "Sensation",
    mood: "playful",
    duration: "Medium",
    vibe: "Hot and cold surprises",
    description: "Using warm and cold elements in alternation.",
    howTo: "Prepare warm towels, ice, warm drinks, cold water. Alternate temperature sensations on skin. Pay attention to reactions.",
    tips: ["Test temperatures on yourself first", "Never too hot or too cold", "The contrast is exciting", "Focus on sensitive areas"],
    pairsWellWith: ["Missionary", "Cowgirl", "Any position after"]
  },
  {
    id: 116,
    name: "Silk & Texture Play",
    category: "Sensation",
    mood: "flowing",
    duration: "Medium",
    vibe: "Different textures on skin",
    description: "Using various textures - silk, fur, leather, cotton - across the body.",
    howTo: "Gather items with different textures. Drag them slowly across your partner's skin. Let them guess what each one is.",
    tips: ["Combine with blindfold", "Vary the textures dramatically", "Let them guess what it is", "Focus on sensitive areas"],
    pairsWellWith: ["Blindfolded Touch", "Teasing", "Slow buildup"]
  },
  {
    id: 117,
    name: "Warm Oil Drizzle",
    category: "Sensation",
    mood: "flowing",
    duration: "Medium",
    vibe: "Warm streams of sensation",
    description: "Drizzling warm massage oil from a height to create streams of warmth.",
    howTo: "Warm massage oil (test on wrist first). Drizzle from 6-12 inches above the body, creating warm streams. Follow with hands to spread.",
    tips: ["Test temperature first - never too hot", "The drizzle sensation is unique", "Follow with massage", "Protect your sheets"],
    pairsWellWith: ["Massage", "Sensual touch", "Slow foreplay"]
  },
  {
    id: 118,
    name: "Breath Play (Light)",
    category: "Sensation",
    mood: "passionate",
    duration: "Quick",
    vibe: "Warm and cool breath sensations",
    description: "Using warm and cool breath on various parts of the body.",
    howTo: "Breathe warm breath on skin, then purse lips for cool breath on the same spot. Alternate across the body. Especially effective on wet skin.",
    tips: ["Especially good after kissing or licking", "Warm then cool creates contrast", "Neck and ears respond well", "Very simple but effective"],
    pairsWellWith: ["Oral play", "Kissing", "Any position"]
  },
  {
    id: 119,
    name: "Vibration Exploration",
    category: "Sensation",
    mood: "playful",
    duration: "Medium",
    vibe: "Using vibrations on unexpected places",
    description: "Using a vibrator or massager on non-obvious body parts.",
    howTo: "Use a vibrator on unexpected areas - neck, inner arms, feet, scalp, back of knees. Explore what feels good where.",
    tips: ["Start on low settings", "Explore non-obvious areas", "Back of neck feels amazing", "Let them guide you to favorite spots"],
    pairsWellWith: ["Exploration", "Toys", "Building arousal"]
  },
  {
    id: 120,
    name: "Scratching (Light)",
    category: "Sensation",
    mood: "passionate",
    duration: "Quick",
    vibe: "Nails lightly dragging on skin",
    description: "Using fingernails to lightly scratch and drag across skin.",
    howTo: "With light pressure, drag fingernails across back, arms, thighs. Vary patterns. Watch for their response to know how much pressure.",
    tips: ["Light pressure - don't break skin", "Back responds well", "Watch their reaction for pressure guidance", "Alternating with soft touch amplifies it"],
    pairsWellWith: ["Passionate positions", "During sex", "Back scratching"]
  },
  {
    id: 121,
    name: "Pinpoint Focus",
    category: "Sensation",
    mood: "commanding",
    duration: "Quick",
    vibe: "Intense focus on one tiny spot",
    description: "Focusing all attention on one tiny spot for an extended time.",
    howTo: "Choose one small area - maybe an inch of skin. Focus all your attention there for several minutes. Kiss, lick, touch - just that spot.",
    tips: ["The anticipation of moving builds", "Inner wrist, neck, behind ear work well", "Don't move no matter what", "Intense in its simplicity"],
    pairsWellWith: ["Teasing", "Building anticipation", "Control play"]
  },
  {
    id: 122,
    name: "Scented Exploration",
    category: "Sensation",
    mood: "flowing",
    duration: "Medium",
    vibe: "Awakening through smell",
    description: "Using scented oils or candles to create an aromatic atmosphere.",
    howTo: "Light scented candles or use essential oils. Let the scent fill the room. Combine with massage. Focus on how scent enhances sensation.",
    tips: ["Choose scents you both enjoy", "Don't overwhelm the senses", "Lavender relaxes, jasmine arouses", "Some oils shouldn't be used on skin"],
    pairsWellWith: ["Sensual Massage", "Spooning", "Slow positions"]
  },

  // ============================================
  // MENTAL (10 ideas)
  // ============================================
  {
    id: 123,
    name: "Whispered Fantasies",
    category: "Mental",
    mood: "passionate",
    duration: "Quick",
    vibe: "Words that ignite the imagination",
    description: "Take turns whispering fantasies and desires to each other.",
    howTo: "Get close - lips near ear. Take turns sharing what you want, what you're thinking, what you find attractive about them. Be specific and vivid.",
    tips: ["Start tamer if new to this", "Describe sensations, not just actions", "React to what they say", "It's okay to laugh together"],
    pairsWellWith: ["Spooning", "The Pretzel", "Any position"]
  },
  {
    id: 124,
    name: "Anticipation Texts",
    category: "Mental",
    mood: "passionate",
    duration: "Extended",
    vibe: "Building desire before you're together",
    description: "Throughout the day, send flirty or explicit texts building anticipation.",
    howTo: "Start subtle in the morning. Escalate throughout the day. Describe what you're thinking about. Tell them what's going to happen later.",
    tips: ["Make sure you have the right recipient!", "Match their comfort level", "Be specific about timing", "Follow through on promises"],
    pairsWellWith: ["Standing Ovation", "Doggy Style", "Any position"]
  },
  {
    id: 125,
    name: "Strip Game",
    category: "Mental",
    mood: "playful",
    duration: "Extended",
    vibe: "Playful competition meets seduction",
    description: "Play a simple game where losing means removing clothing.",
    howTo: "Choose any simple game - cards, rock-paper-scissors, trivia. Loser of each round removes one item. Continue until someone 'wins.'",
    tips: ["Start with more clothing layers", "Make forfeits increasingly intimate", "Keep drinks handy", "No need to finish the game..."],
    pairsWellWith: ["The Chairman", "Cowgirl", "Standing Ovation"]
  },
  {
    id: 126,
    name: "Reading Erotica Together",
    category: "Mental",
    mood: "blossoming",
    duration: "Extended",
    vibe: "Stories that spark imagination",
    description: "Reading erotic stories aloud to each other.",
    howTo: "Find stories that interest you both. Take turns reading passages aloud. Pause to discuss what appeals to you. Let the reading transition naturally.",
    tips: ["Choose stories together", "It's okay to skip parts that don't appeal", "Discuss what you liked", "Try different genres"],
    pairsWellWith: ["The Lotus", "Spooning", "The Pretzel"]
  },
  {
    id: 127,
    name: "Compliment Shower",
    category: "Mental",
    mood: "unified",
    duration: "Quick",
    vibe: "Words of genuine appreciation",
    description: "Take turns giving genuine, specific compliments about attraction and appreciation.",
    howTo: "Sit or lie facing each other. Take turns giving specific compliments - physical, emotional, about actions. Be genuine and detailed.",
    tips: ["Be specific, not generic", "Include non-physical traits", "Receive compliments gracefully", "This builds confidence and desire"],
    pairsWellWith: ["The Lotus", "Face-Off", "Any intimate position"]
  },
  {
    id: 128,
    name: "Delayed Gratification",
    category: "Mental",
    mood: "commanding",
    duration: "Extended",
    vibe: "Building tension through waiting",
    description: "Agree to a period of no touching, only anticipation, before finally coming together.",
    howTo: "Set a time - 15 minutes, an hour, a day. During this time, flirt, hint, tease - but don't touch. When the time is up, come together.",
    tips: ["The longer the wait, the bigger the release", "Verbal teasing during wait time", "Visual teasing works too", "Have an agreed-upon end signal"],
    pairsWellWith: ["Passionate reunion", "Doggy Style", "Cowgirl"]
  },
  {
    id: 129,
    name: "Role Play Lite",
    category: "Mental",
    mood: "playful",
    duration: "Extended",
    vibe: "Trying on different personas",
    description: "Light role play - nothing elaborate, just pretending to meet for the first time or simple scenarios.",
    howTo: "Agree on a simple scenario: meeting at a bar, strangers on a train. Stay in character. Keep it light and fun.",
    tips: ["Start with simple scenarios", "It's okay to laugh", "Don't take it too seriously", "Use it to try new dynamics"],
    pairsWellWith: ["Different positions", "New locations", "Adventure"]
  },
  {
    id: 130,
    name: "The Staring Contest",
    category: "Mental",
    mood: "playful",
    duration: "Quick",
    vibe: "Playful intensity",
    description: "A staring contest with a sensual twist - loser has to do something the winner chooses.",
    howTo: "Classic staring contest rules - first to blink loses. Winner gets to request something: a kiss, a touch, removing clothing, etc.",
    tips: ["Keep stakes fun, not too intense", "The tension builds naturally", "Laughter is part of it", "Great for breaking ice"],
    pairsWellWith: ["Any position", "Strip Game", "Playful positions"]
  },
  {
    id: 131,
    name: "Watching Together",
    category: "Mental",
    mood: "passionate",
    duration: "Medium",
    vibe: "Visual stimulation together",
    description: "Watching something arousing together - ethical adult content or steamy movie scenes.",
    howTo: "Choose something you're both comfortable with. Watch together. Let it inspire you. Discuss what you liked.",
    tips: ["Choose together", "Both should be comfortable", "Use it as inspiration", "Discuss reactions"],
    pairsWellWith: ["Any position", "Trying new things", "Inspiration"]
  },
  {
    id: 132,
    name: "Memory Lane",
    category: "Mental",
    mood: "unified",
    duration: "Medium",
    vibe: "Recounting your greatest hits",
    description: "Taking turns describing your favorite intimate memories together in detail.",
    howTo: "Take turns describing, in detail, your favorite intimate moments together. What made them special? What do you remember most vividly?",
    tips: ["Be specific with details", "Focus on sensations and emotions", "Remind each other of forgotten moments", "Let memories inspire tonight"],
    pairsWellWith: ["Recreating favorites", "Intimate connection", "Any position"]
  },

  // ============================================
  // CONNECTION (10 ideas)
  // ============================================
  {
    id: 133,
    name: "Slow Dancing",
    category: "Connection",
    mood: "unified",
    duration: "Medium",
    vibe: "Building anticipation through movement",
    description: "Put on romantic music and dance together, letting the closeness build tension.",
    howTo: "Choose slow, romantic music. Hold each other close. Let hands wander naturally. Make eye contact. Let the dance progress wherever it leads.",
    tips: ["Create a playlist in advance", "Dim the lights", "No phones or distractions", "Let it progress naturally"],
    pairsWellWith: ["The Ballet Dancer", "Standing Ovation", "Face-Off"]
  },
  {
    id: 134,
    name: "Undressing Ritual",
    category: "Connection",
    mood: "passionate",
    duration: "Quick",
    vibe: "The art of revealing",
    description: "Take turns slowly undressing each other as an intentional, sensual act.",
    howTo: "Take turns removing one item at a time. Go slowly. Kiss each area as it's revealed. Make eye contact. Express appreciation.",
    tips: ["Wear something you feel good in", "Buttons and ties add anticipation", "Verbalize attraction", "No rushing allowed"],
    pairsWellWith: ["Standing Ovation", "The Chairman", "Face-Off"]
  },
  {
    id: 135,
    name: "Eye Gazing",
    category: "Connection",
    mood: "unified",
    duration: "Quick",
    vibe: "Intimate connection without words",
    description: "Sit facing each other and maintain eye contact for several minutes.",
    howTo: "Sit comfortably facing each other. Set a timer for 3-5 minutes. Maintain soft eye contact. Don't speak. Let whatever emotions arise simply be.",
    tips: ["Soft gaze, not staring", "It's okay to smile or tear up", "Breathe together naturally", "Let the transition happen organically"],
    pairsWellWith: ["The Lotus", "Face-Off", "The Spider"]
  },
  {
    id: 136,
    name: "Breathwork Together",
    category: "Connection",
    mood: "unified",
    duration: "Quick",
    vibe: "Synchronizing energy",
    description: "Sit together and synchronize your breathing.",
    howTo: "Sit facing each other or spooning. Match your breathing rhythms. Breathe in together, out together. Feel your bodies sync up.",
    tips: ["Start by listening to their breath", "Deep, slow breaths work best", "Can be done during sex too", "Creates profound connection"],
    pairsWellWith: ["The Lotus", "Om", "Tantra-focused intimacy"]
  },
  {
    id: 137,
    name: "Music & Movement",
    category: "Connection",
    mood: "dynamic",
    duration: "Medium",
    vibe: "Letting rhythm guide you",
    description: "Put on music and move together - not formal dancing, just letting bodies respond to rhythm.",
    howTo: "Choose music with a good beat. Move together however feels natural. Let the rhythm guide your bodies. Transition from dancing to touching.",
    tips: ["Choose music you both like", "No 'right way' to move", "Let hands explore while moving", "Different tempos create different moods"],
    pairsWellWith: ["Standing positions", "The Chairman", "Cowgirl"]
  },
  {
    id: 138,
    name: "Shower Together",
    category: "Connection",
    mood: "playful",
    duration: "Medium",
    vibe: "Wet, warm, and wonderfully slippery",
    description: "Showering together combines warmth, water, and the natural intimacy of washing each other.",
    howTo: "Start by washing each other's hair and backs. Let hands wander as you soap each other. The steam and warmth create a sensual atmosphere.",
    tips: ["Water-based products only", "Be careful - it's slippery", "The steam opens pores", "Don't use soap on sensitive areas"],
    pairsWellWith: ["Standing Ovation", "The Ballet Dancer", "Any position after"]
  },
  {
    id: 139,
    name: "Bath for Two",
    category: "Connection",
    mood: "flowing",
    duration: "Extended",
    vibe: "Soaking together in warmth",
    description: "Taking a bath together - the ultimate in relaxed intimacy.",
    howTo: "Fill the tub with warm water and perhaps bubbles. Get in together. Wash each other. Let hands wander under the water.",
    tips: ["Make sure the tub is big enough", "Candles add ambiance", "The water hides everything while revealing touch", "Very relaxing foreplay"],
    pairsWellWith: ["Relaxed intimacy", "Spooning", "Slow positions"]
  },
  {
    id: 140,
    name: "Cooking Together (Undressed)",
    category: "Connection",
    mood: "playful",
    duration: "Extended",
    vibe: "Domestic intimacy with a twist",
    description: "Cooking a simple meal together while partially or fully undressed.",
    howTo: "Choose a simple recipe. Cook together in various states of undress. Let touches happen naturally. See if you make it to actually eating.",
    tips: ["Choose something simple", "Be careful near the stove", "Aprons provide some protection", "Most couples don't finish cooking..."],
    pairsWellWith: ["Kitchen Counter", "Spontaneity", "Playfulness"]
  },
  {
    id: 141,
    name: "Cuddling with Intent",
    category: "Connection",
    mood: "flowing",
    duration: "Medium",
    vibe: "From innocent to not-so-innocent",
    description: "Start with innocent cuddling and let it naturally evolve.",
    howTo: "Start cuddling like you're just going to watch TV. Let touches become less innocent over time. No rush - let it happen naturally.",
    tips: ["Start completely innocent", "Let it build naturally", "No pressure to escalate", "Great for low-pressure initiation"],
    pairsWellWith: ["Spooning", "The Couch Surfer", "Lazy positions"]
  },
  {
    id: 142,
    name: "Forehead Touches",
    category: "Connection",
    mood: "unified",
    duration: "Quick",
    vibe: "Simple profound connection",
    description: "Simply touching foreheads and breathing together.",
    howTo: "Sit or lie facing each other. Touch foreheads gently. Close your eyes. Breathe together. Stay here for a few minutes.",
    tips: ["Very simple but powerful", "Let thoughts quiet", "Focus on their presence", "Often leads to deep kissing"],
    pairsWellWith: ["The Lotus", "Face-Off", "Deep connection positions"]
  },

  // ============================================
  // SETTING (8 ideas)
  // ============================================
  {
    id: 143,
    name: "Candlelit Room",
    category: "Setting",
    mood: "flowing",
    duration: "Extended",
    vibe: "Setting the mood with ambiance",
    description: "Prepare a room with candles for a romantic atmosphere.",
    howTo: "Turn off all electric lights. Light candles around the room. Make sure they're safely placed. The flickering light transforms the space.",
    tips: ["Safety first with candles", "Scattered around the room works best", "Scented candles add another dimension", "The light is very flattering"],
    pairsWellWith: ["Any intimate activity", "Massage", "Slow positions"]
  },
  {
    id: 144,
    name: "Music Playlist",
    category: "Setting",
    mood: "dynamic",
    duration: "Extended",
    vibe: "Curated sounds for the mood",
    description: "Create and play a playlist specifically for intimacy.",
    howTo: "Create a playlist of songs that put you both in the mood. Let it play in the background. Let the music guide the rhythm and mood.",
    tips: ["Create it together or surprise them", "Consider the tempo arc", "Long enough to not repeat", "Volume low enough to talk"],
    pairsWellWith: ["Any position", "Dancing first", "Setting the mood"]
  },
  {
    id: 145,
    name: "Fresh Sheets",
    category: "Setting",
    mood: "flowing",
    duration: "Quick",
    vibe: "The luxury of clean bedding",
    description: "Put fresh, clean sheets on the bed right before intimacy.",
    howTo: "Make the bed with fresh sheets. Perhaps even slightly chilled from being outside or slightly warm from the dryer. Simple luxury.",
    tips: ["Warm sheets are amazing", "High thread count if possible", "Make the bed nicely", "Simple but effective"],
    pairsWellWith: ["Any bed position", "Slow intimacy", "Romance"]
  },
  {
    id: 146,
    name: "Hotel Fantasy",
    category: "Setting",
    mood: "passionate",
    duration: "Extended",
    vibe: "Pretending you're somewhere else",
    description: "Treat your bedroom like a hotel room - or actually get a hotel.",
    howTo: "Either get a hotel room, or treat your bedroom like one. Make it feel special. Room service (snacks), robes, the 'vacation' mentality.",
    tips: ["The novelty helps", "Hotel rooms feel 'allowed'", "Treat your bedroom as special", "The do-not-disturb sign is real"],
    pairsWellWith: ["Any position", "Vacation mentality", "Trying new things"]
  },
  {
    id: 147,
    name: "Living Room Picnic",
    category: "Setting",
    mood: "playful",
    duration: "Extended",
    vibe: "Floor-based fun",
    description: "Lay out blankets and pillows on the living room floor for an indoor picnic.",
    howTo: "Clear the living room floor. Lay down blankets and pillows. Bring snacks and drinks. Let the floor become your playground.",
    tips: ["More space than the bed", "Different energy than bedroom", "Pillows provide versatility", "Feels novel and fun"],
    pairsWellWith: ["Floor positions", "Playfulness", "Novelty"]
  },
  {
    id: 148,
    name: "Outdoor Under Stars",
    category: "Setting",
    mood: "flowing",
    duration: "Extended",
    vibe: "Nature and intimacy combined",
    description: "Finding a private outdoor spot under the night sky.",
    howTo: "Find a private outdoor space - backyard, balcony, or private location. Bring blankets. Let the night sky and open air enhance the experience.",
    tips: ["Privacy is essential", "Bug spray might be needed", "Blankets for comfort", "The open air is freeing"],
    pairsWellWith: ["Spooning", "Missionary", "Slow intimacy"]
  },
  {
    id: 149,
    name: "Morning Light",
    category: "Setting",
    mood: "flowing",
    duration: "Medium",
    vibe: "Using natural morning light",
    description: "Opening curtains to let morning light flood in for intimacy.",
    howTo: "In the morning, open the curtains and let natural light in. Make love in the daylight. See each other fully.",
    tips: ["Morning light is flattering", "Different from usual darkness", "Can see everything", "Feels open and honest"],
    pairsWellWith: ["Morning intimacy", "Spooning", "Slow positions"]
  },
  {
    id: 150,
    name: "Mirror View",
    category: "Setting",
    mood: "passionate",
    duration: "Extended",
    vibe: "Watching yourselves",
    description: "Positioning near a mirror to watch yourselves.",
    howTo: "Position yourselves where you can see in a mirror. Watch yourselves during intimacy. Make eye contact through the mirror.",
    tips: ["Very visual", "Can be surprisingly arousing", "Vanity or full-length mirror works", "New perspective on each other"],
    pairsWellWith: ["The Vanity", "Doggy Style", "Visual positions"]
  }
];

export const foreplayCategories = [
  'Touch',
  'Sensation',
  'Mental',
  'Connection',
  'Setting',
];

export const durations = ['Quick', 'Medium', 'Extended'] as const;