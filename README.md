# NexusLearn - AI-Powered Learning Platform 🚀

A comprehensive AI-powered learning platform built with React, Vite, Firebase, and cutting-edge AI models (OpenAI & Google Gemini).

## ✨ Features

### 📚 PDF Summarizer
- **Upload PDFs** and extract text automatically
- **AI-powered summarization** with multiple formats:
  - Short notes (concise overview)
  - Long notes (detailed analysis)
  - Bullet points (key takeaways)
- **Auto-generate quizzes** from PDF content (MCQs, True/False, Fill-in-blanks)
- **Flashcard generation** for effective memorization
- **Auto-save** all generated content to Firestore
- **Difficulty control** (Easy/Medium/Hard)

### 🤖 AI Tutor
- **Interactive chat** with specialized AI tutors
- **Multiple tutor modes**:
  - 📐 Math Tutor - Step-by-step problem solving
  - 💻 Computer Science - Programming & algorithms
  - 🧪 Science - Physics, Chemistry, Biology
  - 🗣️ Language - Grammar & writing assistance
  - 📖 Exam Prep - Test strategies & practice
  - ✍️ Writing Helper - Essay & creative writing
- **Context-aware responses** with conversation history
- **Auto-save conversations** with chat history sidebar
- **Copy responses** to clipboard

### 💻 Code Assistant
- **Multi-mode code analysis**:
  - 🔍 Explain - Understand what code does
  - 🐛 Debug - Find and fix errors
  - 🔄 Convert - Translate between languages
  - ⚡ Complexity - Analyze time & space complexity
- **Language support**: Python, JavaScript, C, C++, Java, TypeScript, Go, Rust
- **Save code sessions** to Firestore
- **Copy output** to clipboard
- **Syntax highlighting** with Markdown support

### 📊 Progress Tracking
- **Real-time statistics** from Firestore data:
  - Total study hours (from Pomodoro sessions)
  - Current study streak calculation
  - Weekly activity charts
  - Quiz performance by subject
- **Activity heatmap** visualization
- **Recent activity feed** with timestamps
- **Dynamic calculations** (no hardcoded data)

### 💾 Saved Content
- **Centralized hub** for all saved items:
  - 📄 PDFs with summaries
  - 🧠 Quizzes with scores
  - 🎴 Flashcard sets
  - 💻 Code sessions
  - 💬 Chat conversations
- **Auto-refresh** every 5 seconds
- **Manual refresh** button
- **Delete functionality** for PDFs
- **Formatted timestamps** (e.g., "Dec 11, 2025")

### ⏰ Study Planner (Coming Soon)
- Daily auto-generated schedules
- Smart AI-powered to-do lists
- Pomodoro timer with productivity stats
- Focus mode and motivational reminders

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Consistent iconography

### Backend & Services
- **Firebase Auth** - Google sign-in authentication
- **Firestore** - NoSQL database for all user data
- **OpenAI API** - GPT models for advanced AI features
- **Google Gemini API** - Gemini 2.0 Flash for fast AI processing

### Libraries & Tools
- **React Router** - Client-side routing
- **React Markdown** - Render AI responses
- **React Syntax Highlighter** - Code syntax highlighting
- **React Dropzone** - Drag & drop file uploads
- **React Hot Toast** - Beautiful notifications
- **Framer Motion** - Smooth animations
- **date-fns** - Date formatting utilities
- **PDF.js** - Client-side PDF text extraction

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- OpenAI API key
- Google Gemini API key

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd NexusLearn
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Google Gemini Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Development Mode (optional)
VITE_DEV_MODE=false
```

4. **Configure Firestore Security Rules**

Go to Firebase Console → Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /codeSessions/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /chatSessions/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /flashcardSets/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /quizzes/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /pdfDocuments/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /summaries/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /pomodoroSessions/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the app**

Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
NexusLearn/
├── src/
│   ├── components/
│   │   ├── layout/           # MainLayout, Navbar
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Firebase authentication
│   ├── lib/
│   │   ├── ai.ts            # AI API functions (Gemini)
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── firestore.ts     # Firestore database operations
│   │   └── utils.ts         # Utility functions
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── SignIn.tsx       # Google sign-in
│   │   ├── PDFSummarizer.tsx
│   │   ├── AITutor.tsx
│   │   ├── CodingAssistant.tsx
│   │   ├── Progress.tsx
│   │   └── SavedContent.tsx
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Usage Guide

### Getting Started
1. **Sign in** with your Google account
2. Navigate using the sidebar to access different features

### PDF Summarizer
1. Click "PDF Summarizer" in sidebar
2. Drag & drop a PDF or click to upload
3. Choose summary format (Short/Long/Bullets)
4. Select quiz difficulty
5. Click "Generate Summary & Quiz"
6. View and save results automatically

### AI Tutor
1. Click "AI Tutor" in sidebar
2. Select a tutor mode (Math, CS, Science, etc.)
3. Type your question
4. Get instant AI-powered responses
5. Continue the conversation - all saved automatically

### Code Assistant
1. Click "Code Assistant" in sidebar
2. Select language and mode
3. Paste your code
4. Click "Process Code"
5. View AI analysis/explanation/debug results
6. Click "Save" to store the session

### Progress & Saved Content
- **Progress**: View your study statistics, streaks, and activity
- **Saved Content**: Access all saved PDFs, quizzes, flashcards, code sessions, and chats

## 🔑 API Keys Setup

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add to `.env.local` as `VITE_GEMINI_API_KEY`
4. **Free tier**: 20 requests/day (resets at midnight UTC)

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `VITE_OPENAI_API_KEY`
4. **Note**: Requires billing setup

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Google Authentication**
4. Enable **Firestore Database**
5. Copy config values to `.env.local`

## 🐛 Troubleshooting

### "Failed to load saved content"
- Check browser console for errors
- Verify Firestore security rules are configured
- Ensure you're signed in with Google
- Check network tab for permission-denied errors

### "API quota exceeded"
- Gemini API: 20 requests/day on free tier
- Wait 24 hours or create new API key with different Google account
- Check usage at [Google AI Studio](https://aistudio.google.com/)

### PDF upload not working
- Verify PDF is text-based (not scanned images)
- Check file size (large PDFs may take longer)
- Look for errors in browser console

## 📊 Data Storage

All user data is stored in Firestore:
- **pdfDocuments**: Uploaded PDF metadata
- **summaries**: AI-generated summaries
- **quizzes**: Generated quizzes and scores
- **flashcardSets**: Flashcard collections
- **codeSessions**: Saved code analysis sessions
- **chatSessions**: AI tutor conversations
- **pomodoroSessions**: Study timer sessions
- **users**: User profiles and preferences

## 🔐 Privacy & Security

- **Authentication**: Google OAuth via Firebase
- **Data isolation**: Each user can only access their own data
- **Firestore rules**: Enforce user-level permissions
- **No file storage**: PDFs processed client-side (text extraction only)
- **API keys**: Stored in environment variables (never committed)

## 🎨 Customization

### Adding a New AI Feature
1. Add function to `src/lib/ai.ts`
2. Create Firestore save function in `src/lib/firestore.ts`
3. Build UI component in `src/pages/`
4. Add route in `src/App.tsx`
5. Update sidebar in `src/components/layout/MainLayout.tsx`

### Changing Theme
- Edit `tailwind.config.js` for colors
- Modify `src/index.css` for global styles
- Update shadcn/ui theme variables

## 📝 License

MIT License - feel free to use this project for learning and personal projects!

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Google Gemini](https://ai.google.dev/) for powerful AI capabilities
- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Lucide Icons](https://lucide.dev/) for consistent iconography

---

Built with ❤️ for modern learners who want to study smarter, not harder.
