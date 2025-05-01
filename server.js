require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToBase64(path) {
  return fs.readFileSync(path, { encoding: "base64" });
}

app.post("/analyze", upload.single("file"), async (req, res) => {
  const { prompt } = req.body;
  const imagePath = req.file.path;

  try {
    const base64Image = fileToBase64(imagePath);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    fs.unlinkSync(imagePath); // Cleanup
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gemini Vision error.");
  }
});

app.listen(3001, () => console.log("✅ Server running on http://localhost:3001"));
