# NexusLearn Backend Integration Guide

## ✅ Complete Backend Setup

All backend services are now fully configured and ready to use!

### 🔐 Authentication System

**Location:** `src/contexts/AuthContext.tsx`

**Features:**
- Google Sign-In authentication
- Automatic user profile creation in Firestore
- Protected routes for all pages
- Session persistence

**Usage Example:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.displayName}!</p>
      ) : (
        <button onClick={signInWithGoogle}>Sign In</button>
      )}
    </div>
  );
}
```

---

## 🗄️ Firestore Database Services

**Location:** `src/lib/firestore.ts`

### Available Functions:

#### User Profile
```tsx
import { getUserProfile, updateUserProfile } from '@/lib/firestore';

// Get user data
const profile = await getUserProfile(user.uid);

// Update user data
await updateUserProfile(user.uid, { 
  displayName: 'New Name',
  preferences: { theme: 'dark' }
});
```

#### PDF Management
```tsx
import { uploadPDF, savePDFDocument, getUserPDFs, deletePDF } from '@/lib/firestore';

// Upload PDF file
const { url, path, name } = await uploadPDF(userId, file);

// Save PDF metadata
const pdfId = await savePDFDocument(userId, {
  title: 'My Document',
  fileUrl: url,
  filePath: path,
});

// Get all user's PDFs
const pdfs = await getUserPDFs(userId);

// Delete PDF
await deletePDF(docId, storagePath);
```

#### Summaries
```tsx
import { saveSummary, getSummariesByPDF } from '@/lib/firestore';

// Save summary
await saveSummary(pdfId, userId, {
  type: 'short',
  content: summaryText,
});

// Get summaries for a PDF
const summaries = await getSummariesByPDF(pdfId);
```

#### Quizzes
```tsx
import { saveQuiz, getUserQuizzes, updateQuizResult } from '@/lib/firestore';

// Save quiz
const quizId = await saveQuiz(userId, {
  title: 'Chapter 1 Quiz',
  questions: quizQuestions,
  difficulty: 'medium',
});

// Get user's quizzes
const quizzes = await getUserQuizzes(userId);

// Update quiz results
await updateQuizResult(quizId, {
  score: 85,
  answers: userAnswers,
});
```

#### Study Tasks
```tsx
import { createTask, getUserTasks, updateTask, deleteTask } from '@/lib/firestore';

// Create task
const taskId = await createTask(userId, {
  title: 'Read Chapter 5',
  description: 'Focus on key concepts',
  priority: 'high',
  dueDate: new Date(),
  completed: false,
});

// Get all tasks
const tasks = await getUserTasks(userId);

// Update task
await updateTask(taskId, { completed: true });

// Delete task
await deleteTask(taskId);
```

#### Pomodoro Sessions
```tsx
import { savePomodoroSession, getUserPomodoroSessions } from '@/lib/firestore';

// Save session
await savePomodoroSession(userId, {
  duration: 25,
  subject: 'Mathematics',
  completedAt: new Date(),
});

// Get sessions (last 30 days)
const sessions = await getUserPomodoroSessions(userId, 30);
```

#### Code Sessions
```tsx
import { saveCodeSession, getUserCodeSessions } from '@/lib/firestore';

// Save code session
await saveCodeSession(userId, {
  language: 'python',
  code: 'print("Hello")',
  explanation: 'Basic print statement',
});

// Get code sessions
const sessions = await getUserCodeSessions(userId);
```

#### Chat Sessions
```tsx
import { saveChatSession, updateChatSession, getUserChatSessions } from '@/lib/firestore';

// Create chat session
const sessionId = await saveChatSession(userId, {
  mode: 'math',
  messages: [],
});

// Update with new messages
await updateChatSession(sessionId, messages);

// Get all chat sessions
const chats = await getUserChatSessions(userId);
```

#### Flashcards
```tsx
import { saveFlashcardSet, getUserFlashcardSets, updateFlashcardSet, deleteFlashcardSet } from '@/lib/firestore';

// Save flashcard set
const setId = await saveFlashcardSet(userId, {
  title: 'Spanish Vocabulary',
  cards: flashcardsArray,
});

// Get all sets
const sets = await getUserFlashcardSets(userId);

// Update set
await updateFlashcardSet(setId, { title: 'New Title' });

// Delete set
await deleteFlashcardSet(setId);
```

---

## 🤖 AI Services

**Location:** `src/lib/ai.ts`

### Available Functions:

#### PDF Summarization
```tsx
import { generateSummary } from '@/lib/ai';

// Generate different types of summaries
const shortSummary = await generateSummary(pdfText, 'short');
const longSummary = await generateSummary(pdfText, 'long');
const bulletSummary = await generateSummary(pdfText, 'bullets');
```

#### Quiz Generation
```tsx
import { generateQuiz } from '@/lib/ai';

// Generate quiz (10 questions, medium difficulty)
const quiz = await generateQuiz(contentText, 'medium', 10);

// Returns array of questions with structure:
// { type: 'mcq'|'true-false'|'fill-blank', question, options, correctAnswer, explanation }
```

#### Code Assistant
```tsx
import { explainCode, debugCode, convertCode, analyzeComplexity } from '@/lib/ai';

// Explain code
const explanation = await explainCode(codeString, 'python');

// Debug code
const debugInfo = await debugCode(codeString, 'javascript', errorMessage);

// Convert code between languages
const convertedCode = await convertCode(codeString, 'python', 'javascript');

// Analyze complexity
const complexity = await analyzeComplexity(codeString, 'python');
```

#### AI Tutor
```tsx
import { chatWithTutor } from '@/lib/ai';

// Chat with tutor
const response = await chatWithTutor(
  [
    { role: 'user', content: 'Explain quantum mechanics' },
    { role: 'assistant', content: 'Previous response...' },
    { role: 'user', content: 'Tell me more about wave functions' }
  ],
  'physics' // Mode: math, cs, notes, coding, exam-prep, general
);
```

#### Study Planning
```tsx
import { generateStudySchedule, generateTaskSuggestions } from '@/lib/ai';

// Generate schedule
const schedule = await generateStudySchedule(
  ['Mathematics', 'Physics', 'Chemistry'],
  'I prefer studying in the morning'
);

// Generate task suggestions
const tasks = await generateTaskSuggestions('Calculus', 'undergraduate');
```

#### Flashcard Generation
```tsx
import { generateFlashcards } from '@/lib/ai';

// Generate flashcards from content
const flashcards = await generateFlashcards(contentText, 15);

// Returns array: [{ front: 'Question', back: 'Answer' }]
```

---

## 📄 PDF Processing

**Location:** `src/lib/pdfUtils.ts`

```tsx
import { extractTextFromPDF, getPDFMetadata } from '@/lib/pdfUtils';

// Extract text from PDF file
const text = await extractTextFromPDF(pdfFile);

// Get PDF metadata
const metadata = await getPDFMetadata(pdfFile);
// Returns: { numPages, title, author, subject, creationDate }
```

---

## 🎨 UI Components Already Integrated

All shadcn/ui components are installed and ready:
- Button, Card, Input, Textarea
- Dialog, Alert, Toast, Dropdown
- Tabs, Accordion, Select
- Avatar, Badge, Progress
- And 40+ more components!

---

## 📱 Complete Page Examples

### Example 1: PDF Summarizer (FULLY IMPLEMENTED)
See `src/pages/PDFSummarizerNew.tsx` for a complete working example with:
- File upload with drag & drop
- PDF text extraction
- AI summary generation (3 types)
- Quiz generation
- Flashcard generation
- Firebase Storage upload
- Firestore data persistence

### Example 2: AI Tutor Chat
```tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatWithTutor } from '@/lib/ai';
import { saveChatSession, updateChatSession } from '@/lib/firestore';

export default function AITutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  
  const sendMessage = async (content: string) => {
    const newMessages = [...messages, { role: 'user', content }];
    
    // Get AI response
    const response = await chatWithTutor(newMessages, 'general');
    
    const updatedMessages = [
      ...newMessages,
      { role: 'assistant', content: response }
    ];
    
    setMessages(updatedMessages);
    
    // Save to Firestore
    if (!sessionId) {
      const id = await saveChatSession(user.uid, {
        mode: 'general',
        messages: updatedMessages,
      });
      setSessionId(id);
    } else {
      await updateChatSession(sessionId, updatedMessages);
    }
  };
  
  // ... rest of UI
}
```

---

## 🔧 Environment Variables Required

Create `.env.local` with:

```env
# Firebase (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI (Get from platform.openai.com)
VITE_OPENAI_API_KEY=sk-...

# Google Gemini (Get from makersuite.google.com)
VITE_GEMINI_API_KEY=...
```

---

## 🚀 Quick Start Checklist

1. ✅ Install dependencies (Done)
2. ✅ Set up authentication (Done)
3. ✅ Configure Firebase services (Done)
4. ✅ Integrate AI APIs (Done)
5. ⏳ Add your API keys to `.env.local`
6. ⏳ Enable Firebase services in Console
7. ✅ Start building features!

---

## 📊 Firestore Collections Structure

```
users/
  {userId}/
    - uid
    - email
    - displayName
    - photoURL
    - createdAt
    - lastLogin

pdfDocuments/
  {docId}/
    - userId
    - title
    - fileUrl
    - filePath
    - createdAt

summaries/
  {summaryId}/
    - pdfId
    - userId
    - type (short|long|bullets)
    - content
    - createdAt

quizzes/
  {quizId}/
    - userId
    - title
    - questions[]
    - difficulty
    - results
    - createdAt

tasks/
  {taskId}/
    - userId
    - title
    - description
    - completed
    - priority
    - dueDate
    - createdAt

schedules/
  {scheduleId}/
    - userId
    - date
    - subjects[]
    - tasks[]
    - createdAt

pomodoroSessions/
  {sessionId}/
    - userId
    - duration
    - subject
    - completedAt

codeSessions/
  {sessionId}/
    - userId
    - language
    - code
    - explanation
    - createdAt

chatSessions/
  {sessionId}/
    - userId
    - mode
    - messages[]
    - createdAt
    - updatedAt

flashcardSets/
  {setId}/
    - userId
    - title
    - cards[]
    - createdAt
```

---

## 💡 Next Steps

1. **Configure Firebase:**
   - Go to console.firebase.google.com
   - Enable Authentication (Google)
   - Create Firestore Database
   - Create Storage bucket
   - Add config to `.env.local`

2. **Get AI API Keys:**
   - OpenAI: platform.openai.com
   - Gemini: makersuite.google.com/app/apikey

3. **Test the app:**
   - Run `npm run dev`
   - Visit `http://localhost:8080`
   - Sign in with Google
   - Upload a PDF and test features!

4. **Customize:**
   - Update UI colors in `tailwind.config.ts`
   - Add more AI features
   - Customize dashboards
   - Add analytics

---

## 🎓 Ready to Go!

All backend services are implemented and ready to use. Just add your API keys and start building amazing features! 🚀
