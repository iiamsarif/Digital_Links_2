import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const port = Number(process.env.PORT || 5050);
const adminUser = process.env.ADMIN_USER || process.env.admin || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || process.env.password || "password";
const tokenSecret = process.env.ADMIN_TOKEN_SECRET || `${adminUser}:${adminPassword}`;

const client = new MongoClient(process.env.MONGODB_URI);
let db;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "upload", ext).replace(/[^a-z0-9_-]/gi, "-").slice(0, 48);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }
    cb(null, true);
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir, { maxAge: "30d", immutable: true }));

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", tokenSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return false;
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", tokenSecret).update(body).digest("base64url");
  if (signature !== expected) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!verifyToken(token)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

function publicUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

function collection(name) {
  return db.collection(name);
}

function normalizeProjectLink(value) {
  const link = String(value || "").trim();
  if (!link) return "";
  if (/^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

function normalizePackageItems(items) {
  return Array.isArray(items)
    ? items.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 5)
    : [];
}

function normalizePackagePrice(value) {
  const text = String(value || "").trim();
  return text || "Price 5000";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const { admin, password } = req.body || {};
  if (admin !== adminUser || password !== adminPassword) {
    res.status(401).json({ message: "Invalid admin credentials" });
    return;
  }

  res.json({
    token: signToken({ admin, exp: Date.now() + 1000 * 60 * 60 * 8 }),
  });
});

app.get("/api/photos", async (_req, res, next) => {
  try {
    const photos = await collection("photos").find({}).sort({ createdAt: -1 }).toArray();
    res.json({ photos });
  } catch (error) {
    next(error);
  }
});

app.post("/api/photos", requireAdmin, upload.single("photo"), async (req, res, next) => {
  try {
    const photoCount = await collection("photos").countDocuments();
    if (photoCount >= 10) {
      if (req.file?.filename) {
        fs.promises.rm(path.join(uploadDir, req.file.filename), { force: true }).catch(() => {});
      }
      res.status(400).json({ message: "Maximum 10 photos reached. Delete one photo before uploading another." });
      return;
    }

    const title = req.body.title || "";
    const url = req.file ? publicUrl(req, req.file.filename) : req.body.url;

    if (!url) {
      res.status(400).json({ message: "Upload a photo or provide an image URL." });
      return;
    }

    const document = {
      title,
      url,
      filename: req.file?.filename || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection("photos").insertOne(document);
    res.status(201).json({ photo: { ...document, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

app.put("/api/photos/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = {
      ...(typeof req.body.title === "string" ? { title: req.body.title } : {}),
      ...(typeof req.body.url === "string" ? { url: req.body.url } : {}),
      updatedAt: new Date(),
    };

    await collection("photos").updateOne({ _id: new ObjectId(id) }, { $set: update });
    const photo = await collection("photos").findOne({ _id: new ObjectId(id) });
    res.json({ photo });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/photos/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const photo = await collection("photos").findOne({ _id: new ObjectId(id) });
    if (photo?.filename) {
      fs.promises.rm(path.join(uploadDir, photo.filename), { force: true }).catch(() => {});
    }
    await collection("photos").deleteOne({ _id: new ObjectId(id) });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/projects", async (_req, res, next) => {
  try {
    const project = await collection("projects").findOne({ key: "active-links" });
    res.json({ links: project?.links || [] });
  } catch (error) {
    next(error);
  }
});

app.put("/api/projects", requireAdmin, async (req, res, next) => {
  try {
    const links = Array.isArray(req.body.links)
      ? req.body.links.map(normalizeProjectLink).filter(Boolean)
      : [];

    await collection("projects").updateOne(
      { key: "active-links" },
      {
        $set: {
          key: "active-links",
          links,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    res.json({ links });
  } catch (error) {
    next(error);
  }
});

app.get("/api/content/transform", async (_req, res, next) => {
  try {
    const content = await collection("content").findOne({ key: "transform-text" });
    res.json({ text: content?.text || "" });
  } catch (error) {
    next(error);
  }
});

app.put("/api/content/transform", requireAdmin, async (req, res, next) => {
  try {
    const text = String(req.body?.text || "").trim();
    await collection("content").updateOne(
      { key: "transform-text" },
      {
        $set: {
          key: "transform-text",
          text,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

app.get("/api/content/package", async (_req, res, next) => {
  try {
    const content = await collection("content").findOne({ key: "package-section" });
    res.json({
      items: content?.items || [],
      priceText: content?.priceText || "Price 5000",
      logoUrl: content?.logoUrl || "",
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/content/package", requireAdmin, async (req, res, next) => {
  try {
    const items = normalizePackageItems(req.body?.items);
    const priceText = normalizePackagePrice(req.body?.priceText);
    await collection("content").updateOne(
      { key: "package-section" },
      {
        $set: {
          key: "package-section",
          items,
          priceText,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    const content = await collection("content").findOne({ key: "package-section" });
    res.json({
      items: content?.items || [],
      priceText: content?.priceText || "Price 5000",
      logoUrl: content?.logoUrl || "",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/content/package/logo", requireAdmin, upload.single("logo"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Upload a logo image." });
      return;
    }

    const existing = await collection("content").findOne({ key: "package-section" });
    if (existing?.logoFilename) {
      fs.promises.rm(path.join(uploadDir, existing.logoFilename), { force: true }).catch(() => {});
    }

    const logoUrl = publicUrl(req, req.file.filename);
    await collection("content").updateOne(
      { key: "package-section" },
      {
        $set: {
          key: "package-section",
          logoUrl,
          logoFilename: req.file.filename,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          items: [],
          priceText: "Price 5000",
        },
      },
      { upsert: true },
    );

    const content = await collection("content").findOne({ key: "package-section" });
    res.json({
      items: content?.items || [],
      priceText: content?.priceText || "Price 5000",
      logoUrl: content?.logoUrl || "",
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message || "Server error" });
});

async function start() {
  await client.connect();
  db = client.db(process.env.DB_NAME || "DG_Links");
  await collection("photos").createIndex({ createdAt: -1 });
  await collection("projects").createIndex({ key: 1 }, { unique: true });
  await collection("content").createIndex({ key: 1 }, { unique: true });

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
