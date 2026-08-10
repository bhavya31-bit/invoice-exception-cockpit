import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

// =====================================================
// PATH CONFIGURATION
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/server.js
//       ↓
// project root
//       ↓
// dist
const frontendPath = path.join(__dirname, "..", "dist");

console.log("Frontend path:", frontendPath);

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
// SERVE REACT / VITE PRODUCTION BUILD
// =====================================================

app.use(express.static(frontendPath));

// =====================================================
// REACT FALLBACK
// =====================================================

// IMPORTANT:
// This MUST come AFTER all API routes.

app.use((req, res, next) => {
  // Unknown API route
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  }

  // React application
  res.sendFile(path.join(frontendPath, "index.html"));
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log(`Invoice Exception Cockpit running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Health:   http://localhost:${PORT}/api/health`);
  console.log("========================================");
});