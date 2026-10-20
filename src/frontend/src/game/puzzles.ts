export interface Group {
  id: string;
  category: string;
  words: string[];
  explanation: string;
  clue: string;
  rule?: "literal" | "reverse" | "fill-blank";
}
export interface Puzzle {
  id: string;
  title: string;
  topic: string;
  description: string;
  groups: Group[];
}
export const lessons: Puzzle[] = [
  {
    id: "first-thread",
    title: "Find your first thread",
    topic: "Practice 1 of 2",
    description:
      "Select four words that belong together, then check your group. Try looking for something you can eat.",
    groups: [
      {
        id: "fruit",
        category: "Fruits",
        words: ["APPLE", "PEAR", "GRAPE", "PEACH"],
        clue: "Look for a sweet snack that grows on a plant.",
        explanation:
          "Apple, pear, grape, and peach are all fruits. The shared idea is the thread connecting the words.",
      },
      {
        id: "instruments",
        category: "Musical instruments",
        words: ["DRUM", "FLUTE", "HARP", "VIOLIN"],
        clue: "These help you make music.",
        explanation:
          "These are all musical instruments. A connection can be a simple category like this one.",
      },
    ],
  },
  {
    id: "second-look",
    title: "Give a word a second look",
    topic: "Practice 2 of 2",
    description:
      "A word can suggest more than one connection. PALM might make you think of a hand, but look for four words that fit together across the whole board.",
    groups: [
      {
        id: "trees",
        category: "Types of trees",
        words: ["PALM", "OAK", "BIRCH", "ELM"],
        clue: "Think leaves, trunks, and branches.",
        explanation:
          "Palm is a tree as well as part of a hand. Oak, birch, and elm help you discover its intended meaning here.",
      },
      {
        id: "hand",
        category: "Parts of a hand",
        words: ["THUMB", "PINKY", "KNUCKLE", "FINGERTIP"],
        clue: "You can find these by looking at your hand.",
        explanation:
          "These four describe parts of a hand. With PALM in the tree group, every word has a place. Looking at the whole board helps resolve an overlap.",
      },
    ],
  },
];
export const puzzles: Puzzle[] = [
  {
    id: "garden-path",
    title: "Along the garden path",
    topic: "Everyday nature",
    description:
      "A little fresh air and a few familiar discoveries. Find four groups of four.",
    groups: [
      {
        id: "trees",
        category: "Trees",
        words: ["MAPLE", "BIRCH", "WILLOW", "CEDAR"],
        clue: "Look for plants with woody trunks.",
        explanation:
          "Maple, birch, willow, and cedar are trees. Their leaves and growth habits differ, but they share this category.",
      },
      {
        id: "birds",
        category: "Birds",
        words: ["ROBIN", "SPARROW", "FINCH", "WREN"],
        clue: "You might hear these singing outside.",
        explanation:
          "These are all birds you might encounter in gardens or other outdoor habitats.",
      },
      {
        id: "flowers",
        category: "Flowers",
        words: ["DAISY", "TULIP", "IRIS", "LILY"],
        clue: "Think of a colorful bouquet.",
        explanation:
          "These names refer to flowering plants grown for their blooms. Iris can also mean part of an eye—a word can have several meanings.",
      },
      {
        id: "herbs",
        category: "Culinary herbs",
        words: ["BASIL", "THYME", "SAGE", "MINT"],
        clue: "Their fragrant leaves can flavor food.",
        explanation:
          "These herbs are used in cooking. Sage can also describe a wise person, and mint can mean a place that makes coins.",
      },
    ],
  },
  {
    id: "body-basics",
    title: "Under the surface",
    topic: "Biology basics",
    description:
      "Explore the human body. New vocabulary is welcome here—Relaxed mode gives you room to learn.",
    groups: [
      {
        id: "bones",
        category: "Bones",
        words: ["FEMUR", "TIBIA", "ULNA", "TALUS"],
        clue: "These help form your skeleton.",
        explanation:
          "The femur is in the thigh, the tibia in the lower leg, the ulna in the forearm, and the talus in the ankle.",
      },
      {
        id: "senses",
        category: "Four of the senses",
        words: ["SIGHT", "HEARING", "TASTE", "SMELL"],
        clue: "Ways you perceive the world around you.",
        explanation:
          "These are four familiar senses. Touch is another; this group does not list every sense.",
      },
      {
        id: "teeth",
        category: "Types of teeth",
        words: ["INCISOR", "CANINE", "PREMOLAR", "MOLAR"],
        clue: "Think about biting and chewing.",
        explanation:
          "These are types of human teeth. Incisors cut, canines help tear, and premolars and molars help crush and grind food.",
      },
      {
        id: "blood",
        category: "Blood components",
        words: ["PLASMA", "PLATELETS", "RED CELLS", "WHITE CELLS"],
        clue: "These travel through blood vessels.",
        explanation:
          "Plasma is the liquid portion of blood. Red blood cells carry oxygen, white blood cells support immune defenses, and platelets help blood clot.",
      },
    ],
  },
  {
    id: "kitchen-table",
    title: "Around the kitchen table",
    topic: "Food & everyday life",
    description:
      "A cupboard full of connections. Find the thread running through each set of four.",
    groups: [
      {
        id: "citrus",
        category: "Citrus fruits",
        words: ["LEMON", "LIME", "ORANGE", "GRAPEFRUIT"],
        clue: "Think zest, peel, and tangy juice.",
        explanation:
          "These fruits belong to the citrus group. Orange can also name a color, and lime can name a mineral material.",
      },
      {
        id: "pasta",
        category: "Pasta shapes",
        words: ["PENNE", "FUSILLI", "FARFALLE", "RIGATONI"],
        clue: "You might serve these with a sauce.",
        explanation:
          "Penne and rigatoni are tubes, fusilli are spirals, and farfalle resemble bows or butterflies.",
      },
      {
        id: "utensils",
        category: "Kitchen utensils",
        words: ["WHISK", "LADLE", "SPATULA", "TONGS"],
        clue: "Tools you hold while preparing or serving food.",
        explanation: "These utensils help you mix, serve, turn, or grip food.",
      },
      {
        id: "units",
        category: "Cooking measurements",
        words: ["CUP", "TEASPOON", "TABLESPOON", "OUNCE"],
        clue: "A recipe uses these to tell you how much.",
        explanation:
          "These are measurements used in recipes. An ounce may measure weight, while a fluid ounce measures volume; the recipe should make the distinction clear.",
      },
    ],
  },
];
