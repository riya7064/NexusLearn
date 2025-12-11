# Firestore Debugging Guide

## The Problem
Saved content isn't showing up in the Saved Content page.

## How to Debug

### Step 1: Check Browser Console
1. Open the app in your browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Save a code session from Code Assistant
5. Look for these logs:
   - ✅ "Saving code session for user: [userId]"
   - ✅ "Code session saved with ID: [sessionId]"
   
### Step 2: Check Saved Content Page
1. Go to Saved Content page
2. Check console for:
   - 📥 "Loading saved content for user: [userId]"
   - 📊 "Loaded content counts: { code: X }"
   - 💾 "Code sessions: [array of data]"

### Step 3: Check Firestore Rules
Your Firestore needs these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /codeSessions/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /chatSessions/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /flashcardSets/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /quizzes/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /pdfDocuments/{docId} {
      allow read, write: if request.auth != null && 
                          request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    match /summaries/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Update Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nexuslearn-app`
3. Go to Firestore Database
4. Click on "Rules" tab
5. Replace with the rules above
6. Click "Publish"

### Step 5: Common Issues

**Issue: Permission Denied Error**
- Check console for "permission-denied" errors
- Verify Firestore rules allow authenticated users
- Make sure you're signed in

**Issue: Data Not Appearing**
- The page auto-refreshes every 5 seconds
- Try manually refreshing the browser
- Check if the user ID matches in save vs load

**Issue: No Error Messages**
- Verify Firebase config in `.env.local`
- Check Network tab in DevTools for failed requests
- Ensure internet connection is active

## Quick Test

Run this in browser console while on Code Assistant page:
```javascript
// Check if user is authenticated
console.log("Current user:", firebase.auth().currentUser);

// Try to save manually
const { saveCodeSession } = await import('./src/lib/firestore');
await saveCodeSession('test-user-id', {
  title: 'Test Session',
  language: 'javascript',
  mode: 'explain',
  code: 'console.log("test")',
  output: 'This is a test'
});
```
