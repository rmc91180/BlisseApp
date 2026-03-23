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
    name: "The Slow Melt",
    category: "Touch",
    mood: "flowing",
    duration: "Extended",
    vibe: "Relaxation that slowly turns irresistible",
    description: "A full-body massage that moves from calm to charged, warming connection before anything else even begins.",
    howTo: "Start with shoulders and back using warm oil. Work slowly down the body, gradually including more sensitive areas. Focus on what makes your partner respond.",
    tips: ["Warm the oil in your hands first", "Ask about pressure preferences", "Pay attention to breathing changes", "Let anticipation build before the obvious hotspots"],
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
    name: "The Delicious Delay",
    category: "Touch",
    mood: "commanding",
    duration: "Extended",
    vibe: "Building desire through playful delay",
    description: "Deliberately slow touches that approach the best spots, then drift away just long enough to make both of you grin.",
    howTo: "Touch everywhere except where they most want. Get close, then move away. Let them express desire. Make them wait. Finally give in when tension peaks.",
    tips: ["Watch their body language", "Verbal teasing adds to it", "Have them tell you what they want", "The payoff is worth the wait"],
    pairsWellWith: ["Cowgirl", "Legs-Up Heaven", "Any position"]
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
    mood: "blossoming",
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
    mood: "blossoming",
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
    pairsWellWith: ["The Slow Melt", "Spooning", "Slow positions"]
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
    mood: "blossoming",
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
  },

  // ============================================
  // TOUCH (continued, +5)
  // ============================================
  {
    id: 151,
    name: "Lip Tracing",
    category: "Touch",
    mood: "passionate",
    duration: "Quick",
    vibe: "Mapping the body with your mouth",
    description: "Use your lips - barely parted - to trace slow lines along your partner's collarbones, jaw, and shoulders without ever fully kissing.",
    howTo: "Hover your parted lips just above the skin and drag them lightly across collarbones, along the jawline, and over the shoulders. Let your breath do most of the work. Only press into a real kiss when you feel them shiver.",
    tips: ["Keep lips barely touching the skin", "Let warm breath lead before contact", "Pause at the hollow of the throat", "End with one deliberate, full kiss"],
    pairsWellWith: ["Neck & Ear Focus", "The Delicious Delay", "Spooning"]
  },
  {
    id: 152,
    name: "The Body Map",
    category: "Touch",
    mood: "blossoming",
    duration: "Extended",
    vibe: "Charting every hidden pleasure point",
    description: "Systematically explore your partner's entire body using a single fingertip, noting every spot that earns a response.",
    howTo: "Starting at the crown of the head, glide one fingertip down the body in a slow, intentional path. When your partner reacts - a gasp, a shift, goosebumps - linger there. Mentally 'map' every responsive zone for future visits.",
    tips: ["Use only one fingertip for precision", "Announce each new area softly", "Revisit their favorite spots at the end", "Keep a mental tally and share notes afterward"],
    pairsWellWith: ["Mutual Exploration", "Feather Touch", "The Lotus"]
  },
  {
    id: 153,
    name: "Warm Hands Journey",
    category: "Touch",
    mood: "flowing",
    duration: "Medium",
    vibe: "Radiating warmth through touch",
    description: "Warm your hands under hot water or between blankets, then glide them across your partner's body in long, unbroken strokes.",
    howTo: "Heat your hands under warm water and dry them. Place both palms flat on your partner's back and sweep slowly outward and down, letting the warmth soak into each area before moving on. Cover the entire body in slow passes.",
    tips: ["Reheat hands between rounds", "Flat palms transfer the most warmth", "Focus on areas that hold tension", "The temperature contrast with cool air heightens sensation"],
    pairsWellWith: ["The Slow Melt", "Back Tracing", "Lazy Dog"]
  },
  {
    id: 154,
    name: "The Countdown Touch",
    category: "Touch",
    mood: "commanding",
    duration: "Medium",
    vibe: "Structured teasing with a ticking clock",
    description: "Count down from ten aloud. With each number, deliver a different kind of touch - each one more intimate than the last.",
    howTo: "Start at ten with a light touch on a neutral area like the shoulder. With every count, move closer to more sensitive zones and increase intensity. By one, you should be exactly where they want you.",
    tips: ["Announce each number out loud to build tension", "Vary the type of touch - fingertips, lips, nails", "Pause between numbers for suspense", "Let them guess where the next touch lands"],
    pairsWellWith: ["Blindfolded Touch", "The Delicious Delay", "Cowgirl"]
  },
  {
    id: 155,
    name: "Pressure Play",
    category: "Touch",
    mood: "grounded",
    duration: "Medium",
    vibe: "Deep, grounding contact",
    description: "Use firm, sustained pressure with your full palms to press into muscles and hold, creating a sense of being deeply held and grounded.",
    howTo: "Place both palms flat against your partner's body - shoulders, lower back, thighs. Press in with steady, firm pressure and hold for several breaths before slowly releasing. Move to the next area.",
    tips: ["Ask about pressure comfort before starting", "Hold each press for at least three breaths", "The release feels as good as the press", "Pair with synchronized breathing for deeper connection"],
    pairsWellWith: ["Breathwork Together", "Foot Massage", "The Lotus"]
  },

  // ============================================
  // SENSATION (continued, +5)
  // ============================================
  {
    id: 156,
    name: "Hot Towel Wrap",
    category: "Sensation",
    mood: "flowing",
    duration: "Medium",
    vibe: "Steamy warmth melting into skin",
    description: "Wrap your partner in a hot, damp towel and slowly unwrap them, kissing each revealed area.",
    howTo: "Soak a large towel in hot water and wring it out. Drape it over your partner's torso or legs and let the heat soak in. After a minute, slowly peel the towel away, following its path with your lips.",
    tips: ["Test the temperature on your inner wrist first", "Multiple smaller towels work for different zones", "The unwrapping is the main event", "Follow with cool fingertips for contrast"],
    pairsWellWith: ["Warm Oil Drizzle", "The Slow Melt", "Slow positions"]
  },
  {
    id: 157,
    name: "Flavored Kisses",
    category: "Sensation",
    mood: "playful",
    duration: "Quick",
    vibe: "Taste meets touch",
    description: "Apply something edible - honey, chocolate, fruit - to your partner's skin and kiss it off slowly.",
    howTo: "Dab a small amount of honey, melted chocolate, or fruit juice on your partner's neck, collarbone, or stomach. Kiss and lick it away slowly, letting them feel your tongue trace the sweetness.",
    tips: ["Use body-safe, simple ingredients only", "A little goes a long way", "Avoid anything sticky near sensitive areas", "Strawberries and whipped cream are classic for a reason"],
    pairsWellWith: ["Living Room Picnic", "Cooking Together (Undressed)", "Playful positions"]
  },
  {
    id: 158,
    name: "Sound Exploration",
    category: "Sensation",
    mood: "dynamic",
    duration: "Medium",
    vibe: "Tuning in through hearing",
    description: "Explore how different sounds - whispers, humming against the skin, soft music - change the experience of touch.",
    howTo: "Start in silence and touch your partner. Then hum low against their skin. Whisper descriptions of what you are doing. Play different music and see how it shifts the mood of your touch.",
    tips: ["Hum directly against the neck or chest for vibration", "Alternate between silence and sound", "Low tones tend to feel more sensual", "Let your partner choose a song that sets their mood"],
    pairsWellWith: ["Music & Movement", "Slow Dancing", "Breath Play (Light)"]
  },
  {
    id: 159,
    name: "The Cool Breeze",
    category: "Sensation",
    mood: "playful",
    duration: "Quick",
    vibe: "A shiver-inducing surprise",
    description: "Use a handheld fan or gentle blowing to send cool air across your partner's skin, especially after warming them up.",
    howTo: "After kissing or warming an area with your hands, blow a stream of cool air across the wet or warm skin. Use a small fan for a steadier breeze. Focus on the neck, stomach, and inner arms.",
    tips: ["Works best on slightly damp skin", "Alternate between warm breath and cool air", "A folding fan adds a playful prop element", "Watch for goosebumps as your guide"],
    pairsWellWith: ["Ice & Heat Play", "Temperature Contrast", "Feather Touch"]
  },
  {
    id: 160,
    name: "Wax Alternative (Warm Oil)",
    category: "Sensation",
    mood: "commanding",
    duration: "Medium",
    vibe: "Controlled drips of warmth",
    description: "Drizzle warm massage oil from a height to mimic the thrill of wax play without any risk of burns.",
    howTo: "Heat body-safe massage oil until pleasantly warm (always test on your wrist). Hold the bottle or spoon a foot above your partner's body and let the oil drip in slow, deliberate lines across the chest, stomach, and thighs.",
    tips: ["Always test temperature on your own wrist first", "Control the stream with a spoon for precision", "Tell them where the next drip will land - or do not", "Follow with firm massage strokes to spread the oil"],
    pairsWellWith: ["Warm Oil Drizzle", "Blindfolded Touch", "Commanding positions"]
  },

  // ============================================
  // MENTAL (continued, +5)
  // ============================================
  {
    id: 161,
    name: "The Bucket List",
    category: "Mental",
    mood: "blossoming",
    duration: "Medium",
    vibe: "Dreaming up desires together",
    description: "Each partner writes down five intimate things they have always wanted to try, then you swap lists and discuss.",
    howTo: "Grab two pieces of paper. Each of you writes five things you have been curious about or want to try together. Swap lists. Read them aloud to each other without judgment and pick one to explore tonight.",
    tips: ["No judgment - this is a safe space", "Include things that range from sweet to daring", "You don't have to do everything tonight", "Revisit the list on future date nights"],
    pairsWellWith: ["Reading Erotica Together", "Role Play Lite", "New experiences"]
  },
  {
    id: 162,
    name: "Fantasy Auction",
    category: "Mental",
    mood: "playful",
    duration: "Medium",
    vibe: "Bidding for pleasure",
    description: "Each partner 'auctions' a fantasy or act, and the other bids with compliments, kisses, or dares to win it.",
    howTo: "Take turns describing something you would like to give or receive. Your partner bids for it by offering something in return - a compliment, a kiss somewhere specific, or a promise. Highest bid wins.",
    tips: ["Keep the bidding fun, not transactional", "Creative bids are more fun than escalating ones", "Both people should win something", "Laughter is the sign you are doing it right"],
    pairsWellWith: ["Strip Game", "The Staring Contest", "Playful positions"]
  },
  {
    id: 163,
    name: "Two-Minute Tease Timer",
    category: "Mental",
    mood: "commanding",
    duration: "Quick",
    vibe: "Racing the clock to impress",
    description: "Set a two-minute timer. One partner has exactly that long to make the other as aroused as possible using any means.",
    howTo: "Set a timer for two minutes. One partner does whatever they can - touch, words, kisses, movement - to drive the other wild before the buzzer. Then switch. The intensity of a time limit changes everything.",
    tips: ["The ticking clock removes overthinking", "Use every tool: voice, hands, lips, eye contact", "Switching roles keeps both partners engaged", "Extend the timer if two minutes is not enough"],
    pairsWellWith: ["Delayed Gratification", "The Countdown Touch", "Passionate positions"]
  },
  {
    id: 164,
    name: "The Playlist Dare",
    category: "Mental",
    mood: "dynamic",
    duration: "Extended",
    vibe: "Music-driven spontaneity",
    description: "Create a playlist where each song has an assigned dare. When the song plays, you carry out the dare.",
    howTo: "Build a playlist of eight to ten songs together. Assign a dare or action to each track - a type of kiss, a massage, a compliment, a piece of clothing removed. Hit shuffle and follow the playlist wherever it leads.",
    tips: ["Mix tempos to keep things unpredictable", "Include at least one slow, emotional song", "Write dares on cards for a surprise element", "Let the final song be the wildcard - anything goes"],
    pairsWellWith: ["Music Playlist", "Slow Dancing", "Music & Movement"]
  },
  {
    id: 165,
    name: "Roleplay Roulette",
    category: "Mental",
    mood: "playful",
    duration: "Extended",
    vibe: "Letting chance choose your character",
    description: "Write several mini-scenarios on slips of paper, draw one at random, and commit to playing it out for at least ten minutes.",
    howTo: "Each partner writes three to five short scenarios on separate slips. Fold them up, mix them together, and draw one at random. Set a timer for ten minutes and stay in character. No breaking the scene.",
    tips: ["Keep scenarios simple: a setting and two roles is enough", "Include funny ones to ease any nervousness", "A costume piece or prop sells the scene", "If it clicks, keep going past the timer"],
    pairsWellWith: ["Role Play Lite", "Strip Game", "Hotel Fantasy"]
  },

  // ============================================
  // CONNECTION (continued, +5)
  // ============================================
  {
    id: 166,
    name: "Synchronized Breathing",
    category: "Connection",
    mood: "unified",
    duration: "Quick",
    vibe: "Two bodies, one rhythm",
    description: "Lie chest to chest and match each other's inhales and exhales until your breathing becomes one shared rhythm.",
    howTo: "Lie face to face or with one partner resting on the other's chest. Listen to their breath and begin to match it. Inhale together, exhale together. Stay here for several minutes without speaking.",
    tips: ["Place a hand on their ribcage to feel the rhythm", "Slow down gradually - do not force a pace", "Close your eyes to deepen the focus", "This pairs beautifully as a transition into intimacy"],
    pairsWellWith: ["Breathwork Together", "Forehead Touches", "The Lotus"]
  },
  {
    id: 167,
    name: "The Mirror Exercise",
    category: "Connection",
    mood: "playful",
    duration: "Medium",
    vibe: "Moving as one reflection",
    description: "Stand facing each other. One partner moves slowly and the other mirrors every gesture, creating a silent, synchronized dance.",
    howTo: "Face each other at arm's length. One person leads with slow movements - raising a hand, tilting the head, stepping forward. The other mirrors exactly. After a few minutes, switch leaders. Eventually, let the roles blur.",
    tips: ["Start with large, simple movements", "Maintain eye contact throughout", "Speed up gradually for a fun challenge", "When you cannot tell who is leading, you have found the sweet spot"],
    pairsWellWith: ["Eye Gazing", "Slow Dancing", "Face-Off"]
  },
  {
    id: 168,
    name: "Heartbeat Listening",
    category: "Connection",
    mood: "grounded",
    duration: "Quick",
    vibe: "Hearing the life inside your partner",
    description: "Rest your ear against your partner's chest and simply listen to their heartbeat in silence.",
    howTo: "Have your partner lie on their back. Rest your head on their chest over the heart. Close your eyes. Listen. Feel their breathing rise and fall beneath you. Stay as long as you like.",
    tips: ["Silence makes this more powerful", "Notice how their heartbeat changes when you touch them", "Trace slow circles on their stomach while you listen", "This can be deeply emotional - let it be"],
    pairsWellWith: ["Cuddling with Intent", "Forehead Touches", "Spooning"]
  },
  {
    id: 169,
    name: "Love Language Exchange",
    category: "Connection",
    mood: "blossoming",
    duration: "Medium",
    vibe: "Speaking their language fluently",
    description: "Each partner spends ten minutes expressing love exclusively in the other person's primary love language.",
    howTo: "Identify each other's love language - words, touch, gifts, acts of service, or quality time. Set a timer for ten minutes. Devote that time entirely to expressing love in their language, not yours. Then switch.",
    tips: ["Ask them what makes them feel most loved if unsure", "Exaggerate a little - go all in", "Notice how differently each round feels", "Discuss afterward which moments landed deepest"],
    pairsWellWith: ["Compliment Shower", "Body Worship", "The Lotus"]
  },
  {
    id: 170,
    name: "Partner Yoga",
    category: "Connection",
    mood: "dynamic",
    duration: "Medium",
    vibe: "Strength and trust through the body",
    description: "Practice simple two-person yoga poses that require balance, trust, and physical closeness.",
    howTo: "Look up beginner partner yoga poses. Try three to five together. Support each other's weight. Laugh when you wobble. The physical trust and contact naturally builds intimacy.",
    tips: ["Start with easy poses - seated back-to-back is great", "Wear minimal clothing for skin contact", "Falling together is part of the fun", "End with a resting pose intertwined"],
    pairsWellWith: ["Breathwork Together", "Synchronized Breathing", "The Lotus"]
  },

  // ============================================
  // SETTING (continued, +5)
  // ============================================
  {
    id: 171,
    name: "Pillow Fort Date",
    category: "Setting",
    mood: "playful",
    duration: "Extended",
    vibe: "Childhood magic meets adult intimacy",
    description: "Build a pillow fort together and climb inside for an intimate hideaway that feels secret and special.",
    howTo: "Gather every pillow, blanket, and cushion you own. Construct a fort in the living room. String up fairy lights inside. Bring snacks and drinks. Crawl in together and let the enclosed space create its own energy.",
    tips: ["Fairy lights inside transform the mood", "Make the entrance small so it feels like a private world", "Bring a portable speaker for music", "The silliness of building it together is foreplay in itself"],
    pairsWellWith: ["Living Room Picnic", "Cuddling with Intent", "Playful positions"]
  },
  {
    id: 172,
    name: "Rainy Day In",
    category: "Setting",
    mood: "grounded",
    duration: "Extended",
    vibe: "Cozy seclusion while the world drips outside",
    description: "Wait for a rainy day, then close the curtains, light candles, and declare the day entirely yours.",
    howTo: "When the rain arrives, cancel everything. Close the curtains but open a window so you can hear the rain. Make warm drinks. Wrap up in blankets. Let the sound and atmosphere carry you into closeness.",
    tips: ["The sound of rain is naturally relaxing", "Keep the window cracked for the sound and fresh air", "Hot tea or cocoa adds to the coziness", "There is no agenda - let the day unfold"],
    pairsWellWith: ["Candlelit Room", "Fresh Sheets", "Spooning"]
  },
  {
    id: 173,
    name: "Sunrise Session",
    category: "Setting",
    mood: "blossoming",
    duration: "Medium",
    vibe: "Waking up with the world",
    description: "Set an alarm before dawn, position yourselves by a window, and let the rising sun light up your morning together.",
    howTo: "Set an alarm thirty minutes before sunrise. Move to a spot with a good east-facing window or go to the balcony. Wrap in a blanket together and begin slowly as the sky changes color around you.",
    tips: ["The gradual light shift is incredibly romantic", "Start sleepy and slow - no rush", "Watch the light move across each other's skin", "Morning energy brings a unique tenderness"],
    pairsWellWith: ["Morning Light", "Forehead Touches", "Slow positions"]
  },
  {
    id: 174,
    name: "The Balcony",
    category: "Setting",
    mood: "passionate",
    duration: "Medium",
    vibe: "Open air with a hint of thrill",
    description: "Step out onto a private balcony or patio at night and let the night air and openness add an element of excitement.",
    howTo: "Wait until after dark. Step onto your balcony or a private patio space. Let the cool night air hit your skin. The combination of openness, fresh air, and slight vulnerability changes everything.",
    tips: ["Privacy is essential - be sure you cannot be seen", "A robe you can open is the ideal outfit", "Cool air heightens every warm touch", "Keep a blanket nearby in case it gets cold"],
    pairsWellWith: ["Outdoor Under Stars", "Standing Ovation", "The Ballet Dancer"]
  },
  {
    id: 175,
    name: "Firelight & Wine",
    category: "Setting",
    mood: "flowing",
    duration: "Extended",
    vibe: "Classic warmth and slow indulgence",
    description: "Build a fire - real or electric - pour wine, and let the flickering warmth set the pace for a slow, indulgent evening.",
    howTo: "Light a fireplace or set up an electric fire. Arrange blankets and pillows on the floor nearby. Pour two glasses of wine. Lie together in the glow and let the warmth, light, and taste guide you into each other.",
    tips: ["Keep the fire as the only light source", "A sheepskin rug elevates the experience", "Sip slowly - this is about savoring", "Feed each other small bites between kisses"],
    pairsWellWith: ["Candlelit Room", "Slow Dancing", "Living Room Picnic"]
  },

  // ============================================
  // CURATED EXPANSION (6 ideas)
  // ============================================
  {
    id: 176,
    name: "Couch Cocoon",
    category: "Setting",
    mood: "grounded",
    duration: "Extended",
    vibe: "Blankets, soft light, and nowhere else to be",
    description: "Turn the couch into a little private nest with blankets, pillows, and warm light, then let closeness build without any pressure to rush.",
    howTo: "Pile soft blankets and pillows onto the couch. Dim the lights, put something low and warm on the speakers, and settle in under the same blanket. Start with cuddling, tracing, kissing, or simply resting together until the mood grows on its own.",
    tips: ["Warm socks and low lighting make this even better", "The point is coziness first, escalation second", "Perfect for nights when the bed feels too formal", "Let the shared blanket keep you physically close"],
    pairsWellWith: ["Living Room Picnic", "Cuddling with Intent", "Lazy Evening"]
  },
  {
    id: 177,
    name: "After-Dinner Drift",
    category: "Setting",
    mood: "flowing",
    duration: "Medium",
    vibe: "From dinner conversation into something softer",
    description: "Instead of ending the evening after dinner, let it melt into a slower, more intimate stretch of time with gentle touch and conversation.",
    howTo: "Stay at the table or move to the couch with drinks or tea. Sit closer than usual. Touch hands, knees, shoulders, or the back of the neck while you keep talking. Let the shift from conversation to flirtation happen gradually.",
    tips: ["This works best when you do not force a mood change", "Touch should start light and almost casual", "Lingering eye contact changes the tone quickly", "Ideal for date nights at home"],
    pairsWellWith: ["Slow Dancing", "Compliment Shower", "Couch Cocoon"]
  },
  {
    id: 178,
    name: "The Quiet Challenge",
    category: "Mental",
    mood: "playful",
    duration: "Quick",
    vibe: "No talking, just attention",
    description: "Set a short timer and see how much you can communicate with touch, eye contact, and expression alone - no words allowed.",
    howTo: "Set a timer for three to five minutes. During that time, you cannot speak. Use only touch, kisses, body language, and eye contact to guide each other and build the mood.",
    tips: ["The silence makes every reaction feel bigger", "A grin counts as communication", "Eye contact does a lot of work here", "A short timer keeps it playful instead of awkward"],
    pairsWellWith: ["The Staring Contest", "The Mirror Exercise", "Anticipation Texts"]
  },
  {
    id: 179,
    name: "Show Me Slower",
    category: "Connection",
    mood: "blossoming",
    duration: "Medium",
    vibe: "Teaching each other through pace",
    description: "One partner guides the other toward the exact slower pace that feels best, turning feedback into something intimate instead of clinical.",
    howTo: "Choose one kind of touch or kiss. The receiving partner gives only gentle pace guidance: slower, stay, softer, more. The giving partner adjusts in real time. Then switch roles and repeat.",
    tips: ["Keep the guidance short and warm", "This is about learning, not correcting", "Going slower than you think usually helps", "A single repeated touch works better than constant variety"],
    pairsWellWith: ["Mutual Exploration", "The Roadmap", "Synchronized Breathing"]
  },
  {
    id: 180,
    name: "Favorite Touch Replay",
    category: "Connection",
    mood: "unified",
    duration: "Medium",
    vibe: "Going back to what worked beautifully",
    description: "Each partner recreates one touch, kiss, or move the other person loved recently, turning memory into anticipation.",
    howTo: "Take turns naming one specific thing your partner did that stayed with you - a kiss, a stroke, a whisper, a look. Recreate it slowly and deliberately, then ask if they want it exactly the same or even better this time.",
    tips: ["Specific memories make this more powerful", "This is great for learning what really landed", "Repeat before improvising", "Praise the replay generously when it hits"],
    pairsWellWith: ["Compliment Shower", "Memory Lane", "Show Me Slower"]
  },
  {
    id: 181,
    name: "The Hallway Pause",
    category: "Touch",
    mood: "passionate",
    duration: "Quick",
    vibe: "A stop-in-your-tracks moment that turns charged fast",
    description: "A brief, deliberate pause in a doorway or hallway where one of you stops the other just long enough to shift the whole energy of the evening.",
    howTo: "Catch your partner in a doorway, hallway, or while passing by. Pull them in for a slow kiss, a hand at the waist, or a lingering touch at the neck. Hold the pause just a little longer than expected, then decide whether to keep moving or let it lead somewhere else.",
    tips: ["The surprise is part of the spark", "Keep it intentional, not rushed", "A hand at the lower back changes everything", "Great when you want to create momentum out of nowhere"],
    pairsWellWith: ["The Delicious Delay", "Neck & Ear Focus", "After-Dinner Drift"]
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
