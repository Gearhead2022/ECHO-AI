import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.route";
import conversationRoute from "./routes/conversation.route";
import path from "path";

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

app.get("/", (_, res) => {
    res.json({
        message: "My Voice AI Backend Running"
    });
});

app.use(
    "/conversation",
    conversationRoute
);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});