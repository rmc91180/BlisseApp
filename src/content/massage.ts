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
    name: "The Full-Body Surrender",
    category: "Relaxation",
    mood: "flowing",
    duration: "Extended",
    bodyArea: "Full Body",
    vibe: "Head-to-toe melt with a playful finish",
    description: "A comprehensive full-body massage that releases tension everywhere, then smoothly shifts from therapeutic to sensual.",
    howTo: "Start with shoulders and upper back. Work down each arm. Move to lower back and glutes. Down each leg to feet. Flip and do front. Use long, flowing strokes.",
    tips: ["Warm the oil first (bonus points if they watch you do it slowly)", "Use consistent pressure", "Cover every inch", "Take at least 30 minutes"],
    pairsWellWith: ["Spooning", "Lazy Dog", "The Lotus"]
  },
  {
    id: 302,
    name: "Shoulder Melting Magic",
    category: "Relaxation",
    mood: "grounded",
    duration: "Medium",
    bodyArea: "Shoulders & Neck",
    vibe: "Releasing stored stress",
    description: "Deep focus on shoulders and neck where most people store stress, with slow touch that invites full-body exhale.",
    howTo: "Have them lie face down. Use thumbs to work the muscles between shoulder blades. Knead the trapezius muscles. Work up the neck carefully. Use circular motions.",
    tips: ["Find the knots and work them gently", "Ask about pressure", "Include the base of the skull", "Steal a kiss between shoulder passes"],
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
    mood: "blossoming",
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
    name: "The Almost-There Trail",
    category: "Sensual",
    mood: "passionate",
    duration: "Medium",
    bodyArea: "Full Body",
    vibe: "Building arousal through touch",
    description: "A massage that deliberately teases by hovering near sensitive zones, building anticipation before each reveal.",
    howTo: "Start normally but let fingers trail closer and closer to erogenous zones. Get close, then move away. Build anticipation. Make them want more.",
    tips: ["The tease is the point", "Get close but don't give in", "Watch their breathing", "Pause at the edge and smile before giving in"],
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
    mood: "blossoming",
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
  },

  // ============================================
  // RELAXATION +3 (IDs 321–323)
  // ============================================
  {
    id: 321,
    name: "Neck & Décolletage Flow",
    category: "Relaxation",
    mood: "flowing",
    duration: "Medium",
    bodyArea: "Shoulders & Neck",
    vibe: "Graceful unwinding from jaw to collarbone",
    description: "A flowing sequence that traces from the base of the skull down through the neck and across the décolletage, releasing tension held in the throat and upper chest.",
    howTo: "Begin at the base of the skull with gentle circular motions. Glide thumbs down either side of the neck. Fan outward across the collarbones with open palms. Repeat the flow several times, gradually increasing pressure.",
    tips: ["Keep strokes symmetrical on both sides", "Avoid pressing on the front of the throat", "Warm oil makes the glide smoother", "Pause at the collarbones and let your hands rest there"],
    pairsWellWith: ["Face & Jaw Release", "Shoulder Melting Magic", "Deep connection"]
  },
  {
    id: 322,
    name: "Hip Opener",
    category: "Relaxation",
    mood: "grounded",
    duration: "Extended",
    bodyArea: "Hip Flexors",
    vibe: "Unlocking deep-seated tightness",
    description: "A slow, intentional massage that targets the hip flexors and surrounding muscles, releasing tension from sitting and daily stress.",
    howTo: "Have your partner lie on their back with knees bent. Use palm pressure along the front of the hip crease. Work the outer hip with kneading strokes. Gently rotate their bent leg to loosen the joint while massaging the surrounding muscles.",
    tips: ["Go slowly — hip flexors can be very tender", "Communicate constantly about depth", "Combine with gentle passive stretching", "Breathe together to encourage release"],
    pairsWellWith: ["Stretching Assistance", "Lower Back Love", "Leg & Foot Revival"]
  },
  {
    id: 323,
    name: "Belly Breathing Massage",
    category: "Relaxation",
    mood: "unified",
    duration: "Quick",
    bodyArea: "Abdomen",
    vibe: "Calming the core, quieting the mind",
    description: "A gentle abdominal massage synchronized with your partner's breathing that settles the body and builds deep trust.",
    howTo: "Place warm hands on their belly. Feel their breath rise and fall. Begin slow clockwise circles in rhythm with their exhale. Keep pressure feather-light and gradually widen the circles to include the sides of the torso.",
    tips: ["Never press deeply on the abdomen", "Match their breathing rhythm exactly", "Clockwise follows the direction of digestion", "This is deeply vulnerable — maintain a calm presence"],
    pairsWellWith: ["Scalp Serenity", "Face & Jaw Release", "Mindful connection"]
  },

  // ============================================
  // SENSUAL +4 (IDs 324–327)
  // ============================================
  {
    id: 324,
    name: "The Whisper Touch",
    category: "Sensual",
    mood: "passionate",
    duration: "Quick",
    bodyArea: "Full Body",
    vibe: "So light it makes them hold their breath",
    description: "An almost imperceptible touch that heightens every nerve ending. Your fingertips barely graze the skin, creating electric anticipation.",
    howTo: "Use only the very tips of your fingers — barely making contact. Drift across the inner arm, along the collarbone, down the side of the torso. Move unpredictably. Pause and let them feel the warmth of your hand hovering just above the skin.",
    tips: ["The less you touch, the more they feel", "Hover just above the skin between traces", "Breath on the skin amplifies the effect", "Watch for shivers — that means it's working"],
    pairsWellWith: ["The Feather Trace", "Blindfolded touch", "Building anticipation"]
  },
  {
    id: 325,
    name: "Spine Tingler",
    category: "Sensual",
    mood: "commanding",
    duration: "Medium",
    bodyArea: "Back",
    vibe: "A shiver from tailbone to nape",
    description: "A deliberately slow massage that follows the spine's length, combining firm palm pressure with feather-light fingernail traces to create waves of sensation.",
    howTo: "Start at the base of the spine with both palms. Glide upward with steady pressure along each side of the vertebrae. At the nape, switch to the lightest fingernail trace and drift back down. Alternate between firm and barely-there with each pass.",
    tips: ["Never press directly on the spine", "The contrast between firm and light is everything", "Slow down even more than you think you should", "Let your breath fall on their neck at the top of each stroke"],
    pairsWellWith: ["Fingertip Raindrops", "The Almost-There Trail", "Rear entry positions"]
  },
  {
    id: 326,
    name: "Warm Stone Fantasy",
    category: "Sensual",
    mood: "flowing",
    duration: "Extended",
    bodyArea: "Full Body",
    vibe: "Melting heat meets intimate touch",
    description: "Using warmed smooth stones or heated oil compresses placed along the body, followed by slow sensual strokes that blend warmth with connection.",
    howTo: "Warm smooth stones in hot water or heat oil compresses. Place them along the back, behind the knees, and on the palms. While the heat seeps in, use oiled hands to massage the exposed areas. Remove stones one by one and massage the warmed skin beneath.",
    tips: ["Always test stone temperature on your own wrist first", "River stones from a craft store work perfectly", "The removal-and-massage reveal is the most sensual moment", "Dim lighting and candles complete the atmosphere"],
    pairsWellWith: ["The Oil Drizzle", "Hot Stone Simulation", "Extended foreplay"]
  },
  {
    id: 327,
    name: "The Silk Stroke",
    category: "Sensual",
    mood: "playful",
    duration: "Medium",
    bodyArea: "Inner Thighs",
    vibe: "Teasing texture on sensitive skin",
    description: "Using a silk scarf or satin fabric dragged slowly across the inner thighs and torso to create a unique, teasing sensation that skin-to-skin touch alone cannot replicate.",
    howTo: "Drape a silk scarf across your partner's body. Pull it slowly across the inner thighs, over the hips, and along the stomach. Alternate between the fabric and your bare hand so they feel the contrast. Bunch the fabric and use it to knead gently.",
    tips: ["Real silk or satin works best — avoid synthetics", "The transition from fabric to bare skin is electric", "Try draping it over your hand as you massage", "Combine with a blindfold for intensified sensation"],
    pairsWellWith: ["Inner Thigh Focus", "The Feather Trace", "Sensation play"]
  },

  // ============================================
  // THERAPEUTIC +3 (IDs 328–330)
  // ============================================
  {
    id: 328,
    name: "Tension Headache Release",
    category: "Therapeutic",
    mood: "grounded",
    duration: "Quick",
    bodyArea: "Head & Scalp",
    vibe: "Targeted relief when it matters most",
    description: "A focused technique that targets the specific pressure points around the skull, temples, and base of the neck that contribute to tension headaches.",
    howTo: "Start with sustained pressure on the temples using the pads of your thumbs. Move to the ridge at the base of the skull and press firmly for 30 seconds on each side. Use circular motions across the forehead. Finish with gentle traction — cradling the head and pulling lightly toward you.",
    tips: ["Dim the lights — bright light worsens headaches", "Firm, steady pressure works better than rubbing", "The suboccipital muscles at the skull base are key", "Peppermint oil on the temples can enhance relief"],
    pairsWellWith: ["Scalp Serenity", "Face & Jaw Release", "Shoulder Melting Magic"]
  },
  {
    id: 329,
    name: "IT Band Release",
    category: "Therapeutic",
    mood: "dynamic",
    duration: "Medium",
    bodyArea: "Legs & Feet",
    vibe: "Unlocking the runner's nemesis",
    description: "A firm massage along the outer thigh targeting the iliotibial band, a notoriously tight area for anyone who sits, runs, or cycles.",
    howTo: "Have your partner lie on their side. Use your forearm or elbow to apply slow, steady pressure along the outer thigh from hip to knee. Work in short sections, holding on tender spots for 10 to 15 seconds. Follow with broad palm strokes to flush the area.",
    tips: ["This can be intense — start lighter than you think", "Have them breathe through tender spots", "Rolling a warm towel under the leg adds comfort", "Always stroke toward the heart when finishing"],
    pairsWellWith: ["Leg & Foot Revival", "Stretching Assistance", "Circulation Boost"]
  },
  {
    id: 330,
    name: "Neck Reset",
    category: "Therapeutic",
    mood: "unified",
    duration: "Medium",
    bodyArea: "Shoulders & Neck",
    vibe: "Undoing a day spent at a screen",
    description: "A structured therapeutic sequence for the neck that combines compression, gentle stretching, and focused muscle work to counteract forward-head posture and screen fatigue.",
    howTo: "Sit behind your partner. Cup the base of their skull and apply gentle upward traction. Use thumbs to work the muscles along each side of the cervical spine. Gently tilt their head to each side, massaging the stretched side. Finish with slow circles on the upper trapezius.",
    tips: ["Support the head fully — never let it drop", "Avoid rotating the neck forcefully", "The levator scapulae muscle at the side of the neck is often the tightest", "Warm towel on the shoulders beforehand works wonders"],
    pairsWellWith: ["Shoulder Melting Magic", "Tension Headache Release", "Pressure Point Release"]
  },
  {
    id: 331,
    name: "Desk Day Rescue",
    category: "Therapeutic",
    mood: "grounded",
    duration: "Quick",
    bodyArea: "Shoulders & Hips",
    vibe: "Relief for the spots that tighten after long hours sitting",
    description: "A practical reset for screen-heavy days, focused on shoulders, upper back, and hips that feel locked from sitting too long.",
    howTo: "Start seated or standing behind your partner. Use firm palm pressure across the tops of the shoulders, then knead between the shoulder blades. Move to the hips with broad circular pressure at the outer glutes and hip creases. Finish with a slow stretch through the chest and side body.",
    tips: ["This works well before dinner or before bed", "The hips often need just as much attention as the shoulders", "Keep pressure steady instead of poking at knots", "A warm towel before starting helps everything soften faster"],
    pairsWellWith: ["Neck Reset", "Shoulder Melting Magic", "Hip Opener"]
  },
  {
    id: 332,
    name: "Palm-to-Palm Reset",
    category: "Relaxation",
    mood: "unified",
    duration: "Quick",
    bodyArea: "Hands & Forearms",
    vibe: "A small ritual that instantly feels caring",
    description: "A focused hand and forearm massage that feels grounding, attentive, and surprisingly intimate for such a simple setup.",
    howTo: "Sit facing each other. Take one hand at a time and press your thumbs through the palm in slow lines from heel to fingers. Rotate each finger gently, then glide along the forearm with both thumbs while supporting underneath with your fingers.",
    tips: ["Perfect for transitions between the day and the night", "Use slower pressure than you think you need", "The wrist and base of the thumb often hold the most tension", "Switch hands only after finishing one side completely"],
    pairsWellWith: ["Arm & Hand Heaven", "Couch Cocoon", "Deep connection"]
  },
  {
    id: 333,
    name: "Breathing Wave",
    category: "Sensual",
    mood: "flowing",
    duration: "Medium",
    bodyArea: "Torso & Ribs",
    vibe: "Long glides timed to each exhale",
    description: "A torso massage shaped by breath, where each stroke follows the exhale and turns simple touch into something calm and deeply charged.",
    howTo: "Have your partner lie on their back or side. Place warm hands at the ribs or sides of the waist. As they exhale, glide slowly downward or outward with full palms. Reset softly during the inhale. Repeat until both of you settle into the same tempo.",
    tips: ["Do not rush the inhale-exhale rhythm", "The side ribs are often more sensitive than expected", "A pause with still hands can be just as powerful as movement", "This works best when the room is quiet and the pace stays slow"],
    pairsWellWith: ["Belly Breathing Massage", "The Whisper Touch", "Slow-build foreplay"]
  },
  {
    id: 334,
    name: "The Aftercare Hold",
    category: "Relaxation",
    mood: "blossoming",
    duration: "Medium",
    bodyArea: "Full Body",
    vibe: "Gentle touch for settling back into each other",
    description: "A softer, slower massage for after intimacy or after a long day, focused on reassurance, warmth, and helping both bodies come back down together.",
    howTo: "Use very light oil or lotion and keep strokes broad and slow. Focus on the back, hips, shoulders, and thighs with comforting passes instead of deep work. Pause often to simply hold, breathe, and let your hands rest.",
    tips: ["This is about comfort, not technique", "Stillness between strokes makes it feel even safer", "Works beautifully after sex, stress, or an emotional conversation", "A blanket nearby helps the body stay warm while relaxing"],
    pairsWellWith: ["The Full-Body Surrender", "Cuddling with Intent", "Spooning"]
  }
];

export const massageCategories = ['Relaxation', 'Sensual', 'Therapeutic'];
export const massageDurations = ['Quick', 'Medium', 'Extended'] as const;
