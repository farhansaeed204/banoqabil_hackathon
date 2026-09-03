import type { PlantAnalysis } from "./types";

export const DEMO_MAX_DAYS = 30;
export const DEMO_MIN_DAYS = 1;

export const DEMO_RESULTS: Record<string, PlantAnalysis> = {
  "tomato-blight": {
    plantName: "Tomato",
    scientificName: "Solanum lycopersicum",
    confidence: 96,
    healthStatus: "unhealthy",
    moistureEstimate: "normal",
    sunlightNeeds: "6–8 hours direct sun",
    diseases: [
      {
        name: "Early Blight (Alternaria solani)",
        probability: 88,
        severity: "moderate",
        description:
          "Fungal infection causing concentric target-like dark spots with yellow halos on older leaves, eventually leading to leaf drop and reduced yield.",
        symptoms: [
          "Brown/dark concentric rings on lower leaves",
          "Yellowing halo around spots",
          "Lower leaf drop progressing upward",
        ],
      },
    ],
    treatment: {
      immediateActions: [
        "Remove and dispose of severely infected lower leaves",
        "Improve airflow around the plant (stake/prune)",
        "Water at the base, avoid wetting foliage",
      ],
      remedies: [
        {
          name: "Copper-based fungicide",
          dosage: "2.5 g per litre of water",
          frequency: "Every 7 days for 3 weeks",
          safetyNote: "Wear gloves; avoid applying in midday heat.",
        },
        {
          name: "Neem oil (organic option)",
          dosage: "5 ml per litre of water",
          frequency: "Every 7–10 days",
          safetyNote: "Apply in the evening to avoid leaf burn.",
        },
      ],
      preventiveMeasures: [
        "Crop rotation with non-solanaceous plants",
        "Mulch to prevent soil splash",
        "Space plants for better airflow",
      ],
    },
    recoveryEstimate: {
      minDays: 14,
      maxDays: 21,
      conditions: [
        "Remove infected leaves promptly",
        "Apply fungicide on schedule",
        "Keep foliage dry",
      ],
    },
    careTips: [
      "Water early morning at the base.",
      "Stake plants to keep leaves off soil.",
      "Rotate crops each season.",
    ],
    summary:
      "Your tomato plant shows early blight, a common fungal infection. With prompt leaf removal and a 3-week fungicide schedule, it should recover in 2–3 weeks.",
  },

  "rose-blackspot": {
    plantName: "Rose",
    scientificName: "Rosa spp.",
    confidence: 94,
    healthStatus: "unhealthy",
    moistureEstimate: "normal",
    sunlightNeeds: "6+ hours direct sun",
    diseases: [
      {
        name: "Black Spot (Diplocarpon rosae)",
        probability: 91,
        severity: "moderate",
        description:
          "Fungal disease causing black, fringed circular spots on leaves with yellowing, leading to premature leaf drop and weaker flowering.",
        symptoms: [
          "Black spots with fringed edges on leaves",
          "Yellowing around spots",
          "Premature leaf drop",
        ],
      },
    ],
    treatment: {
      immediateActions: [
        "Pick off and destroy infected leaves and fallen debris",
        "Prune to open up the bush for airflow",
        "Water at the base only",
      ],
      remedies: [
        {
          name: "Sulfur-based fungicide",
          dosage: "Mix per label, typically 3 g/L",
          frequency: "Every 7–10 days",
          safetyNote: "Do not apply when temperature exceeds 29°C.",
        },
        {
          name: "Baking soda spray (organic)",
          dosage: "1 tbsp + few drops dish soap per litre",
          frequency: "Every 7 days",
          safetyNote: "Test on one leaf first.",
        },
      ],
      preventiveMeasures: [
        "Mulch around the base to stop splash-up",
        "Avoid overhead watering",
        "Plant resistant rose varieties",
      ],
    },
    recoveryEstimate: {
      minDays: 14,
      maxDays: 28,
      conditions: [
        "Remove all infected leaves",
        "Fungicide on schedule",
        "Good sun + airflow",
      ],
    },
    careTips: [
      "Prune in late winter for a healthy shape.",
      "Feed monthly in the growing season.",
      "Deadhead spent blooms regularly.",
    ],
    summary:
      "This rose has black spot, a common fungal disease. Clear the infected leaves and treat weekly for 2–4 weeks; the plant should recover and reflower.",
  },

  "monstera-healthy": {
    plantName: "Monstera",
    scientificName: "Monstera deliciosa",
    confidence: 98,
    healthStatus: "healthy",
    moistureEstimate: "normal",
    sunlightNeeds: "Bright, indirect light",
    diseases: [],
    treatment: {
      immediateActions: ["Continue current care routine — no treatment needed."],
      remedies: [],
      preventiveMeasures: [
        "Dust leaves monthly to maximize light",
        "Check for pests weekly",
        "Use a well-draining aroid mix",
      ],
    },
    recoveryEstimate: {
      minDays: 0,
      maxDays: 0,
      conditions: ["Maintain consistent indirect light and humidity."],
    },
    careTips: [
      "Water when top 2–3 cm of soil is dry.",
      "Provide a moss pole for climbing.",
      "Keep away from direct harsh sun.",
    ],
    summary:
      "This monstera is healthy! Its large fenestrated leaves, vibrant green colour and good stem structure indicate strong growth. Just keep up the current care.",
  },

  "lemon-yellowing": {
    plantName: "Lemon / Citrus",
    scientificName: "Citrus limon",
    confidence: 90,
    healthStatus: "unhealthy",
    moistureEstimate: "normal",
    sunlightNeeds: "Full sun",
    diseases: [
      {
        name: "Nutrient Deficiency (likely Nitrogen or Iron chlorosis)",
        probability: 74,
        severity: "mild",
        description:
          "Yellowing leaves, especially older leaves, often indicate a nitrogen deficiency; young leaves yellowing with green veins suggests iron deficiency.",
        symptoms: [
          "Uniform yellowing of older leaves (N)",
          "Yellow leaves with green veins (Fe)",
          "Stunted growth and fewer blooms",
        ],
      },
    ],
    treatment: {
      immediateActions: [
        "Confirm which deficiency by which leaves yellow first",
        "Apply a balanced citrus fertilizer",
        "Check soil pH (ideal 6.0–7.0) — iron locks out in alkaline soil",
      ],
      remedies: [
        {
          name: "Balanced citrus fertilizer (NPK)",
          dosage: "Follow label, typically 1 tbsp per plant monthly",
          frequency: "Monthly in growing season",
          safetyNote: "Water in well after applying.",
        },
        {
          name: "Chelated iron (if green veins visible)",
          dosage: "5 g diluted per label",
          frequency: "Twice, 2 weeks apart",
          safetyNote: "Do not over-apply.",
        },
      ],
      preventiveMeasures: [
        "Feed with citrus-specific fertilizer regularly",
        "Maintain proper soil pH",
        "Mulch and water deeply, less often",
      ],
    },
    recoveryEstimate: {
      minDays: 30,
      maxDays: 60,
      conditions: [
        "Correct feeding schedule",
        "Proper pH",
        "Consistent watering",
      ],
    },
    careTips: [
      "Citrus need full sun for fruiting.",
      "Protect from frost.",
      "Water deeply but allow soil to dry slightly.",
    ],
    summary:
      "This lemon tree's yellowing leaves point to a nutrient deficiency, most likely nitrogen or iron. Correct feeding and pH should restore green growth within 1–2 months.",
  },
};

export const DEMO_KEYS = Object.keys(DEMO_RESULTS);
