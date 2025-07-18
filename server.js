import express from "express";
import mongoose from "mongoose";
import url_model from "./models/shorturl.js";
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Constants
const PORT = 5001;
const LOCALHOST_IP = "127.0.0.1";
const MONGO_URI = `mongodb://${LOCALHOST_IP}:27017/Url_Shortner`;
const LOCAL_URL = `http://localhost:${PORT}`;

const connectMongoDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Successfully Connected to MongoDB !!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", async (req, res) => {
  const urlLists = await url_model.find();
  res.render("index", { shorturls: urlLists });
});

app.post("/shorturls", async (req, res) => {
  await url_model.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shorturl", async (req, res) => {
  const shorturl = await url_model.findOne({ short: req.params.shorturl });
  if (shorturl == null) return res.sendStatus(404);

  shorturl.clicks++;
  await shorturl.save();

  res.redirect(shorturl.full);
});

app.post("/:id", async (req, res) => {
  const id = req.params.id;
  const deleteAction = await url_model.findOneAndDelete({ _id: id });
  if (deleteAction == null) return res.sendStatus(404);

  res.redirect("/");
});

app.listen(PORT, () => {
  connectMongoDB(MONGO_URI);
  console.log(`Server is running on:\x1b[36m ${LOCAL_URL} \x1b[0m`);
  
  // Auto-open in default browser (Windows)
  if (process.platform === 'win32') {
    exec(`start ${LOCAL_URL}`);
  }
});