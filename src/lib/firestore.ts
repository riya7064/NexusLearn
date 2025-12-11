import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// User Profile
export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (uid: string, data: any) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

// PDF Documents (without file upload - text extraction only)
export const savePDFDocument = async (userId: string, data: any) => {
  const docRef = await addDoc(collection(db, 'pdfDocuments'), {
    userId,
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserPDFs = async (userId: string) => {
  const q = query(
    collection(db, 'pdfDocuments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deletePDF = async (docId: string) => {
  await deleteDoc(doc(db, 'pdfDocuments', docId));
};

// Summaries
export const saveSummary = async (pdfId: string, userId: string, summary: any) => {
  const docRef = await addDoc(collection(db, 'summaries'), {
    pdfId,
    userId,
    ...summary,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getSummariesByPDF = async (pdfId: string) => {
  const q = query(
    collection(db, 'summaries'),
    where('pdfId', '==', pdfId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Quizzes
export const saveQuiz = async (userId: string, quiz: any) => {
  const docRef = await addDoc(collection(db, 'quizzes'), {
    userId,
    ...quiz,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserQuizzes = async (userId: string) => {
  const q = query(
    collection(db, 'quizzes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateQuizResult = async (quizId: string, results: any) => {
  const docRef = doc(db, 'quizzes', quizId);
  await updateDoc(docRef, {
    results,
    completedAt: Timestamp.now(),
  });
};

// Study Tasks
export const createTask = async (userId: string, task: any) => {
  const docRef = await addDoc(collection(db, 'tasks'), {
    userId,
    ...task,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserTasks = async (userId: string) => {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTask = async (taskId: string, updates: any) => {
  const docRef = doc(db, 'tasks', taskId);
  await updateDoc(docRef, updates);
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

// Study Schedules
export const saveSchedule = async (userId: string, schedule: any) => {
  const docRef = await addDoc(collection(db, 'schedules'), {
    userId,
    ...schedule,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserSchedules = async (userId: string) => {
  const q = query(
    collection(db, 'schedules'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Pomodoro Sessions
export const savePomodoroSession = async (userId: string, session: any) => {
  const docRef = await addDoc(collection(db, 'pomodoroSessions'), {
    userId,
    ...session,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserPomodoroSessions = async (userId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, 'pomodoroSessions'),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Code Sessions
export const saveCodeSession = async (userId: string, session: any) => {
  const docRef = await addDoc(collection(db, 'codeSessions'), {
    userId,
    ...session,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserCodeSessions = async (userId: string) => {
  const q = query(
    collection(db, 'codeSessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Chat Sessions
export const saveChatSession = async (userId: string, session: any) => {
  const docRef = await addDoc(collection(db, 'chatSessions'), {
    userId,
    ...session,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateChatSession = async (sessionId: string, messages: any[]) => {
  const docRef = doc(db, 'chatSessions', sessionId);
  await updateDoc(docRef, {
    messages,
    updatedAt: Timestamp.now(),
  });
};

export const getUserChatSessions = async (userId: string) => {
  const q = query(
    collection(db, 'chatSessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Flashcards
export const saveFlashcardSet = async (userId: string, flashcardSet: any) => {
  const docRef = await addDoc(collection(db, 'flashcardSets'), {
    userId,
    ...flashcardSet,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getUserFlashcardSets = async (userId: string) => {
  const q = query(
    collection(db, 'flashcardSets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateFlashcardSet = async (setId: string, updates: any) => {
  const docRef = doc(db, 'flashcardSets', setId);
  await updateDoc(docRef, updates);
};

export const deleteFlashcardSet = async (setId: string) => {
  await deleteDoc(doc(db, 'flashcardSets', setId));
};
