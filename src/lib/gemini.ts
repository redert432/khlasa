import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function fileToGenerativePart(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function summarizeDocument(file: File, outputLanguage: string = "Arabic") {
  const filePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      `Analyze the attached document or image. Provide a comprehensive summary dividing it by the main topics or sections. If it is a book page, summarize the points covered. If there are any actionable tasks, forms to fill, or clear action items, extract them clearly.

CRITICAL: Your final output (both the summary and the action items) MUST be written entirely in ${outputLanguage}.`,
      filePart as any
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING
          },
          actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          illustrationSvg: {
            type: Type.STRING,
            description: "A simple, elegant SVG illustration representing the core theme of the document (minimalist, flat design)"
          }
        },
        required: ["summary", "illustrationSvg"]
      }
    }
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text);
  } catch (e) {
    return { summary: text, actionItems: [] };
  }
}

export async function compileResearch(sourceText: string, files: File[] = [], outputLanguage: string = "Arabic") {
  const parts: any[] = [
    `You are an expert Academic Researcher and Technical Writer. 
    Act as a "Compiler and Designer" of traditional and university-grade research.
    Your task is to take the provided sources (text and/or documents) and compile them into a formal structured research paper.
    
    Structure the output as a valid JSON object with these keys:
    - title: A formal academic title for the paper
    - abstract: A 200-word overview
    - introduction: Background and problem statement
    - methodology: How the research was conducted or structured
    - findings: Main data points and analysis
    - conclusion: Final thoughts and future work
    - references: A list of cited-style references based on the text
    
    CRITICAL: Everything MUST be written in ${outputLanguage}. Use professional academic tone.
    
    Source Text:
    ${sourceText}`
  ];

  for (const file of files) {
    const part = await fileToGenerativePart(file);
    parts.push(part);
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: parts,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          abstract: { type: Type.STRING },
          introduction: { type: Type.STRING },
          methodology: { type: Type.STRING },
          findings: { type: Type.STRING },
          conclusion: { type: Type.STRING },
          illustrationSvg: { type: Type.STRING, description: "A simple, elegant SVG illustration representing the research theme (minimalist, flat design)" },
          references: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "abstract", "introduction", "findings", "conclusion", "illustrationSvg"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}

export async function summarizeMeeting(transcript: string, outputLanguage: string = "Arabic") {
  if (!transcript.trim()) return { summary: '', actionItems: [], diarizedTranscript: '' };
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following raw meeting transcript. 
1. Identify different speakers (e.g., Speaker 1, Speaker 2, or specific names if mentioned).
2. Rewrite the transcript clearly, labeling each spoken part with the speaker's name/label.
3. Provide a concise summary of the meeting, divided by main topics.
4. Extract any actionable tasks or action items mentioned.

CRITICAL: Your final output (summary, action items, and the labels/content of the diarized transcript) MUST be written entirely in ${outputLanguage}. Even if the raw transcript is in English, translate the speakers' words and your insights into ${outputLanguage}.

Raw Transcript:
${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A summary of the meeting, divided by main topics.",
          },
          actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of actionable tasks extracted from the meeting.",
          },
          diarizedTranscript: {
            type: Type.STRING,
            description: "The transcript rewritten with speaker labels and proper formatting.",
          },
          illustrationSvg: {
            type: Type.STRING,
            description: "A simple, elegant SVG illustration representing the meeting's theme (minimalist, flat design)",
          }
        },
        required: ["summary", "actionItems", "diarizedTranscript", "illustrationSvg"],
      },
    },
  });

  try {
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr) as { summary: string, actionItems: string[], diarizedTranscript: string };
  } catch (err) {
    console.error("Failed to parse AI output", err);
    return { summary: '', actionItems: [], diarizedTranscript: '' };
  }
}

export async function solveMathProblem(file: File, outputLanguage: string = "Arabic") {
  const filePart = await fileToGenerativePart(file);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      `Analyze the attached image of a math problem. Solve the problem step-by-step. 
      Break down the explanation into clear logical steps.
      Provide the final solution separately.

      CRITICAL: All explanations and steps MUST be written in ${outputLanguage}. Use LaTeX formatting for mathematical expressions if possible (e.g. $x^2$).`,
      filePart as any
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          solution: {
            type: Type.STRING,
            description: "The final answer or result."
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The detailed steps taken to reach the solution."
          },
          explanation: {
            type: Type.STRING,
            description: "A brief overall explanation of the mathematical concept used."
          }
        },
        required: ["solution", "steps", "explanation"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}
