# 🎬 YouTube Downloader

A modern YouTube video downloader built with **React + TypeScript + FastAPI + yt-dlp + FFmpeg**.

This application allows users to download and convert YouTube videos into multiple formats with a clean, responsive user interface and real-time conversion progress tracking.

---

## ✨ Features

### Frontend

- React + TypeScript
- SCSS Styling
- Responsive Design
- Queue Management
- Real-Time Progress Updates
- Individual File Downloads
- Download All Files as ZIP

### Backend

- FastAPI
- yt-dlp
- FFmpeg
- Server-Sent Events (SSE)
- Queue Processing
- ZIP Archive Generation

### DevOps

- Dockerized Frontend
- Dockerized Backend
- Nginx Reverse Proxy
- Docker Compose
- Persistent Download Storage

---

## 🚀 Supported Formats

| Format    | Type  |
| --------- | ----- |
| MP3       | Audio |
| MP4 720p  | Video |
| MP4 1080p | Video |
| WebM      | Video |

---

## 🏗️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- SCSS
- Axios

### Backend

- Python
- FastAPI
- yt-dlp
- FFmpeg
- sse-starlette

### Infrastructure

- Docker
- Docker Compose
- Nginx

---

## 📁 Project Structure

```text
youtube-downloader/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── downloads/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# 🖥️ Run Locally

## Prerequisites

Install the following:

### Python

https://www.python.org/downloads/

### Node.js

https://nodejs.org/

### FFmpeg

https://ffmpeg.org/download.html

Verify installation:

```bash
python --version
node --version
ffmpeg -version
```

---

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🐳 Run with Docker

## Prerequisites

Install Docker Desktop:

https://www.docker.com/products/docker-desktop/

Verify installation:

```bash
docker --version
docker compose version
```

---

## Build Containers

From the project root:

```bash
docker compose build
```

---

## Start Containers

Foreground mode:

```bash
docker compose up
```

Detached mode:

```bash
docker compose up -d
```

---

## Stop Containers

```bash
docker compose down
```

---

## Rebuild Containers

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## View Logs

All services:

```bash
docker compose logs -f
```

Backend:

```bash
docker logs youtube-downloader-backend
```

Frontend:

```bash
docker logs youtube-downloader-frontend
```

---

## Access Application

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

---

# 📡 API Endpoints

### Get Video Information

```http
POST /video-info
```

### Add Video to Queue

```http
POST /queue
```

### Get Queue

```http
GET /queue
```

### Convert All Videos

```http
POST /convert-all
```

### Progress Stream (SSE)

```http
GET /progress
```

### Download Single File

```http
GET /download/{filename}
```

### Download ZIP Archive

```http
GET /download-all
```

---

# ⚠️ Disclaimer

This project is intended for educational and personal use only.

Users are responsible for complying with YouTube's Terms of Service and applicable copyright laws when downloading content.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push changes

```bash
git push origin feature/my-feature
```

5. Open a Pull Request

---

# 📄 License

MIT License

---

# 👨‍💻 Author

**Nobin S Johns**

Frontend Developer (React.js | TypeScript)

GitHub: https://github.com/nobinsj

---

⭐ If you found this project useful, consider giving it a star on GitHub.
