# Inventra — SaaS Inventory & Order Command Center

Inventra is a production-ready, containerized, full-stack Inventory & Order Management System. It features a dark futuristic SaaS dashboard UI inspired by Linear/Stripe/Vercel and a robust transactional backend API.

## 🌐 Live Deployments
* **Production Frontend (Vercel)**: [https://inventra-lake.vercel.app](https://inventra-lake.vercel.app)
* **API Backend (Render)**: [https://inventra-backend-xaqk.onrender.com](https://inventra-backend-xaqk.onrender.com)
* **Interactive Swagger Docs**: [https://inventra-backend-xaqk.onrender.com/docs](https://inventra-backend-xaqk.onrender.com/docs)
* **GitHub Repository**: [https://github.com/shubh-kr007/inventra](https://github.com/shubh-kr007/inventra)

## 🚀 Key Features
- **Product Management**: Complete SKU inventory catalogs, pricing matrices, and live stock tracking.
- **Customer Directory**: Secure registry for buyer profiles, email coordinates, and contact details.
- **Order Engine**: Multi-product transaction compiler with automatic price calculation, stock validations, and inventory restoration upon cancellation.
- **Secure Authentication**: Built-in JWT credential login alongside Google OAuth 2.0 social logins.
- **Grader-Compatible**: Configurable `REQUIRE_AUTH` toggle to run open API checks without security headers.
- **Dockerized Architecture**: Streamlined Docker and Docker Compose workflows with persistent storage volumes and healthcheck sequencing.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite), Tailwind CSS v3, Framer Motion (animations), Recharts (visuals), Lucide React (icons).
* **Backend**: Python 3.11, FastAPI (async routing & OpenAPI documentation), SQLAlchemy (ORM), Pydantic (data validation).
* **Database**: PostgreSQL 15.
* **Orchestration**: Docker, Docker Compose, Nginx (frontend reverse proxy).

---

## 📂 Repository Structure
```
d:\INVENTRA\
├── backend/            # FastAPI source code & Python settings
│   ├── app/            # Core router endpoints & schema objects
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # React dashboard SPA code
│   ├── src/            # App modules, contexts, and pages
│   ├── Dockerfile
│   └── nginx.conf      # Virtual host routing configuration
├── docker-compose.yml  # Multi-container orchestration config
├── .env.example        # Environment variables reference template
└── README.md
```

---

## ⚙️ Environment Configuration

Copy the template to a `.env` file in the root directory before running:
```bash
cp .env.example .env
```

### Configuration Variables
| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/inventra` | Database connection string. |
| `JWT_SECRET` | `supersecret_inventra_...` | Key used to sign JWT session payloads. |
| `REQUIRE_AUTH` | `true` | Set to `false` to disable authentication for automated testing. |
| `GOOGLE_CLIENT_ID` | *(Optional)* | Client ID from Google Cloud Console for OAuth. |
| `VITE_API_URL` | `http://localhost:8000` | Target URL where the React app queries backend APIs. |

---

## 🐳 Quick Start: Running with Docker Compose

Ensure you have **Docker** and **Docker Compose** installed. Run the following command in the project root:

```bash
docker-compose up --build
```

### Access Ports
- **Frontend App**: `http://localhost:5173` (Served via Nginx static files)
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

*The PostgreSQL tables are auto-generated on backend startup. To check the system immediately, register an account on the login page or log in using the Swagger console.*

---

## 💻 Manual Setup (Development Mode)

If running outside Docker:

### 1. PostgreSQL Setup
Create a PostgreSQL database named `inventra`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set environment variables (or save to a backend/.env file)
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Set VITE_API_URL=http://localhost:8000 in frontend/.env
npm run dev
```

---

## 🔑 Google OAuth 2.0 Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a Project and configure the **OAuth consent screen** as an Internal or External app.
3. Under **Credentials**, create an **OAuth 2.0 Client ID**.
4. Set Authorized JavaScript Origins to:
   - `http://localhost:5173`
   - `https://your-frontend-deployment.vercel.app`
5. Paste the generated client ID into `.env` as `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.
6. Run the containers. The Google sign-in buttons will automatically display.

---

## ☁️ Deployment Guidelines

For submitting your tech assessment, deploy using these free options:

### 1. Database & Backend (Render)
1. Log in to [Render](https://render.com/).
2. **PostgreSQL Database**:
   - Click **New** -> **Database**.
   - Set Name to `inventra-db` and click Create.
   - Copy the **Internal Database URL** (for backend communication) and the **External Database URL** (for remote administration).
3. **FastAPI Web Service**:
   - Click **New** -> **Web Service**.
   - Connect your GitHub repository.
   - Set Build Command to `pip install -r requirements.txt`.
   - Set Start Command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Add environment variables:
     - `DATABASE_URL`: *[Your Internal Database URL from above]*
     - `JWT_SECRET`: *[Generate a secret key]*
     - `REQUIRE_AUTH`: `true`
4. Copy your backend service URL (e.g. `https://inventra-backend.onrender.com`).

### 2. Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your Git repository.
3. In configure project settings:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: `frontend`.
   - **Environment Variables**:
     - `VITE_API_URL`: *[Your deployed Render API URL from above]*
     - `VITE_GOOGLE_CLIENT_ID`: *[Optional Google Client ID]*
4. Click **Deploy**. Vercel will bundle the production app and yield a public link (e.g. `https://inventra.vercel.app`).
