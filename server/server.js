import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Exception Cockpit API is running",
  });
});

// AI Invoice Analysis
app.post("/api/analyze-invoice", async (req, res) => {
  try {
    const invoice = req.body;

    // Calculate quantity difference
    const difference =
      invoice.invoiceQuantity - invoice.receivedQuantity;

    // AI prompt
    const prompt = `
You are an AI assistant supporting a Finance / Accounts Payable team
in a Purchase-to-Pay (P2P) invoice exception management system.

Your task is to analyze the invoice information provided below and
give a concise, evidence-based business recommendation.

IMPORTANT RULES:

1. Use ONLY the information provided.
2. Do not invent facts.
3. Do not assume that goods are damaged, lost, or in transit.
4. If additional verification is required, clearly say what should be verified.
5. The Finance/AP employee remains responsible for the final decision.
6. Focus on invoice accuracy, payment risk, and exception handling.

INVOICE INFORMATION

Invoice ID: ${invoice.id}
Supplier: ${invoice.supplier}
Invoice Amount: ₹${invoice.amount.toLocaleString("en-IN")}

Purchase Order Quantity: ${invoice.poQuantity} units
Received Quantity: ${invoice.receivedQuantity} units
Invoice Quantity: ${invoice.invoiceQuantity} units

Quantity Difference: ${difference} units
Mismatch Percentage: ${invoice.mismatchPercentage}%

Return the analysis using EXACTLY this format:

AI RISK ASSESSMENT

Risk Level: [LOW / MEDIUM / HIGH]

Key Finding:
[One or two concise sentences explaining the discrepancy.]

Discrepancy:
[State the quantity difference and mismatch percentage.]

Business Impact:
[Explain the possible payment or processing risk based only on the supplied data.]

Recommended Action:
[APPROVE / REJECT / ESCALATE]

Next Step:
[Give one practical verification or processing step for the Finance/AP employee.]
`;

    // Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // Send AI response to frontend
    res.json({
      success: true,
      analysis: response.text,
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      success: false,
      message: "AI analysis failed.",
      error: error.message,
    });
  }
});

// Render provides PORT automatically
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Invoice Exception Cockpit API running on port ${PORT}`
  );
});