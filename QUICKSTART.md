# 🚀 NexusLearn - Quick Setup Guide

## ✅ What's Already Done

**All backend services are fully implemented!**

- ✅ Authentication with Google Sign-In
- ✅ Protected routes for all pages
- ✅ Firebase Firestore database integration
- ✅ Firebase Storage for file uploads
- ✅ OpenAI GPT-4 integration
- ✅ Google Gemini AI integration  
- ✅ PDF text extraction
- ✅ Complete UI with 50+ shadcn components
- ✅ Fully functional PDF Summarizer example

---

## 📋 Final Steps to Get Running

### Step 1: Set Up Firebase (5 minutes)

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Create a new project**
   - Click "Add project"
   - Name it "NexusLearn" (or anything you want)
   - Disable Google Analytics (optional)
   - Click "Create project"

3. **Enable Authentication**
   - In your project, click "Authentication" in the left menu
   - Click "Get Started"
   - Click on "Google" under Sign-in providers
   - Toggle "Enable"
   - Add your email as support email
   - Click "Save"

4. **Create Firestore Database**
   - Click "Firestore Database" in the left menu
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select your region
   - Click "Enable"

5. **Create Storage Bucket**
   - Click "Storage" in the left menu
   - Click "Get started"
   - Choose "Start in test mode"
   - Click "Done"

6. **Get your Firebase config**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register app (name it "NexusLearn Web")
   - **Copy the firebaseConfig object values**

7. **Update `.env.local`**
   ```env
   VITE_FIREBASE_API_KEY=AIza...your-key
   VITE_FIREBASE_AUTH_DOMAIN=nexuslearn-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=nexuslearn-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=nexuslearn-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456:web:abcdef
   ```

---

### Step 2: Get OpenAI API Key (2 minutes)

1. **Go to [OpenAI Platform](https://platform.openai.com/api-keys)**

2. **Sign in or create account**

3. **Create API Key**
   - Click "Create new secret key"
   - Name it "NexusLearn"
   - Copy the key (starts with `sk-...`)

4. **Add to `.env.local`**
   ```env
   VITE_OPENAI_API_KEY=sk-...your-key
   ```

5. **Add credits (if needed)**
   - Go to Settings > Billing
   - Add $5-10 to start (very affordable for testing)

---

### Step 3: Get Gemini API Key (Optional - 2 minutes)

1. **Go to [Google AI Studio](https://makersuite.google.com/app/apikey)**

2. **Click "Create API Key"**

3. **Copy the key**

4. **Add to `.env.local`**
   ```env
   VITE_GEMINI_API_KEY=AIza...your-key
   ```

---

### Step 4: Update Firestore Security Rules (2 minutes)

In Firebase Console > Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /pdfDocuments/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /summaries/{summaryId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /schedules/{scheduleId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /pomodoroSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /codeSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /flashcardSets/{setId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

Click "Publish"

---

### Step 5: Update Firebase Storage Rules (1 minute)

In Firebase Console > Storage > Rules, replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publish"

---

### Step 6: Run the App! 🎉

```bash
npm run dev
```

Visit **http://localhost:8080**

---

## 🎯 Testing Checklist

1. **✅ Login**
   - Click "Continue with Google"
   - Should redirect to homepage after login

2. **✅ Upload PDF**
   - Go to "PDF Summarizer"
   - Upload a PDF file
   - Click "Generate Summaries"
   - Wait for AI to process (~10-30 seconds)
   - See summaries, generate quiz, generate flashcards

3. **✅ Check Profile**
   - Bottom left sidebar shows your name/email
   - Click "Sign Out" to test logout

4. **✅ Check Firestore**
   - Go to Firebase Console > Firestore
   - Should see new documents created!

---

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- **Fix:** Make sure you've enabled Google Sign-In in Firebase Console

### Error: "Failed to generate summary"
- **Fix:** Check if OpenAI API key is correct and has credits

### Error: "Permission denied"
- **Fix:** Make sure Firestore security rules are updated

### CORS Error
- **Fix:** In production, you'll need a backend proxy for API calls
- For now, the app uses `dangerouslyAllowBrowser` flag (development only)

### PDF not uploading
- **Fix:** Check Firebase Storage is enabled and rules are set

---

## 📚 What's Next?

Now that everything is set up, you can:

1. **Implement more pages:**
   - Use `PDFSummarizerNew.tsx` as a reference
   - Copy the pattern for other features
   - All backend functions are ready to use!

2. **Customize UI:**
   - Update colors in `tailwind.config.ts`
   - Modify components in `src/components/ui/`

3. **Add features:**
   - Implement the Coding Assistant
   - Build the AI Tutor chat interface
   - Create the Study Planner with calendar
   - Add the Flashcards review system
   - Build the Progress analytics dashboard

4. **Deploy:**
   - Use Vercel, Netlify, or Firebase Hosting
   - Update security rules for production
   - Set up proper API proxying

---

## 📖 Documentation

- **BACKEND-GUIDE.md** - Complete API reference
- **README.md** - Project overview
- **SETUP-COMPLETE.md** - Initial setup summary

---

## 💡 Tips

1. **Keep dev server running** - Changes hot-reload automatically
2. **Check Firebase Console** - See data being created in real-time
3. **Monitor API usage** - Check OpenAI dashboard for costs
4. **Use React DevTools** - Debug state and components
5. **Read the code** - `PDFSummarizerNew.tsx` shows complete integration

---

## 🎓 You're All Set!

Your NexusLearn platform is ready to go! Just add your API keys and start testing.

**Questions?** Check the BACKEND-GUIDE.md for detailed examples of every feature!

Good luck with your project! 🚀
