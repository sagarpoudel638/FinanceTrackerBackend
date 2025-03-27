
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiSuggestion(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

export function createGeminiPrompt(transactions) {
    const transactionData = JSON.stringify(transactions, null, 2);  

    const prompt = `
    I have the following financial transaction data:

    ${transactionData}

    Based on this data, provide financial suggestions in 5-6 lines. Focus on improving spending habits, saving, and potential investment opportunities.  Be concise and actionable.  Avoid definitions or explanations.  Go straight to the suggestions.

    Financial Suggestions:
    `;

    return prompt;
}