import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiSuggestion(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error.status, error.message);
    if (error.status === 429) {
      throw new Error("AI_QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export function createGeminiPrompt(transactions) {
  // Strip MongoDB metadata — only send what's relevant
  const cleaned = transactions.map((t) => ({
    title: t.title,
    income: Number(t.income) || 0,
    expenses: Number(t.expenses) || 0,
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-AU") : "unknown",
  }));

  const totalIncome = cleaned.reduce((sum, t) => sum + t.income, 0);
  const totalExpenses = cleaned.reduce((sum, t) => sum + t.expenses, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const transactionLines = cleaned
    .map((t) => `- ${t.date}: "${t.title}" | Income: $${t.income.toFixed(2)} | Expenses: $${t.expenses.toFixed(2)}`)
    .join("\n");

  const prompt = `
You are a personal finance advisor. Analyze the transaction data below and give exactly 5 short, actionable suggestions.

SUMMARY:
- Total Income:    $${totalIncome.toFixed(2)}
- Total Expenses:  $${totalExpenses.toFixed(2)}
- Net Balance:     $${balance.toFixed(2)}
- Savings Rate:    ${savingsRate}%
- Transactions:    ${cleaned.length}

TRANSACTIONS:
${transactionLines}

INSTRUCTIONS:
- Write exactly 5 suggestions, numbered 1 to 5
- Each suggestion must be one sentence only
- Be specific — reference actual amounts or transaction titles from the data above
- No markdown, no bold, no asterisks, no bullet symbols
- Plain text only

Financial Suggestions:
`.trim();

  return prompt;
}
