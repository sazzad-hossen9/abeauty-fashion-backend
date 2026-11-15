import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const products = [
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000001"),
    id: "rose-dew-hydrating-serum",
    name: "Rose Dew Hydrating Serum",
    nameBn: "রোজ ডিউ হাইড্রেটিং সিরাম",
    category: "Skincare",
    subCategory: "Serums",
    price: 28.00,
    wasPrice: null,
    rating: 4.9,
    reviewCount: 212,
    tint: "#FBE4EA",
    badge: "Bestseller",
    badgeType: "default",
    inStock: true,
    isNew: false,
    isBestseller: true,
    concerns: ["Dryness & dehydration", "Dullness", "Sensitive skin"],
    description: "A lightweight, fragrance-free serum with hyaluronic acid and rose water that floods skin with moisture and leaves a soft, dewy finish. Layers easily under makeup.",
    descriptionBn: "হায়ালুরোনিক অ্যাসিড ও গোলাপজলের হালকা, সুগন্ধিমুক্ত সিরাম যা ত্বককে গভীরভাবে আর্দ্র করে এবং সতেজ আভা দেয়।",
    tags: ["Hydrating", "Fragrance-free", "Vegan", "All skin types"],
    sizes: [
      { name: "30 ml", price: 28.00, selected: true },
      { name: "50 ml", price: 42.00 },
      { name: "Duo pack", price: 50.00 }
    ],
    details: "Glass dropper bottle with UV protection. Suitable for all skin types, including highly reactive and sensitive skin. Use morning and night after cleansing.",
    howToUse: "Dispense 3–4 drops onto freshly cleansed, slightly damp skin. Gently press into face, neck and décolletage until absorbed. Follow with moisturizer.",
    ingredients: "Aqua (Water), Rosa Damascena Flower Water, Sodium Hyaluronate, Glycerin, Panthenol, Niacinamide (2%), Beta-Glucan, Phenoxyethanol, Ethylhexylglycerin.",
    shippingInfo: "Free shipping on orders over $50. Unopened items can be returned within 30 days for a full refund."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000002"),
    id: "velvet-matte-lip-tint",
    name: "Velvet Matte Lip Tint",
    nameBn: "ভেলভেট ম্যাট লিপ টিন্ট",
    category: "Makeup",
    subCategory: "Lips",
    price: 16.00,
    wasPrice: null,
    rating: 4.8,
    reviewCount: 94,
    tint: "#F6D7E0",
    badge: "New",
    badgeType: "new",
    inStock: true,
    isNew: true,
    isBestseller: false,
    concerns: ["Dullness"],
    description: "Weightless velvety matte color with nourishing jojoba oil and vitamin E that lasts all day without drying or settling into fine lip lines.",
    descriptionBn: "ভারহীন ভেলভেটি ম্যাট লিপ কালার যা জোজোবা অয়েল সমৃদ্ধ এবং সারাদিন ঠোঁট মসৃণ রাখে।",
    tags: ["Long-lasting", "Non-drying", "Vitamin E", "Cruelty-free"],
    shades: ["01 Petal Rose", "02 Berry Velvet", "03 Soft Nude", "04 Cherry Kiss"],
    sizes: [
      { name: "Standard (4.5g)", price: 16.00, selected: true },
      { name: "Duo Shade Pack", price: 28.00 }
    ],
    details: "Velvety applicator for precision contouring. Dermatologically tested and free from synthetic fragrances.",
    howToUse: "Apply from center of lips outward for a soft blurred gradient, or layer fully for rich, bold pigment.",
    ingredients: "Dimethicone, Dimethicone Crosspolymer, Jojoba Seed Oil, Tocopheryl Acetate (Vitamin E), Iron Oxides, Red 7 Lake.",
    shippingInfo: "Fast nationwide dispatch. Dispatched in tamper-proof hygienic eco-packaging."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000003"),
    id: "overnight-repair-hair-mask",
    name: "Overnight Repair Hair Mask",
    nameBn: "ওভারনাইট রিপেয়ার হেয়ার মাস্ক",
    category: "Hair Care",
    subCategory: "Masks",
    price: 22.00,
    wasPrice: null,
    rating: 4.7,
    reviewCount: 78,
    tint: "#FAF0D4",
    badge: "",
    badgeType: "",
    inStock: true,
    isNew: false,
    isBestseller: false,
    concerns: ["Frizz & breakage", "Dryness & dehydration"],
    description: "Deep conditioning overnight treatment with cold-pressed Moroccan argan oil and botanical keratin to repair split ends and eliminate frizz.",
    descriptionBn: "মরক্কান আর্গান অয়েল এবং উদ্ভিজ্জ কেরাটিন সমৃদ্ধ ডিপ কন্ডিশনিং হেয়ার মাস্ক যা চুলের ডগা ফাটা রোধ করে।",
    tags: ["Silicone-free", "Color-safe", "Argan Oil", "Deep Repair"],
    sizes: [
      { name: "150 ml", price: 22.00, selected: true },
      { name: "300 ml Jumbo", price: 36.00 }
    ],
    details: "Zero residue on pillowcases. Rinses clean without heavy buildup.",
    howToUse: "Work through damp or dry mid-lengths and ends before bed. Sleep in a silk scarf or wash out in morning.",
    ingredients: "Aqua, Cetearyl Alcohol, Argania Spinosa Kernel Oil, Hydrolyzed Pea Protein, Shea Butter, Behentrimonium Chloride.",
    shippingInfo: "Ships within 24 hours in climate-controlled packaging."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000004"),
    id: "nano-ionic-facial-steamer",
    name: "Nano Ionic Facial Steamer",
    nameBn: "ন্যানো আয়নিক ফেসিয়াল স্টিমার",
    category: "Beauty Tools",
    subCategory: "Steamers",
    price: 49.00,
    wasPrice: 65.00,
    rating: 4.8,
    reviewCount: 165,
    tint: "#E2ECF6",
    badge: "Sale",
    badgeType: "sale",
    inStock: true,
    isNew: false,
    isBestseller: true,
    concerns: ["Breakouts", "Dullness", "Dryness & dehydration"],
    description: "Warm nano-mist penetrates skin up to 10x more effectively, opening pores before cleansing and priming skin for serum absorption.",
    descriptionBn: "গভীরভাবে পোর পরিষ্কার করার ন্যানো-আয়নিক স্টিম প্রযুক্তি। আমাদের বায়িং গাইডের সেরা পণ্য।",
    tags: ["Nano-steam", "Auto-shutoff", "BPA-Free", "Award Winner"],
    sizes: [
      { name: "Standard (90ml tank)", price: 49.00, selected: true }
    ],
    details: "Includes precision steam nozzle, 90ml water tank (15 min continuous mist), and essential oil aroma chamber.",
    howToUse: "Fill reservoir with distilled water. Power on and hold face 8–10 inches away for 8–12 minutes.",
    ingredients: "Medical-grade ABS plastic, ceramic PTC heating element.",
    shippingInfo: "Includes 1-year official brand warranty and easy 30-day exchange."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000005"),
    id: "soft-glow-cushion-foundation",
    name: "Soft Glow Cushion Foundation",
    nameBn: "সফট গ্লো কুশন ফাউন্ডেশন",
    category: "Makeup",
    subCategory: "Face",
    price: 34.00,
    wasPrice: null,
    rating: 4.6,
    reviewCount: 112,
    tint: "#FCE6D9",
    badge: "New",
    badgeType: "new",
    inStock: true,
    isNew: true,
    isBestseller: false,
    concerns: ["Dullness", "Sensitive skin"],
    description: "Buildable breathable coverage with SPF 50+ PA++++ that delivers a natural, luminous satin finish without caking.",
    descriptionBn: "এসপিএফ ৫০+ যুক্ত হালকা ও দীর্ঘস্থায়ী কুশন ফাউন্ডেশন, যা ত্বকে দেয় নিখুঁত দীপ্তি।",
    tags: ["SPF 50+", "Non-comedogenic", "Includes Refill", "Satin Glow"],
    shades: ["01 Porcelain Glow", "02 Natural Beige", "03 Warm Honey", "04 Golden Caramel"],
    sizes: [
      { name: "15g + 15g Refill", price: 34.00, selected: true }
    ],
    details: "Comes with antibacterial rubycell teardrop puff and mirror compact.",
    howToUse: "Gently press the puff into the sponge cushion and pat lightly across face from center outwards.",
    ingredients: "Titanium Dioxide, Zinc Oxide, Centella Asiatica Extract, Niacinamide, Adenosine, Dimethicone.",
    shippingInfo: "Delivered in eco-friendly protective casing."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000006"),
    id: "mulberry-silk-pillowcase",
    name: "Mulberry Silk Pillowcase",
    nameBn: "মালবেরি সিল্ক বালিশের কভার",
    category: "Personal Care",
    subCategory: "Night Care",
    price: 39.00,
    wasPrice: null,
    rating: 4.9,
    reviewCount: 310,
    tint: "#ECE4F6",
    badge: "Bestseller",
    badgeType: "default",
    inStock: true,
    isNew: false,
    isBestseller: true,
    concerns: ["Fine lines", "Frizz & breakage", "Sensitive skin"],
    description: "100% 22-Momme Grade 6A pure mulberry silk that protects delicate facial skin from sleep wrinkles and prevents morning hair tangles.",
    descriptionBn: "১০০% খাঁটি ২২-মোমে মালবেরি সিল্ক যা ঘুমের সময় ত্বকের বলিরেখা ও চুলের রুক্ষতা প্রতিরোধ করে।",
    tags: ["100% Pure Silk", "Hypoallergenic", "Anti-aging", "Hidden Zipper"],
    shades: ["Champagne Ivory", "Blush Rose", "Midnight Onyx", "Silver Mist"],
    sizes: [
      { name: "Standard (20x26 in)", price: 39.00, selected: true },
      { name: "King (20x36 in)", price: 46.00 }
    ],
    details: "OEKO-TEX certified non-toxic dyes. Machine washable on delicate cycle with pH neutral detergent.",
    howToUse: "Slip onto your favorite pillow. Wake up with smooth hair and hydrated skin.",
    ingredients: "100% 22-Momme Grade 6A Pure Mulberry Silk.",
    shippingInfo: "Luxury branded gift box included with every pillowcase."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000007"),
    id: "gentle-amino-foam-cleanser",
    name: "Gentle Amino Foam Cleanser",
    nameBn: "জেন্টল অ্যামিনো ফোম ক্লিনজার",
    category: "Skincare",
    subCategory: "Cleansers",
    price: 18.00,
    wasPrice: null,
    rating: 4.7,
    reviewCount: 142,
    tint: "#E2EEE5",
    badge: "",
    badgeType: "",
    inStock: true,
    isNew: false,
    isBestseller: false,
    concerns: ["Breakouts", "Sensitive skin", "Dryness & dehydration"],
    description: "pH 5.5 balanced amino acid cleanser that sweeps away sunscreen, makeup and environmental pollutants without disrupting the lipid moisture barrier.",
    descriptionBn: "ত্বকের প্রাকৃতিক আর্দ্রতা অক্ষুণ্ণ রেখে মেকআপ ও ময়লা দূর করার কোমল অ্যামিনো ফোম ক্লিনজার।",
    tags: ["pH 5.5", "Sulfate-free", "Centella Asiatica", "Non-stripping"],
    sizes: [
      { name: "120 ml", price: 18.00, selected: true },
      { name: "200 ml Value Size", price: 26.00 }
    ],
    details: "Gentle apple-derived amino acid surfactants foam into a plush micro-bubble lather.",
    howToUse: "Pump 1–2 times onto wet palms. Lather into foam and massage onto face in circular motions for 60 seconds. Rinse with lukewarm water.",
    ingredients: "Water, Potassium Cocoyl Glycinate, Disodium Cocoamphodiacetate, Centella Asiatica Extract, Green Tea Extract, Allantoin.",
    shippingInfo: "Ships within 24 hours."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000008"),
    id: "pro-ionic-hair-dryer-1800w",
    name: "Pro Ionic Hair Dryer 1800W",
    nameBn: "প্রো আয়নিক হেয়ার ড্রায়ার ১৮০০W",
    category: "Beauty Tools",
    subCategory: "Dryers",
    price: 79.00,
    wasPrice: 99.00,
    rating: 4.8,
    reviewCount: 220,
    tint: "#F1E8DF",
    badge: "Sale",
    badgeType: "sale",
    inStock: true,
    isNew: false,
    isBestseller: true,
    concerns: ["Frizz & breakage"],
    description: "Salon-grade ionic airflow locks in natural moisture for 50% faster drying time, ultra-quiet operation and zero heat frizz.",
    descriptionBn: "অত্যাধুনিক আয়নিক প্রযুক্তির ১৮০০ ওয়াট ড্রায়ার যা চুলে ক্ষতিকর তাপ ছাড়াই ৫০% দ্রুত শুকিয়ে দেয়।",
    tags: ["Negative Ions", "110,000 RPM Motor", "Magnetic Nozzles", "Lightweight 390g"],
    sizes: [
      { name: "Full Set (2 Nozzles + Diffuser)", price: 79.00, selected: true }
    ],
    details: "3 heat settings, 3 speed settings, instant cool-shot button and intelligent heat sensor preventing burn damage.",
    howToUse: "Towel dry hair to remove excess water. Select desired heat/speed and use magnetic styling concentrator for precision smoothing.",
    ingredients: "Heat-resistant polymer, brushless DC motor, tourmaline ceramic grille.",
    shippingInfo: "2-year manufacturer warranty with doorstep replacement guarantee."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000009"),
    id: "barrier-repair-night-cream",
    name: "Barrier Repair Night Cream",
    nameBn: "ব্যারিয়ার রিপেয়ার নাইট ক্রিম",
    category: "Skincare",
    subCategory: "Moisturisers",
    price: 32.00,
    wasPrice: null,
    rating: 4.8,
    reviewCount: 185,
    tint: "#ECE4F6",
    badge: "New",
    badgeType: "new",
    inStock: true,
    isNew: true,
    isBestseller: false,
    concerns: ["Dryness & dehydration", "Fine lines", "Sensitive skin"],
    description: "Multi-ceramide lipid complex cream that fortifies weakened moisture barriers, calms irritation and seals in overnight hydration.",
    descriptionBn: "সেরামাইড ও পেপটাইড সমৃদ্ধ পুষ্টিকর নাইট ক্রিম যা ত্বকের সুরক্ষাবলয় মজবুত করে।",
    tags: ["5 Essential Ceramides", "Peptides", "Fragrance-free", "Dermatologist Tested"],
    sizes: [
      { name: "50 ml Jar", price: 32.00, selected: true },
      { name: "100 ml Tube", price: 54.00 }
    ],
    details: "Airless pump jar ensures zero contamination and preserved active ingredient potency.",
    howToUse: "Smooth a hazelnut-sized amount over face and neck as the final step in your nighttime routine.",
    ingredients: "Aqua, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Shea Butter.",
    shippingInfo: "Ships within 24 hours."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000010"),
    id: "vitamin-c-brightening-drops",
    name: "Vitamin C Brightening Drops",
    nameBn: "ভিটামিন সি ব্রাইটনিং ড্রপস",
    category: "Skincare",
    subCategory: "Serums",
    price: 26.00,
    wasPrice: 32.00,
    rating: 4.6,
    reviewCount: 97,
    tint: "#FAF0D4",
    badge: "Sale",
    badgeType: "sale",
    inStock: true,
    isNew: false,
    isBestseller: false,
    concerns: ["Dullness", "Fine lines"],
    description: "15% stabilized Vitamin C complex enriched with ferulic acid and Kakadu plum to fade post-acne dark marks and brighten tired skin.",
    descriptionBn: "১৫% স্টেবিলাইজড ভিটামিন সি সিরাম যা দাগ দূর করে ত্বকে আনে স্বাস্থ্যোজ্জ্বল ঔজ্জ্বল্য।",
    tags: ["15% Active C", "Ferulic Acid", "Dark Spot Fading", "Antioxidant Shield"],
    sizes: [
      { name: "30 ml", price: 26.00, selected: true }
    ],
    details: "Formulated at optimal pH 3.2 for maximum absorption without tingling or irritation.",
    howToUse: "Apply 3–5 drops in the morning before moisturizer. Always follow with broad spectrum SPF.",
    ingredients: "Ascorbic Acid, Ferulic Acid, Tocopherol, Kakadu Plum Extract, Propanediol, Hyaluronic Acid.",
    shippingInfo: "Protected in amber UV-filtering glass."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000011"),
    id: "petal-blush-stick",
    name: "Petal Blush Stick",
    nameBn: "পেটাল ব্লাশ স্টিক",
    category: "Makeup",
    subCategory: "Cheeks",
    price: 19.00,
    wasPrice: null,
    rating: 4.7,
    reviewCount: 88,
    tint: "#FCE6D9",
    badge: "",
    badgeType: "",
    inStock: true,
    isNew: false,
    isBestseller: false,
    concerns: ["Dullness"],
    description: "Multitasking cream-to-powder cheek and lip stick that melts into skin for an effortless sun-kissed, watercolor glow.",
    descriptionBn: "সহজে মিশে যাওয়া ক্রিম ব্লাশ স্টিক যা গাল ও ঠোঁটে এনে দেয় মিষ্টি গোলাপি ছোঁয়া।",
    tags: ["Multi-use", "Buildable", "Nourishing", "Travel Friendly"],
    shades: ["Morning Rose", "Warm Apricot", "Soft Mauve", "Berry Flush"],
    sizes: [
      { name: "8g Stick", price: 19.00, selected: true }
    ],
    details: "Infused with organic rosehip seed oil and squalane for seamless blending.",
    howToUse: "Swipe directly onto cheeks and tap with fingertips or a fluffy blush brush.",
    ingredients: "Squalane, Rosa Canina Fruit Oil, Candelilla Wax, Mica, Titanium Dioxide, Iron Oxides.",
    shippingInfo: "Ships immediately."
  },
  {
    _id: new ObjectId("672001a1b2c3d4e5f6000012"),
    id: "jade-facial-roller-gua-sha",
    name: "Jade Facial Roller & Gua Sha Set",
    nameBn: "জেড ফেসিয়াল রোলার ও গুয়া শা সেট",
    category: "Beauty Tools",
    subCategory: "Rollers",
    price: 24.00,
    wasPrice: null,
    rating: 4.7,
    reviewCount: 134,
    tint: "#E2ECF6",
    badge: "",
    badgeType: "",
    inStock: true,
    isNew: false,
    isBestseller: false,
    concerns: ["Fine lines", "Sensitive skin"],
    description: "Authentic Xiuyan natural jade stone roller and heart-shaped gua sha tool to boost microcirculation, relieve tension and drain puffiness.",
    descriptionBn: "১০০% আসল জেড পাথরের ফেসিয়াল রোলার যা মুখের রক্ত সঞ্চালন বাড়ায় ও ফোলাভাব কমায়।",
    tags: ["100% Real Jade", "Dual-ended", "Noise-free Frame", "Gift Set"],
    sizes: [
      { name: "2-Piece Set (Roller + Gua Sha)", price: 24.00, selected: true }
    ],
    details: "Features reinforced zinc alloy brackets and silicone noise dampers for completely squeak-free rolling.",
    howToUse: "Apply facial oil or serum first. Roll upward and outward along jawline, cheekbones, and forehead.",
    ingredients: "Natural Xiuyan Jade stone, rose-gold plated zinc alloy frame.",
    shippingInfo: "Safely packaged in foam-lined protective gift box."
  }
];

async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas.");

    const db = client.db("abeauty-fashion");
    const productsCollection = db.collection("products");

    // Remove existing products to avoid duplicates
    await productsCollection.deleteMany({});
    console.log("Cleared existing products.");

    // Insert all 12 products
    const result = await productsCollection.insertMany(products);
    console.log(`Successfully seeded ${result.insertedCount} products into database!`);

  } catch (error) {
    console.error("Error during database seed:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

seedDatabase();

