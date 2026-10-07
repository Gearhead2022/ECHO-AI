import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.route";
import conversationRoute from "./routes/conversation.route";
import path from "path";
import voiceRoute from "./routes/voice.route";
import https from "https";
import fs from "fs";
import memoryRoute from "./routes/memory.route";

dotenv.config();

// console.log("OLLAMA_URL:", process.env.OLLAMA_URL);
// console.log("OLLAMA_MODEL:", process.env.OLLAMA_MODEL);

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/chat", chatRoute);
app.use(
    "/audio",
    express.static(
        path.join(process.cwd(), "public/audio")
    )
);
app.use("/voice", voiceRoute);

app.get("/", (_, res) => {
    res.json({
        message: "My Voice AI Backend Running"
    });
});

app.use(
    "/conversation",
    conversationRoute
);

app.use(
    "/memory",
    memoryRoute
);

const PORT = Number(process.env.PORT) || 5005

const httpsOptions = {
    key: fs.readFileSync(
        path.resolve(
            process.cwd(),
            "../frontend/certs/echo-key-old.pem"
        )
    ),
    cert: fs.readFileSync(
        path.resolve(
            process.cwd(),
            "../frontend/certs/echo-cert-old.pem"
        )
    ),
};

https.createServer(
    httpsOptions,
    app
).listen(PORT, "0.0.0.0", () => {
    console.log(
        `Echo AI backend running on https://0.0.0.0:${PORT}`
    );
});