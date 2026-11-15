import express from "express";
import cors from "cors";
import crypto from "crypto";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3005"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const ALLOWED_CATEGORIES = new Set([
  "skincare",
  "makeup",
  "hair-care",
  "personal-care",
  "fragrance",
  "beauty-tools",
]);
const ALLOWED_BADGES = new Set(["bestseller", "new", "sale"]);
const SORT_MAP = {
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { "variants.0.price": 1, price: 1, _id: 1 },
  "price-desc": { "variants.0.price": -1, price: -1, _id: -1 },
  rating: { ratingAvg: -1, ratingCount: -1, _id: -1 },
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPrimaryImage(media) {
  if (!Array.isArray(media) || media.length === 0) return null;
  const first = media.find(
    (m) =>
      m &&
      m.type !== "video" &&
      typeof m.url === "string" &&
      m.url.trim() &&
      m.url.trim() !== "***" &&
      (m.url.includes("i.ibb.co") || /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(m.url))
  );
  if (first) return first.url.trim();
  const any = media.find(
    (m) =>
      m &&
      m.type !== "video" &&
      typeof m.url === "string" &&
      m.url.trim() &&
      m.url.trim() !== "***"
  );
  return any ? any.url.trim() : null;
}

function serializeProduct(doc) {
  if (!doc) return null;
  const directImage = doc.image || getPrimaryImage(doc.media) || null;
  return {
    ...doc,
    _id: String(doc._id),
    image: directImage,
  };
}

// MongoDB Connection
const client = new MongoClient(process.env.MONGODB_URI);

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, key] = stored.split(":");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
}

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const { passwordHash, password, ...safe } = userDoc;
  return { ...safe, id: userDoc._id.toString() };
}

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const db = client.db("abeauty-fashion");
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");
    const wishlistCollection = db.collection("wishlist");
    const usersCollection = db.collection("users");
    const articlesCollection = db.collection("articles");
    const reviewsCollection = db.collection("reviews");
    const couponsCollection = db.collection("coupons");
    const countersCollection = db.collection("counters");
    const contactsCollection = db.collection("contacts");

    const getNextSequence = async (name, startAt = 1000) => {
      const counter = await countersCollection.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      const seq = counter?.seq ?? counter?.value?.seq ?? 1;
      return startAt + seq;
    };

    // Create product indexes at startup
    await Promise.all([
      productsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true }),
      productsCollection.createIndex({ isActive: 1, category: 1 }),
      productsCollection.createIndex({ badge: 1 }),
    ]).catch((err) => console.warn("Product index creation warning:", err.message));

    // ==================== PRODUCTS APIS ====================
    const listProductsHandler = async (req, res) => {
      try {
        const { category, subcategory, badge, q, sort, page, limit } = req.query;
        const filter = { isActive: true };

        if (category !== undefined && String(category).trim() !== "") {
          const normalizedCat = String(category).trim().toLowerCase().replace(/\s+/g, "-");
          if (normalizedCat !== "all" && normalizedCat !== "shop-all") {
            if (!ALLOWED_CATEGORIES.has(normalizedCat)) {
              return res.status(400).json({ error: "Invalid category parameter" });
            }
            filter.category = normalizedCat;
          }
        }

        if (subcategory !== undefined && String(subcategory).trim() !== "") {
          const sub = String(subcategory).trim().toLowerCase().replace(/\s+/g, "-");
          if (sub.length > 64 || !/^[a-z0-9-]+$/.test(sub)) {
            return res.status(400).json({ error: "Invalid subcategory parameter" });
          }
          filter.subcategory = sub;
        }

        if (badge !== undefined && String(badge).trim() !== "") {
          const normalizedBadge = String(badge).trim().toLowerCase();
          if (!ALLOWED_BADGES.has(normalizedBadge)) {
            return res.status(400).json({ error: "Invalid badge parameter" });
          }
          filter.badge = normalizedBadge;
        }

        if (q !== undefined && String(q).trim() !== "") {
          const rawQ = String(q).trim();
          if (rawQ.length > 100) {
            return res.status(400).json({ error: "Search query is too long" });
          }
          const searchRegex = new RegExp(escapeRegex(rawQ), "i");
          filter.$or = [
            { name: searchRegex },
            { tags: searchRegex },
            { description: searchRegex },
          ];
        }

        let sortSpec = SORT_MAP.newest;
        if (sort !== undefined && String(sort).trim() !== "") {
          const sortKey = String(sort).trim().toLowerCase();
          if (!SORT_MAP[sortKey]) {
            return res.status(400).json({ error: "Invalid sort parameter" });
          }
          sortSpec = SORT_MAP[sortKey];
        }

        let parsedPage = 1;
        if (page !== undefined && String(page).trim() !== "") {
          if (!/^\d+$/.test(String(page).trim())) {
            return res.status(400).json({ error: "Invalid page parameter" });
          }
          parsedPage = Math.max(1, parseInt(String(page).trim(), 10));
        }

        let parsedLimit = 12;
        if (limit !== undefined && String(limit).trim() !== "") {
          if (!/^\d+$/.test(String(limit).trim())) {
            return res.status(400).json({ error: "Invalid limit parameter" });
          }
          parsedLimit = Math.min(48, Math.max(1, parseInt(String(limit).trim(), 10)));
        }

        const total = await productsCollection.countDocuments(filter);
        const docs = await productsCollection
          .find(filter)
          .sort(sortSpec)
          .skip((parsedPage - 1) * parsedLimit)
          .limit(parsedLimit)
          .toArray();

        const totalPages = total > 0 ? Math.ceil(total / parsedLimit) : 0;
        res.json({
          items: docs.map(serializeProduct),
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages,
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
      }
    };

    const getProductBySlugHandler = async (req, res) => {
      try {
        const slug = String(req.params.slug || "").trim();
        if (!slug || slug.length > 120) {
          return res.status(400).json({ error: "Invalid product slug" });
        }
        const orClauses = [{ slug }, { id: slug }];
        if (ObjectId.isValid(slug) && slug.length === 24) {
          orClauses.push({ _id: new ObjectId(slug) });
        }
        const product = await productsCollection.findOne({
          isActive: true,
          $or: orClauses,
        });
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.json(serializeProduct(product));
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch product details" });
      }
    };

    const getRelatedProductsHandler = async (req, res) => {
      try {
        const slug = String(req.params.slug || "").trim();
        if (!slug || slug.length > 120) {
          return res.status(400).json({ error: "Invalid product slug" });
        }
        const orClauses = [{ slug }, { id: slug }];
        if (ObjectId.isValid(slug) && slug.length === 24) {
          orClauses.push({ _id: new ObjectId(slug) });
        }
        const current = await productsCollection.findOne({
          isActive: true,
          $or: orClauses,
        });
        if (!current) {
          return res.status(404).json({ error: "Product not found" });
        }
        const related = await productsCollection
          .find({
            isActive: true,
            category: current.category,
            _id: { $ne: current._id },
          })
          .limit(4)
          .toArray();
        res.json(related.map(serializeProduct));
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch related products" });
      }
    };

    app.get(["/api/products", "/products"], listProductsHandler);
    app.get(["/api/products/:slug/related", "/products/:slug/related"], getRelatedProductsHandler);
    app.get(["/api/products/:slug", "/products/:slug"], getProductBySlugHandler);

    // ==================== ARTICLES APIS ====================
    app.get("/api/articles", async (req, res) => {
      try {
        const articles = await articlesCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.send(articles);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch articles" });
      }
    });

    // ==================== REVIEWS APIS ====================
    app.get("/api/reviews", async (req, res) => {
      try {
        const productId = req.query.productId;
        const query = productId ? { productId } : {};
        const reviews = await reviewsCollection.find(query).sort({ createdAt: -1, _id: -1 }).toArray();
        res.send(reviews);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch reviews" });
      }
    });

    app.post("/api/reviews", async (req, res) => {
      try {
        const { productId, who, skin, rating, title, body } = req.body || {};
        if (!productId || !who || !title || !body) {
          return res.status(400).send({ error: "productId, name, title, and body are required" });
        }
        const reviewDoc = {
          productId: String(productId),
          who: String(who).trim(),
          skin: skin || "Normal skin",
          rating: Number(rating) || 5,
          title: String(title).trim(),
          body: String(body).trim(),
          verified: false,
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
        };
        const result = await reviewsCollection.insertOne(reviewDoc);
        res.status(201).send({
          success: true,
          review: { _id: result.insertedId, id: result.insertedId.toString(), ...reviewDoc },
        });
      } catch (error) {
        res.status(500).send({ error: "Failed to submit review" });
      }
    });

    // ==================== ORDERS APIS ====================
    app.get("/api/orders", async (req, res) => {
      try {
        const userId = req.query.userId;
        if (!userId) {
          return res.status(400).send({ error: "userId query parameter is required" });
        }
        const orders = await ordersCollection
          .find({ userId })
          .sort({ createdAt: -1, _id: -1 })
          .toArray();
        res.send(orders);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch orders" });
      }
    });

    app.post("/api/orders", async (req, res) => {
      try {
        const payload = req.body || {};
        if (!Array.isArray(payload.items) || payload.items.length === 0) {
          return res.status(400).send({ error: "Order must include at least one item" });
        }
        const seqNumber = await getNextSequence("orderNumber", 1000);
        const now = new Date();
        const orderDoc = {
          ...payload,
          orderNumber: `#${seqNumber}`,
          date: now.toISOString().split("T")[0],
          createdAt: now.toISOString(),
          status: "Processing",
          statusColor: { bg: "#FBF1D6", fg: "#7A5A10" },
          itemsCount: payload.items.reduce((sum, i) => sum + (Number(i.qty) || 1), 0),
        };
        const result = await ordersCollection.insertOne(orderDoc);
        res.status(201).send({
          success: true,
          message: "Order placed successfully",
          order: { _id: result.insertedId, ...orderDoc },
          result,
        });
      } catch (error) {
        res.status(500).send({ error: "Failed to place order" });
      }
    });

    // ==================== WISHLIST APIS ====================
    app.get("/api/wishlist", async (req, res) => {
      try {
        const userId = req.query.userId;
        if (!userId) {
          return res.status(400).send({ error: "userId query parameter is required" });
        }
        const wishlist = await wishlistCollection.find({ userId }).toArray();
        res.send(wishlist);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch wishlist" });
      }
    });

    app.post("/api/wishlist", async (req, res) => {
      try {
        const { userId, ...product } = req.body || {};
        if (!userId) {
          return res.status(400).send({ error: "userId is required to save wishlist item" });
        }
        const productId = product.productId || product.id || product._id;
        if (!productId) {
          return res.status(400).send({ error: "Product identifier is required" });
        }
        const existing = await wishlistCollection.findOne({
          userId,
          $or: [{ productId }, { id: productId }],
        });
        if (existing) {
          return res.send({ success: true, message: "Already in wishlist", item: existing });
        }
        const wishlistDoc = {
          ...product,
          userId,
          productId: String(productId),
          addedAt: new Date().toISOString(),
        };
        delete wishlistDoc._id;
        const result = await wishlistCollection.insertOne(wishlistDoc);
        res.status(201).send({
          success: true,
          message: "Added to wishlist",
          item: { _id: result.insertedId, ...wishlistDoc },
          result,
        });
      } catch (error) {
        res.status(500).send({ error: "Failed to add to wishlist" });
      }
    });

    app.delete("/api/wishlist/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const userId = req.query.userId;
        const idMatch =
          ObjectId.isValid(id) && id.length === 24
            ? { $or: [{ _id: new ObjectId(id) }, { id }, { productId: id }] }
            : { $or: [{ id }, { productId: id }] };
        const query = userId ? { $and: [{ userId }, idMatch] } : idMatch;
        const result = await wishlistCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Wishlist item not found" });
        }
        res.send({ success: true, message: "Removed from wishlist", result });
      } catch (error) {
        res.status(500).send({ error: "Failed to remove from wishlist" });
      }
    });

    // ==================== USERS / AUTH APIS ====================
    app.post("/api/users/register", async (req, res) => {
      try {
        const { firstName, lastName, email, password, phone } = req.body || {};
        if (!email || !password) {
          return res.status(400).send({ error: "Email and password are required" });
        }
        const normalizedEmail = String(email).trim().toLowerCase();
        const existing = await usersCollection.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).send({ error: "An account with this email already exists" });
        }
        const now = new Date();
        const userDoc = {
          firstName: String(firstName || "").trim(),
          lastName: String(lastName || "").trim(),
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          phone: phone ? String(phone).trim() : "",
          address: { street: "", apt: "", city: "", state: "", zip: "", country: "" },
          savedPayment: null,
          memberSince: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          createdAt: now.toISOString(),
        };
        const result = await usersCollection.insertOne(userDoc);
        res.status(201).send({
          success: true,
          user: sanitizeUser({ _id: result.insertedId, ...userDoc }),
        });
      } catch (error) {
        res.status(500).send({ error: "Failed to create account" });
      }
    });

    app.post("/api/users/login", async (req, res) => {
      try {
        const { email, password } = req.body || {};
        if (!email || !password) {
          return res.status(400).send({ error: "Email and password are required" });
        }
        const normalizedEmail = String(email).trim().toLowerCase();
        const userDoc = await usersCollection.findOne({ email: normalizedEmail });
        if (!userDoc || !verifyPassword(password, userDoc.passwordHash)) {
          return res.status(401).send({ error: "Invalid email or password" });
        }
        res.send({ success: true, user: sanitizeUser(userDoc) });
      } catch (error) {
        res.status(500).send({ error: "Failed to sign in" });
      }
    });

    app.patch("/api/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid user ID" });
        }
        const allowed = {};
        for (const key of ["firstName", "lastName", "phone", "address", "savedPayment"]) {
          if (req.body && req.body[key] !== undefined) {
            allowed[key] = req.body[key];
          }
        }
        const updated = await usersCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: allowed },
          { returnDocument: "after" }
        );
        const doc = updated?.value ?? updated;
        if (!doc) {
          return res.status(404).send({ error: "User not found" });
        }
        res.send({ success: true, user: sanitizeUser(doc) });
      } catch (error) {
        res.status(500).send({ error: "Failed to update user profile" });
      }
    });

    // ==================== COUPONS & CONTACT APIS ====================
    app.post("/api/coupons/validate", async (req, res) => {
      try {
        const code = String(req.body?.code || "").trim().toUpperCase();
        if (!code) {
          return res.status(400).send({ error: "Please enter a coupon code" });
        }
        const coupon = await couponsCollection.findOne({ code, active: { $ne: false } });
        if (!coupon) {
          return res.status(404).send({ error: "Invalid or expired coupon code" });
        }
        res.send({
          success: true,
          coupon: {
            code: coupon.code,
            rate: Number(coupon.rate) || 0,
            freeShip: Boolean(coupon.freeShip),
            desc: coupon.desc || coupon.code,
          },
        });
      } catch (error) {
        res.status(500).send({ error: "Failed to validate coupon" });
      }
    });

    app.post("/api/contact", async (req, res) => {
      try {
        const { name, email, topic, orderNumber, message } = req.body || {};
        if (!name || !email || !message) {
          return res.status(400).send({ error: "Name, email, and message are required" });
        }
        const ticketNumber = await getNextSequence("contactTicket", 2000);
        const ticketDoc = {
          ref: `#T-${ticketNumber}`,
          name: String(name).trim(),
          email: String(email).trim(),
          topic: topic || "General",
          orderNumber: orderNumber ? String(orderNumber).trim() : "",
          message: String(message).trim(),
          createdAt: new Date().toISOString(),
        };
        await contactsCollection.insertOne(ticketDoc);
        res.status(201).send({ success: true, ref: ticketDoc.ref });
      } catch (error) {
        res.status(500).send({ error: "Failed to submit contact inquiry" });
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ message: "A-Beauty & Fashion Server is running successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
