import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (Free tier!)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log('🔑 Gemini API Key configured:', apiKey ? `${apiKey.slice(0, 10)}...` : 'MISSING!');

const genAI = new GoogleGenerativeAI(apiKey);
// Use gemini-2.5-flash - the latest and fastest model available
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
  }
});

// PDF Summarization
export const generateSummary = async (text: string, type: 'short' | 'long' | 'bullets') => {
  const prompts = {
    short: 'Provide a concise summary (2-3 paragraphs) of the following text:',
    long: 'Provide a detailed, comprehensive summary of the following text:',
    bullets: 'Summarize the following text in bullet points, highlighting key concepts and main ideas:',
  };

  try {
    console.log(`🤖 Calling Gemini AI for ${type} summary...`);
    console.log('📝 Text length:', text.length, 'characters');
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
    }
    
    if (!text || text.length < 10) {
      throw new Error('Text is too short to summarize. Please provide more content.');
    }
    
    const prompt = `You are an expert educational assistant. ${prompts[type]}\n\n${text.slice(0, 30000)}`;
    console.log('📤 Sending prompt to Gemini (first 200 chars):', prompt.slice(0, 200));
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    console.log('✅ Gemini response received (first 200 chars):', summary.slice(0, 200));
    
    if (!summary || summary.length < 10) {
      throw new Error('Gemini returned an empty or very short response.');
    }
    
    return summary;
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
    });
    
    // Provide specific error messages
    if (error?.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your .env.local file.');
    } else if (error?.message?.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please try again later or check your API limits.');
    } else if (error?.message?.includes('blocked')) {
      throw new Error('Content was blocked by safety filters. Try a different PDF.');
    } else if (error?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error?.status === 403) {
      throw new Error('API access forbidden. Check if your API key has the necessary permissions.');
    } else if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      throw new Error('⚠️ Daily API quota exceeded (20 requests/day on free tier). Please try again tomorrow or get a new API key at https://aistudio.google.com/apikey');
    } else {
      throw new Error(error?.message || 'Failed to generate summary. Please try again.');
    }
  }
};

// Quiz Generation
export const generateQuiz = async (
  text: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
) => {
  try {
    console.log(`📝 Generating ${count} ${difficulty} quiz questions...`);
    console.log('📄 Text length:', text.length, 'characters');
    
    const prompt = `You are an expert quiz creator. Generate ${count} ${difficulty} difficulty multiple-choice quiz questions based on the provided text. 

Return ONLY a valid JSON array with this EXACT structure (no markdown code blocks, no extra text):
[
  {
    "question": "What is the main topic?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this is correct"
  }
]

IMPORTANT: 
- Return ONLY the JSON array, nothing else
- Each question must have exactly 4 options
- correctAnswer must be one of the options
- Make questions relevant to the text content

Text to analyze:
${text.slice(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    console.log('🤖 Raw Gemini response (first 500 chars):', content.slice(0, 500));
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any leading/trailing text that isn't JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // Fix common JSON issues
    content = content.replace(/\n/g, ' ')  // Remove newlines
                     .replace(/\s+/g, ' ')  // Normalize spaces
                     .replace(/,\s*}/g, '}')  // Remove trailing commas
                     .replace(/,\s*\]/g, ']');  // Remove trailing commas in arrays
    
    console.log('🔧 Cleaned content (first 500 chars):', content.slice(0, 500));
    
    const quizData = JSON.parse(content);
    console.log('✅ Successfully parsed', quizData.length, 'quiz questions');
    
    return quizData;
  } catch (error: any) {
    console.error('❌ Error generating quiz:', error);
    console.error('Error details:', error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('⚠️ Daily API quota exceeded. Please try again tomorrow or use a different API key.');
    }
    
    throw new Error(error.message || 'Failed to generate quiz. Please try again.');
  }
};

// Code Explanation
export const explainCode = async (code: string, language: string) => {
  try {
    console.log(`💡 Explaining ${language} code...`);
    const prompt = `You are an expert programming tutor. Explain the following ${language} code clearly and concisely:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **What it does**: Overall purpose
2. **How it works**: Step-by-step explanation
3. **Key concepts**: Important programming concepts used`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const explanation = response.text();
    
    console.log('✅ Code explanation complete');
    return explanation;
  } catch (error: any) {
    console.error('❌ Error explaining code:', error);
    throw new Error(error.message || 'Failed to explain code. Please try again.');
  }
};

// Code Debugging
export const debugCode = async (code: string, language: string, error?: string) => {
  try {
    console.log(`🐛 Debugging ${language} code...`);
    const prompt = `You are an expert debugging assistant. Debug this ${language} code${error ? ` that produces this error: ${error}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Issues Found**: List all bugs, errors, or potential problems
2. **Fixed Code**: Corrected version with fixes
3. **Explanation**: Why each fix was necessary`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const debug = response.text();
    
    console.log('✅ Debug analysis complete');
    return debug;
  } catch (error: any) {
    console.error('❌ Error debugging code:', error);
    throw new Error(error.message || 'Failed to debug code. Please try again.');
  }
};

// Code Conversion
export const convertCode = async (code: string, fromLang: string, toLang: string) => {
  try {
    console.log(`🔄 Converting from ${fromLang} to ${toLang}...`);
    const prompt = `Convert this ${fromLang} code to ${toLang}:

\`\`\`${fromLang}
${code}
\`\`\`

Provide:
1. **Converted Code**: Complete ${toLang} version
2. **Key Differences**: Syntax and feature differences between languages
3. **Notes**: Any important considerations`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const converted = response.text();
    
    console.log('✅ Code conversion complete');
    return converted;
  } catch (error: any) {
    console.error('❌ Error converting code:', error);
    throw new Error(error.message || 'Failed to convert code. Please try again.');
  }
};

// Code Complexity Analysis
export const analyzeComplexity = async (code: string, language: string) => {
  try {
    console.log(`⚡ Analyzing complexity for ${language} code...`);
    const prompt = `You are an expert in algorithm analysis. Analyze the time and space complexity of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Time Complexity**: Big-O notation with explanation
2. **Space Complexity**: Big-O notation with explanation
3. **Optimization Suggestions**: If any improvements can be made

Be clear and concise.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log('✅ Complexity analysis complete');
    return analysis;
  } catch (error: any) {
    console.error('❌ Error analyzing complexity:', error);
    console.error('Error details:', error.message);
    throw new Error(error.message || 'Failed to analyze complexity. Please try again.');
  }
};

// AI Tutor Chat
export const chatWithTutor = async (
  message: string,
  mode: 'study' | 'coding' | 'notes' | 'doubt' | 'exam',
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
) => {
  const systemPrompts: Record<typeof mode, string> = {
    study: `You are an expert Study Tutor. Help students understand concepts clearly with:
- Clear explanations with examples
- Breaking down complex topics
- Connecting concepts to real-world applications
- Encouraging active learning`,
    
    coding: `You are a Code Helper. Assist students with programming:
- Explain code concepts step-by-step
- Debug issues and suggest fixes
- Provide code examples with comments
- Teach best practices`,
    
    notes: `You are a Notes Maker. Help create effective study materials:
- Organize information in clear sections
- Use bullet points and formatting
- Highlight key concepts
- Create concise summaries`,
    
    doubt: `You are a Doubt Solver. Clear student confusion by:
- Addressing specific questions directly
- Providing multiple explanations if needed
- Using analogies and examples
- Checking understanding`,
    
    exam: `You are an Exam Prep Coach. Help students prepare for exams:
- Create practice questions
- Explain important topics
- Provide test-taking strategies
- Build confidence through practice`
  };

  try {
    console.log(`💬 AI Tutor (${mode} mode) processing message...`);
    
    // Build conversation context
    const context = conversationHistory.length > 0 
      ? conversationHistory.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n')
      : '';
    
    const prompt = `${systemPrompts[mode]}

${context ? `Previous conversation:\n${context}\n\n` : ''}Student: ${message}

Tutor:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();
    
    console.log('✅ AI Tutor response generated');
    return reply;
  } catch (error: any) {
    console.error('❌ Error in tutor chat:', error);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('⚠️ Daily API quota exceeded (20 requests/day). The free Gemini API has a daily limit. Please try again tomorrow or upgrade your API key.');
    }
    
    throw new Error(error.message || 'Failed to get response from tutor. Please try again.');
  }
};

// Study Schedule Generation
export const generateStudySchedule = async (subjects: string[], preferences?: string) => {
  try {
    const prompt = `Create a daily study schedule for these subjects: ${subjects.join(', ')}${preferences ? `\n\nPreferences: ${preferences}` : ''}\n\nReturn ONLY a valid JSON array (no markdown) with schedule items in this format:
[
  {
    "time": "09:00 AM",
    "duration": 60,
    "subject": "Subject name",
    "activity": "Activity description"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw new Error('Failed to generate schedule');
  }
};

// Generate Flashcards
export const generateFlashcards = async (text: string, count: number = 10) => {
  try {
    console.log(`🃏 Generating ${count} flashcards...`);
    console.log('📄 Text length:', text.length, 'characters');
    
    const prompt = `Create ${count} educational flashcards from the given text. Each flashcard should help students learn key concepts.

Return ONLY a valid JSON array with this EXACT structure (no markdown code blocks, no extra text):
[
  {
    "front": "Question or key term",
    "back": "Answer or detailed definition"
  }
]

IMPORTANT:
- Return ONLY the JSON array, nothing else
- Front should be concise (question or term)
- Back should be detailed but clear
- Focus on the most important concepts

Text:
${text.slice(0, 15000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    console.log('🤖 Raw Gemini response (first 500 chars):', content.slice(0, 500));
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any leading/trailing text that isn't JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // Fix common JSON issues
    content = content.replace(/\n/g, ' ')  // Remove newlines
                     .replace(/\s+/g, ' ')  // Normalize spaces
                     .replace(/,\s*}/g, '}')  // Remove trailing commas
                     .replace(/,\s*\]/g, ']');  // Remove trailing commas in arrays
    
    console.log('🔧 Cleaned content (first 500 chars):', content.slice(0, 500));
    
    const flashcards = JSON.parse(content);
    console.log('✅ Successfully parsed', flashcards.length, 'flashcards');
    
    return flashcards;
  } catch (error: any) {
    console.error('❌ Error generating flashcards:', error);
    console.error('Error details:', error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('⚠️ Daily API quota exceeded (20 requests/day on free tier). Please wait until tomorrow or upgrade your API key at https://ai.google.dev/');
    }
    
    throw new Error(error.message || 'Failed to generate flashcards. Please try again.');
  }
};

// Task Suggestions
export const generateTaskSuggestions = async (subject: string, level: string) => {
  try {
    const prompt = `Suggest 5 study tasks for ${subject} at ${level} level. Return ONLY valid JSON (no markdown):
[
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "low|medium|high",
    "estimatedTime": 30
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate task suggestions');
  }
};
