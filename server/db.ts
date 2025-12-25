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
      theme_key TEXT DEFAULT 'summer',
      primary_color TEXT DEFAULT '#ef6e2d',
      secondary_color TEXT DEFAULT '#fdc22c',
      accent_color TEXT DEFAULT '#178ab6',
      text_color TEXT DEFAULT '#1e293b',
      hero_style TEXT DEFAULT 'light',
      hero_gradient_from TEXT DEFAULT '#fff7ed',
      hero_gradient_via TEXT DEFAULT '#fef3c7',
      hero_gradient_to TEXT DEFAULT '#ffedd5',
      hero_image_url TEXT,
      hero_overlay_color TEXT,
      hero_headline TEXT DEFAULT 'Start Here. Go Anywhere.',
      hero_subtext TEXT DEFAULT 'We guide you through every step of your international education journey.',
      hero_badge_text TEXT DEFAULT 'Your Gateway to Global Education',
      hero_button_primary TEXT DEFAULT 'Explore Destinations',
      hero_button_secondary TEXT DEFAULT 'Learn More',
      contact_phone TEXT DEFAULT '+91 98765 43210',
      contact_email TEXT DEFAULT 'info@eduflyoverseas.com',
      contact_address TEXT DEFAULT 'Chennai, Tamil Nadu, India',
      footer_tagline TEXT DEFAULT 'Your trusted partner for international education.',
      about_intro TEXT DEFAULT 'Edufly Overseas is a premier international education consultancy.'
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
        'Gardens by the Bay, Sentosa Island, Universal Studios'
      ) RETURNING id
    `);
    const singaporeId = singaporeResult.rows[0].id;
    
    // Singapore places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Changi International Airport', 'changi-airport', 'World''s best airport and aviation hub', 
       'Ranked amongst the top airports in the world, Changi International Airport is a tourist attraction in itself. It hosts the much awaited Singapore Airshow, which regularly attracts engineering, aviation and management students to witness technological advancements at a global stage.',
       'The airport showcases Singapore''s commitment to excellence and innovation. The Jewel complex features the world''s tallest indoor waterfall, lush gardens, and a unique blend of nature and architecture that reflects Singapore''s garden city ethos.',
       'Opened in 1981, Changi Airport has grown from handling 8 million passengers to over 60 million annually. It has won the Skytrax World''s Best Airport award multiple times and represents Singapore''s transformation into a global aviation hub.',
       'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800'),
      ($1, 'Marina Bay Sands', 'marina-bay-sands', 'Iconic architectural masterpiece',
       'An integrated resort featuring a stunning hotel, casino, convention center, and the famous infinity pool. Award-winning architects have made Singapore their playground, and Marina Bay Sands stands as a testament to modern architectural innovation.',
       'Marina Bay Sands has become a symbol of modern Singapore, representing the nation''s ambition and cosmopolitan character. The SkyPark offers panoramic views and hosts cultural events that bring together diverse communities.',
       'Designed by Moshe Safdie and opened in 2010, this $8 billion development transformed Singapore''s skyline. The three 55-story towers connected by a 1-hectare rooftop park demonstrate cutting-edge engineering and design.',
       'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'),
      ($1, 'Sentosa Island', 'sentosa-island', 'Entertainment and leisure destination',
       'Entertainment districts and tourist attractions like Sentosa island and Universal Studios offer special packages for visiting students. The island features beaches, theme parks, resorts, and educational attractions.',
       'Sentosa embodies Singapore''s approach to leisure - combining entertainment with education. The island hosts cultural performances, historical exhibits at Fort Siloso, and environmental education programs at its nature reserves.',
       'Originally called Pulau Blakang Mati (Island of Death Behind), Sentosa was a British military fortress. After Singapore''s independence, it was transformed into a resort island in 1972 and renamed Sentosa, meaning "peace and tranquility" in Malay.',
       'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800'),
      ($1, 'Gardens by the Bay', 'gardens-by-the-bay', 'Futuristic nature park',
       'A stunning nature park spanning 101 hectares featuring the iconic Supertree Grove, Cloud Forest, and Flower Dome. A perfect blend of nature and technology showcasing sustainable architecture.',
       'The gardens celebrate Singapore''s multicultural heritage through themed gardens representing different cultures. Regular cultural festivals, art installations, and performances make it a vibrant cultural hub.',
       'Opened in 2012 as part of Singapore''s vision to transform into a City in a Garden. The Supertrees were designed to mimic the function of real trees, collecting rainwater and generating solar power.',
       'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=800')
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
        'Taj Mahal, Varanasi, Jaipur, Kerala backwaters'
      ) RETURNING id
    `);
    const indiaId = indiaResult.rows[0].id;
    
    // India places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Taj Mahal', 'taj-mahal', 'Iconic monument of eternal love',
       'India''s traditional architecture is most famous for monuments like the Taj Mahal. This UNESCO World Heritage Site is considered one of the most beautiful buildings ever created, attracting millions of visitors annually.',
       'The Taj Mahal represents the pinnacle of Mughal architecture, blending Persian, Islamic, and Indian architectural styles. It symbolizes eternal love and has inspired poets, artists, and architects for centuries. The monument hosts cultural events during festivals.',
       'Built between 1632-1653 by Emperor Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal. Over 20,000 artisans worked on the project, with materials sourced from across Asia. The white marble changes color throughout the day.',
       'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'),
      ($1, 'Varanasi', 'varanasi', 'One of the world''s oldest living cities',
       'Students of history and political science have much to learn from cities like Varanasi or Benares, which is over 5000 years old. This spiritual capital of India offers profound insights into ancient civilization.',
       'Varanasi is the spiritual heart of India, where Hindu pilgrims come for salvation. The ghats along the Ganges host daily rituals, music, and dance. The city is renowned for classical music, silk weaving, and Sanskrit learning.',
       'One of the oldest continuously inhabited cities in the world, Varanasi has been a center of learning, art, and religion for over 5000 years. Buddha gave his first sermon nearby, and the city has hosted scholars from across the ancient world.',
       'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800'),
      ($1, 'Dharavi', 'dharavi', 'World''s most entrepreneurial community',
       'The customized tour of Dharavi, often called the world''s most entrepreneurial slum, has been attracting a lot of management students. India''s entrepreneurs and frugal economy offer unique lessons in innovation.',
       'Dharavi represents the resilience and entrepreneurial spirit of India. Its micro-industries, community networks, and sustainable practices offer insights into grassroots innovation and social enterprise models.',
       'Established in 1884 during the colonial era, Dharavi has evolved into a thriving informal economy generating over $1 billion annually. It houses thousands of small businesses in leather, pottery, textiles, and recycling.',
       'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800'),
      ($1, 'Jaipur', 'jaipur', 'The Pink City of palaces and forts',
       'Known as the Pink City, Jaipur showcases India''s royal heritage through magnificent palaces, forts, and traditional arts. The city is a living museum of Rajasthani culture and architecture.',
       'Jaipur preserves the rich traditions of Rajput culture - from block printing and gem cutting to folk music and dance. The bazaars overflow with traditional crafts, and artisan families continue centuries-old techniques.',
       'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India''s first planned city. It was painted pink in 1876 to welcome Prince Albert and has maintained this tradition. The city exemplifies the blend of Rajput and Mughal architecture.',
       'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800'),
      ($1, 'Kerala Backwaters', 'kerala-backwaters', 'Serene network of lagoons and canals',
       'Kerala''s backwaters offer a tranquil experience through a network of lagoons, lakes, and canals. Students can explore sustainable tourism, Ayurveda, and the unique ecosystem of this region.',
       'Kerala''s culture blends Hindu, Christian, and Islamic traditions harmoniously. Kathakali dance, Ayurvedic medicine, and the unique cuisine reflect this diversity. The region is known as "God''s Own Country."',
       'The backwaters were created centuries ago as natural waterways for trade. The Chinese fishing nets, introduced by traders from Kublai Khan''s court, still dot the landscape. Houseboats evolved from traditional rice barges called kettuvallams.',
       'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800')
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
        'Big Ben, Tower of London, Edinburgh Castle, Stonehenge'
      ) RETURNING id
    `);
    const ukId = ukResult.rows[0].id;
    
    // UK places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Oxford University', 'oxford-university', 'World''s oldest English-speaking university',
       'Oxford is home to the oldest university in the English-speaking world, with 39 colleges spread across the historic city. The dreaming spires and hallowed halls have educated world leaders, scientists, and artists.',
       'Oxford embodies British academic tradition with its formal halls, gown-wearing students, and tutorial system. The Bodleian Library, Sheldonian Theatre, and college chapels host cultural events, concerts, and lectures year-round.',
       'Founded in 1096, Oxford has educated 28 British Prime Ministers, 55 Nobel laureates, and countless world leaders. The colleges, each with unique traditions, have shaped British intellectual and political life for nearly a millennium.',
       'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800'),
      ($1, 'British Museum', 'british-museum', 'World''s greatest collection of human history',
       'Housing over 8 million objects spanning two million years of human history, the British Museum offers unparalleled educational opportunities. From the Rosetta Stone to the Elgin Marbles, it''s a journey through civilization.',
       'The museum is a cultural crossroads where visitors encounter treasures from every continent. Free entry reflects the British tradition of public education, and the Great Court hosts lectures, performances, and cultural festivals.',
       'Founded in 1753 as the first national public museum, it was based on the collection of physician Sir Hans Sloane. The iconic Reading Room has hosted Marx, Gandhi, and Oscar Wilde. The collection has grown through exploration, donation, and scholarship.',
       'https://images.unsplash.com/photo-1590099543022-c4e2d0b78a0e?w=800'),
      ($1, 'Tower of London', 'tower-of-london', 'Historic royal palace and fortress',
       'A UNESCO World Heritage Site, the Tower of London has served as a royal palace, prison, treasury, and menagerie. Today it houses the Crown Jewels and offers insights into 1000 years of British history.',
       'The Tower represents the pageantry of British monarchy. Yeoman Warders (Beefeaters) in Tudor uniforms conduct tours, and the Ceremony of the Keys has been performed nightly for 700 years without interruption.',
       'Built by William the Conqueror in 1066, the Tower has witnessed coronations, executions, and imprisonments of famous figures including Anne Boleyn and Sir Walter Raleigh. The ravens, according to legend, protect the kingdom.',
       'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800'),
      ($1, 'Edinburgh Castle', 'edinburgh-castle', 'Scotland''s iconic fortress',
       'Perched atop an ancient volcanic rock, Edinburgh Castle dominates the Scottish capital. It offers panoramic views and houses the Scottish Crown Jewels, Stone of Destiny, and military museums.',
       'The castle is the heart of Scottish cultural identity. The Edinburgh Military Tattoo, held annually on the esplanade, showcases military bands and performers from around the world against this dramatic backdrop.',
       'The rock has been occupied since the Iron Age. Mary Queen of Scots gave birth to James VI here in 1566. The One O''Clock Gun has been fired daily since 1861. The castle has witnessed sieges, royal dramas, and the birth of nations.',
       'https://images.unsplash.com/photo-1548636556-e91a222af833?w=800')
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
        'Statue of Liberty, Grand Canyon, Golden Gate, Times Square'
      ) RETURNING id
    `);
    const usaId = usaResult.rows[0].id;
    
    // USA places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'Silicon Valley', 'silicon-valley', 'Global hub of technology and innovation',
       'The birthplace of the tech revolution, Silicon Valley is home to Google, Apple, Facebook, and thousands of startups. Students can visit innovation centers, attend tech talks, and understand the ecosystem that changed the world.',
       'Silicon Valley embodies the American spirit of innovation and entrepreneurship. The culture of "move fast and break things" has attracted talent worldwide. Tech campuses often feature open architecture, collaborative spaces, and creative amenities.',
       'Named after the silicon chip manufacturers who settled here in the 1960s, the region grew from Hewlett-Packard''s garage startup to become the world''s technology capital. Stanford University has been central to its development.',
       'https://images.unsplash.com/photo-1531973486364-5fa64260d75b?w=800'),
      ($1, 'Smithsonian Institution', 'smithsonian', 'World''s largest museum complex',
       'The Smithsonian comprises 19 museums and galleries, including the National Air and Space Museum and Natural History Museum. With free admission and 154 million artifacts, it''s the world''s largest museum complex.',
       'The Smithsonian represents America''s commitment to public education and preservation. Each museum hosts cultural programs, research initiatives, and educational outreach. The institution shapes how America understands its history and the world.',
       'Founded in 1846 with a bequest from British scientist James Smithson, who never visited America. The original "Castle" building was completed in 1855. Today the institution includes research centers worldwide.',
       'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'),
      ($1, 'Harvard University', 'harvard', 'America''s oldest and most prestigious university',
       'Founded in 1636, Harvard is the oldest institution of higher education in the United States. Its campus in Cambridge, Massachusetts, offers tours of historic buildings, world-class museums, and the famous Harvard Yard.',
       'Harvard''s culture combines academic rigor with tradition. The House system, final clubs, and graduation ceremonies maintain centuries-old customs. The university has produced 8 US presidents and 160 Nobel laureates.',
       'Named after its first benefactor John Harvard, the university predates the country itself. It played crucial roles in American independence, abolition, and civil rights. The Widener Library houses 3.5 million books.',
       'https://images.unsplash.com/photo-1564499508722-5b80a2c8f1b2?w=800')
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
        'Eiffel Tower, Louvre, Versailles, Mont Saint-Michel'
      ) RETURNING id
    `);
    const franceId = franceResult.rows[0].id;
    
    // France places
    await pool.query(`
      INSERT INTO destination_places (destination_id, name, slug, short_description, description, culture, history, image_url) VALUES
      ($1, 'The Louvre', 'louvre', 'World''s largest and most visited museum',
       'Home to the Mona Lisa and 35,000 other works spanning 9,000 years, the Louvre is the world''s most visited museum. The glass pyramid entrance and Renaissance palace offer an unparalleled artistic education.',
       'The Louvre embodies France''s commitment to arts and culture. From Egyptian antiquities to French paintings, it represents humanity''s creative achievement. The museum hosts lectures, concerts, and educational programs.',
       'Originally a medieval fortress, it became a royal palace before opening as a museum in 1793 during the French Revolution. Napoleon expanded the collection through conquests. The glass pyramid was added in 1989.',
       'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'),
      ($1, 'Palace of Versailles', 'versailles', 'Symbol of absolute monarchy',
       'The Palace of Versailles represents the height of French royal power and artistry. Its Hall of Mirrors, gardens, and the Trianon palaces offer insights into 17th-century culture, politics, and landscape architecture.',
       'Versailles defined European court culture for centuries. Its gardens, fountains, and interiors influenced art and architecture worldwide. Today it hosts the Festival of Versailles and remains a symbol of French grandeur.',
       'Built by Louis XIV starting in 1661, Versailles was the seat of French government for over a century. The Treaty of Versailles ending WWI was signed in the Hall of Mirrors. The gardens cover 800 hectares.',
       'https://images.unsplash.com/photo-1594028066836-8cf66c69cb05?w=800')
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
        'Sydney Opera House, Great Barrier Reef, Uluru, Melbourne arts'
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
        'Brandenburg Gate, Neuschwanstein Castle, Berlin Wall'
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
        'Niagara Falls, Banff National Park, CN Tower, Quebec City'
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
    
    console.log("Destinations and places seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding destinations:", error);
  }
}
