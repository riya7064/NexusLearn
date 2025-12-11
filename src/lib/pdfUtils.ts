import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - using unpkg as a reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('📄 Starting PDF extraction...');
    console.log('File:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ File loaded into memory');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    console.log('⏳ Loading PDF document...');
    
    const pdf = await loadingTask.promise;
    console.log('✅ PDF loaded successfully. Pages:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`📖 Processing page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
      console.log(`✅ Page ${i} extracted (${pageText.length} chars)`);
    }
    
    const finalText = fullText.trim();
    console.log('✅ Extraction complete! Total characters:', finalText.length);
    
    if (finalText.length === 0) {
      throw new Error('PDF appears to be empty or contains only images. Try a text-based PDF.');
    }
    
    return finalText;
  } catch (error: any) {
    console.error('❌ PDF Extraction Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more helpful error messages
    if (error.message?.includes('worker')) {
      throw new Error('PDF worker failed to load. Please check your internet connection and try again.');
    } else if (error.message?.includes('Invalid PDF')) {
      throw new Error('This file appears to be corrupted or not a valid PDF.');
    } else if (error.message?.includes('password')) {
      throw new Error('This PDF is password-protected. Please use an unprotected PDF.');
    } else {
      throw new Error(error.message || 'Failed to extract text from PDF. The file may be image-based or corrupted.');
    }
  }
};

export const getPDFMetadata = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const metadata = await pdf.getMetadata();
    
    const info = metadata.info as any;
    
    return {
      numPages: pdf.numPages,
      title: info?.Title || file.name,
      author: info?.Author || 'Unknown',
      subject: info?.Subject || '',
      creationDate: info?.CreationDate || new Date(),
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new Error('Failed to get PDF metadata');
  }
};
