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
  destinations: string[];
  services: string[];
  aboutUs: string;
  whyChooseUs: string[];
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
  websiteInfo: {
    navigation: string[];
    features: string[];
  };
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

  destinations: [
    "United States (NASA Tour)",
    "Singapore",
    "United Kingdom", 
    "India",
    "France",
    "Australia",
    "Germany",
    "Canada",
    "Netherlands",
    "Switzerland"
  ],

  services: [
    "Educational Tours & Study Abroad Programs",
    "University Counseling",
    "Program Customization",
    "Complete Travel Arrangements",
    "24/7 Support During Tours",
    "Safety & Insurance Coverage"
  ],

  aboutUs: "Edufly Overseas is a premier international education consultancy dedicated to helping students achieve their dreams of studying abroad and experiencing global educational tours. We specialize in organizing safe, educational, and fun-filled tours for schools, colleges, and universities.",

  whyChooseUs: [
    "Expert Planning & Execution",
    "Safety-First Approach",
    "Experienced Tour Guides",
    "Comprehensive Insurance",
    "Customized Itineraries",
    "24/7 Support",
    "Trusted by Educational Institutions"
  ],

  contact: {
    phone: "9094550551 / 9842223864",
    email: "eduflyoverseasindia@gmail.com",
    address: "NO 122 G ENAIKARAN STREET, KANCHIPURAM 631502",
    whatsapp: "919094550551"
  },

  faqs: [
    {
      question: "What destinations do you offer?",
      answer: "We offer educational tours to USA (NASA program), Singapore, UK, India, France, Australia, Germany, Canada, Netherlands, and Switzerland. Each destination features unique educational experiences."
    },
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
    },
    {
      question: "How can I contact you?",
      answer: "You can reach us at 9094550551, email us at eduflyoverseasindia@gmail.com, or chat with me on WhatsApp. Our office is in Kanchipuram."
    },
    {
      question: "Do you customize tours for schools?",
      answer: "Yes! We specialize in customizing educational tours for schools, colleges, and universities based on your specific requirements and curriculum needs."
    },
    {
      question: "What age groups do you cater to?",
      answer: "We organize tours for students from Grade 8 to university level, with programs tailored to different age groups and educational needs."
    }
  ],

  websiteInfo: {
    navigation: [
      "Home - Overview of our services",
      "About Us - Our story and mission",
      "Destinations - Explore all countries we offer",
      "Programs - Educational tour programs",
      "Gallery - Photos from past tours",
      "Contact - Get in touch with us"
    ],
    features: [
      "Browse destinations by country",
      "View detailed program information",
      "See testimonials from past students",
      "Download tour brochures",
      "Make secure online payments",
      "Chat with Sarah for instant help"
    ]
  }
};
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
