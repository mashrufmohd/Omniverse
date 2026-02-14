# 🛍️ Omniverse: ABFRL Conversational Sales Agent

> **Where Retro Aesthetics meet Next-Gen AI.**  
> A full-stack conversational commerce platform built for **Aditya Birla Fashion and Retail Limited (ABFRL)**.

---

## 🎥 Demo & Intro Video

### ▶️ Intro Video
[![Watch the Intro](https://img.youtube.com/vi/90EZf3vSMHY/hqdefault.jpg)](https://youtu.be/90EZf3vSMHY)

### ▶️ Full Demo Walkthrough
[![Watch the Demo](https://img.youtube.com/vi/zINMdeTzido/hqdefault.jpg)](https://youtu.be/zINMdeTzido)

> **Click the thumbnails above to watch the videos.**  
> See the AI Agent handle product discovery, manage the cart using natural language, and process mock UPI payments in real time.

## 🚀 Overview

**Omniverse** reimagines the e-commerce experience by moving away from static catalogs to dynamic, intent-driven conversations. Powered by **Google Gemini 2.5 Flash** and **Vector Search**, this platform allows users to shop, manage carts, and track orders using natural language, all wrapped in a distinctive **Retro/Brutalist UI**.

Unlike standard chatbots, the **Omniverse Master Agent** is transactional—it possesses **true agency**. It can modify database states, handle complex inventory queries across locations, and orchestrate payments without the user ever leaving the chat interface.

### 🌟 Key Features

#### 🤖 Intelligent Sales Agent
*   **Context-Aware:** Remembers conversation history and user preferences using MongoDB-persisted sessions.
*   **RAG Implementation:** Uses **Qdrant** vector search to recommend products based on semantic meaning (e.g., *"Show me something for a summer wedding"*).
*   **Tool Use:** The LLM autonomously calls backend tools to check inventory, update carts, and fetch order status.
*   **Streaming Responses:** Real-time token streaming via Server-Sent Events (SSE) for a snappy, human-like chat experience.

#### 🛒 Conversational Commerce
*   **Natural Language Actions:** *"Add that red shirt in medium to my cart"* or *"Remove the shoes."*
*   **Visual Product Cards:** Chat responses include interactive product cards for immediate purchase.
*   **Smart Cart Management:** Discount code application and quantity adjustments handled via chat.

#### 🏪 Shopkeeper & Admin Dashboard
*   **Shopkeeper Portal:** Dedicated dashboard for vendors to manage inventory and view products.
*   **Admin Analytics:** Visualizing revenue trends, top-selling products, and user growth.

#### 💳 Seamless Checkout
*   **Mock UPI Payment:** Includes a generated QR code flow for simulating mobile payments.
*   **Real-time Order Tracking:** Users can ask *"Where is my order?"* to get real-time status updates via the chat.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS + Custom Brutalist/Retro Theme
*   **State Management:** Zustand
*   **Auth:** Firebase Authentication
*   **Streaming:** Server-Sent Events (SSE)
*   **QR Generation:** `qrcode` for UPI payments

### Backend (Server)
*   **API:** FastAPI (Python 3.11)
*   **LLM:** Google Gemini 2.5 Flash (via `google-generativeai` SDK)
*   **Orchestration:** Custom Master Agent with Tool Calling
*   **Database:** MongoDB (via Beanie ODM)
*   **Vector DB:** Qdrant (for semantic product search)
*   **Containerization:** Docker & Docker Compose

---

## 🏗️ System Architecture

```mermaid
graph TD
    User[User] -->|Next.js UI| FE[Frontend Client]
    FE -->|SSE Stream| API[FastAPI Gateway]
    
    subgraph "Backend Core"
        API -->|Auth| Firebase[Firebase Admin]
        API -->|Query| Agent[Master Agent]
        
        Agent -->|Inference| Gemini[Google Gemini LLM]
        Agent -->|Vector Search| Qdrant[(Qdrant DB)]
        
        Agent -->|Tool Call| Tools[Agent Tools]
        Tools -->|Cart/Orders| Mongo[(MongoDB)]
        Tools -->|Inventory| Mongo
    end
    
    FE -->|Direct Auth| FirebaseAuth[Firebase Client SDK]
```
## 📂 Project Structure
```
omnivers/
├── abfrl-backend/              # Python FastAPI Server
│   ├── app/
│   │   ├── agents/             # LLM Logic (Master Agent, Tools)
│   │   ├── api/                # API Routes (Chat, Cart, Orders)
│   │   ├── core/               # Config & Security
│   │   ├── db/                 # MongoDB Connection
│   │   ├── models/             # Beanie ODM Models
│   │   └── services/           # Business Logic (Cart, Payment)
│   ├── data/                   # Seed JSON files
│   ├── tests/                  # Pytest suites
│   ├── Dockerfile              # Backend Container
│   └── requirements.txt        # Python Dependencies
│
├── abfrl-frontend/             # Next.js 14 Client
│   ├── src/
│   │   ├── app/                # App Router Pages
│   │   ├── components/         # UI Components (Retro Theme)
│   │   ├── context/            # Auth & Cart Context
│   │   ├── hooks/              # Custom React Hooks
│   │   └── lib/                # API Clients & Utils
│   └── public/                 # Static Assets
│
└── package.json                # Root package config
```

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker Desktop (for MongoDB & Qdrant)
- Google Gemini API Key
- Firebase Project (for Authentication)



### 1️⃣ Database Setup (Docker)

Start **MongoDB** and **Qdrant** using the provided Docker Compose file.

```bash
cd abfrl-backend
docker-compose up -d
```

### 2️⃣ Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd abfrl-backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## ⚙️ Configuration (.env)

Create a `.env` file inside the `abfrl-backend/` directory with the following content:

```env
PROJECT_NAME="ABFRL Sales Agent"
API_V1_STR="/api/v1"

MONGODB_URL="mongodb://user:password@localhost:5432"
DATABASE_NAME="abfrl_db"

SECRET_KEY="your_secret_key_here"
GOOGLE_API_KEY="your_gemini_api_key_here"

QDRANT_URL="http://localhost:6333"

FIREBASE_PROJECT_ID="your-firebase-project-id"
```
##  Seed Data

Populate the database with initial products and inventory.

```bash
python seed_mongo.py
```
### ▶️ Run Server
```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
### Backend will be available at:
-http://localhost:8000
-API Docs: http://localhost:8000/docs

### 3️⃣ Frontend Setup

Navigate to the frontend directory.

```bash
cd abfrl-frontend
# Install dependencies
npm install
```
## ⚙️ Frontend Configuration (.env.local)

Create a `.env.local` file inside the `abfrl-frontend/` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Firebase Client Config (get these from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-app"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."
```
### Run Client:
```
npm run dev
```
Frontend will be available at http://localhost:3000

## 🧪 Testing the Flow

### 1️⃣ Login / Signup
Use the Retro login page (handled via Firebase).

### 2️⃣ Start Chatting
Go to the **AI Assistant** tab.

Try:
- "I'm looking for a blue shirt."
- "Add the second one to my cart."

### 3️⃣ Cart Management

Try:
- "What is in my cart?"
- "Apply discount code SAVE10."

### 4️⃣ Checkout

- Ask the bot to **"Checkout"** or click the checkout button.
- Fill in shipping details.
- **Payment:** Scan the generated QR code with your phone (simulated) or wait for the mock success trigger.

### 5️⃣ Tracking

After ordering, ask the bot:

- "Where is my order?"

## 📄 API Documentation

The backend exposes a Swagger UI at:

👉 http://localhost:8000/docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/chat/stream` | Main LLM chat endpoint (streaming response) |
| **GET** | `/api/v1/products` | Fetch all products with inventory |
| **GET** | `/api/v1/cart/` | Get current user's cart summary |
| **POST** | `/api/v1/payment/create-mock` | Generate UPI QR session |
| **GET** | `/api/v1/orders/user/{id}` | Fetch order history for a user |

## 🎨 UI Design System

The project uses a custom **Retro-Brutalist** design system defined in `globals.css`.

### 🎯 Colors

- **Primary:** `#FF5E3B` (Retro Coral)  
- **Secondary:** `#00CCBF` (Teal)  
- **Accent:** `#FFD166` (Mustard)

### 🧱 Shadows

- Hard, non-blurred shadows  
  ```css
  box-shadow: 4px 4px 0px 0px #000;
  
## 📜 License
This project is licensed under the MIT License.





