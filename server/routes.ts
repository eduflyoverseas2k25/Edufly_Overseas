import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertLeadSchema } from "@shared/schema";
import { initializeDatabase } from "./db";
import crypto from "crypto";

// Stateless token system - tokens are signed with SECRET and can be verified without storage
const TOKEN_SECRET = process.env.SESSION_SECRET || "default-secret-change-me";
const TOKEN_EXPIRY_HOURS = 24;

function generateToken(): string {
  const payload = {
    id: crypto.randomBytes(8).toString('hex'),
    exp: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
  };
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + signature;
}

function verifyToken(token: string): boolean {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return false;
    
    const data = Buffer.from(dataB64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('hex');
    
    if (signature !== expectedSig) return false;
    
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return false;
    
    return true;
  } catch {
    return false;
  }
}

async function seedDatabase() {
  const existingDestinations = await storage.getDestinations();
  if (existingDestinations.length === 0) {
    const ukDest = await storage.createDestination({
      name: "UK",
      slug: "uk",
      overview: "The United Kingdom offers world-class education with prestigious universities, rich history, and diverse cultural experiences for international students. From the ancient halls of Oxford and Cambridge to the vibrant streets of London, the UK provides an unparalleled academic environment combined with centuries of heritage and modern innovation.",
      duration: "7-14 Days",
      language: "English",
      studentExposure: "Global education, Cross-cultural exchange, Historical learning",
      academicVisits: "Oxford, Cambridge, Imperial College, British Museum",
      industryExposure: "Financial District, Tech Hubs, Creative Industries",
      sightseeing: "Big Ben, Tower Bridge, Buckingham Palace, Stonehenge",
      imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80"
    });

    const usaDest = await storage.createDestination({
      name: "USA",
      slug: "usa",
      overview: "The United States provides unparalleled educational opportunities with world-renowned universities, cutting-edge research facilities, and diverse campus experiences. From Silicon Valley's innovation hubs to Wall Street's financial centers, the USA offers students exposure to global leadership in technology, business, and culture.",
      duration: "10-14 Days",
      language: "English",
      studentExposure: "Innovation, Research, Multicultural exposure",
      academicVisits: "MIT, Harvard, Stanford, Silicon Valley companies",
      industryExposure: "Tech Giants, Wall Street, Hollywood Studios",
      sightseeing: "Statue of Liberty, Golden Gate Bridge, Grand Canyon",
      imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80"
    });

    const franceDest = await storage.createDestination({
      name: "France",
      slug: "france",
      overview: "France combines academic excellence with rich artistic heritage, offering students exposure to world-class cuisine, fashion, and cultural landmarks. Experience the romance of Paris, the art of the Louvre, and the innovation of top business schools in a country that has shaped global culture for centuries.",
      duration: "7-10 Days",
      language: "French, English",
      studentExposure: "Art, Culture, Gastronomy, Fashion",
      academicVisits: "Sorbonne, INSEAD, Le Cordon Bleu",
      industryExposure: "Fashion Houses, Culinary Schools, Art Museums",
      sightseeing: "Eiffel Tower, Louvre, Palace of Versailles",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80"
    });

    const switzerlandDest = await storage.createDestination({
      name: "Switzerland",
      slug: "switzerland",
      overview: "Switzerland is renowned for hospitality management education, precision engineering, and stunning Alpine landscapes that inspire learning. Home to some of the world's finest hospitality schools and research institutions, Switzerland offers a unique blend of natural beauty, innovation, and multicultural exposure.",
      duration: "7-10 Days",
      language: "German, French, Italian, English",
      studentExposure: "Hospitality, Precision Engineering, Banking",
      academicVisits: "EHL, ETH Zurich, CERN",
      industryExposure: "Swiss Banks, Watchmaking, Chocolate Industry",
      sightseeing: "Swiss Alps, Lake Geneva, Zurich Old Town",
      imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80"
    });

    const netherlandsDest = await storage.createDestination({
      name: "Netherlands",
      slug: "netherlands",
      overview: "The Netherlands offers innovative education in a progressive, multicultural environment with strong emphasis on sustainability and technology. Known for its design thinking, sustainable architecture, and cutting-edge agricultural innovation, the Netherlands provides a forward-looking educational experience.",
      duration: "5-7 Days",
      language: "Dutch, English",
      studentExposure: "Innovation, Sustainability, Design Thinking",
      academicVisits: "TU Delft, University of Amsterdam, Design Schools",
      industryExposure: "Tech Startups, Sustainable Architecture, Agriculture Innovation",
      sightseeing: "Amsterdam Canals, Windmills, Tulip Gardens",
      imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80"
    });

    const chinaDest = await storage.createDestination({
      name: "China",
      slug: "china",
      overview: "China presents a unique blend of ancient traditions and modern innovation, offering students insights into the world's fastest-growing economy. From the Great Wall to Shanghai's futuristic skyline, China provides an extraordinary journey through history and into the future of global business.",
      duration: "7-14 Days",
      language: "Mandarin, English",
      studentExposure: "Technology, Manufacturing, Ancient Culture",
      academicVisits: "Tsinghua University, Peking University, Tech Parks",
      industryExposure: "Manufacturing Hubs, Tech Companies, Traditional Crafts",
      sightseeing: "Great Wall, Forbidden City, Shanghai Skyline",
      imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80"
    });

    const singaporeDest = await storage.createDestination({
      name: "Singapore",
      slug: "singapore",
      overview: "Singapore is fast becoming a country of interest for teachers as a safe and interesting destination for student groups. Preferred by school students as well as those pursuing higher education, Singapore combines quality STEM experiences with history and culture, arts and adventure, technology with hospitality.",
      duration: "5-7 Days",
      language: "English, Mandarin, Malay, Tamil",
      studentExposure: "STEM experiences, History, Culture, Arts, Adventure, Technology, Hospitality",
      academicVisits: "Changi International Airport, Singapore Airshow (Engineering, Aviation, Management)",
      industryExposure: "Architecture tours (Zaha Hadid, Art Deco, Brutalist, Colonial styles)",
      sightseeing: "Sentosa Island, Universal Studios",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80"
    });

    const indiaDest = await storage.createDestination({
      name: "India",
      slug: "india",
      overview: "India is as diverse as the world wants it to be, for this is the land of colour, culture, food, Entrepreneurship and technology. For students and people from all walks of life, India offers something very unique. From the Taj Mahal to the tech hubs of Bangalore, India presents an incredible contrast of ancient wisdom and modern innovation.",
      duration: "7-10 Days",
      language: "Hindi, English, Regional Languages",
      studentExposure: "Culture, History, Entrepreneurship, Frugal Economy",
      academicVisits: "Startups, Tata Group companies, Dharavi (Entrepreneurial slum for management students)",
      industryExposure: "Traditional Music and Art",
      sightseeing: "Taj Mahal, Forts, Palaces, Temples, Mosques, Varanasi (Benares)",
      imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80"
    });

    // Seed Places for UK
    await storage.createDestinationPlace({
      destinationId: ukDest.id,
      name: "Tower of London",
      description: "Historic castle and fortress on the north bank of the River Thames. Home to the Crown Jewels and centuries of royal history.",
      imageUrl: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1564510714747-69c3bc1fab41?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: ukDest.id,
      name: "Big Ben & Parliament",
      description: "The iconic clock tower and Houses of Parliament, symbols of British democracy and architectural grandeur.",
      imageUrl: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: ukDest.id,
      name: "Oxford University",
      description: "One of the world's oldest and most prestigious universities, featuring stunning Gothic architecture.",
      imageUrl: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for USA
    await storage.createDestinationPlace({
      destinationId: usaDest.id,
      name: "Statue of Liberty",
      description: "The iconic symbol of freedom and democracy, welcoming visitors to New York Harbor since 1886.",
      imageUrl: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: usaDest.id,
      name: "Golden Gate Bridge",
      description: "San Francisco's famous Art Deco suspension bridge, an engineering marvel spanning the Golden Gate strait.",
      imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: usaDest.id,
      name: "Times Square",
      description: "The bustling heart of New York City, famous for its bright lights, Broadway theaters, and vibrant energy.",
      imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for France
    await storage.createDestinationPlace({
      destinationId: franceDest.id,
      name: "Eiffel Tower",
      description: "The iconic iron lattice tower, symbol of Paris and one of the most recognizable structures in the world.",
      imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: franceDest.id,
      name: "Louvre Museum",
      description: "The world's largest art museum, home to the Mona Lisa and countless masterpieces of human creativity.",
      imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: franceDest.id,
      name: "Palace of Versailles",
      description: "The magnificent royal palace showcasing the opulence of French monarchy and stunning gardens.",
      imageUrl: "https://images.unsplash.com/photo-1551410224-699683e15636?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1551410224-699683e15636?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for Switzerland
    await storage.createDestinationPlace({
      destinationId: switzerlandDest.id,
      name: "Swiss Alps",
      description: "Majestic mountain ranges offering breathtaking views, world-class skiing, and alpine adventures.",
      imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: switzerlandDest.id,
      name: "Lake Geneva",
      description: "One of Europe's largest lakes, surrounded by stunning scenery and historic towns.",
      imageUrl: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: switzerlandDest.id,
      name: "CERN",
      description: "The European Organization for Nuclear Research, home to the Large Hadron Collider.",
      imageUrl: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for Netherlands
    await storage.createDestinationPlace({
      destinationId: netherlandsDest.id,
      name: "Amsterdam Canals",
      description: "UNESCO World Heritage canal ring with beautiful bridges, historic buildings, and houseboats.",
      imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: netherlandsDest.id,
      name: "Keukenhof Gardens",
      description: "The world's largest flower garden, showcasing millions of tulips in spectacular displays.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: netherlandsDest.id,
      name: "Windmills of Kinderdijk",
      description: "Historic windmill complex, a UNESCO World Heritage Site representing Dutch water management.",
      imageUrl: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for China
    await storage.createDestinationPlace({
      destinationId: chinaDest.id,
      name: "Great Wall of China",
      description: "One of the greatest wonders of the world, stretching over 13,000 miles across China.",
      imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: chinaDest.id,
      name: "Forbidden City",
      description: "The imperial palace complex in Beijing, home to Chinese emperors for nearly 500 years.",
      imageUrl: "https://images.unsplash.com/photo-1584700617784-a0a30a0f4e8c?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1584700617784-a0a30a0f4e8c?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: chinaDest.id,
      name: "Shanghai Skyline",
      description: "The futuristic Pudong skyline featuring the Oriental Pearl Tower and modern skyscrapers.",
      imageUrl: "https://images.unsplash.com/photo-1545893835-abaa50cbe628?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1545893835-abaa50cbe628?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for Singapore
    await storage.createDestinationPlace({
      destinationId: singaporeDest.id,
      name: "Marina Bay Sands",
      description: "Iconic integrated resort featuring the world-famous rooftop infinity pool and stunning architecture.",
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: singaporeDest.id,
      name: "Gardens by the Bay",
      description: "Futuristic nature park featuring the iconic Supertree Grove and climate-controlled conservatories.",
      imageUrl: "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: singaporeDest.id,
      name: "Sentosa Island",
      description: "Resort island featuring Universal Studios, beaches, and world-class attractions.",
      imageUrl: "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80"
      ]
    });

    // Seed Places for India
    await storage.createDestinationPlace({
      destinationId: indiaDest.id,
      name: "Taj Mahal",
      description: "The magnificent white marble mausoleum, one of the Seven Wonders of the World.",
      imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: indiaDest.id,
      name: "Jaipur Pink City",
      description: "The royal capital of Rajasthan, famous for its pink-hued buildings and majestic palaces.",
      imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80"
      ]
    });
    await storage.createDestinationPlace({
      destinationId: indiaDest.id,
      name: "Varanasi Ghats",
      description: "The spiritual heart of India, where ancient rituals take place along the sacred Ganges River.",
      imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80"
      ]
    });
  } else {
    // Destinations exist, but check if places need to be seeded
    for (const dest of existingDestinations) {
      const existingPlaces = await storage.getPlacesByDestinationId(dest.id);
      if (existingPlaces.length === 0) {
        // Seed places for this destination based on its slug
        const placesData: Record<string, Array<{name: string, description: string, imageUrl: string, galleryImages: string[]}>> = {
          uk: [
            { name: "Tower of London", description: "Historic castle and fortress on the north bank of the River Thames. Home to the Crown Jewels and centuries of royal history.", imageUrl: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1564510714747-69c3bc1fab41?auto=format&fit=crop&q=80"] },
            { name: "Big Ben & Parliament", description: "The iconic clock tower and Houses of Parliament, symbols of British democracy and architectural grandeur.", imageUrl: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80"] },
            { name: "Oxford University", description: "One of the world's oldest and most prestigious universities, featuring stunning Gothic architecture.", imageUrl: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&q=80"] }
          ],
          usa: [
            { name: "Statue of Liberty", description: "The iconic symbol of freedom and democracy, welcoming visitors to New York Harbor since 1886.", imageUrl: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&q=80"] },
            { name: "Golden Gate Bridge", description: "San Francisco's famous Art Deco suspension bridge, an engineering marvel spanning the Golden Gate strait.", imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80"] },
            { name: "Times Square", description: "The bustling heart of New York City, famous for its bright lights, Broadway theaters, and vibrant energy.", imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80"] }
          ],
          france: [
            { name: "Eiffel Tower", description: "The iconic iron lattice tower, symbol of Paris and one of the most recognizable structures in the world.", imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80"] },
            { name: "Louvre Museum", description: "The world's largest art museum, home to the Mona Lisa and countless masterpieces of human creativity.", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80"] },
            { name: "Palace of Versailles", description: "The magnificent royal palace showcasing the opulence of French monarchy and stunning gardens.", imageUrl: "https://images.unsplash.com/photo-1551410224-699683e15636?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1551410224-699683e15636?auto=format&fit=crop&q=80"] }
          ],
          switzerland: [
            { name: "Swiss Alps", description: "Majestic mountain range offering breathtaking views and world-class skiing experiences.", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80"] },
            { name: "Lake Geneva", description: "One of Europe's largest lakes, surrounded by stunning Alpine scenery and charming lakeside towns.", imageUrl: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&q=80"] },
            { name: "CERN", description: "The world's largest particle physics laboratory, home to the Large Hadron Collider.", imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80"] }
          ],
          netherlands: [
            { name: "Amsterdam Canals", description: "The iconic waterways of Amsterdam, lined with historic buildings and charming houseboats.", imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80"] },
            { name: "Keukenhof Gardens", description: "The world's largest flower garden, showcasing millions of tulips in spectacular displays.", imageUrl: "https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?auto=format&fit=crop&q=80"] },
            { name: "Windmills of Kinderdijk", description: "UNESCO World Heritage site featuring 19 historic windmills in a beautiful polder landscape.", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80"] }
          ],
          china: [
            { name: "Great Wall of China", description: "The iconic ancient fortification stretching thousands of kilometers across northern China.", imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80"] },
            { name: "Forbidden City", description: "The imperial palace complex in Beijing, home to Chinese emperors for nearly 500 years.", imageUrl: "https://images.unsplash.com/photo-1584952368632-4a14c9f4ecfd?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1584952368632-4a14c9f4ecfd?auto=format&fit=crop&q=80"] },
            { name: "Shanghai Skyline", description: "The futuristic skyline of Pudong, showcasing China's modern economic powerhouse.", imageUrl: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&q=80"] }
          ],
          singapore: [
            { name: "Marina Bay Sands", description: "Iconic integrated resort featuring the world-famous rooftop infinity pool and stunning architecture.", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80"] },
            { name: "Gardens by the Bay", description: "Futuristic nature park featuring the iconic Supertree Grove and climate-controlled conservatories.", imageUrl: "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&q=80"] },
            { name: "Sentosa Island", description: "Resort island featuring Universal Studios, beaches, and world-class attractions.", imageUrl: "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80"] }
          ],
          india: [
            { name: "Taj Mahal", description: "The magnificent white marble mausoleum, one of the Seven Wonders of the World.", imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80"] },
            { name: "Jaipur Pink City", description: "The royal capital of Rajasthan, famous for its pink-hued buildings and majestic palaces.", imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80"] },
            { name: "Varanasi Ghats", description: "The spiritual heart of India, where ancient rituals take place along the sacred Ganges River.", imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80", galleryImages: ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80"] }
          ]
        };
        
        const places = placesData[dest.slug];
        if (places) {
          for (const place of places) {
            await storage.createDestinationPlace({
              destinationId: dest.id,
              ...place
            });
          }
          console.log(`Seeded places for ${dest.name}`);
        }
      }
    }
  }

  const existingPrograms = await storage.getPrograms();
  if (existingPrograms.length === 0) {
    const programs = [
      { title: "School Student Exchange", category: "School Students", description: "Cultural and academic exchange programs for school students." },
      { title: "Engineering & Tech Tours", category: "Engineering & Technology", description: "Visits to top engineering firms and tech hubs." },
      { title: "Medical Internships", category: "Medicine & Health Sciences", description: "Observation and learning in world-class hospitals." },
      { title: "Culinary Arts Workshop", category: "Hospitality & Culinary", description: "Hands-on cooking and hospitality management training." },
      { title: "Architectural Wonders", category: "Architecture & Design", description: "Study tours of iconic architectural landmarks." },
      { title: "Global Business Management", category: "Management & Business", description: "Corporate visits and management seminars." },
      { title: "International Law Seminar", category: "Law", description: "Insights into international legal systems and courts." },
      { title: "Music & Arts Appreciation", category: "Arts & Music", description: "Exploration of global art scenes and musical heritage." },
    ];

    for (const prog of programs) {
      await storage.createProgram({
        ...prog,
        imageUrl: `https://source.unsplash.com/800x600/?${prog.category.split(' ')[0].toLowerCase()}`
      });
    }
  }

  const existingTestimonials = await storage.getTestimonials();
  if (existingTestimonials.length === 0) {
    await storage.createTestimonial({
      name: "Arjun Mehta",
      role: "Student",
      content: "The trip to Singapore was an eye-opener! Visiting the Airshow was a dream come true.",
      imageUrl: "https://randomuser.me/api/portraits/men/1.jpg"
    });
    await storage.createTestimonial({
      name: "Sarah Jenkins",
      role: "Parent",
      content: "Edufly organized everything perfectly. My daughter had a safe and enriching experience in the UK.",
      imageUrl: "https://randomuser.me/api/portraits/women/2.jpg"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize database tables (creates them if they don't exist)
  await initializeDatabase();
  
  // Trust proxy for Render deployment
  app.set('trust proxy', 1);

  // Stateless token-based auth middleware (no cookies, no storage needed!)
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token && verifyToken(token)) {
      next();
    } else {
      console.log(`[Auth] Access denied - token: ${token ? 'invalid/expired' : 'missing'}`);
      res.status(401).json({ message: "Access denied. Please login." });
    }
  };

  // Leads
  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(input);
      console.log("New Lead Created:", lead);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Destinations
  app.get(api.destinations.list.path, async (req, res) => {
    const destinations = await storage.getDestinations();
    res.json(destinations);
  });

  app.get(api.destinations.get.path, async (req, res) => {
    const destination = await storage.getDestinationBySlug(req.params.slug);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
  });

  // Destination Places
  app.get("/api/destinations/:id/places", async (req, res) => {
    const destinationId = parseInt(req.params.id);
    if (isNaN(destinationId)) {
      return res.status(400).json({ message: "Invalid destination ID" });
    }
    const places = await storage.getPlacesByDestinationId(destinationId);
    res.json(places);
  });

  // Programs
  app.get(api.programs.list.path, async (req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  // Testimonials
  app.get(api.testimonials.list.path, async (req, res) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });

  // Gallery
  app.get(api.gallery.list.path, async (req, res) => {
    const gallery = await storage.getGallery();
    res.json(gallery);
  });

  // Admin Auth - stateless signed tokens (survives server restarts!)
  app.post(api.admin.login.path, async (req, res) => {
    const { username, password } = req.body;
    const adminUser = (process.env.ADMIN_USER || "admin").trim();
    const adminPass = (process.env.ADMIN_PASS || "admin").trim();
    
    console.log(`[Auth] Login attempt for user: "${username}"`);
    
    if (username?.trim() === adminUser && password === adminPass) {
      const token = generateToken();
      console.log(`[Auth] Login successful, signed token generated`);
      res.json({ token, message: "Login successful" });
    } else {
      console.log(`[Auth] Login failed`);
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Admin Logout (just clears client-side, token will expire naturally)
  app.post("/api/admin/logout", (req, res) => {
    res.json({ message: "Logged out" });
  });

  // Admin Check Auth (verifies token signature and expiry)
  app.get("/api/admin/check-auth", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (token && verifyToken(token)) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Admin Leads (Protected)
  app.get(api.admin.leadsList.path, requireAdmin, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.patch("/api/admin/leads/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const lead = await storage.updateLeadStatus(id, status);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  });

  app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteLead(id);
    if (!deleted) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted" });
  });

  // Admin Destinations (Protected)
  app.get("/api/admin/destinations", requireAdmin, async (req, res) => {
    const destinations = await storage.getDestinations();
    res.json(destinations);
  });

  app.post("/api/admin/destinations", requireAdmin, async (req, res) => {
    try {
      const destination = await storage.createDestination(req.body);
      res.status(201).json(destination);
    } catch (err) {
      res.status(400).json({ message: "Failed to create destination" });
    }
  });

  app.put("/api/admin/destinations/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const destination = await storage.updateDestination(id, req.body);
    if (!destination) return res.status(404).json({ message: "Destination not found" });
    res.json(destination);
  });

  app.delete("/api/admin/destinations/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteDestination(id);
    if (!deleted) return res.status(404).json({ message: "Destination not found" });
    res.json({ message: "Destination deleted" });
  });

  // Admin Programs (Protected)
  app.get("/api/admin/programs", requireAdmin, async (req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  app.post("/api/admin/programs", requireAdmin, async (req, res) => {
    try {
      const program = await storage.createProgram(req.body);
      res.status(201).json(program);
    } catch (err) {
      res.status(400).json({ message: "Failed to create program" });
    }
  });

  app.put("/api/admin/programs/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const program = await storage.updateProgram(id, req.body);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  });

  app.delete("/api/admin/programs/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProgram(id);
    if (!deleted) return res.status(404).json({ message: "Program not found" });
    res.json({ message: "Program deleted" });
  });

  // Admin Places (Protected)
  app.get("/api/admin/destinations/:destId/places", requireAdmin, async (req, res) => {
    const destId = parseInt(req.params.destId);
    const places = await storage.getPlacesByDestinationId(destId);
    res.json(places);
  });

  app.post("/api/admin/places", requireAdmin, async (req, res) => {
    try {
      const place = await storage.createDestinationPlace(req.body);
      res.status(201).json(place);
    } catch (err) {
      res.status(400).json({ message: "Failed to create place" });
    }
  });

  app.put("/api/admin/places/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const place = await storage.updateDestinationPlace(id, req.body);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  });

  app.delete("/api/admin/places/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteDestinationPlace(id);
    if (!deleted) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Place deleted" });
  });

  // Admin Gallery (Protected)
  app.get("/api/admin/gallery", requireAdmin, async (req, res) => {
    const galleryItems = await storage.getGallery();
    res.json(galleryItems);
  });

  app.post("/api/admin/gallery", requireAdmin, async (req, res) => {
    try {
      const item = await storage.createGalleryItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Failed to create gallery item" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteGalleryItem(id);
    if (!deleted) return res.status(404).json({ message: "Gallery item not found" });
    res.json({ message: "Gallery item deleted" });
  });

  // Admin Testimonials (Protected)
  app.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
    const testimonials = await storage.getTestimonials();
    res.json(testimonials);
  });

  app.post("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.status(201).json(testimonial);
    } catch (err) {
      res.status(400).json({ message: "Failed to create testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTestimonial(id);
    if (!deleted) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Testimonial deleted" });
  });

  // Site Settings (Public - for frontend theme)
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  });

  // Admin Site Settings (Protected)
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Apply Theme Preset (Protected)
  app.post("/api/admin/settings/apply-theme", requireAdmin, async (req, res) => {
    try {
      const { themeKey } = req.body;
      if (!themeKey) {
        return res.status(400).json({ message: "Theme key is required" });
      }
      
      const { getThemeByKey } = await import("@shared/themes");
      const theme = getThemeByKey(themeKey);
      
      if (!theme) {
        return res.status(400).json({ message: "Invalid theme key" });
      }
      
      const settings = await storage.updateSiteSettings({
        themeKey: theme.key,
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        accentColor: theme.colors.accent,
        textColor: theme.colors.text,
        heroStyle: theme.hero.style,
        heroGradientFrom: theme.hero.gradientFrom,
        heroGradientVia: theme.hero.gradientVia,
        heroGradientTo: theme.hero.gradientTo,
        heroImageUrl: theme.hero.imageUrl || null,
        heroOverlayColor: theme.hero.overlayColor || null,
      });
      
      res.json(settings);
    } catch (err) {
      console.error("Apply theme error:", err);
      res.status(400).json({ message: "Failed to apply theme" });
    }
  });

  // Seed data on startup
  await seedDatabase();

  return httpServer;
}
