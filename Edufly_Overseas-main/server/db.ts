import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  console.log("Initializing database tables...");
  
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      purpose TEXT NOT NULL,
      amount INTEGER,
      status TEXT DEFAULT 'pending',
      gateway TEXT,
      transaction_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS destinations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      overview TEXT NOT NULL,
      duration TEXT,
      language TEXT,
      student_exposure TEXT,
      academic_visits TEXT,
      industry_exposure TEXT,
      sightseeing TEXT,
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS programs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      content TEXT NOT NULL,
      image_url TEXT
    );
    
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      title TEXT,
      image_url TEXT NOT NULL,
      category TEXT
    );
    
    CREATE TABLE IF NOT EXISTS destination_places (
      id SERIAL PRIMARY KEY,
      destination_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      short_description TEXT,
      description TEXT,
      culture TEXT,
      history TEXT,
      image_url TEXT NOT NULL,
      gallery_images TEXT[]
    );
    
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      theme_key TEXT DEFAULT 'dark',
      primary_color TEXT DEFAULT '#ef6e2d',
      secondary_color TEXT DEFAULT '#fdc22c',
      accent_color TEXT DEFAULT '#178ab6',
      text_color TEXT DEFAULT '#1e293b',
      hero_style TEXT DEFAULT 'dark',
      hero_gradient_from TEXT DEFAULT '#1e293b',
      hero_gradient_via TEXT DEFAULT '#334155',
      hero_gradient_to TEXT DEFAULT '#475569',
      hero_image_url TEXT,
      hero_overlay_color TEXT DEFAULT 'rgba(30, 41, 59, 0.95)',
      hero_headline TEXT DEFAULT 'Start Here. Go Anywhere.',
      hero_subtext TEXT DEFAULT 'We guide you through every step of your international education journey, from university selection to visa approval.',
      hero_badge_text TEXT DEFAULT 'Your Gateway to Global Education',
      hero_button_primary TEXT DEFAULT 'Explore Destinations',
      hero_button_secondary TEXT DEFAULT 'Learn More',
      contact_phone TEXT DEFAULT '9094550551 / 9842223864',
      contact_email TEXT DEFAULT 'eduflyoverseasindia@gmail.com',
      contact_address TEXT DEFAULT 'NO 122 G ENAIKARAN STREET, KANCHIPURAM 631502',
      footer_tagline TEXT DEFAULT 'Your trusted partner for educational travel and study tours.',
      about_intro TEXT DEFAULT 'Travel is a university in itself. We at Edufly Overseas collaborate with schools, colleges and universities to deliver well planned and outcome based educational tours. Our expertise in planning and executing safe, educational and fun-filled tours have made us a trusted name in the industry.'
    );
    
    -- Add missing columns for destination_places
    DO $$ 
    BEGIN
      ALTER TABLE destination_places ADD COLUMN IF NOT EXISTS slug TEXT;
      ALTER TABLE destination_places ADD COLUMN IF NOT EXISTS short_description TEXT;
      ALTER TABLE destination_places ADD COLUMN IF NOT EXISTS culture TEXT;
      ALTER TABLE destination_places ADD COLUMN IF NOT EXISTS history TEXT;
      ALTER TABLE destination_places ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
    EXCEPTION WHEN others THEN NULL;
    END $$;
    
    -- Update slug for existing places without slug
    UPDATE destination_places SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
    
    INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  `;
  
  try {
    await pool.query(createTablesSQL);
    console.log("Database tables initialized successfully");
    
    // Seed default destinations and places
    await seedDestinationsAndPlaces();
    
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

async function seedDestinationsAndPlaces() {
  try {
    // Check if destinations exist
    const existingDestinations = await pool.query('SELECT COUNT(*) FROM destinations');
    if (parseInt(existingDestinations.rows[0].count) > 0) {
      console.log("Destinations already seeded, skipping...");
      return;
    }
    
    console.log("Seeding destinations and places...");
    
    // Singapore
    const singaporeResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Singapore',
        'singapore',
        'Singapore is fast becoming a country of interest for teachers as a safe and interesting destination for student groups. Preferred by school students as well as those pursuing higher education, Singapore combines quality STEM experiences with history and culture, arts and adventure, technology with hospitality.',
        '5-7 days',
        'English, Mandarin, Malay, Tamil',
        'World-class universities, innovation hubs, and research centers',
        'NUS, NTU, Singapore Polytechnic, Science Centre',
        'Changi Airport, Marina Bay Sands, tech startups',
        'Gardens by the Bay, Sentosa Island, Universal Studios',
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'
      ) RETURNING id
    `);
    const singaporeId = singaporeResult.rows[0].id;
    
    // Singapore places - all major attractions
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Marina Bay Sands', 'marina-bay-sands', 'Iconic architectural masterpiece',
       'An integrated resort featuring a stunning hotel, casino, convention center, and the famous infinity pool. Award-winning architects have made Singapore their playground, and Marina Bay Sands stands as a testament to modern architectural innovation.',
       'A symbol of modern Singapore and its ambitions. Special for you: Visit the SkyPark observation deck for 360-degree views of the city skyline.',
       'Designed by Moshe Safdie and opened in 2010, this $8 billion development transformed Singapore''s skyline. The three 55-story towers connected by a 1-hectare rooftop park demonstrate cutting-edge engineering.',
       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'),
      ($1, 'Gardens by the Bay', 'gardens-by-the-bay', 'Futuristic nature park',
       'A stunning nature park spanning 101 hectares featuring the iconic Supertree Grove, Cloud Forest, and Flower Dome. A perfect blend of nature and technology showcasing sustainable architecture.',
       'Singapore''s vision of a City in a Garden comes alive here. Special for you: The light show at Supertree Grove every evening is mesmerizing.',
       'Opened in 2012, the Supertrees were designed to mimic the function of real trees, collecting rainwater and generating solar power. The Cloud Forest houses the world''s tallest indoor waterfall.',
       'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800'),
      ($1, 'Sentosa Island', 'sentosa-island', 'Entertainment and leisure destination',
       'Sentosa Island offers beaches, theme parks, resorts, and educational attractions. Universal Studios Singapore, Adventure Cove, and S.E.A. Aquarium make it perfect for student groups.',
       'Combines entertainment with education seamlessly. Special for you: Universal Studios offers thrilling rides based on your favorite movies.',
       'Originally called Pulau Blakang Mati, it was a British military fortress. Transformed into a resort island in 1972 and renamed Sentosa, meaning "peace and tranquility" in Malay.',
       'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800'),
      ($1, 'Merlion', 'merlion', 'Symbol of Singapore',
       'The Merlion is Singapore''s iconic mascot, a mythical creature with a lion''s head and fish body. Standing at the waterfront, it has become the most recognizable symbol of the nation.',
       'Represents Singapore''s origins as a fishing village and its name, derived from Sanskrit words meaning "Lion City." Special for you: The perfect photo spot with the city skyline behind.',
       'Designed in 1964 by Fraser Brunner for the Singapore Tourism Board. The original sculpture at Merlion Park was unveiled in 1972. The Merlion appears on coins, emblems, and souvenirs.',
       'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800'),
      ($1, 'Universal Studios Singapore', 'universal-studios-singapore', 'Hollywood in Southeast Asia',
       'Universal Studios Singapore is Southeast Asia''s first and only Universal theme park. With 24 rides, shows, and attractions in seven themed zones, it brings Hollywood magic to life.',
       'Hollywood movies become reality here. Special for you: Ride the Transformers: The Ride 3D and experience Battlestar Galactica dueling coasters.',
       'Opened in 2010 as part of Resorts World Sentosa. It features attractions based on Shrek, Madagascar, Jurassic Park, and Transformers. The park attracts over 4 million visitors annually.',
       'https://images.unsplash.com/photo-1609840053826-1c44b7c15295?w=800'),
      ($1, 'Night Safari', 'night-safari', 'World''s first nocturnal zoo',
       'The Night Safari is the world''s first nocturnal zoo, home to over 2,500 animals from 130 species. Explore wildlife in their natural nighttime habitats through walking trails and tram rides.',
       'A unique way to experience wildlife after dark. Special for you: The tram ride through different geographic zones offers close encounters with animals.',
       'Opened in 1994 as a project of the Singapore Zoo. It has won numerous awards and is recognized as a world leader in animal welfare and conservation.',
       'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800'),
      ($1, 'Orchard Road', 'orchard-road', 'Premier shopping boulevard',
       'Orchard Road is Singapore''s premier shopping destination, stretching 2.2 kilometers with malls, department stores, and boutiques. From luxury brands to street food, it offers everything.',
       'The heart of Singapore''s retail scene. Special for you: Visit ION Orchard and Ngee Ann City for world-class shopping and dining.',
       'Named after the fruit orchards and nutmeg plantations that once lined the road. Transformed into a shopping district in the 1970s, it now hosts the world''s best brands.',
       'https://images.unsplash.com/photo-1562816431-68f55fb19e1e?w=800'),
      ($1, 'Singapore Zoo', 'singapore-zoo', 'Open-concept wildlife park',
       'The Singapore Zoo is a world-renowned open-concept zoo spanning 28 hectares. Home to over 2,800 animals from 300 species, it offers natural enclosures that blur the line between visitors and wildlife.',
       'Consistently ranked among the best zoos in the world. Special for you: Breakfast with orangutans is an unforgettable experience.',
       'Opened in 1973, it pioneered the open-concept design. The zoo focuses on conservation and has successful breeding programs for endangered species.',
       'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800'),
      ($1, 'Jurong Bird Park', 'jurong-bird-park', 'Asia''s largest bird paradise',
       'Jurong Bird Park, now relocated to Mandai Wildlife Reserve as Bird Paradise, is Asia''s largest bird park with over 5,000 birds from 400 species in naturalistic habitats.',
       'A paradise for bird lovers and nature enthusiasts. Special for you: The Penguin Cove and flamingo lake are highlights.',
       'Originally opened in 1971, it was one of the first attractions developed for tourism. The new Bird Paradise opened in 2023 with immersive walk-through aviaries.',
       'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800'),
      ($1, 'Little India', 'little-india', 'Vibrant cultural enclave',
       'Little India is a vibrant neighborhood bursting with colors, aromas, and sounds. Explore traditional shops, temples, and authentic Indian cuisine in this cultural treasure.',
       'Singapore''s Indian heritage on full display. Special for you: Visit during Deepavali for spectacular lights and celebrations.',
       'The area has been associated with the Indian community since the early days of colonial Singapore. Cattle trade and brick kilns attracted Indian workers who settled here.',
       'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800')
    `, [singaporeId]);
    
    // India
    const indiaResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'India',
        'india',
        'India is as diverse as the world wants it to be, for this is the land of colour, culture, food, entrepreneurship and technology. For students and people from all walks of life, India offers something very unique. Even the legendary Steve Jobs came to India during his college days, had a cultural tour and inspired he went back and made history.',
        '7-14 days',
        'Hindi, English, and 22 official languages',
        'IITs, IIMs, startup ecosystem, ancient universities',
        'IIT Delhi, IIM Ahmedabad, ISRO, Nalanda ruins',
        'Tata Group, Infosys, Dharavi entrepreneurs',
        'Taj Mahal, Varanasi, Jaipur, Kerala backwaters',
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'
      ) RETURNING id
    `);
    const indiaId = indiaResult.rows[0].id;
    
    // India places - all major attractions
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Gateway of India', 'gateway-of-india', 'Mumbai''s iconic monument',
       'The Gateway of India stands majestically on the waterfront of Mumbai Harbor. This grand arch was built to commemorate the landing of King George V and Queen Mary in 1911.',
       'A symbol of Mumbai''s colonial heritage and modern aspirations. Special for you: Take a ferry to Elephanta Caves for stunning views of the Gateway from the sea.',
       'Built in Indo-Saracenic style, the gateway was completed in 1924. The last British troops departed from India through this gate in 1948, marking the end of colonial rule.',
       'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'),
      ($1, 'India Gate', 'india-gate', 'New Delhi''s war memorial',
       'India Gate is a war memorial located in the heart of New Delhi. This 42-meter high sandstone arch commemorates the 70,000 Indian soldiers who died in World War I.',
       'The Amar Jawan Jyoti (eternal flame) burns here in honor of fallen soldiers. Special for you: Evening visits offer a beautiful view when the gate is illuminated.',
       'Designed by Edwin Lutyens and completed in 1931. Originally called the All India War Memorial. It now stands as a symbol of national pride and sacrifice.',
       'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'),
      ($1, 'Dharamshala-Dalhousie', 'dharamshala-dalhousie', 'Himalayan hill stations',
       'Dharamshala, home to the Dalai Lama, and nearby Dalhousie offer stunning Himalayan views, Tibetan culture, and colonial architecture. Perfect for spiritual and nature experiences.',
       'Tibetan Buddhism thrives in Dharamshala. Special for you: Visit the Tsuglagkhang Complex and McLeod Ganj for authentic Tibetan experiences.',
       'Dharamshala became the seat of the Tibetan government-in-exile in 1960. Dalhousie, named after Lord Dalhousie, was established as a summer retreat by the British.',
       'https://images.unsplash.com/photo-1524613032530-449a5d94c285?w=800'),
      ($1, 'Jim Corbett National Park', 'jim-corbett', 'India''s oldest national park',
       'Jim Corbett National Park is India''s first and oldest national park, established in 1936. Home to Bengal tigers, elephants, and diverse wildlife in the Himalayan foothills.',
       'Named after the legendary hunter-turned-conservationist Jim Corbett. Special for you: Jeep safaris offer chances to spot tigers in their natural habitat.',
       'Originally called Hailey National Park, it was renamed after Jim Corbett in 1956. The park is part of Project Tiger and has been crucial for tiger conservation in India.',
       'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800'),
      ($1, 'Taj Mahal', 'taj-mahal', 'Iconic monument of eternal love',
       'The Taj Mahal is one of the most beautiful buildings ever created. This UNESCO World Heritage Site is a masterpiece of Mughal architecture and a symbol of eternal love.',
       'The pinnacle of Mughal architecture, blending Persian, Islamic, and Indian styles. Special for you: Visit at sunrise to see the marble change colors dramatically.',
       'Built between 1632-1653 by Emperor Shah Jahan for his wife Mumtaz Mahal. Over 20,000 artisans worked on it, with materials from across Asia.',
       'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'),
      ($1, 'Goa', 'goa', 'Beach paradise with Portuguese heritage',
       'Goa offers beautiful beaches, Portuguese architecture, and a unique blend of Indian and European cultures. From old churches to vibrant nightlife, it appeals to all travelers.',
       'A fusion of East and West, reflected in cuisine, architecture, and festivals. Special for you: Explore Old Goa''s UNESCO churches and relax on pristine beaches.',
       'A Portuguese colony for 450 years until 1961. The Basilica of Bom Jesus houses the remains of St. Francis Xavier. The region''s vindaloo and bebinca are culinary icons.',
       'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'),
      ($1, 'Golden Temple', 'golden-temple', 'Spiritual heart of Sikhism',
       'The Golden Temple (Harmandir Sahib) in Amritsar is the holiest shrine in Sikhism. Its gold-plated dome and sacred pool attract millions of devotees and visitors annually.',
       'A beacon of equality where everyone eats together in the world''s largest free kitchen. Special for you: Experience the langar (community meal) serving 100,000 people daily.',
       'The foundation stone was laid by a Muslim saint in 1588. The current structure was rebuilt in marble and gold-plated copper in the 19th century after destruction by invaders.',
       'https://images.unsplash.com/photo-1518002054494-3a6f94352e9e?w=800'),
      ($1, 'Darjeeling-Gangtok', 'darjeeling-gangtok', 'Himalayan tea country and Buddhism',
       'Darjeeling is famous for its tea plantations, toy train, and views of Kanchenjunga. Nearby Gangtok offers Tibetan monasteries and stunning mountain scenery.',
       'British colonial charm meets Buddhist spirituality. Special for you: Ride the UNESCO World Heritage Darjeeling Himalayan Railway (Toy Train).',
       'Darjeeling became a British hill station in the 1840s. Tea cultivation began here in 1856. Gangtok became capital of Sikkim when it joined India in 1975.',
       'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'),
      ($1, 'Kaziranga National Park', 'kaziranga', 'Home of the one-horned rhino',
       'Kaziranga National Park in Assam is a UNESCO World Heritage Site, home to two-thirds of the world''s one-horned rhinoceros. It also shelters tigers, elephants, and wild water buffalo.',
       'Conservation success story in India''s northeast. Special for you: Elephant safaris offer the best chance to spot rhinos up close.',
       'Established in 1905, it became a national park in 1974. The park''s anti-poaching efforts have been remarkably successful, saving the rhino from near extinction.',
       'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=800'),
      ($1, 'Mahabalipuram', 'mahabalipuram', 'Shore temple and rock sculptures',
       'Mahabalipuram (Mamallapuram) features ancient shore temples and rock-cut sculptures dating to the 7th century. This UNESCO World Heritage Site showcases Pallava dynasty architecture.',
       'Living stone-carving tradition continues here. Special for you: Watch artisans create sculptures using the same techniques as their ancestors.',
       'Built during the Pallava dynasty in the 7th century. The Shore Temple survived the 2004 tsunami. Recent discoveries have revealed submerged temple ruins offshore.',
       'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'),
      ($1, 'Manali', 'manali', 'Gateway to the Himalayas',
       'Manali is a popular hill station nestled in the mountains of Himachal Pradesh. Adventure activities, ancient temples, and stunning landscapes make it perfect for students.',
       'Adventure capital of North India. Special for you: Try paragliding, river rafting, or trek to nearby glaciers.',
       'Named after the sage Manu, believed to have stepped off his ark here after the great flood. The Hadimba Temple dates to 1553 and the region has been a pilgrimage site for centuries.',
       'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800')
    `, [indiaId]);
    
    // United Kingdom
    const ukResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'United Kingdom',
        'united-kingdom',
        'The United Kingdom offers world-class education with centuries of academic tradition. Home to Oxford, Cambridge, and leading research institutions, the UK combines historic charm with modern innovation, making it a premier destination for international students.',
        '7-14 days',
        'English',
        'Oldest universities, British Council programs, research excellence',
        'Oxford, Cambridge, Imperial College, British Museum',
        'BBC, Financial District, Tech City London',
        'Big Ben, Tower of London, Edinburgh Castle, Stonehenge',
        'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800'
      ) RETURNING id
    `);
    const ukId = ukResult.rows[0].id;
    
    // UK places - all major attractions
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Big Ben', 'big-ben', 'Iconic clock tower of London',
       'The Elizabeth Tower, commonly known as Big Ben, is one of the most recognizable landmarks in the world. Standing at the north end of the Houses of Parliament, this Gothic Revival masterpiece has become a symbol of British democracy and heritage.',
       'Big Ben represents British punctuality and tradition. The chimes are broadcast live on BBC Radio and mark important national moments. The tower is a beloved symbol that has inspired countless artists and filmmakers.',
       'Completed in 1859, the Great Clock of Westminster is famous for its accuracy. The name Big Ben actually refers to the main bell inside. The tower survived the Blitz during WWII and underwent major restoration completed in 2022.',
       'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800'),
      ($1, 'London Eye', 'london-eye', 'Giant observation wheel on the Thames',
       'The London Eye offers breathtaking panoramic views of London from 135 meters high. This modern marvel has become an iconic part of the London skyline and a must-visit attraction for students exploring urban design and engineering.',
       'The Eye represents London''s embrace of modern architecture alongside historic landmarks. Special for you: Experience sunset views of the entire city, including Parliament, St. Paul''s, and beyond.',
       'Opened on New Year''s Eve 1999 as the Millennium Wheel, it was the world''s tallest Ferris wheel until 2006. The 32 capsules represent London''s 32 boroughs. Over 3.5 million people ride it annually.',
       'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800'),
      ($1, 'London Bridge', 'london-bridge', 'Historic Thames crossing',
       'London Bridge connects the City of London with Southwark. The current bridge offers stunning views and is surrounded by attractions including Borough Market and The Shard.',
       'The bridge area is a cultural melting pot with food markets, street performers, and riverside walks. Special for you: Explore Borough Market nearby for culinary delights from around the world.',
       'There has been a bridge at this location for nearly 2000 years. The famous nursery rhyme references the medieval bridge. The current bridge opened in 1973; the previous one was sold and moved to Arizona!',
       'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'),
      ($1, 'Thames River Cruise', 'thames-cruise', 'Scenic journey through London',
       'A Thames River Cruise offers a unique perspective of London''s landmarks from the water. Glide past Parliament, the Tower of London, and modern marvels while learning about the city''s maritime history.',
       'The Thames has been London''s lifeblood for centuries. Special for you: Evening cruises offer magical views of illuminated landmarks and the city''s reflection on the water.',
       'The Thames has been a trade route since Roman times. Historic events from Viking invasions to royal processions have taken place on these waters. Today it''s a hub for leisure and transportation.',
       'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800'),
      ($1, 'The Shard', 'the-shard', 'Western Europe''s tallest building',
       'At 310 meters, The Shard dominates the London skyline. Its viewing platform offers 360-degree views extending up to 40 miles on clear days. A testament to modern British architecture and engineering.',
       'The Shard represents London''s 21st-century ambitions. Special for you: The View from The Shard at sunset offers a photographer''s paradise with the city spread below.',
       'Designed by Renzo Piano and completed in 2012, the glass-clad pyramid was inspired by church spires and masts of sailing ships. It houses offices, restaurants, a hotel, and residential apartments.',
       'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800'),
      ($1, 'British Museum', 'british-museum', 'World''s greatest collection of human history',
       'Housing over 8 million objects spanning two million years of human history, the British Museum offers unparalleled educational opportunities. From the Rosetta Stone to the Elgin Marbles, it''s a journey through civilization.',
       'The museum is a cultural crossroads. Special for you: The Egyptian mummies collection and Rosetta Stone are must-sees for history enthusiasts.',
       'Founded in 1753 as the first national public museum. The iconic Reading Room has hosted Marx, Gandhi, and Oscar Wilde. The Great Court is Europe''s largest covered public square.',
       'https://images.unsplash.com/photo-1590099543022-c4e2d0b78a0e?w=800'),
      ($1, 'Tower of London', 'tower-of-london', 'Historic royal palace and fortress',
       'A UNESCO World Heritage Site, the Tower of London has served as a royal palace, prison, treasury, and menagerie. Today it houses the Crown Jewels and offers insights into 1000 years of British history.',
       'Yeoman Warders in Tudor uniforms conduct tours. Special for you: Watch the Ceremony of the Keys, performed nightly for 700 years without interruption.',
       'Built by William the Conqueror in 1066. Famous prisoners included Anne Boleyn and Sir Walter Raleigh. The ravens, according to legend, protect the kingdom.',
       'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800'),
      ($1, 'Madame Tussauds', 'madame-tussauds', 'World-famous wax museum',
       'Madame Tussauds London is the original wax museum, featuring lifelike figures of celebrities, historical figures, royalty, and sports stars. An interactive experience that combines art, history, and entertainment.',
       'A London institution since 1835. Special for you: Get photos with royalty, sports legends, and Hollywood stars in incredibly realistic settings.',
       'Founded by Marie Tussaud, a French artist who learned wax modeling from her employer. She created death masks of French Revolution victims before moving to London. The collection now spans multiple locations worldwide.',
       'https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=800'),
      ($1, 'Oxford Street', 'oxford-street', 'Europe''s busiest shopping street',
       'Oxford Street is one of the world''s most famous shopping destinations, stretching 1.5 miles with over 300 shops. From flagship department stores to international brands, it''s a retail paradise.',
       'The street comes alive during Christmas with spectacular lights. Special for you: Visit during the festive season for a magical shopping experience with stunning decorations.',
       'Named after Edward Harley, 2nd Earl of Oxford, the street evolved from a Roman road. Selfridges opened here in 1909, revolutionizing department store shopping.',
       'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'),
      ($1, 'London Aquarium', 'london-aquarium', 'Journey through the world''s waters',
       'The SEA LIFE London Aquarium houses over 600 species in themed zones from the Antarctic to tropical rainforests. Interactive experiences and conservation education make it perfect for students.',
       'Located in County Hall on the South Bank. Special for you: Get up close with sharks, stingrays, and even penguins in immersive exhibits.',
       'Opened in 1997 in the former Greater London Council building. It holds 2 million liters of water and is one of Europe''s largest aquariums. Strong focus on marine conservation and endangered species.',
       'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800')
    `, [ukId]);
    
    // USA
    const usaResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'United States',
        'united-states',
        'The United States is home to many of the world''s top universities and offers diverse educational experiences. From Silicon Valley to Wall Street, students can explore innovation, entrepreneurship, and cutting-edge research across multiple fields.',
        '10-21 days',
        'English, Spanish',
        'Ivy League, Silicon Valley, NASA, world-class research',
        'MIT, Stanford, Harvard, Smithsonian',
        'Google, Apple, Wall Street, Hollywood studios',
        'Statue of Liberty, Grand Canyon, Golden Gate, Times Square',
        'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800'
      ) RETURNING id
    `);
    const usaId = usaResult.rows[0].id;
    
    // USA places - all major attractions
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Statue of Liberty', 'statue-of-liberty', 'Symbol of freedom and democracy',
       'The Statue of Liberty stands as a universal symbol of freedom and democracy. This colossal neoclassical sculpture on Liberty Island welcomes millions of visitors who climb to the crown for stunning views of New York Harbor.',
       'Lady Liberty represents America''s immigrant heritage and ideals of freedom. Special for you: Take the ferry and climb to the crown for an unforgettable experience of American symbolism.',
       'A gift from France in 1886, designed by Frédéric Auguste Bartholdi with an iron framework by Gustave Eiffel. The torch was originally a lighthouse. It welcomed over 12 million immigrants who passed through nearby Ellis Island.',
       'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800'),
      ($1, 'Wall Street', 'wall-street', 'Heart of global finance',
       'Wall Street in Lower Manhattan is the financial center of the world, home to the New York Stock Exchange and major financial institutions. Students of economics and business gain invaluable insights here.',
       'The street symbolizes capitalism and American economic power. Special for you: Visit the Charging Bull statue and see traders in action at the NYSE.',
       'Named after a 17th-century wall built by Dutch colonists. The first stock exchange formed under a buttonwood tree in 1792. The street has witnessed financial panics, the Great Depression, and the 2008 crisis.',
       'https://images.unsplash.com/photo-1560290280-0d5e1beebae9?w=800'),
      ($1, 'White House', 'white-house', 'Residence of the US President',
       'The White House has served as the official residence of every U.S. president since John Adams. This iconic building symbolizes American democracy and executive power.',
       'The White House represents American democracy in action. Special for you: Tour the historic rooms and see where world-changing decisions are made.',
       'Designed by James Hoban and completed in 1800. It was burned by the British in 1814 and rebuilt. The West Wing was added in 1901. It has 132 rooms, 35 bathrooms, and 6 levels.',
       'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800'),
      ($1, 'Grand Canyon National Park', 'grand-canyon', 'One of Earth''s most spectacular landscapes',
       'The Grand Canyon reveals nearly 2 billion years of Earth''s geological history in its layered bands of colorful rock. This UNESCO World Heritage Site stretches 277 miles and reaches a depth of over a mile.',
       'Sacred to many Native American tribes who have lived here for thousands of years. Special for you: Watch sunrise paint the canyon in spectacular colors.',
       'Carved by the Colorado River over millions of years. Theodore Roosevelt declared it a National Monument in 1908. It became a National Park in 1919 and now hosts 6 million visitors annually.',
       'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=800'),
      ($1, 'Universal Studios', 'universal-studios', 'World-famous movie theme park',
       'Universal Studios brings movies to life with thrilling rides, shows, and attractions. From Harry Potter''s Wizarding World to Jurassic Park, experience the magic of cinema in interactive form.',
       'Hollywood meets theme park entertainment. Special for you: Experience the Wizarding World of Harry Potter and ride The Revenge of the Mummy.',
       'Founded in 1912 as a film studio. The theme park opened in 1964, making it one of the oldest in California. It pioneered the studio tour concept and has evolved with each movie blockbuster.',
       'https://images.unsplash.com/photo-1609840053826-1c44b7c15295?w=800'),
      ($1, 'Times Square', 'times-square', 'The Crossroads of the World',
       'Times Square dazzles with its giant digital billboards, Broadway theaters, and constant energy. This iconic intersection in Midtown Manhattan is the heart of American entertainment and commerce.',
       'The brightest corner in America, symbolizing the energy of NYC. Special for you: See a Broadway show and experience the electric New Year''s Eve atmosphere.',
       'Named after The New York Times, which moved here in 1904. The New Year''s Eve ball drop tradition began in 1907. The square underwent major revitalization in the 1990s.',
       'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800'),
      ($1, 'Niagara Falls USA', 'niagara-falls-usa', 'Spectacular natural wonder',
       'The American side of Niagara Falls offers stunning viewpoints and the famous Cave of the Winds experience. Feel the thunderous power of millions of gallons of water cascading down every second.',
       'A honeymoon destination and natural wonder shared with Canada. Special for you: Get soaked at Cave of the Winds for an unforgettable experience.',
       'The falls formed about 12,000 years ago. Nikola Tesla developed hydroelectric power here. Daredevils have attempted crossings on tightropes and in barrels since the 1800s.',
       'https://images.unsplash.com/photo-1533094602577-198d7a9a6c05?w=800'),
      ($1, 'Golden Gate Bridge', 'golden-gate-bridge', 'San Francisco''s iconic landmark',
       'The Golden Gate Bridge is an engineering marvel and one of the most photographed bridges in the world. Its distinctive International Orange color and Art Deco design make it instantly recognizable.',
       'A symbol of San Francisco and American engineering prowess. Special for you: Walk or bike across for stunning views of the bay and Alcatraz.',
       'Completed in 1937 after four years of construction. At 1.7 miles long, it was the longest suspension bridge span until 1964. The color was chosen for visibility in fog.',
       'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'),
      ($1, 'Yellowstone National Park', 'yellowstone', 'America''s first national park',
       'Yellowstone is a geothermal wonderland with geysers, hot springs, and abundant wildlife. Old Faithful and the Grand Prismatic Spring are just a few of its 10,000 thermal features.',
       'Sacred to many indigenous tribes for thousands of years. Special for you: Watch Old Faithful erupt and see bison, elk, and bears in their natural habitat.',
       'Established in 1872 as the world''s first national park. It sits atop a supervolcano. The park hosts half of the world''s geothermal features and is a UNESCO World Heritage Site.',
       'https://images.unsplash.com/photo-1577224682124-f3f5e2d54f44?w=800'),
      ($1, 'Mount Rushmore', 'mount-rushmore', 'Faces of American history',
       'Mount Rushmore features the carved faces of Presidents Washington, Jefferson, Roosevelt, and Lincoln on the granite mountain. This monument to democracy took 14 years to complete.',
       'A tribute to American leadership and democracy. Special for you: The evening lighting ceremony offers a patriotic experience like no other.',
       'Sculpted by Gutzon Borglum from 1927-1941. Each face is 60 feet tall. Originally planned to depict the presidents to their waists, but funding ran out. It attracts 2 million visitors annually.',
       'https://images.unsplash.com/photo-1558025137-0b406e64f4d3?w=800')
    `, [usaId]);
    
    // France
    const franceResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'France',
        'france',
        'France combines world-class education with unmatched cultural heritage. From the Sorbonne to cutting-edge engineering schools, French education emphasizes critical thinking and creativity. Students explore art, cuisine, fashion, and history in the heart of Europe.',
        '7-14 days',
        'French, English',
        'Grandes Écoles, art schools, culinary institutes',
        'Sorbonne, Sciences Po, Le Cordon Bleu, Louvre',
        'Airbus, L''Oréal, fashion houses, vineyards',
        'Eiffel Tower, Louvre, Versailles, Mont Saint-Michel',
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=800'
      ) RETURNING id
    `);
    const franceId = franceResult.rows[0].id;
    
    // France places - all major attractions
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Eiffel Tower', 'eiffel-tower', 'Symbol of Paris and France',
       'The Eiffel Tower is the most iconic landmark in Paris and one of the most recognizable structures in the world. Standing at 330 meters, it offers breathtaking views of the City of Light from three observation levels.',
       'The Iron Lady symbolizes French engineering genius and romance. Special for you: Visit at night when 20,000 lights sparkle on the hour.',
       'Built by Gustave Eiffel for the 1889 World''s Fair. Originally meant to be temporary, it was saved by its usefulness as a radio tower. Over 300 million people have visited since its opening.',
       'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=800'),
      ($1, 'Louvre Museum', 'louvre', 'World''s largest and most visited museum',
       'Home to the Mona Lisa and 35,000 other works spanning 9,000 years, the Louvre is the world''s most visited museum. The glass pyramid entrance and Renaissance palace offer an unparalleled artistic education.',
       'France''s commitment to arts on full display. Special for you: See the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace.',
       'Originally a medieval fortress, it became a royal palace before opening as a museum in 1793. Napoleon expanded the collection. The glass pyramid was added in 1989.',
       'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'),
      ($1, 'Palace of Versailles', 'versailles', 'Symbol of absolute monarchy',
       'The Palace of Versailles represents the height of French royal power and artistry. Its Hall of Mirrors, gardens, and the Trianon palaces offer insights into 17th-century culture and landscape architecture.',
       'The epitome of French royal grandeur. Special for you: Walk through the Hall of Mirrors where the Treaty of Versailles was signed.',
       'Built by Louis XIV starting in 1661, Versailles was the seat of French government for over a century. The gardens cover 800 hectares with 1,400 fountains.',
       'https://images.unsplash.com/photo-1594028066836-8cf66c69cb05?w=800'),
      ($1, 'Côte d''Azur', 'cote-dazur', 'The French Riviera',
       'The Côte d''Azur stretches along France''s Mediterranean coast, featuring glamorous cities like Nice, Cannes, and Monaco. Azure waters, luxury yachts, and stunning beaches make this a legendary destination.',
       'Playground of artists, celebrities, and royalty for over a century. Special for you: Experience the glamour of the Cannes Film Festival location.',
       'Artists like Picasso, Matisse, and Chagall were drawn to its extraordinary light. The region became fashionable in the late 1800s when European aristocracy discovered its mild winters.',
       'https://images.unsplash.com/photo-1534069786094-6d4f8d720a45?w=800'),
      ($1, 'Loire Valley Châteaux', 'loire-valley', 'Garden of France with royal castles',
       'The Loire Valley is home to over 300 châteaux, including Chambord and Chenonceau. This UNESCO World Heritage Site showcases Renaissance architecture and the French art of living.',
       'Known as the Garden of France for its wines and produce. Special for you: Tour fairy-tale castles and taste world-famous wines.',
       'French kings built their residences here from the 15th century. The Loire was the political center of France before Versailles. The valley produces acclaimed wines like Sancerre and Vouvray.',
       'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=800'),
      ($1, 'Cathédrale Notre-Dame', 'notre-dame', 'Masterpiece of Gothic architecture',
       'Notre-Dame de Paris is a masterpiece of French Gothic architecture, famous for its flying buttresses, rose windows, and gargoyles. Though damaged by fire in 2019, its restoration showcases French craftsmanship.',
       'The spiritual heart of Paris for 850 years. Special for you: Witness the remarkable restoration effort of this beloved monument.',
       'Construction began in 1163 and took nearly 200 years. Napoleon was crowned here. Victor Hugo''s novel saved it from demolition in the 1800s. The 2019 fire sparked worldwide support for restoration.',
       'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800'),
      ($1, 'Arc de Triomphe', 'arc-de-triomphe', 'Monument honoring French military',
       'The Arc de Triomphe stands at the center of Place Charles de Gaulle, where 12 avenues radiate outward. This massive arch honors those who fought for France and offers panoramic views of the Champs-Élysées.',
       'A symbol of French pride and victory. Special for you: Climb to the top for the best view down the Champs-Élysées to the Louvre.',
       'Commissioned by Napoleon in 1806 after his victory at Austerlitz. Completed in 1836. The Tomb of the Unknown Soldier lies beneath the arch with an eternal flame lit since 1923.',
       'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800'),
      ($1, 'French Riviera', 'french-riviera', 'Mediterranean glamour',
       'The French Riviera includes legendary destinations like Nice, Cannes, Saint-Tropez, and Monaco. Crystal-clear waters, belle époque architecture, and world-class cuisine define this glamorous coastline.',
       'Where celebrities and artists have vacationed for generations. Special for you: Walk the Promenade des Anglais in Nice or explore Monaco''s Monte Carlo.',
       'The Riviera became fashionable in the 1800s when Queen Victoria visited. The region hosts the Cannes Film Festival, Monaco Grand Prix, and Nice Carnival.',
       'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800')
    `, [franceId]);
    
    // Australia
    const australiaResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Australia',
        'australia',
        'Australia offers high-quality education with a relaxed lifestyle and stunning natural environments. Its universities rank among the world''s best, and the multicultural society welcomes international students. From marine biology to mining engineering, Australia provides unique learning opportunities.',
        '10-21 days',
        'English',
        'Group of Eight universities, CSIRO research, marine science',
        'University of Melbourne, Sydney University, Great Barrier Reef research',
        'Mining industry, biotech, sustainable agriculture',
        'Sydney Opera House, Great Barrier Reef, Uluru, Melbourne arts',
        'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800'
      ) RETURNING id
    `);
    const australiaId = australiaResult.rows[0].id;
    
    // Australia places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Sydney Opera House', 'sydney-opera-house', 'Architectural masterpiece and cultural icon',
       'A UNESCO World Heritage Site and one of the 20th century''s most distinctive buildings, the Sydney Opera House hosts over 1,500 performances annually. Its sail-shaped shells have become synonymous with Australia.',
       'The Opera House is Australia''s cultural heart, hosting opera, ballet, theater, and concerts. It represents Australia''s coming of age as a cultural nation and its embrace of bold, innovative design.',
       'Designed by Danish architect Jørn Utzon and opened in 1973, the building took 16 years to complete. Its construction pioneered new engineering techniques. Over 10 million people visit annually.',
       'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800'),
      ($1, 'Great Barrier Reef', 'great-barrier-reef', 'World''s largest coral reef system',
       'Spanning 2,300 kilometers, the Great Barrier Reef is the world''s largest living structure and a UNESCO World Heritage Site. It offers unparalleled opportunities for marine science education and environmental awareness.',
       'The reef is sacred to Aboriginal and Torres Strait Islander peoples, who have been its custodians for thousands of years. Their traditional knowledge informs modern conservation efforts and cultural tourism.',
       'The reef began forming about 20,000 years ago during the last Ice Age. It comprises nearly 3,000 individual reef systems and supports extraordinary biodiversity. Climate change now threatens its survival.',
       'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800')
    `, [australiaId]);
    
    // Germany
    const germanyResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Germany',
        'germany',
        'Germany is Europe''s largest economy and a leader in engineering, automotive, and renewable energy. Its universities offer tuition-free education even for international students. From BMW to Siemens, students can explore world-class industry and research.',
        '7-14 days',
        'German, English',
        'Technical universities, research institutes, automotive engineering',
        'TU Munich, RWTH Aachen, Max Planck Institutes',
        'BMW, Mercedes-Benz, Bosch, renewable energy facilities',
        'Brandenburg Gate, Neuschwanstein Castle, Berlin Wall',
        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800'
      ) RETURNING id
    `);
    const germanyId = germanyResult.rows[0].id;
    
    // Germany places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'BMW Welt and Museum', 'bmw-welt', 'Showcase of German automotive excellence',
       'BMW Welt in Munich offers interactive exhibits on automotive innovation, engineering, and sustainable mobility. Students can explore the history of transportation and the future of electric vehicles.',
       'BMW represents German engineering excellence - "Freude am Fahren" (Joy of Driving). The Welt hosts cultural events, concerts, and educational programs, embodying Munich''s blend of tradition and innovation.',
       'BMW was founded in 1916 as an aircraft engine manufacturer. The four-part logo represents a spinning propeller. The company has pioneered automotive technology from the first electric car to advanced manufacturing.',
       'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800'),
      ($1, 'Brandenburg Gate', 'brandenburg-gate', 'Symbol of German unity',
       'Berlin''s most famous landmark, the Brandenburg Gate has witnessed the city''s dramatic history. Once a symbol of division, it now represents German reunification and European unity.',
       'The Gate anchors Berlin''s cultural mile, near the Holocaust Memorial, Reichstag, and Museum Island. New Year''s celebrations and public gatherings here symbolize German democracy and openness.',
       'Built in 1791 as a symbol of peace, it was later co-opted by Napoleon and the Nazis. During the Cold War, it stood in no-man''s land between East and West. Its opening in 1989 symbolized the fall of the Berlin Wall.',
       'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800')
    `, [germanyId]);
    
    // Canada
    const canadaResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Canada',
        'canada',
        'Canada is known for its welcoming attitude toward international students and high quality of life. Its bilingual environment, diverse cities, and strong universities make it an excellent choice. Students can explore natural wonders from Niagara Falls to the Rocky Mountains.',
        '7-14 days',
        'English, French',
        'Research universities, co-op programs, multicultural experience',
        'University of Toronto, McGill, UBC',
        'Tech startups, aerospace, natural resources',
        'Niagara Falls, Banff National Park, CN Tower, Quebec City',
        'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800'
      ) RETURNING id
    `);
    const canadaId = canadaResult.rows[0].id;
    
    // Canada places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Niagara Falls', 'niagara-falls', 'One of the world''s great natural wonders',
       'The thundering waters of Niagara Falls attract millions of visitors annually. Students can learn about hydroelectric power, geology, and environmental conservation while experiencing this natural wonder.',
       'Niagara represents the spirit of shared stewardship between Canada and the US. The falls have inspired artists, daredevils, and honeymooners. The region''s wine country adds culinary experiences.',
       'Formed 12,000 years ago as glaciers retreated, the falls have moved 11 kilometers upstream. Nikola Tesla developed AC power here. The first ever crossing on a tightrope was in 1859.',
       'https://images.unsplash.com/photo-1533094602577-198d7a9a6c05?w=800'),
      ($1, 'Banff National Park', 'banff-national-park', 'Crown jewel of the Canadian Rockies',
       'Canada''s first national park offers pristine wilderness, stunning mountain scenery, and world-class outdoor education. Students can study ecology, geology, and conservation in a UNESCO World Heritage Site.',
       'Banff embodies Canada''s commitment to wilderness preservation. The park balances tourism with conservation, offering insights into sustainable development. Indigenous perspectives inform interpretation programs.',
       'Established in 1885 after the discovery of hot springs, Banff was Canada''s first national park. The Canadian Pacific Railway opened the wilderness to tourism. The park protects grizzly bears, wolves, and ancient forests.',
       'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800')
    `, [canadaId]);
    
    // Netherlands (NEW)
    const netherlandsResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Netherlands',
        'netherlands',
        'The Netherlands combines centuries of artistic heritage with modern innovation. From Van Gogh to cutting-edge design, from tulip fields to world-class universities, this compact country offers rich educational experiences in a welcoming, multicultural environment.',
        '5-7 days',
        'Dutch, English',
        'Top universities, design schools, sustainable development',
        'TU Delft, University of Amsterdam, Rijksmuseum',
        'Philips, Shell, sustainable agriculture, creative industries',
        'Canals of Amsterdam, Keukenhof Gardens, Windmills',
        'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'
      ) RETURNING id
    `);
    const netherlandsId = netherlandsResult.rows[0].id;
    
    // Netherlands places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Vondelpark', 'vondelpark', 'Amsterdam''s beloved green oasis',
       'Vondelpark is Amsterdam''s largest and most famous city park. Spanning 47 hectares, it offers gardens, ponds, playgrounds, and open-air performances in the heart of the city.',
       'A meeting place for all Amsterdammers. Special for you: Enjoy a picnic, rent bikes, or catch a free concert at the open-air theater.',
       'Opened in 1865 and named after the 17th-century playwright Joost van den Vondel. It receives about 10 million visitors annually and is a protected national heritage site.',
       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
      ($1, 'Amsterdam Canal Ride', 'amsterdam-canals', 'UNESCO World Heritage waterways',
       'Amsterdam''s 17th-century canal ring is a UNESCO World Heritage Site. A boat ride through these historic waterways offers unique views of gabled houses, bridges, and Dutch architecture.',
       'The canals are the soul of Amsterdam. Special for you: Evening cruises showcase the illuminated bridges and houses reflecting on the water.',
       'The canal ring was built during the Dutch Golden Age in the 17th century. Amsterdam has more than 100 kilometers of canals, 90 islands, and 1,500 bridges.',
       'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'),
      ($1, 'Keukenhof', 'keukenhof', 'World''s largest flower garden',
       'Keukenhof is the world''s largest flower garden, showcasing 7 million tulips, daffodils, and hyacinths each spring. A spectacular celebration of Dutch horticultural expertise.',
       'The Netherlands'' flower-growing tradition on magnificent display. Special for you: Visit during tulip season (March-May) for an explosion of color.',
       'The park has been open since 1950, though the estate dates to the 15th century. It was originally a kitchen garden (hence the name) for a countess''s castle.',
       'https://images.unsplash.com/photo-1524821249001-6b0e1f7f8f93?w=800'),
      ($1, 'Rijksmuseum', 'rijksmuseum', 'National museum of Dutch art',
       'The Rijksmuseum houses over 8,000 works including Rembrandt''s Night Watch and Vermeer''s Milkmaid. It''s the most visited museum in the Netherlands and a treasure of Dutch Golden Age art.',
       'The heart of Dutch cultural heritage. Special for you: The Night Watch gallery underwent complete renovation to showcase the masterpiece.',
       'Founded in 1800 and housed in its current building since 1885. The building itself is a masterpiece of Dutch Neo-Renaissance architecture by Pierre Cuypers.',
       'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800'),
      ($1, 'Anne Frank House', 'anne-frank-house', 'WWII memorial and museum',
       'The Anne Frank House is the actual hiding place where Anne Frank wrote her famous diary during WWII. A deeply moving museum that brings history to life.',
       'A powerful reminder of the Holocaust and the importance of human rights. Special for you: Book tickets well in advance as this is one of Amsterdam''s most visited sites.',
       'The Frank family hid here from 1942-1944. Anne''s diary has been translated into over 70 languages. The museum opened in 1960 and the Secret Annex has been preserved.',
       'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'),
      ($1, 'Van Gogh Museum', 'van-gogh-museum', 'World''s largest Van Gogh collection',
       'The Van Gogh Museum houses the world''s largest collection of Van Gogh''s paintings and drawings. Over 200 paintings and 500 drawings trace the artist''s life and work.',
       'Dedicated to the tortured genius of Dutch art. Special for you: See Sunflowers, The Bedroom, and Almond Blossom up close.',
       'The museum opened in 1973, housing the collection preserved by Van Gogh''s family. A new wing designed by Kisho Kurokawa was added in 1999.',
       'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800'),
      ($1, 'Hoge Veluwe National Park', 'hoge-veluwe', 'Netherlands'' largest nature reserve',
       'Hoge Veluwe is the Netherlands'' largest national park, featuring forests, heathland, and sand dunes. The Kröller-Müller Museum within the park houses another major Van Gogh collection.',
       'Dutch nature at its finest. Special for you: Use the free white bikes to explore the park''s 40km of cycling paths.',
       'Created by the Kröller-Müller family in the early 20th century. The park protects rare heathland ecosystems and wildlife including deer and wild boar.',
       'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'),
      ($1, 'Kinderdijk Windmills', 'kinderdijk', 'UNESCO World Heritage windmills',
       'Kinderdijk is home to 19 authentic 18th-century windmills, a UNESCO World Heritage Site. These iconic structures showcase Dutch water management engineering.',
       'The symbol of Dutch innovation in the face of nature. Special for you: Visit inside a working windmill to see how millers lived and worked.',
       'Built around 1740 to pump water from the polders. The site demonstrates how the Dutch have managed water for centuries. Some windmills are still in operation.',
       'https://images.unsplash.com/photo-1550426735-c33c7ce414ff?w=800'),
      ($1, 'Ijsselmeer Towns', 'ijsselmeer-towns', 'Historic fishing villages',
       'The towns around the former Zuiderzee (now Ijsselmeer) preserve Dutch maritime heritage. Volendam, Marken, and Edam offer traditional costumes, cheese, and wooden houses.',
       'Step back in time to old Holland. Special for you: Try authentic Dutch cheese in Edam and see traditional costumes in Volendam.',
       'These fishing communities date back centuries. The Afsluitdijk causeway of 1932 turned the Zuiderzee into the Ijsselmeer freshwater lake, changing these communities forever.',
       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800')
    `, [netherlandsId]);
    
    // Switzerland (NEW)
    const switzerlandResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'Switzerland',
        'switzerland',
        'Switzerland offers world-class education amid stunning Alpine scenery. Home to ETH Zurich and elite hospitality schools, Switzerland combines precision engineering, banking expertise, and sustainable mountain living. Students experience multilingual culture in one of the world''s most peaceful nations.',
        '8-10 days',
        'German, French, Italian, Romansh',
        'Top engineering and hospitality schools, research centers',
        'ETH Zurich, EPFL Lausanne, EHL Hospitality School',
        'Swiss banks, watchmaking, pharmaceuticals, tourism',
        'Matterhorn, Swiss Alps, Lake Geneva, medieval old towns',
        'https://images.unsplash.com/photo-1531430542672-d37966de6331?w=800'
      ) RETURNING id
    `);
    const switzerlandId = switzerlandResult.rows[0].id;
    
    // Switzerland places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'The Matterhorn', 'matterhorn', 'Switzerland''s iconic peak',
       'The Matterhorn is one of the most recognizable mountains in the world. Rising 4,478 meters above the Swiss-Italian border, its distinctive pyramid shape has become a symbol of the Alps.',
       'The ultimate symbol of Alpine adventure. Special for you: The Gornergrat railway offers stunning views without climbing.',
       'First climbed in 1865 in a tragic expedition that killed four climbers. The mountain has since been summited over 3,000 times annually but remains challenging.',
       'https://images.unsplash.com/photo-1531430542672-d37966de6331?w=800'),
      ($1, 'Jungfraujoch', 'jungfraujoch', 'Top of Europe',
       'Jungfraujoch at 3,454 meters is Europe''s highest railway station. The journey through mountain tunnels opens to glaciers, ice caves, and breathtaking Alpine panoramas.',
       'Swiss engineering marvel in the high Alps. Special for you: Walk on the Aletsch Glacier, Europe''s longest glacier.',
       'The railway was completed in 1912 after 16 years of construction. The Sphinx Observatory at the summit offers 360-degree views of the Alps.',
       'https://images.unsplash.com/photo-1530878955558-a6c31b9c9b7e?w=800'),
      ($1, 'Interlaken', 'interlaken', 'Adventure capital of Switzerland',
       'Interlaken sits between two stunning lakes at the foot of the Jungfrau region. It''s Switzerland''s adventure sports capital, offering paragliding, bungee jumping, and skiing.',
       'Where adventure meets Alpine beauty. Special for you: Try paragliding for bird''s-eye views of the lakes and mountains.',
       'The town developed as a tourist destination in the 19th century. The Höheweg promenade offers direct views of the Jungfrau. It remains popular for its central location.',
       'https://images.unsplash.com/photo-1548277577-0a4d5c87a12c?w=800'),
      ($1, 'Lucerne', 'lucerne', 'Picturesque lakeside city',
       'Lucerne is a beautifully preserved medieval city on Lake Lucerne. The Chapel Bridge, Lion Monument, and stunning mountain backdrop make it quintessentially Swiss.',
       'Where history meets natural beauty. Special for you: Walk the 14th-century Chapel Bridge, Europe''s oldest covered wooden bridge.',
       'The Chapel Bridge dates to 1333, though it was rebuilt after a 1993 fire. The Lion Monument commemorates Swiss Guards killed during the French Revolution.',
       'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800'),
      ($1, 'Lake Geneva', 'lake-geneva', 'Europe''s largest Alpine lake',
       'Lake Geneva (Lac Léman) is Western Europe''s largest lake, shared with France. Its shores host Geneva, Lausanne, Montreux, and the famous Jet d''Eau fountain.',
       'The heart of French-speaking Switzerland. Special for you: The Lavaux vineyard terraces along the lake are a UNESCO World Heritage Site.',
       'The lake has been a resort destination since Roman times. The Jet d''Eau fountain shoots water 140 meters high. Montreux hosts the famous Jazz Festival.',
       'https://images.unsplash.com/photo-1586610952632-9c9d8e7a9ec7?w=800'),
      ($1, 'Château de Chillon', 'chateau-de-chillon', 'Medieval castle on Lake Geneva',
       'Château de Chillon is a medieval fortress dramatically positioned on a rock on Lake Geneva. It''s Switzerland''s most visited historic building and inspired Lord Byron''s famous poem.',
       'Medieval romance on the lake shore. Special for you: Explore underground dungeons and climb the tower for lake views.',
       'The castle dates to the 12th century and served the Counts of Savoy. Byron wrote "The Prisoner of Chillon" after visiting in 1816. Over 400,000 visitors come annually.',
       'https://images.unsplash.com/photo-1530878955558-a6c31b9c9b7e?w=800'),
      ($1, 'St. Moritz', 'st-moritz', 'Birthplace of winter tourism',
       'St. Moritz is one of the world''s most glamorous ski resorts. This sunny Alpine town has hosted two Winter Olympics and invented the skeleton bobsled.',
       'Luxury and sport in perfect harmony. Special for you: Experience the Cresta Run or take the Bernina Express scenic railway.',
       'Tourism began here in 1864 when a hotel owner bet guests they could enjoy winter in the Alps. It hosted the 1928 and 1948 Winter Olympics.',
       'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
      ($1, 'Lake Lugano', 'lake-lugano', 'Italian Switzerland''s gem',
       'Lake Lugano lies in Italian-speaking Ticino, offering Mediterranean atmosphere in the Swiss Alps. Palm trees, gelato, and Italian architecture create a unique Swiss experience.',
       'Where Switzerland meets Italy. Special for you: Take the funicular to Monte Brè for panoramic views of the lake and Alps.',
       'The region was under Milanese rule before joining Switzerland. Lugano has been a haven for artists and exiles, including Hermann Hesse who lived nearby.',
       'https://images.unsplash.com/photo-1543682704-15adeb008ac4?w=800'),
      ($1, 'Bern', 'bern', 'Switzerland''s charming capital',
       'Bern is Switzerland''s federal capital, with a beautifully preserved medieval old town that''s a UNESCO World Heritage Site. Einstein developed his theory of relativity here.',
       'Medieval character with modern governance. Special for you: See the famous Zytglogge (Clock Tower) and Einstein''s apartment.',
       'Founded in 1191, legend says it was named after the first animal killed in a hunt - a bear. The old town''s arcades stretch 6 kilometers.',
       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800')
    `, [switzerlandId]);
    
    // China (NEW)
    const chinaResult = await pool.query(`
      INSERT INTO destinations (name, slug, overview, duration, language, student_exposure, academic_visits, industry_exposure, sightseeing, image_url)
      VALUES (
        'China',
        'china',
        'China offers an extraordinary journey through 5,000 years of civilization. From the Great Wall to modern megacities, students witness the world''s fastest-growing economy alongside ancient traditions. Experience Mandarin, calligraphy, martial arts, and cutting-edge technology in one transformative trip.',
        '6-8 days',
        'Mandarin Chinese',
        'Top universities, tech companies, manufacturing insights',
        'Tsinghua, Peking University, Fudan University',
        'Alibaba, Huawei, manufacturing zones, bullet trains',
        'Great Wall, Forbidden City, Terracotta Army, Li River',
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800'
      ) RETURNING id
    `);
    const chinaId = chinaResult.rows[0].id;
    
    // China places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Great Wall of China', 'great-wall', 'World''s greatest architectural feat',
       'The Great Wall stretches over 21,000 kilometers across northern China. This UNESCO World Heritage Site is one of the most impressive architectural feats in human history.',
       'The ultimate symbol of Chinese civilization and determination. Special for you: Hike the Mutianyu section for stunning views and fewer crowds.',
       'Construction began in the 7th century BC and continued for over 2,000 years. Multiple dynasties contributed to the wall. It''s visible from space contrary to popular myth.',
       'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800'),
      ($1, 'Terracotta Army', 'terracotta-army', 'Ancient buried warriors',
       'The Terracotta Army in Xi''an consists of 8,000 life-sized clay soldiers buried with Emperor Qin Shi Huang. Discovered in 1974, it''s one of the greatest archaeological finds ever.',
       'A journey into ancient China''s imperial grandeur. Special for you: See the ongoing excavation work and workshop where figures are restored.',
       'Created around 210 BC to protect the First Emperor in the afterlife. Each soldier has unique features. The site was discovered by farmers digging a well.',
       'https://images.unsplash.com/photo-1530903922044-de4a9ffcb8f9?w=800'),
      ($1, 'Forbidden City', 'forbidden-city', 'Imperial palace complex',
       'The Forbidden City was home to Chinese emperors for 500 years. This vast palace complex with 980 buildings is the world''s largest collection of preserved wooden structures.',
       'The heart of imperial China. Special for you: Arrive early to see the palace before crowds fill the courtyards.',
       'Built between 1406-1420 during the Ming Dynasty. 24 emperors lived here. It became a museum in 1925 after the last emperor was expelled.',
       'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800'),
      ($1, 'The Bund', 'the-bund', 'Shanghai''s iconic waterfront',
       'The Bund showcases Shanghai''s colonial-era architecture along the Huangpu River. Across the water, the Pudong skyline represents modern China''s meteoric rise.',
       'Where old Shanghai meets new China. Special for you: See the Bund at night when both sides of the river light up spectacularly.',
       'Developed as a trading hub in the 1800s. The buildings represent European styles from Art Deco to Neoclassical. Pudong across the river was farmland until the 1990s.',
       'https://images.unsplash.com/photo-1537531383496-f4749b3a2339?w=800'),
      ($1, 'Li River Cruise', 'li-river', 'Legendary karst landscape',
       'The Li River cruise from Guilin to Yangshuo passes through some of China''s most stunning scenery. Limestone karst peaks rise from the water like ancient paintings.',
       'The landscape that inspired Chinese artists for millennia. Special for you: Take a bamboo raft through the smaller channels at sunset.',
       'The karst formations are 300 million years old. This landscape appears on the 20 yuan note. Artists and poets have celebrated it since the Tang Dynasty.',
       'https://images.unsplash.com/photo-1529921879218-f99546d1ab69?w=800'),
      ($1, 'Giant Panda Base', 'giant-pandas', 'Chengdu''s beloved pandas',
       'The Chengdu Research Base of Giant Panda Breeding is the best place to see pandas. Over 120 pandas live here in natural habitats designed for their conservation.',
       'Home to China''s beloved national treasure. Special for you: Visit during morning feeding time for the most active pandas.',
       'Founded in 1987 with six rescued pandas. The breeding program has been remarkably successful. Pandas are no longer endangered thanks to conservation efforts.',
       'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800'),
      ($1, 'Yellow Mountains', 'huangshan', 'Inspiration for Chinese art',
       'Huangshan (Yellow Mountains) features granite peaks, ancient pine trees, and seas of clouds. This UNESCO site has inspired Chinese paintings and poetry for centuries.',
       'China''s most beautiful mountain scenery. Special for you: Stay overnight to catch the magical sunrise above the clouds.',
       'The mountains formed 100 million years ago. They''ve been a pilgrimage site for artists since ancient times. The unique pines inspired the classic Chinese painting style.',
       'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800'),
      ($1, 'Potala Palace', 'potala-palace', 'Tibet''s sacred fortress',
       'The Potala Palace in Lhasa was the winter residence of the Dalai Lama. This 13-story palace is an architectural wonder and the spiritual heart of Tibetan Buddhism.',
       'The crown jewel of Tibetan heritage. Special for you: Climb the 1,000 steps for breathtaking views and spiritual experience.',
       'Construction began in the 7th century and was expanded in the 17th century. It contains over 1,000 rooms, 10,000 shrines, and 200,000 statues.',
       'https://images.unsplash.com/photo-1461823385004-d7660947a7c0?w=800'),
      ($1, 'Leshan Giant Buddha', 'leshan-buddha', 'World''s largest stone Buddha',
       'The Leshan Giant Buddha is the world''s largest stone Buddha statue at 71 meters tall. Carved into a cliff face, it overlooks the confluence of three rivers.',
       'A marvel of ancient Buddhist devotion. Special for you: Take a boat to see the full statue from the river.',
       'Carved over 90 years from 713-803 AD during the Tang Dynasty. A monk began it hoping to calm the turbulent waters. The drainage system keeps it well-preserved.',
       'https://images.unsplash.com/photo-1529921879218-f99546d1ab69?w=800'),
      ($1, 'West Lake', 'west-lake', 'Hangzhou''s poetic paradise',
       'West Lake in Hangzhou is one of China''s most celebrated landscapes. Gardens, temples, pagodas, and causeways create scenes that have inspired poets for a thousand years.',
       'China''s most romantic lake. Special for you: Rent a boat at sunset or attend a traditional tea ceremony.',
       'The lake was made famous by poets like Su Dongpo, who built a causeway here. Marco Polo called Hangzhou "the finest city in the world." It''s a UNESCO World Heritage Site.',
       'https://images.unsplash.com/photo-1537531383496-f4749b3a2339?w=800')
    `, [chinaId]);
    
    console.log("Destinations and places seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding destinations:", error);
  }
}
