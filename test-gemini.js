// Quick test script to list available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCYn8l6gmFL0GyvdGjhIIUOYK6qx6VRbws';
const genAI = new GoogleGenerativeAI(apiKey);

console.log('Fetching list of available models...\n');

try {
  // Try to list models using the API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  
  if (data.error) {
    console.error('❌ API Error:', data.error.message);
    console.log('\n⚠️  Your API key may not be enabled for the Gemini API.');
    console.log('📝 Please follow these steps:');
    console.log('   1. Go to https://makersuite.google.com/app/apikey');
    console.log('   2. Create a new API key or verify your existing one');
    console.log('   3. Make sure "Generative Language API" is enabled');
  } else if (data.models) {
    console.log('✅ Available models:');
    data.models.forEach(model => {
      console.log(`   - ${model.name} (${model.displayName})`);
      if (model.supportedGenerationMethods) {
        console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
      }
    });
  } else {
    console.log('Response:', data);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}

