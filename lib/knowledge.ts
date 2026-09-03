// Curated, evidence-based plant care knowledge base.
// Used by the RAG chatbot as source context. Each entry is a self-contained fact.

export interface KbEntry {
  id: string;
  text: string;
  metadata: Record<string, string>;
}

export const KNOWLEDGE_BASE: KbEntry[] = [
  // --- Tomato ---
  {
    id: "kb-tomato-blight",
    metadata: { plant: "tomato", disease: "early blight" },
    text: "Early blight on tomatoes, caused by Alternaria solani, appears as dark brown spots with concentric target-like rings and a yellow halo on older leaves. Treatment: remove infected leaves, improve airflow, and apply copper fungicide (2.5 g per litre) or neem oil (5 ml per litre) every 7-10 days. Prevent by rotating crops and mulching to stop soil splash.",
  },
  {
    id: "kb-tomato-lateblight",
    metadata: { plant: "tomato", disease: "late blight" },
    text: "Late blight on tomatoes is caused by Phytophthora infestans and shows as large greasy, water-soaked grey-green blotches on leaves and stems, often with white fuzzy growth under humid conditions, plus dark rot on fruit. It spreads fast. Remove infected plants immediately, apply a copper fungicide, and destroy debris. Avoid overhead watering.",
  },
  {
    id: "kb-tomato-bulb",
    metadata: { plant: "tomato", disease: "blossom end rot" },
    text: "Blossom end rot on tomatoes is not a disease but a calcium deficiency caused by uneven watering. It appears as a sunken, leathery dark patch at the blossom end of fruit. Fix by watering consistently, mulching, and adding calcium (lime or gypsum). Affected fruit won't recover but new fruit will be fine.",
  },
  {
    id: "kb-tomato-powdery",
    metadata: { plant: "tomato", disease: "powdery mildew" },
    text: "Powdery mildew on tomatoes shows as white powdery spots on upper leaf surfaces, leading to yellowing and leaf drop. Improve airflow, avoid crowding, and apply a sulfur fungicide or a baking soda spray (1 tbsp per litre plus a dash of dish soap) weekly.",
  },

  // --- Rose ---
  {
    id: "kb-rose-blackspot",
    metadata: { plant: "rose", disease: "black spot" },
    text: "Black spot on roses, caused by Diplocarpon rosae, shows as circular black spots with fringed edges and yellowing around them, leading to leaf drop. Remove and destroy infected leaves, water at the base, and apply a sulfur-based or baking-soda fungicide every 7-10 days. Mulch to prevent splash-back.",
  },
  {
    id: "kb-rose-powdery",
    metadata: { plant: "rose", disease: "powdery mildew" },
    text: "Powdery mildew on roses appears as white powdery patches on leaves, buds and shoots, distorting new growth. Increase airflow, avoid overhead watering, and treat with sulfur fungicide or a milk spray (1 part milk to 9 parts water) weekly.",
  },
  {
    id: "kb-rose-aphids",
    metadata: { plant: "rose", disease: "aphids" },
    text: "Aphids are small soft-bodied green or black insects that cluster on new rose shoots and buds, causing curling and sticky honeydew. Blast them off with water, introduce ladybugs, or spray neem oil (5 ml per litre) or insecticidal soap weekly.",
  },
  {
    id: "kb-rose-rust",
    metadata: { plant: "rose", disease: "rust" },
    text: "Rose rust shows as bright orange pustules on the undersides of leaves with yellowing on top. Remove infected leaves, improve airflow, and apply a sulfur or copper fungicide every 7-10 days. Clean up fallen leaves to stop spores overwintering.",
  },

  // --- Citrus ---
  {
    id: "kb-citrus-nitrogen",
    metadata: { plant: "citrus", disease: "nitrogen deficiency" },
    text: "Nitrogen deficiency in citrus causes uniform yellowing of older leaves, stunted growth and fewer blooms. Fix by applying a balanced citrus fertilizer and watering it in. Yellowing usually corrects within a few weeks after feeding.",
  },
  {
    id: "kb-citrus-iron",
    metadata: { plant: "citrus", disease: "iron chlorosis" },
    text: "Iron chlorosis in citrus shows as yellowing of young leaves with green veins, usually because soil pH is too alkaline. Fix by lowering soil pH toward 6.0-6.5 and applying chelated iron. Recheck new growth for improvement.",
  },
  {
    id: "kb-citrus-greening",
    metadata: { plant: "citrus", disease: "citrus greening" },
    text: "Citrus greening (Huanglongbing) causes blotchy yellow mottling of leaves, misshapen bitter fruit, and twig dieback. It is spread by psyllids and has no cure; remove infected trees to protect others and control the psyllid insect vector.",
  },
  {
    id: "kb-citrus-lemonminer",
    metadata: { plant: "citrus", disease: "leaf miner" },
    text: "Citrus leaf miner produces silvery winding tunnels in young leaves. Damage is mostly cosmetic. Control with neem oil on new growth or beneficial wasps; prune affected flush. Mature trees tolerate it well.",
  },

  // --- General care ---
  {
    id: "kb-general-watering",
    metadata: { plant: "general", disease: "watering" },
    text: "Correct watering: water deeply and less often rather than little and often, to encourage deep roots. Water at the base, in the morning, and avoid wetting foliage to reduce fungal disease. Most plants prefer the top 2-3 cm of soil to dry between waterings.",
  },
  {
    id: "kb-general-neem",
    metadata: { plant: "general", disease: "neem oil" },
    text: "Neem oil is an organic treatment for many pests and fungal issues. Mix 5 ml per litre of water, shake well, and spray in the evening to avoid leaf burn. Reapply every 7-10 days. Safe for bees and beneficial insects when applied correctly.",
  },
  {
    id: "kb-general-copper",
    metadata: { plant: "general", disease: "copper fungicide" },
    text: "Copper-based fungicides control fungal and bacterial diseases. Typical dose is 2.5 g per litre, applied every 7-10 days and after rain. Wear gloves, avoid spraying in midday heat or when bees are very active, and follow the product label.",
  },
  {
    id: "kb-general-ledlight",
    metadata: { plant: "general", disease: "light requirements" },
    text: "Light: edible crops and fruiting plants like tomatoes and citrus need full sun (6-8 hours). Foliage houseplants like monstera prefer bright indirect light. Signs of too little light are leggy growth and pale leaves; signs of too much are scorched or sunburnt leaves.",
  },
  {
    id: "kb-general-soilph",
    metadata: { plant: "general", disease: "soil pH" },
    text: "Soil pH affects nutrient availability. Most vegetables prefer slightly acidic to neutral soil (6.0-7.0). Alkaline soil above 7.5 can lock up iron and cause yellowing. Test soil pH and amend with sulfur to lower it or lime to raise it.",
  },
  {
    id: "kb-general-frost",
    metadata: { plant: "general", disease: "frost protection" },
    text: "Protect tender plants from frost by covering with cloth or bringing pots indoors overnight. Water deeply before a frost event. Citrus and tropical plants are especially frost sensitive and should be moved or covered when temperatures approach freezing.",
  },
  {
    id: "kb-general-pesticidesafe",
    metadata: { plant: "general", disease: "pesticide safety" },
    text: "When using any pesticide or fungicide, always wear gloves and eye protection, follow the labelled dosage, and avoid spraying on windy days or before rain. Keep treatments away from edible parts near harvest, and wash produce thoroughly before eating.",
  },
  {
    id: "kb-general-compost",
    metadata: { plant: "general", disease: "compost & feeding" },
    text: "Feed plants regularly in the growing season with balanced fertilizer or compost. Over-fertilizing can burn roots and cause leaf scorch, while under-fertilizing causes slow growth and pale leaves. Follow the recommended frequency and water after applying.",
  },
  {
    id: "kb-general-succulent",
    metadata: { plant: "general", disease: "root rot" },
    text: "Root rot is caused by overwatering or poor drainage, showing as yellowing, wilting and mushy brown roots. If suspected, stop watering, repot in well-draining soil, and trim rotted roots. Ensure pots have drainage holes. Healthy roots are firm and white/pale.",
  },
  {
    id: "kb-general-spider-mite",
    metadata: { plant: "general", disease: "spider mites" },
    text: "Spider mites are tiny pests that cause fine stippling on leaves, webbing, and a dusty look. They thrive in dry conditions. Increase humidity, hose the plant down, and apply insecticidal soap or neem oil repeatedly (weekly) to break the life cycle.",
  },
];
