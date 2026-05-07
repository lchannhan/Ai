import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getSystemPrompt = (outputMode: 'word' | 'latex') => `
    You are a high-fidelity OCR agent for Khmer and English technical documents.
    Your primary goal is to extract ALL content perfectly, including text, complex mathematical formulas, and detailed TABLES.

    Target Output Format: ${outputMode === 'word' ? 'Microsoft Word (MathType-ready)' : 'Professional LaTeX (XeLaTeX-ready)'}
    
    IMPORTANT RULES:
    1. MATH FORMULAS:
       - Identify every mathematical formula, equation, constant, and symbol.
       - Convert them into standard LaTeX syntax.
       - ALWAYS wrap formulas in single dollar signs (e.g., $f(x)=y$). Use double dollar signs for centered, standalone equations.

    2. TABLE EXTRACTION (STRICT LAW):
       - If you see any grid, border, or aligned rows/columns, you MUST extract it as a table.
       - DO NOT skip tables or flatten them into paragraphs.
       - ${outputMode === 'word' ? `For Word: Use STRICT Markdown Pipe Table format:
         | Header 1 | Header 2 |
         | -------- | -------- |
         | Cell A   | Cell B   |` : `For LaTeX: Use a professional tabular environment:
         \\begin{tabular}{|c|c|}
         \\hline
         Header 1 & Header 2 \\\\
         \\hline
         Cell A & Cell B \\\\
         \\hline
         \\end{tabular}`}
       - Ensure every row and column is accounted for.

    3. DOCUMENT STRUCTURE:
       - Maintain original hierarchies: Title, Headings (H1, H2, H3), lists, and page order.
       - For Khmer text: Accuracy is paramount. Use modern Khmer spelling. Preserve Khmer numerals (១, ២, ៣) if they appear in the original.

    4. Output exclusively the extracted content. No conversational filler or explanations.
`;

export async function extractTextWithMath(files: File[], outputMode: 'word' | 'latex' = 'word'): Promise<string> {
  const fileParts = await Promise.all(
    files.map(async (file) => {
      const data = await fileToBase64(file);
      return {
        inlineData: {
          data,
          mimeType: file.type,
        },
      };
    })
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: getSystemPrompt(outputMode) },
          ...fileParts,
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("មិនមានអត្ថបទត្រូវបានស្រង់ចេញទេ។");
    }
    return text;
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    if (error instanceof Error && error.message.includes("403")) {
      throw new Error("បញ្ហាសិទ្ធិប្រើប្រាស់ API។ សូមពិនិត្យមើលការកំណត់របស់អ្នក។");
    }
    throw new Error("ការបំប្លែងបានបរាជ័យ។ សូមព្យាយាមម្តងទៀតជាមួយឯកសារផ្សេង។");
  }
}

export async function* streamTextWithMath(files: File[], outputMode: 'word' | 'latex' = 'word'): AsyncGenerator<string> {
  const fileParts = await Promise.all(
    files.map(async (file) => {
      const data = await fileToBase64(file);
      return {
        inlineData: {
          data,
          mimeType: file.type,
        },
      };
    })
  );

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: getSystemPrompt(outputMode) },
          ...fileParts,
        ],
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(",")[1];
      if (base64String) resolve(base64String);
      else reject("Failed to convert file to base64");
    };
    reader.onerror = (error) => reject(error);
  });
}
