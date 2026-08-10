import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// GEMINI AI
// =====================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Exception Cockpit API is running",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Exception Cockpit API is running",
  });
});

// =====================================================
// AI INVOICE ANALYSIS
// =====================================================

app.post("/api/analyze-invoice", async (req, res) => {
  try {
    const invoice = req.body;

    const invoiceQuantity = Number(invoice.invoiceQuantity || 0);
    const receivedQuantity = Number(invoice.receivedQuantity || 0);
    const amount = Number(invoice.amount || 0);

    const difference = invoiceQuantity - receivedQuantity;

    const prompt = `
You are an AI assistant supporting a Finance / Accounts Payable team
in a Purchase-to-Pay (P2P) invoice exception management system.

Analyze the invoice information provided below.

IMPORTANT RULES:

1. Use ONLY the information provided.
2. Do not invent facts.
3. Do not assume goods are damaged, lost, or in transit.
4. If additional verification is required, clearly say what should be verified.
5. The Finance/AP employee remains responsible for the final decision.
6. Focus on invoice accuracy, payment risk, and exception handling.

INVOICE INFORMATION

Invoice ID: ${invoice.id || "Not provided"}
Supplier: ${invoice.supplier || "Not provided"}
Invoice Amount: ₹${amount.toLocaleString("en-IN")}

Purchase Order Quantity: ${invoice.poQuantity || 0} units
Received Quantity: ${receivedQuantity} units
Invoice Quantity: ${invoiceQuantity} units

Quantity Difference: ${difference} units
Mismatch Percentage: ${invoice.mismatchPercentage || 0}%

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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

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

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Invoice Exception Cockpit API running on port ${PORT}`);
});