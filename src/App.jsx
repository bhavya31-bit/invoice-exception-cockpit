import React, { useMemo, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const invoices = [
  {
    id: "INV001",
    supplier: "ABC Suppliers",
    amount: 50000,
    poQuantity: 100,
    receivedQuantity: 100,
    invoiceQuantity: 100,
    status: "Matched",
    risk: "Low",
  },
  {
    id: "INV002",
    supplier: "Tech Hardware",
    amount: 95000,
    poQuantity: 120,
    receivedQuantity: 115,
    invoiceQuantity: 120,
    status: "Exception",
    risk: "Medium",
  },
  {
    id: "INV003",
    supplier: "Delta Industries",
    amount: 125000,
    poQuantity: 200,
    receivedQuantity: 180,
    invoiceQuantity: 200,
    status: "Exception",
    risk: "High",
  },
  {
    id: "INV004",
    supplier: "Global Components",
    amount: 85000,
    poQuantity: 150,
    receivedQuantity: 150,
    invoiceQuantity: 150,
    status: "Matched",
    risk: "Low",
  },
  {
    id: "INV005",
    supplier: "Metro Supplies",
    amount: 110000,
    poQuantity: 250,
    receivedQuantity: 230,
    invoiceQuantity: 250,
    status: "Exception",
    risk: "High",
  },
  {
    id: "INV006",
    supplier: "Prime Electricals",
    amount: 140000,
    poQuantity: 300,
    receivedQuantity: 285,
    invoiceQuantity: 300,
    status: "Exception",
    risk: "High",
  },
  {
    id: "INV007",
    supplier: "Prime Materials",
    amount: 45000,
    poQuantity: 100,
    receivedQuantity: 100,
    invoiceQuantity: 100,
    status: "Matched",
    risk: "Low",
  },
  {
    id: "INV008",
    supplier: "Sunrise Traders",
    amount: 72000,
    poQuantity: 180,
    receivedQuantity: 170,
    invoiceQuantity: 180,
    status: "Exception",
    risk: "Medium",
  },
  {
    id: "INV009",
    supplier: "Vertex Systems",
    amount: 98000,
    poQuantity: 200,
    receivedQuantity: 190,
    invoiceQuantity: 200,
    status: "Exception",
    risk: "Medium",
  },
  {
    id: "INV010",
    supplier: "TechPro Systems",
    amount: 78000,
    poQuantity: 240,
    receivedQuantity: 230,
    invoiceQuantity: 240,
    status: "Matched",
    risk: "Low",
  },
  {
    id: "INV011",
    supplier: "Nova Enterprises",
    amount: 135000,
    poQuantity: 300,
    receivedQuantity: 270,
    invoiceQuantity: 300,
    status: "Exception",
    risk: "High",
  },
  {
    id: "INV012",
    supplier: "Reliable Equipments",
    amount: 76000,
    poQuantity: 160,
    receivedQuantity: 155,
    invoiceQuantity: 160,
    status: "Exception",
    risk: "Medium",
  },
];

function formatCurrency(value) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function App() {
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[9]);

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");

  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return invoices;
    }

    return invoices.filter(
      (invoice) =>
        invoice.id.toLowerCase().includes(value) ||
        invoice.supplier.toLowerCase().includes(value) ||
        invoice.status.toLowerCase().includes(value) ||
        invoice.risk.toLowerCase().includes(value)
    );
  }, [search]);

  const totalInvoices = invoices.length;

  const matchedInvoices = invoices.filter(
    (invoice) => invoice.status === "Matched"
  ).length;

  const exceptionInvoices = totalInvoices - matchedInvoices;

  const highRiskInvoices = invoices.filter(
    (invoice) => invoice.risk === "High"
  ).length;

  const mediumRiskInvoices = invoices.filter(
    (invoice) => invoice.risk === "Medium"
  ).length;

  const lowRiskInvoices = invoices.filter(
    (invoice) => invoice.risk === "Low"
  ).length;

  const autoMatchRate = Math.round(
    (matchedInvoices / totalInvoices) * 100
  );

  const exceptionRate = Math.round(
    (exceptionInvoices / totalInvoices) * 100
  );

  const reviewInvoices = invoices.filter(
    (invoice) => invoice.status === "Exception"
  );

  const reviewValue = reviewInvoices.reduce(
    (total, invoice) => total + invoice.amount,
    0
  );

  const blockedValue = reviewValue;

  const mismatchPercentage =
    selectedInvoice.invoiceQuantity > 0
      ? Math.abs(
          ((selectedInvoice.invoiceQuantity -
            selectedInvoice.receivedQuantity) /
            selectedInvoice.invoiceQuantity) *
            100
        )
      : 0;

  async function analyzeWithAI() {
    setAiLoading(true);
    setAiError("");
    setAiAnalysis("");

    try {
      const response = await fetch(
        `${API_URL}/api/analyze-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedInvoice.id,
            supplier: selectedInvoice.supplier,
            amount: selectedInvoice.amount,
            poQuantity: selectedInvoice.poQuantity,
            receivedQuantity: selectedInvoice.receivedQuantity,
            invoiceQuantity: selectedInvoice.invoiceQuantity,
            mismatchPercentage: mismatchPercentage.toFixed(1),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI analysis request failed."
        );
      }

      setAiAnalysis(data.analysis || "No analysis returned.");
    } catch (error) {
      console.error("AI analysis error:", error);

      setAiError(
        "Unable to get AI analysis. Please check that the AI server is running."
      );
    } finally {
      setAiLoading(false);
    }
  }

  function handleAction(action) {
    const type = action.toLowerCase();

    setActionType(type);

    setActionMessage(
      `Invoice ${selectedInvoice.id} has been marked as ${action.toUpperCase()}.`
    );
  }

  function selectInvoice(invoice) {
    setSelectedInvoice(invoice);
    setAiAnalysis("");
    setAiError("");
    setActionMessage("");
    setActionType("");
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>Invoice Exception Cockpit</h1>
          <p>
            P2P Invoice Review &amp; Exception Management
          </p>
        </div>

        <div className="department">
          Finance / AP
        </div>
      </header>

      <main className="container">

        {/* KPI CARDS */}
        <section className="kpi-grid">

          <div className="kpi-card">
            <span>Total Invoices</span>
            <strong>{totalInvoices}</strong>
          </div>

          <div className="kpi-card green">
            <span>Auto-Match Rate</span>
            <strong>{autoMatchRate}%</strong>
          </div>

          <div className="kpi-card orange">
            <span>Exception Rate</span>
            <strong>{exceptionRate}%</strong>
          </div>

          <div className="kpi-card red">
            <span>High-Risk Invoices</span>
            <strong>{highRiskInvoices}</strong>
          </div>

        </section>

        {/* SECONDARY KPI */}
        <section className="secondary-card">

          <div>
            <span>Blocked Invoice Value</span>
            <strong>{formatCurrency(blockedValue)}</strong>
          </div>

          <div>
            <span>Invoices Requiring Review</span>
            <strong>{exceptionInvoices}</strong>
          </div>

          <div>
            <span>Processing Focus</span>
            <strong>Risk-Based</strong>
          </div>

        </section>

        {/* EXCEPTION SUMMARY */}
        <section className="section-card">

          <div className="section-header">
            <div>
              <h2>Exception Summary</h2>
              <p>Current invoice risk distribution</p>
            </div>

            <div className="review-value">
              <span>Review Value</span>
              <strong>{formatCurrency(reviewValue)}</strong>
            </div>
          </div>

          <div className="risk-grid">

            <div className="risk-card high">
              <div className="risk-title">
                <strong>High Risk</strong>
                <b>{highRiskInvoices}</b>
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${(highRiskInvoices / totalInvoices) * 100}%`,
                  }}
                />
              </div>

              <p>Immediate attention required</p>
            </div>

            <div className="risk-card medium">
              <div className="risk-title">
                <strong>Medium Risk</strong>
                <b>{mediumRiskInvoices}</b>
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${(mediumRiskInvoices / totalInvoices) * 100}%`,
                  }}
                />
              </div>

              <p>Review recommended</p>
            </div>

            <div className="risk-card low">
              <div className="risk-title">
                <strong>Low Risk</strong>
                <b>{lowRiskInvoices}</b>
              </div>

              <div className="progress">
                <div
                  style={{
                    width: `${(lowRiskInvoices / totalInvoices) * 100}%`,
                  }}
                />
              </div>

              <p>Normal processing</p>
            </div>

          </div>
        </section>

        {/* BUSINESS IMPACT */}
        <section className="section-card">

          <div className="section-header">
            <div>
              <h2>Projected Business Impact</h2>
              <p>
                Illustrative target improvements from the proposed
                workflow.
              </p>
            </div>
          </div>

          <div className="impact-table">

            <div className="impact-row header-row">
              <span>Business KPI</span>
              <span>Before</span>
              <span>Target After</span>
              <span>Improvement</span>
            </div>

            <div className="impact-row">
              <span>Invoice Exception Rate</span>
              <strong>25%</strong>
              <strong>10%</strong>
              <span className="improvement">↓ 60%</span>
            </div>

            <div className="impact-row">
              <span>Manual Review Time</span>
              <strong>3 days</strong>
              <strong>1 day</strong>
              <span className="improvement">↓ 67%</span>
            </div>

            <div className="impact-row">
              <span>Blocked Invoice Value</span>
              <strong>₹10L</strong>
              <strong>₹4L</strong>
              <span className="improvement">↓ 60%</span>
            </div>

          </div>

        </section>

        {/* INVOICE LIST */}
        <section className="section-card">

          <div className="section-header invoice-header">

            <div>
              <h2>Invoice Exceptions</h2>
              <p>
                Select an invoice to review its exception details.
              </p>
            </div>

            <input
              className="search"
              type="text"
              placeholder="Search invoice or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="invoice-table">

            <div className="invoice-row invoice-row-header">
              <span>Invoice</span>
              <span>Supplier</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Risk</span>
            </div>

            {filteredInvoices.map((invoice) => (
              <button
                key={invoice.id}
                className={`invoice-row invoice-button ${
                  selectedInvoice.id === invoice.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectInvoice(invoice)}
              >
                <span>{invoice.id}</span>

                <span className="supplier">
                  {invoice.supplier}
                </span>

                <span>
                  {formatCurrency(invoice.amount)}
                </span>

                <span>
                  <span
                    className={`badge ${
                      invoice.status === "Matched"
                        ? "matched"
                        : "exception"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </span>

                <span>
                  <span
                    className={`badge risk-${invoice.risk.toLowerCase()}`}
                  >
                    {invoice.risk}
                  </span>
                </span>
              </button>
            ))}

          </div>

        </section>

        {/* SELECTED INVOICE */}
        <section className="section-card selected-section">

          <div className="selected-heading">
            <div>
              <span className="eyebrow">
                SELECTED INVOICE
              </span>

              <h2>{selectedInvoice.id}</h2>

              <p>{selectedInvoice.supplier}</p>
            </div>

            <div className="selected-amount">
              {formatCurrency(selectedInvoice.amount)}
            </div>
          </div>

          <div className="invoice-details">

            <div>
              <span>PO Quantity</span>
              <strong>
                {selectedInvoice.poQuantity}
              </strong>
            </div>

            <div>
              <span>Received Quantity</span>
              <strong>
                {selectedInvoice.receivedQuantity}
              </strong>
            </div>

            <div>
              <span>Invoice Quantity</span>
              <strong>
                {selectedInvoice.invoiceQuantity}
              </strong>
            </div>

            <div>
              <span>Mismatch</span>
              <strong className="mismatch">
                {mismatchPercentage.toFixed(1)}%
              </strong>
            </div>

          </div>

          <div className="mismatch-message">
            {mismatchPercentage === 0
              ? "No quantity mismatch detected."
              : mismatchPercentage < 5
              ? `Small quantity mismatch detected: ${mismatchPercentage.toFixed(
                  1
                )}%. Review recommended.`
              : `Quantity mismatch detected: ${mismatchPercentage.toFixed(
                  1
                )}%. Further verification recommended.`}
          </div>

        </section>

        {/* GEMINI AI */}
        <section className="ai-card">

          <div className="ai-header">

            <div>
              <h2>✨ Gemini AI Analysis</h2>

              <p>
                AI-assisted exception analysis and recommendation.
              </p>
            </div>

            <button
              className="ai-button"
              onClick={analyzeWithAI}
              disabled={aiLoading}
            >
              {aiLoading
                ? "⏳ Analyzing..."
                : "✨ Analyze with AI"}
            </button>

          </div>

          {aiLoading && (
            <div className="ai-loading">
              Gemini is analyzing {selectedInvoice.id}...
            </div>
          )}

          {aiError && !aiLoading && (
            <div className="ai-error">
              {aiError}
            </div>
          )}

          {aiAnalysis && !aiLoading && (
            <div className="ai-result">
              <pre>{aiAnalysis}</pre>
            </div>
          )}

          {!aiAnalysis && !aiError && !aiLoading && (
            <div className="ai-placeholder">
              Click <strong>Analyze with AI</strong> to get an
              evidence-based invoice risk assessment.
            </div>
          )}

        </section>

        {/* ACTION BUTTONS */}
        <section className="action-section">

          <button
            className="action-button approve"
            onClick={() => handleAction("Approve")}
          >
            ✓ Approve
          </button>

          <button
            className="action-button reject"
            onClick={() => handleAction("Reject")}
          >
            ✕ Reject
          </button>

          <button
            className="action-button escalate"
            onClick={() => handleAction("Escalate")}
          >
            ⚠ Escalate
          </button>

        </section>

        {/* ACTION RESULT */}
        {actionMessage && (
          <div
            className={`action-message ${actionType}`}
          >
            {actionMessage}
          </div>
        )}

      </main>

      <footer>
        Invoice Exception Cockpit • Finance / AP
      </footer>

    </div>
  );
}

export default App;