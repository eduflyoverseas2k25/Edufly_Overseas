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
      id: "nasa-stem-tour",
      name: "NASA STEM Educational Tour",
      title: "NASA STEM Educational Tour - USA",
      duration: "10 Days",
      eligibility: "Students Grade 8-12",
      price: 350000,
      currency: "INR",
      description: "An immersive journey to NASA Space Centers, Kennedy Space Center, and SpaceX facilities. Experience rocket launches, meet astronauts, and explore the future of space exploration.",
      brochureUrl: "https://customer-assets.emergentagent.com/job_code-audit-50/artifacts/u657utzs_USA%20STEM%20Programme.pdf",
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
      answer: "You can make payments online via Razorpay. We accept credit/debit cards, UPI, and net banking. Both full payment and part payment options are available."
    },
    {
      question: "Can I pay in installments?",
      answer: "Yes, we offer part payment options. You can secure your seat with a partial payment and complete the remaining amount later."
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
  price: ["price", "cost", "fee", "amount", "how much"],
  duration: ["duration", "days", "how long", "time"],
  eligibility: ["eligible", "age", "grade", "class", "who can"],
  payment: ["pay", "payment", "razorpay", "card"],
  contact: ["contact", "phone", "email", "address", "whatsapp"],
  safety: ["safe", "safety", "secure", "insurance"]
};
