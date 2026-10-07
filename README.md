# 🤖 Echo AI

> **A local, voice-enabled AI assistant built from the ground up.**

Echo AI is a personal AI assistant designed to run primarily on a local computer, providing a ChatGPT-like conversational experience with **voice input, voice output, memory, and eventually autonomous tools and agent capabilities**.

The goal is not simply to build another chatbot.

The goal is to build **Echo** — an AI assistant that can listen, understand, remember, respond, speak, and eventually take actions on the computer.

---

# 📌 Project Status

Echo is currently under active development.

| System               | Technology             | Status            |
| -------------------- | ---------------------- | ----------------- |
| 💬 Chat UI           | Next.js / React        | ✅ Working         |
| 🧠 LLM               | Ollama + Qwen          | ✅ Working         |
| 🗣️ Text-to-Speech   | Piper                  | ✅ Working         |
| 🎤 Speech-to-Text    | Whisper.cpp            | ✅ Working         |
| 💾 Database          | MySQL                  | ✅ Working         |
| 🧠 Memory System     | Prisma + MySQL         | 🚧 In Development |
| 🔊 Audio Queue       | Custom browser service | 🚧 In Development |
| 👂 Wake Word         | OpenWakeWord WASM      | 🧪 Experimental   |
| 🔐 HTTPS             | mkcert                 | ✅ Working         |
| 📱 LAN Access        | Local network          | ✅ Working         |
| 🤖 Agent System      | —                      | 🗺️ Planned       |
| 🌐 Web Tools         | —                      | 🗺️ Planned       |
| 📁 File Tools        | —                      | 🗺️ Planned       |
| 🖥️ Computer Control | —                      | 🗺️ Planned       |
| 🧠 Long-Term Memory  | —                      | 🗺️ Planned       |
| 🎙️ "Hey Echo"       | Custom wake word       | 🗺️ Planned       |

---

# 🎯 Vision

Echo is being developed around a simple idea:

> **Echo should feel like an actual personal AI assistant, not just a chat application.**

The long-term goal is for Echo to be able to:

1. Hear the user
2. Understand what was said
3. Remember relevant information
4. Think using a local LLM
5. Respond naturally
6. Speak the response
7. Use tools when necessary
8. Access files when permitted
9. Browse the web when permitted
10. Control the computer when permitted
11. Maintain useful long-term memory
12. Eventually operate as an autonomous AI agent

The intended architecture is:

```text
                 ┌──────────────────┐
                 │      USER        │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   🎤 LISTEN      │
                 │ Microphone       │
                 │ Wake Word        │
                 │ Whisper STT      │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   🧠 THINK       │
                 │ Ollama           │
                 │ Qwen             │
                 └────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ 💾 Memory│ │ 🛠 Tools │ │ 🤖 Agent │
        └──────────┘ └──────────┘ └──────────┘
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   🗣️ SPEAK       │
                 │ Piper TTS        │
                 │ Audio Queue      │
                 └──────────────────┘
                          │
                          ▼
                       🔊 Echo
```

---

# 🧱 Core Architecture

Echo is currently split into two major applications:

```text
D:\Echo AI
│
├── backend
│   ├── API
│   ├── Chat
│   ├── STT
│   ├── TTS
│   ├── Memory
│   ├── Database
│   └── AI Providers
│
├── frontend
│   ├── Chat UI
│   ├── Voice Recorder
│   ├── Audio Player
│   ├── Audio Queue
│   ├── Wake Word
│   └── User Interaction
│
└── AI
    ├── whisper
    └── piper
```

---

# 📁 Project Structure

Current project structure:

```text
D:\Echo AI
│
├── backend
│   │
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── providers
│   │   ├── repositories
│   │   ├── routes
│   │   ├── services
│   │   ├── lib
│   │   ├── generated
│   │   └── server.ts
│   │
│   ├── prisma
│   │
│   ├── public
│   │   └── audio
│   │
│   ├── package.json
│   └── .env
│
├── frontend
│   │
│   ├── app
│   ├── components
│   ├── hooks
│   ├── services
│   ├── types
│   └── package.json
│
└── AI
    │
    ├── whisper
    │   └── whisper.cpp
    │
    └── piper
        ├── piper.exe
        └── voices
```

The exact structure may evolve as Echo's architecture becomes more mature.

---

# 🧠 AI / LLM

Echo currently uses:

```text
Ollama
   │
   └── Qwen
       └── qwen3:4b
```

Ollama provides the local LLM runtime.

The backend communicates with Ollama through its local API.

Current configuration:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b
```

The general flow is:

```text
User Message
     │
     ▼
Backend
     │
     ▼
Ollama
     │
     ▼
Qwen
     │
     ▼
AI Response
```

The important goal is to keep Echo's AI processing local whenever practical.

This means Echo does not need to depend entirely on an external AI API for normal conversation.

---

# 🗣️ Text-to-Speech

Echo uses **Piper** for local text-to-speech.

Current voice:

```text
en_US-ryan-medium.onnx
```

Located under:

```text
D:\Echo AI\AI\piper\voices
```

The backend uses a `PiperProvider`.

Conceptually:

```text
AI Response
     │
     ▼
PiperProvider
     │
     ▼
Piper
     │
     ▼
WAV File
     │
     ▼
Frontend
     │
     ▼
🔊 Echo speaks
```

Generated audio is stored in:

```text
backend/public/audio
```

Audio files currently follow a pattern similar to:

```text
response-{timestamp}-{random}.wav
```

The backend exposes the audio directory through:

```text
/audio
```

---

# 🎤 Speech-to-Text

Echo uses **whisper.cpp** for local speech recognition.

Current location:

```text
D:\Echo AI\AI\whisper\whisper.cpp
```

Whisper was built using:

```text
CMake
Visual Studio Build Tools
```

The executable is:

```text
build\bin\Release\whisper-cli.exe
```

Current model:

```text
ggml-base.en.bin
```

Located at:

```text
D:\Echo AI\AI\whisper\whisper.cpp\ggml-base.en.bin
```

---

# 🎤 Voice Input Pipeline

The current voice-input architecture is:

```text
Microphone
     │
     ▼
Browser
     │
     ▼
MediaRecorder
     │
     ▼
Audio Blob
     │
     ▼
/transcribe
     │
     ▼
Multer Upload
     │
     ▼
Audio Conversion
     │
     ▼
16 kHz WAV
     │
     ▼
Whisper.cpp
     │
     ▼
Text
     │
     ▼
Echo Chat
```

The browser records audio using:

```text
getUserMedia()
MediaRecorder
```

The backend receives the recording through the transcription endpoint.

The audio is converted to the required WAV format before being passed to Whisper.

---

# 👂 Wake Word

Echo has also started experimenting with wake-word detection.

Current technology:

```text
openwakeword-wasm-browser
```

The library runs wake-word detection in the browser using ONNX/WASM.

Available models tested include:

```text
alexa
hey_mycroft
hey_jarvis
hey_rhasspy
timer
weather
```

The initial testing focused on:

```text
hey_jarvis
```

However, wake-word recognition quality and pronunciation comfort are still being evaluated.

The long-term target is:

```text
"Hey Echo"
```

---

# 🟢 Wake Word → Conversation Flow

The intended behavior is:

```text
Echo is waiting
      │
      ▼
🎧 Listening for wake word
      │
      │
      ├── No wake word
      │       │
      │       └── Continue listening
      │
      ▼
"Hey Echo"
      │
      ▼
🎤 Start recording
      │
      ▼
User speaks
      │
      ▼
Whisper
      │
      ▼
Text
      │
      ▼
Qwen
      │
      ▼
Piper
      │
      ▼
🔊 Echo responds
```

---

# 🖱️ Push-to-Talk

Because wake-word recognition is still experimental, Echo also supports the concept of a manual:

```text
🎤 Push to Talk
```

This is useful because it allows voice interaction without requiring a wake word.

The desired behavior is:

```text
Press / activate microphone
        │
        ▼
Record voice
        │
        ▼
Whisper
        │
        ▼
Echo thinks
        │
        ▼
Echo responds
        │
        ▼
Echo speaks
```

This provides a reliable fallback while wake-word development continues.

---

# 🔊 Audio Playback

Echo does not simply play every generated WAV immediately.

A custom audio queue was created to manage multiple responses.

The general system is:

```text
Sentence 1
    │
    ▼
Audio generated
    │
    ▼
Queue

Sentence 2
    │
    ▼
Audio generated
    │
    ▼
Queue

Sentence 3
    │
    ▼
Audio generated
    │
    ▼
Queue
```

Then:

```text
Queue
 │
 ├── ▶ Sentence 1
 │
 ├── Sentence 2
 │
 └── Sentence 3
```

This prevents multiple audio files from trying to play simultaneously.

The frontend contains an audio service and queue service responsible for:

* Initializing browser audio
* Queueing audio
* Playing audio sequentially
* Tracking playback
* Handling errors
* Stopping playback
* Pausing/resuming where applicable

---

# ⚠️ Audio Playback Lessons

One of the problems encountered during development was:

```text
MEDIA_ELEMENT_ERROR
code: 4
MediaError
Format error
```

This happened after multiple generated WAV files were being queued and replayed.

Important lessons:

* Audio URLs need to be managed carefully.
* Old audio should not accidentally be replayed.
* Queue state needs to remain synchronized with playback state.
* Browser audio errors should be handled instead of allowing the queue to become stuck.
* TTS files need to remain valid and accessible for the entire playback lifecycle.

These issues are part of the ongoing audio-system development.

---

# 💾 Database

Echo uses:

```text
MySQL
```

Current database:

```text
echo_ai_db
```

The database runs on:

```text
port 3307
```

Prisma is used as the ORM/database layer.

The project was upgraded toward Prisma 7 and the newer generated-client/adapter architecture.

Current database direction:

```text
Echo
 │
 ▼
Prisma
 │
 ▼
MySQL
 │
 ▼
echo_ai_db
```

---

# 🧠 Memory

One of the most important parts of Echo is memory.

The goal is for Echo to remember useful information rather than treating every conversation as completely isolated.

Current memory repository functionality includes operations conceptually equivalent to:

```text
getAll()
getByKey()
save()
```

Memory entries can contain information such as:

```text
key
value
category
createdAt
updatedAt
```

The long-term goal is to allow Echo to distinguish between:

```text
Conversation Context
        │
        ▼
Short-Term Memory
        │
        ▼
Long-Term Memory
        │
        ▼
Persistent Knowledge
```

---

# 💭 Memory Philosophy

Echo should not blindly save everything.

The intended memory system should eventually determine:

```text
Is this important?
        │
        ├── No → Don't remember
        │
        └── Yes
             │
             ▼
        Save memory
```

Examples of useful memory:

```text
User preferences
Project information
Important decisions
Frequently used settings
Long-term goals
Relevant personal workflow information
```

The system should avoid unnecessarily storing temporary conversation details.

---

# 🌐 Frontend

Echo's frontend is built with:

```text
Next.js
React
TypeScript
```

The frontend is responsible for:

* Chat interface
* Message rendering
* Recording
* Audio playback
* Audio queue
* Wake-word experiments
* Typing indicators
* Auto scrolling
* Voice interaction

The main chat experience is composed around components such as:

```text
ChatWindow
ChatInput
MessageBubble
```

and hooks/services such as:

```text
useChat
useRecorder
AudioService
AudioQueueService
```

---

# 💬 Chat Flow

The basic text conversation flow is:

```text
User
 │
 ▼
ChatInput
 │
 ▼
useChat
 │
 ▼
Backend API
 │
 ▼
Chat Service
 │
 ▼
Ollama
 │
 ▼
Qwen
 │
 ▼
Response
 │
 ▼
Frontend
 │
 ├── Display text
 │
 └── Generate/play audio
```

---

# 🏗️ Backend

Echo's backend is built using:

```text
Node.js
TypeScript
Express
Prisma
MySQL
```

Current development port:

```text
5005
```

The backend handles:

```text
Chat
STT
TTS
Memory
Database
AI providers
Audio files
```

---

# 🔌 Provider Architecture

Echo uses provider-style abstractions so that AI technologies can be replaced without rebuilding the entire application.

For example:

```text
ProviderFactory
      │
      ├── LLM Provider
      │      └── OllamaProvider
      │
      ├── TTS Provider
      │      └── PiperProvider
      │
      └── STT Provider
             └── Whisper
```

This is intentional.

The goal is to prevent Echo from becoming permanently tied to one AI provider.

---

# 🧩 Current AI Providers

## LLM

```text
OllamaProvider
```

Uses:

```text
Ollama
Qwen
```

---

## TTS

```text
PiperProvider
```

Uses:

```text
Piper
en_US-ryan-medium
```

---

## STT

```text
Whisper
```

Uses:

```text
whisper.cpp
ggml-base.en.bin
```

---

# 🔐 HTTPS

Echo was configured for local HTTPS using:

```text
mkcert
```

Certificates were generated for local development including:

```text
localhost
127.0.0.1
192.168.1.251
```

This is important because browser microphone access requires a secure context in many situations.

The HTTPS setup also makes it possible to test Echo from other devices on the local network.

---

# 📱 LAN Access

Echo's frontend/backend can be accessed across the local network.

The development environment uses the computer's LAN address rather than being limited to:

```text
localhost
```

The frontend can run with:

```text
next dev --hostname=0.0.0.0
```

This allows devices such as a phone to connect to Echo on the same network.

This was especially useful for testing:

```text
📱 Phone
   │
   ▼
🌐 Echo Web UI
   │
   ▼
🎤 Phone Microphone
   │
   ▼
Echo Backend
```

---

# ⚙️ Environment Configuration

Example backend configuration:

```env
PORT=5005

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b

PIPER_EXE=D:\Echo AI\AI\piper\piper.exe
PIPER_MODEL=D:\Echo AI\AI\piper\voices\en_US-ryan-medium.onnx

AUDIO_OUTPUT=public\audio

DATABASE_URL=...
```

> Never commit real database credentials, passwords, API keys, or other secrets to Git.

---

# 🚀 Running Echo

## 1. Start MySQL

Make sure the Echo MySQL database is running.

Expected database:

```text
echo_ai_db
```

---

## 2. Start Ollama

Make sure Ollama is running locally.

Verify that the configured model exists:

```powershell
ollama list
```

Expected model:

```text
qwen3:4b
```

---

## 3. Start Backend

```powershell
cd "D:\Echo AI\backend"
npm run dev
```

Backend:

```text
http://localhost:5005
```

---

## 4. Start Frontend

Open another terminal:

```powershell
cd "D:\Echo AI\frontend"
npm run dev
```

Frontend:

```text
http://localhost:3000
```

For LAN development:

```text
https://192.168.1.251:3000
```

The actual LAN IP may change depending on the network.

---

# 🧪 Testing Echo Components

Echo should be tested one subsystem at a time.

Recommended testing order:

```text
1. MySQL
   ↓
2. Prisma
   ↓
3. Ollama
   ↓
4. Qwen
   ↓
5. Backend Chat
   ↓
6. Piper
   ↓
7. Browser Audio
   ↓
8. Whisper
   ↓
9. Microphone
   ↓
10. Voice Conversation
   ↓
11. Wake Word
```

This makes debugging much easier.

If everything is tested at once, it becomes difficult to know which subsystem caused the failure.

---

# 🧪 Whisper Test

Whisper can be tested independently from the rest of Echo.

The project has already successfully tested Whisper using a sample WAV file.

A successful test should produce recognizable speech text from the audio file.

This proves:

```text
Whisper binary
+
Model
+
Audio format
```

are working independently of the browser.

---

# 🧪 Piper Test

Piper should also be testable independently.

The expected flow is:

```text
Text
 │
 ▼
Piper
 │
 ▼
WAV
 │
 ▼
Play WAV
```

If this works independently, problems in Echo's audio system can be isolated to the browser/queue rather than Piper itself.

---

# 🛠️ Troubleshooting Philosophy

When Echo breaks, do not immediately change multiple systems.

Instead:

```text
Identify
   ↓
Isolate
   ↓
Test
   ↓
Confirm
   ↓
Fix
   ↓
Test again
```

For example, if voice conversation fails:

```text
Microphone?
    ↓
Recording?
    ↓
Upload?
    ↓
Audio conversion?
    ↓
Whisper?
    ↓
Text?
    ↓
Ollama?
    ↓
Qwen?
    ↓
Piper?
    ↓
WAV?
    ↓
Browser playback?
```

This approach has been important throughout Echo's development.

---

# 🧠 Echo's Personality

Echo is intended to behave naturally.

The assistant should not repeatedly expose internal instructions or implementation details to the user.

Echo should:

* Respond naturally
* Be honest when uncertain
* Avoid inventing information
* Keep responses useful
* Speak naturally through TTS
* Avoid reading emoji aloud
* Avoid exposing internal system instructions
* Treat the user as someone interacting with an assistant, not a developer console

---

# 🔒 Local-First Philosophy

One of Echo's major design goals is:

> **Keep Echo as local as possible.**

The preferred architecture is:

```text
User
 │
 ▼
Local Computer
 │
 ├── Ollama
 ├── Qwen
 ├── Whisper
 ├── Piper
 ├── MySQL
 └── Echo Backend
```

Cloud services may eventually be added where they provide significant value, but Echo should not depend on the cloud for its fundamental functionality.

---

# 🤖 Future Agent Architecture

The long-term goal is to turn Echo from a conversational AI into an AI agent.

The architecture is expected to evolve toward:

```text
                    ┌──────────────┐
                    │     Echo     │
                    └──────┬───────┘
                           │
                     ┌─────▼─────┐
                     │    LLM    │
                     └─────┬─────┘
                           │
                  ┌────────▼────────┐
                  │   Agent System  │
                  └────────┬────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   🌐 Web               📁 Files          🖥️ Computer
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                       💾 Memory
```

The LLM should eventually be able to decide:

```text
Can I answer this myself?
        │
        ├── Yes → Answer
        │
        └── No
             │
             ▼
         Use a tool
```

---

# 🛠️ Planned Tools

## 🌐 Web

Echo should eventually be able to:

* Search the web
* Read web pages
* Research topics
* Compare information
* Retrieve current information

---

## 📁 Files

Echo should eventually be able to work with permitted local files.

Possible capabilities:

```text
Read
Search
Create
Edit
Summarize
Analyze
Organize
```

Access should be permission-based and carefully controlled.

---

## 🖥️ Computer

Eventually Echo may be able to perform controlled computer actions.

Potential capabilities:

```text
Open applications
Navigate interfaces
Perform repetitive tasks
Manage files
Execute approved commands
```

This subsystem must be designed with strong safety boundaries.

---

# 🧠 Long-Term Memory

Future memory architecture may become:

```text
                ┌─────────────┐
                │ Conversation│
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │ Memory      │
                │ Evaluation  │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Short-Term         Long-Term
         Context            Memory
              │                 │
              └────────┬────────┘
                       ▼
                    MySQL
```

The eventual objective is for Echo to understand context such as:

```text
"What were we working on yesterday?"

"Continue the project we were building."

"What did we decide about the audio system?"

"Remember this for later."
```

---

# 🎙️ Future "Hey Echo"

The ultimate wake-word goal is:

```text
"Hey Echo"
```

The current wake-word implementation is experimental.

The long-term design is:

```text
                    🎧
                 Listening
                     │
                     ▼
             Wake Word Detector
                     │
              "Hey Echo?"
                     │
             ┌───────┴───────┐
             │               │
            No              Yes
             │               │
             ▼               ▼
        Keep waiting     Start recording
                              │
                              ▼
                           Whisper
                              │
                              ▼
                            Qwen
                              │
                              ▼
                            Piper
                              │
                              ▼
                             🔊
```

---

# 🧪 Development Roadmap

## Phase 1 — Foundation

* [x] Project structure
* [x] Frontend
* [x] Backend
* [x] Local LLM
* [x] Ollama integration
* [x] Qwen integration
* [x] MySQL
* [x] Prisma
* [x] Basic chat

---

## Phase 2 — Voice

* [x] Browser microphone
* [x] MediaRecorder
* [x] Audio upload
* [x] Whisper.cpp
* [x] Piper
* [x] WAV generation
* [x] Browser audio playback
* [x] Audio queue
* [ ] Fully stable voice conversation

---

## Phase 3 — Wake Word

* [x] OpenWakeWord experiment
* [x] Test existing wake words
* [x] Evaluate recognition quality
* [ ] Improve detection
* [ ] Integrate wake → record → respond
* [ ] Custom "Hey Echo" model

---

## Phase 4 — Memory

* [x] MySQL foundation
* [x] Memory repository
* [ ] Automatic memory extraction
* [ ] Memory importance scoring
* [ ] Memory retrieval
* [ ] Conversation memory
* [ ] Long-term memory

---

## Phase 5 — Agent

* [ ] Agent architecture
* [ ] Tool registry
* [ ] Tool selection
* [ ] Tool execution
* [ ] Web tool
* [ ] File tool
* [ ] Computer tool
* [ ] Permission system
* [ ] Action confirmation

---

## Phase 6 — Advanced Echo

* [ ] Continuous voice mode
* [ ] Better wake word
* [ ] Streaming responses
* [ ] Better sentence-level TTS
* [ ] Advanced memory
* [ ] Personal knowledge
* [ ] Tool orchestration
* [ ] Autonomous tasks
* [ ] Scheduled tasks
* [ ] Multi-step planning
* [ ] Better personality/context management

---

# 🗺️ Current Architecture vs Future Architecture

## Current

```text
User
 │
 ▼
Frontend
 │
 ▼
Backend
 │
 ├── Ollama → Qwen
 │
 ├── Piper
 │
 ├── Whisper
 │
 └── MySQL
```

## Future

```text
User
 │
 ▼
🎙️ Voice / Chat
 │
 ▼
Echo Core
 │
 ├── 🧠 Context
 ├── 💾 Memory
 ├── 🤖 Agent
 │      │
 │      ├── 🌐 Web
 │      ├── 📁 Files
 │      ├── 🖥️ Computer
 │      └── 🔧 Other Tools
 │
 ├── 🧠 Local LLM
 │
 └── 🗣️ Voice
        │
        ├── Whisper
        └── Piper
```

---

# 💡 Design Principles

Echo is being built around several principles.

## 1. Local First

Prefer local processing whenever practical.

## 2. Modular

AI providers should be replaceable.

## 3. Testable

Each subsystem should be independently testable.

## 4. Honest

Echo should say when it does not know something rather than inventing an answer.

## 5. Useful

Features should solve actual problems rather than exist simply because they are technically possible.

## 6. Controlled

Tools that can affect the computer should have explicit boundaries and permissions.

## 7. Evolvable

The architecture should allow Echo to grow from:

```text
Chatbot
   ↓
Voice Assistant
   ↓
Personal Assistant
   ↓
AI Agent
```

without requiring the entire project to be rebuilt.

---

# 🧰 Main Technologies

| Component   | Technology           |
| ----------- | -------------------- |
| Frontend    | Next.js              |
| UI          | React                |
| Language    | TypeScript           |
| Backend     | Node.js              |
| API         | Express              |
| ORM         | Prisma               |
| Database    | MySQL                |
| LLM Runtime | Ollama               |
| LLM         | Qwen                 |
| STT         | Whisper.cpp          |
| TTS         | Piper                |
| Wake Word   | OpenWakeWord WASM    |
| Audio       | WAV / Browser Audio  |
| HTTPS       | mkcert               |
| Build       | TypeScript / Next.js |
| Development | Windows              |

---

# 🖥️ Current Development Hardware

Echo is being developed on a machine with approximately:

```text
CPU: Intel 11th Gen i5
RAM: 16 GB
GPU: Intel UHD Graphics 730
```

There is currently no dedicated NVIDIA GPU.

Because of this, Echo's local AI stack is intentionally designed around relatively lightweight models and CPU-friendly technologies.

---

# 📌 Important Paths

```text
Echo Root
D:\Echo AI

Backend
D:\Echo AI\backend

Frontend
D:\Echo AI\frontend

AI
D:\Echo AI\AI

Whisper
D:\Echo AI\AI\whisper\whisper.cpp

Piper
D:\Echo AI\AI\piper

Piper Voices
D:\Echo AI\AI\piper\voices

Generated Audio
D:\Echo AI\backend\public\audio
```

---

# 📝 Development Notes

Echo has gone through several iterations during development.

Important lessons learned include:

* Keep provider implementations separated.
* Test AI components independently.
* Do not assume browser audio will behave exactly like local audio.
* WAV playback needs careful queue management.
* Browser microphone access requires an appropriate secure context.
* LAN testing is extremely useful for voice functionality.
* Whisper audio input must be converted into an appropriate format.
* Wake-word recognition can be much harder than expected.
* A wake word that is technically available may not be comfortable or reliable to pronounce.
* Push-to-talk is a valuable fallback.
* Database architecture should be kept separate from AI-provider logic.
* Prisma upgrades can require changes to generated-client imports and adapters.
* Avoid keeping duplicate Prisma client configurations.
* Echo's internal identity/prompt should not accidentally become visible as normal assistant output.

---

# 🔮 Where Echo Is Going

The ultimate goal is not:

> "Make a chatbot."

The goal is:

> **Build a personal AI assistant that can live on the user's computer, understand voice, remember useful information, communicate naturally, and eventually perform useful actions.**

The evolution is:

```text
                 ECHO
                  │
                  ▼
             ┌─────────┐
             │  Chat   │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │  Voice  │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │ Memory  │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │  Tools  │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │  Agent  │
             └────┬────┘
                  │
                  ▼
          🤖 PERSONAL AI
```

---

# ❤️ Why Echo Exists

Echo is a long-term project.

Every component is being built step by step:

```text
One feature.
One problem.
One fix.
One improvement.
```

The objective is not to rush to a finished product.

The objective is to understand how all of the pieces work and gradually combine them into something genuinely useful.

---

# 🚀 Final Goal

One day, the desired experience is simply:

```text
👤: "Hey Echo."

🤖: "Yeah?"

👤: "What were we working on yesterday?"

🤖: "We were working on the audio queue.
    We fixed the playback issue, but the
    wake-word integration is still being tested."

👤: "Continue where we left off."

🤖: "Sure."
```

And eventually:

```text
👤: "Hey Echo, find the latest version of
     the project documentation and update it
     with what we finished today."

🤖: "Got it."
```

That is the direction of Echo.

---

# 📜 Project Philosophy

> **Echo should not just answer.
> Echo should understand.
> Echo should remember.
> Echo should help.
> And eventually, Echo should act.**

---

## 🔧 Status

**Project:** Echo AI
**Stage:** Active Development
**Primary Goal:** Local Personal AI Assistant
**Current Focus:** Voice interaction, audio stability, memory, and wake-word integration

---
