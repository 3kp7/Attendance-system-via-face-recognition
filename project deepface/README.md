# 📸 DeepFace Attendance App

An AI-powered student attendance system using **face verification** technology!  
Built with **React Native + Expo**, **FastAPI backend**, and **DeepFace** for facial recognition.

---

## 🚀 Features

- ✅ Student login and authentication (JWT tokens)
- ✅ Dashboard showing courses and attendance status
- ✅ Search for courses
- ✅ View detailed course info
- ✅ Mark attendance by capturing live photo 📸
- ✅ Face verification against registered profile
- ✅ Attendance is recorded only if face matches ✅
- ✅ Full-stack project (Frontend + Backend)

---

## 🛠️ Tech Stack

| Frontend | Backend | AI |
|:--------|:--------|:---|
| React Native (Expo Router) | FastAPI (Python) | DeepFace (Facial Recognition) |
| Tailwind CSS (NativeWind) | PostgreSQL / SQLite | OpenCV |
| Context API (for Auth State) | JWT Authentication | Pre-trained FaceNet Model |

---

## ⚙️ Setup Instructions

### Backend (FastAPI)

1. Clone the repo
2. Create and activate virtual environment
3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Run backend server:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Frontend (React Native)
1. Go into frontend folder
2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npx expo start
```

Scan the QR code with your Expo Go app 📱

---

## 📸 How It Works
1. Student logs into the app ✅
2. Dashboard shows list of enrolled courses 📚
3. Student selects a course and clicks **Mark Attendance** 📍
4. App opens camera to capture a live photo 📸
5. Photo is sent to backend `/verify_face/?course_id=...`
6. DeepFace compares captured image with stored profile image 🤖
7. If faces match ➡️ Attendance is recorded!
8. If faces don't match ➡️ Attendance rejected ❌

---

## 📂 Project Structure
```
Attendance-backend/
  ├── backend/
  │   ├── main.py        # FastAPI app
  │   ├── models.py      # Database models
  │   ├── auth.py        # Authentication utils
  │   ├── database.py    # DB setup
  └── requirements.txt   # Python dependencies

Attendance-frontend/
  ├── app/
  │   ├── (tabs)/         # Main tabs like Dashboard, Courses, Attendance
  │   ├── screens/        # Attendance screen
  │   ├── contexts/       # AuthContext
  │   ├── api/            # API Services
  └── package.json        # Project setup
```

## 🐳 Docker Deployment
You can run the entire stack using Docker Compose:

```bash
docker-compose up -d
```

---

## 🔐 Default Test Users

| Email | Password | Name |
|-------|----------|------|
| abd@gmail.com | abd123 | Abdelrahman Alsayed |
| az@gmail.com | az123 | Aziz Al Tamimi |
| man@gmail.com | man123 | Mohammed Mansuor |
| ahm@gmail.com | ahm123 | Ahmed WithJohn |

---

## 🙌 Acknowledgements
- [DeepFace](https://github.com/serengil/deepface) for facial recognition
- [FastAPI](https://fastapi.tiangolo.com/) for backend APIs
- [Expo](https://expo.dev/) for mobile app framework
- [NativeWind](https://www.nativewind.dev/) for Tailwind CSS in React Native
