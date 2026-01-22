export interface MassageTechnique {
  id: number;
  name: string;
  category: string;
  mood: string;
  duration: 'Quick' | 'Medium' | 'Extended';
  bodyArea: string;
  vibe: string;
  description: string;
  howTo: string;
  tips: string[];
  pairsWellWith: string[];
}

export const massageTechniques: MassageTechnique[] = [
  // ============================================
  // RELAXATION (7 techniques)
  // ============================================
  {
    id: 301,
    name: "Full Body Melt",
    category: "Relaxation",
    mood: "flowing",
    duration: "Extended",
    bodyArea: "Full Body",
    vibe: "Complete relaxation from head to toe",
    description: "A comprehensive full-body massage that releases tension everywhere, transitioning from therapeutic to sensual.",
    howTo: "Start with shoulders and upper back. Work down each arm. Move to lower back and glutes. Down each leg to feet. Flip and do front. Use long, flowing strokes.",
    tips: ["Warm the oil first", "Use consistent pressure", "Cover every inch", "Take at least 30 minutes"],
    pairsWellWith: ["Spooning", "Lazy Dog", "The Lotus"]
  },
  {
    id: 302,
    name: "Shoulder Surrender",
    category: "Relaxation",
    mood: "grounded",
    duration: "Medium",
    bodyArea: "Shoulders & Neck",
    vibe: "Releasing stored stress",
    description: "Deep focus on shoulders and neck where most people carry tension.",
    howTo: "Have them lie face down. Use thumbs to work the muscles between shoulder blades. Knead the trapezius muscles. Work up the neck carefully. Use circular motions.",
    tips: ["Find the knots and work them gently", "Ask about pressure", "Include the base of the skull", "Don't press directly on spine"],
    pairsWellWith: ["Neck & Ear Focus", "Spooning", "Intimate connection"]
  },
  {
    id: 303,
    name: "Lower Back Love",
    category: "Relaxation",
    mood: "grounded",
    duration: "Medium",
    bodyArea: "Lower Back",
    vibe: "Releasing deep-held tension",
    description: "Focused attention on the lower back, a common area of pain and tension.",
    howTo: "Use palms and thumbs on muscles beside the spine. Work the sacrum gently. Include the sides of the lower back. Use broad, sweeping strokes.",
    tips: ["Never press on the spine itself", "The sides often need more attention", "Warmth helps - warm hands, warm oil", "This area connects to relaxation everywhere"],
    pairsWellWith: ["Lazy Dog", "Doggy Style prep", "Deep relaxation"]
  },
  {
    id: 304,
    name: "Scalp Serenity",
    category: "Relaxation",
    mood: "flowing",
    duration: "Quick",
    bodyArea: "Head & Scalp",
    vibe: "Melting stress through the head",
    description: "A focused scalp massage that releases tension and creates deep relaxation.",
    howTo: "Use fingertips (not nails) to massage entire scalp. Include temples, behind ears, base of skull. Use small circular motions with varying pressure.",
    tips: ["Fingertips only, no nails", "Include the hairline", "Temples are very sensitive", "Can be done with them in your lap"],
    pairsWellWith: ["Face-to-Face positions", "Deep connection", "Stress relief"]
  },
  {
    id: 305,
    name: "Leg & Foot Revival",
    category: "Relaxation",
    mood: "grounded",
    duration: "Medium",
    bodyArea: "Legs & Feet",
    vibe: "Grounding through the lower body",
    description: "Complete attention to legs and feet, often neglected but incredibly relaxing.",
    howTo: "Start with feet - work arches and each toe. Move up calves with kneading motions. Work thighs with broad strokes. Don't forget the backs of knees.",
    tips: ["Firm pressure on feet prevents tickling", "Calves often need deep work", "Inner thighs can transition to sensual", "Take your time with each foot"],
    pairsWellWith: ["Full body massage", "Foot worship", "Building anticipation"]
  },
  {
    id: 306,
    name: "Face & Jaw Release",
    category: "Relaxation",
    mood: "flowing",
    duration: "Quick",
    bodyArea: "Face & Jaw",
    vibe: "Releasing facial tension",
    description: "Gentle massage of the face and jaw, where many people hold stress without realizing.",
    howTo: "Use gentle pressure on temples. Stroke across forehead. Work the jaw muscles with circular motions. Include cheekbones and around eyes.",
    tips: ["Very gentle pressure", "Jaw muscles often need the most work", "Avoid pulling skin", "Include the ears"],
    pairsWellWith: ["Intimate moments", "Deep connection", "Relaxation"]
  },
  {
    id: 307,
    name: "Arm & Hand Heaven",
    category: "Relaxation",
    mood: "flowing",
    duration: "Quick",
    bodyArea: "Arms & Hands",
    vibe: "Often forgotten, always appreciated",
    description: "Focused massage on arms and hands - surprisingly sensual and relaxing.",
    howTo: "Start at shoulders and work down each arm. Spend time on forearms. Work the palm and each finger. Don't forget the wrist.",
    tips: ["Forearms often hold tension", "Palm massage is surprisingly relaxing", "Work between the fingers", "Inner arm is very sensitive"],
    pairsWellWith: ["Hand holding", "Intimate connection", "Full body massage"]
  },

  // ============================================
  // SENSUAL (7 techniques)
  // ============================================
  {
    id: 308,
    name: "The Tease Trail",
    category: "Sensual",
    mood: "passionate",
    duration: "Medium",
    bodyArea: "Full Body",
    vibe: "Building arousal through touch",
    description: "A massage that deliberately teases, approaching sensitive areas without fully engaging them.",
    howTo: "Start normally but let fingers trail closer and closer to erogenous zones. Get close, then move away. Build anticipation. Make them want more.",
    tips: ["The tease is the point", "Get close but don't give in", "Watch their breathing", "Let them ask for more"],
    pairsWellWith: ["Any position after", "Extended foreplay", "Building desire"]
  },
  {
    id: 309,
    name: "Inner Thigh Focus",
    category: "Sensual",
    mood: "passionate",
    duration: "Medium",
    bodyArea: "Inner Thighs",
    vibe: "Getting close to where they want you",
    description: "Focused attention on inner thighs - sensual without being explicitly sexual.",
    howTo: "Work the inner thighs with kneading and stroking. Get progressively closer to sensitive areas. Use varying pressure. Maintain the tease.",
    tips: ["Very sensitive area", "Build anticipation", "Both sides equally", "Can transition to more"],
    pairsWellWith: ["Oral play", "The slow tease", "Any position"]
  },
  {
    id: 310,
    name: "Glute Glory",
    category: "Sensual",
    mood: "commanding",
    duration: "Medium",
    bodyArea: "Glutes",
    vibe: "Often neglected, incredibly sensual",
    description: "Deep massage of the glutes - therapeutic and arousing.",
    howTo: "Use strong kneading motions on the glute muscles. These are large muscles that can take pressure. Include the sides and lower back connection.",
    tips: ["These muscles can handle deep pressure", "Very therapeutic", "Naturally arousing", "Leads well into more"],
    pairsWellWith: ["Rear entry positions", "Lazy Dog", "Doggy Style"]
  },
  {
    id: 311,
    name: "Chest & Stomach Circles",
    category: "Sensual",
    mood: "unified",
    duration: "Medium",
    bodyArea: "Chest & Stomach",
    vibe: "Intimate front-body attention",
    description: "Gentle massage of chest and stomach - vulnerable and intimate.",
    howTo: "Use circular motions on the chest. Work the stomach gently. Include the sides. This is vulnerable territory - be gentle and present.",
    tips: ["Very intimate area", "Gentle pressure only", "Watch for ticklishness", "Eye contact adds intimacy"],
    pairsWellWith: ["Missionary", "Face-to-face positions", "Deep connection"]
  },
  {
    id: 312,
    name: "The Oil Drizzle",
    category: "Sensual",
    mood: "flowing",
    duration: "Medium",
    bodyArea: "Full Body",
    vibe: "Warm streams of sensation",
    description: "Drizzling warm oil from a height creates unique streaming sensations.",
    howTo: "Warm massage oil safely. Hold it 6-12 inches above the body and drizzle in patterns. Follow with spreading hands. The drizzle itself is the sensation.",
    tips: ["Test temperature first!", "The height creates anticipation", "Drizzle before spreading", "Protect your sheets"],
    pairsWellWith: ["Full body massage", "Sensual atmosphere", "Extended foreplay"]
  },
  {
    id: 313,
    name: "The Feather Trace",
    category: "Sensual",
    mood: "playful",
    duration: "Quick",
    bodyArea: "Full Body",
    vibe: "Barely-there sensations",
    description: "Using a feather or extremely light fingertips to trace patterns.",
    howTo: "Use a feather or the very lightest fingertip touch. Trace unpredictable patterns. Focus on sensitive areas: inner arms, sides, neck, thighs.",
    tips: ["Lighter than you think", "Unpredictable patterns work best", "Watch for goosebumps", "Combine with blindfold"],
    pairsWellWith: ["Blindfolded touch", "Building anticipation", "Sensation play"]
  },
  {
    id: 314,
    name: "Fingertip Raindrops",
    category: "Sensual",
    mood: "flowing",
    duration: "Quick",
    bodyArea: "Back",
    vibe: "Light touches like rain",
    description: "Using all fingertips to create light, rain-like touches across the back.",
    howTo: "Use all ten fingertips to create light, random touches across the back like raindrops. Vary the pattern and intensity.",
    tips: ["Very light touch", "Random patterns", "Cover the whole back", "Very relaxing and sensual"],
    pairsWellWith: ["Back massage", "Relaxation", "Building arousal"]
  },

  // ============================================
  // THERAPEUTIC (6 techniques)
  // ============================================
  {
    id: 315,
    name: "Deep Tissue Release",
    category: "Therapeutic",
    mood: "grounded",
    duration: "Extended",
    bodyArea: "Full Body",
    vibe: "Working out serious tension",
    description: "Deeper pressure massage focused on releasing muscle knots and tension.",
    howTo: "Use thumbs, knuckles, and even elbows for deeper pressure. Work slowly into tight areas. Ask about pressure. Focus on problem areas.",
    tips: ["Always ask about pressure", "Work slowly into depth", "Breathe with your partner", "Some discomfort is normal, pain is not"],
    pairsWellWith: ["After exercise", "Stress relief", "Deep relaxation"]
  },
  {
    id: 316,
    name: "Hot Stone Simulation",
    category: "Therapeutic",
    mood: "flowing",
    duration: "Extended",
    bodyArea: "Full Body",
    vibe: "Heat therapy without the stones",
    description: "Using warm hands and warm towels to simulate hot stone therapy.",
    howTo: "Warm towels in dryer or microwave (carefully!). Place warm towels on tense areas. Use very warm (not hot) hands. The heat melts tension.",
    tips: ["Test temperature carefully", "Microwaved towels can be dangerously hot in spots", "Heat opens up muscles", "Very relaxing"],
    pairsWellWith: ["Deep relaxation", "Cold weather", "Therapeutic focus"]
  },
  {
    id: 317,
    name: "Pressure Point Release",
    category: "Therapeutic",
    mood: "grounded",
    duration: "Medium",
    bodyArea: "Various",
    vibe: "Targeted tension release",
    description: "Focused pressure on specific trigger points to release tension.",
    howTo: "Find areas of tension (knots). Apply steady, firm pressure with thumb. Hold for 30-60 seconds. Release slowly. Move to next point.",
    tips: ["Hold pressure steadily", "Some discomfort is normal", "Don't press too hard", "Release slowly"],
    pairsWellWith: ["Athletes", "Tension relief", "Therapeutic sessions"]
  },
  {
    id: 318,
    name: "Stretching Assistance",
    category: "Therapeutic",
    mood: "dynamic",
    duration: "Medium",
    bodyArea: "Full Body",
    vibe: "Helping them stretch deeper",
    description: "Assisting your partner with stretches they couldn't do alone.",
    howTo: "Help them stretch hamstrings, hip flexors, back, and arms. Provide gentle resistance. Don't push past their limits. Make it feel good, not painful.",
    tips: ["Never force a stretch", "Communicate constantly", "Hold stretches for 30 seconds", "Very intimate activity"],
    pairsWellWith: ["Before athletic positions", "Flexibility work", "Partner yoga"]
  },
  {
    id: 319,
    name: "Circulation Boost",
    category: "Therapeutic",
    mood: "dynamic",
    duration: "Quick",
    bodyArea: "Full Body",
    vibe: "Getting the blood flowing",
    description: "Vigorous massage strokes designed to increase circulation.",
    howTo: "Use brisk, invigorating strokes. Work toward the heart. Include light percussion (tapping). Gets blood flowing and energizes.",
    tips: ["More vigorous than relaxing", "Good for waking up", "Include light tapping", "Energizing rather than relaxing"],
    pairsWellWith: ["Morning intimacy", "Energy boost", "Before activity"]
  },
  {
    id: 320,
    name: "Muscle Recovery",
    category: "Therapeutic",
    mood: "grounded",
    duration: "Extended",
    bodyArea: "Targeted",
    vibe: "Helping sore muscles heal",
    description: "Focused massage on sore or tired muscles to aid recovery.",
    howTo: "Identify the sore areas. Use medium pressure with long strokes. Work the surrounding muscles too. Include gentle stretching.",
    tips: ["Good after workouts", "Don't massage injured areas", "Focus on the muscles around soreness", "Hydrate after"],
    pairsWellWith: ["Athletic recovery", "After exercise", "Therapeutic care"]
  }
];

export const massageCategories = ['Relaxation', 'Sensual', 'Therapeutic'];
export const massageDurations = ['Quick', 'Medium', 'Extended'] as const;
