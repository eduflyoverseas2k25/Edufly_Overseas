export interface Program {
  id: string;
  name: string;
  title: string;
  duration: string;
  eligibility: string;
  price: number;
  currency: string;
  description: string;
  brochureUrl?: string;
  highlights: string[];
  includes: string[];
}

export interface KnowledgeBase {
  programs: Program[];
  destinations: Array<{
    name: string;
    description: string;
    highlights: string[];
  }>;
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const sarahKnowledge: KnowledgeBase = {
  programs: [
    {
      id: "nasa-trip",
      name: "NASA Trip",
      title: "NASA Space Center Experience - USA",
      duration: "10 Days",
      eligibility: "Students Grade 8-12",
      price: 350000,
      currency: "INR",
      description: "An immersive journey to NASA Space Centers, Kennedy Space Center, and SpaceX facilities. Experience rocket launches, meet astronauts, and explore the future of space exploration.",
      brochureUrl: "/brochures/nasa-trip-2026.pdf",
      highlights: [
        "Visit NASA Kennedy Space Center",
        "Tour SpaceX Facilities",
        "Meet NASA Scientists and Astronauts",
        "Witness Rocket Launch (subject to schedule)",
        "Space Shuttle Atlantis Experience",
        "STEM Workshops and Activities"
      ],
      includes: [
        "International Flights",
        "Accommodation (4-star hotels)",
        "All Meals",
        "Entry Tickets",
        "Travel Insurance",
        "Tour Guide"
      ]
    },
    {
      id: "uk-oxford-cambridge",
      name: "UK Universities Tour",
      title: "Oxford & Cambridge Universities - UK",
      duration: "12 Days",
      eligibility: "Students Grade 10-12",
      price: 280000,
      currency: "INR",
      description: "Explore the prestigious universities of Oxford and Cambridge. Attend lectures, visit historic colleges, and experience British academic culture.",
      highlights: [
        "Oxford University Tour",
        "Cambridge University Campus",
        "British Museum Visit",
        "Harry Potter Studio Tour",
        "Interactive University Sessions"
      ],
      includes: [
        "International Flights",
        "Accommodation",
        "All Meals",
        "Entry Tickets",
        "Travel Insurance"
      ]
    }
  ],

  destinations: [
    {
      name: "Singapore",
      description: "Safe and innovative destination combining STEM experiences with culture and adventure.",
      highlights: ["Gardens by the Bay", "Universal Studios", "Science Centre"]
    },
    {
      name: "United States",
      description: "Home to world-class universities and innovation hubs like Silicon Valley.",
      highlights: ["MIT", "Harvard", "NASA", "Silicon Valley"]
    },
    {
      name: "United Kingdom",
      description: "Historic universities and centuries of academic tradition.",
      highlights: ["Oxford", "Cambridge", "British Museum", "London"]
    }
  ],

  contact: {
    phone: "9094550551 / 9842223864",
    email: "eduflyoverseasindia@gmail.com",
    address: "NO 122 G ENAIKARAN STREET, KANCHIPURAM 631502",
    whatsapp: "919094550551"
  },

  faqs: [
    {
      question: "What is included in the tour package?",
      answer: "Our packages include international flights, accommodation, meals, entry tickets, travel insurance, and an experienced tour guide."
    },
    {
      question: "Is travel insurance included?",
      answer: "Yes, comprehensive travel insurance is included in all our tour packages."
    },
    {
      question: "What is the payment process?",
      answer: "You can make payments online via Razorpay. We accept credit/debit cards, UPI, and net banking."
    },
    {
      question: "Can I get a refund if I cancel?",
      answer: "Refund policies vary by program. Please contact us for specific cancellation terms."
    },
    {
      question: "What safety measures do you have?",
      answer: "Safety is our top priority. We have 24/7 support, experienced guides, comprehensive insurance, and follow all safety protocols."
    }
  ]
};

// Intent matching keywords
export const intentKeywords = {
  nasa: ["nasa", "space", "rocket", "astronaut", "kennedy"],
  uk: ["uk", "oxford", "cambridge", "england", "britain", "london"],
  price: ["price", "cost", "fee", "amount", "how much"],
  duration: ["duration", "days", "how long", "time"],
  eligibility: ["eligible", "age", "grade", "class", "who can"],
  payment: ["pay", "payment", "razorpay", "card"],
  contact: ["contact", "phone", "email", "address", "whatsapp"],
  safety: ["safe", "safety", "secure", "insurance"]
};
