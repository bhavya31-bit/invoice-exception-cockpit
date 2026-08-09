import { useState } from "react";
import "./App.css";

const invoices = [
  {
    id: "INV001",
    supplier: "ABC Suppliers",
    amount: 50000,
    poQuantity: 100,
    receivedQuantity: 100,
    invoiceQuantity: 100,
  },
  {
    id: "INV002",
    supplier: "XYZ Industries",
    amount: 72000,
    poQuantity: 100,
    receivedQuantity: 95,
    invoiceQuantity: 100,
  },
  {
    id: "INV003",
    supplier: "PQR Manufacturing",
    amount: 120000,
    poQuantity: 100,
    receivedQuantity: 80,
    invoiceQuantity: 100,
  },
  {
    id: "INV004",
    supplier: "Global Components",
    amount: 85000,
    poQuantity: 200,
    receivedQuantity: 200,
    invoiceQuantity: 200,
  },
  {
    id: "INV005",
    supplier: "Delta Electronics",
    amount: 64000,
    poQuantity: 150,
    receivedQuantity: 145,
    invoiceQuantity: 150,
  },
  {
    id: "INV006",
    supplier: "Nova Industrial",
    amount: 150000,
    poQuantity: 500,
    receivedQuantity: 430,
    invoiceQuantity: 500,
  },
  {
    id: "INV007",
    supplier: "Prime Materials",
    amount: 45000,
    poQuantity: 80,
    receivedQuantity: 80,
    invoiceQuantity: 80,
  },
  {
    id: "INV008",
    supplier: "Vertex Solutions",
    amount: 92000,
    poQuantity: 250,
    receivedQuantity: 240,
    invoiceQuantity: 250,
  },
  {
    id: "INV009",
    supplier: "Sunrise Engineering",
    amount: 110000,
    poQuantity: 300,
    receivedQuantity: 210,
    invoiceQuantity: 300,
  },
  {
    id: "INV010",
    supplier: "TechPro Systems",
    amount: 78000,
    poQuantity: 120,
    receivedQuantity: 120,
    invoiceQuantity: 120,
  },
  {
    id: "INV011",
    supplier: "Metro Hardware",
    amount: 56000,
    poQuantity: 180,
    receivedQuantity: 175,
    invoiceQuantity: 180,
  },
  {
    id: "INV012",
    supplier: "Evergreen Supplies",
    amount: 135000,
    poQuantity: 400,
    receivedQuantity: 300,
    invoiceQuantity: 400,
  },
];

function App() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // AI
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Filters
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Audit Trail
  const [auditLogs, setAuditLogs] = useState([]);

  // ================= RISK CALCULATION =================

  const getRisk = (invoice) => {
    const difference = Math.abs(
      invoice.invoiceQuantity - invoice.receivedQuantity
    );

    const mismatchPercentage =
      (difference / invoice.receivedQuantity) * 100;

    if (difference === 0) {
      return {
        level: "Low",
        score: 10,
        mismatch: 0,
      };
    }

    if (mismatchPercentage <= 5.5) {
      return {
        level: "Medium",
        score: 55,
        mismatch: mismatchPercentage,
      };
    }

    return {
      level: "High",
      score: 91,
      mismatch: mismatchPercentage,
    };
  };

  // ================= STATUS =================

  const getStatus = (invoice) => {
    if (
      invoice.invoiceQuantity === invoice.receivedQuantity
    ) {
      return "Matched";
    }

    return "Exception";
  };

  // ================= AUDIT LOG =================

  const addAuditLog = (invoiceId, action, result) => {
    const newLog = {
      id: Date.now(),
      invoiceId,
      user: "Finance / AP",
      action,
      result,
      time: new Date().toLocaleString(),
    };

    setAuditLogs((previousLogs) => [
      newLog,
      ...previousLogs,
    ]);
  };

  // ================= OPEN INVOICE =================

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setActionMessage("");
    setAiAnalysis("");
    setAiError("");
  };

  // ================= BACK =================

  const goBack = () => {
    setSelectedInvoice(null);
    setActionMessage("");
    setAiAnalysis("");
    setAiError("");
  };

  // ================= APPROVE =================

  const approveInvoice = () => {
    if (
      selectedInvoice.invoiceQuantity >
      selectedInvoice.receivedQuantity
    ) {
      setActionMessage(
        "❌ Approval blocked: Invoice quantity exceeds received quantity."
      );

      addAuditLog(
        selectedInvoice.id,
        "Approve",
        "Blocked - Quantity mismatch"
      );

      return;
    }

    setActionMessage(
      "✅ Invoice approved successfully."
    );

    addAuditLog(
      selectedInvoice.id,
      "Approve",
      "Approved"
    );
  };

  // ================= REJECT =================

  const rejectInvoice = () => {
    setActionMessage(
      "❌ Invoice rejected and sent back for correction."
    );

    addAuditLog(
      selectedInvoice.id,
      "Reject",
      "Rejected - Sent for correction"
    );
  };

  // ================= ESCALATE =================

  const escalateInvoice = () => {
    setActionMessage(
      "⚠ Invoice escalated to the finance review team."
    );

    addAuditLog(
      selectedInvoice.id,
      "Escalate",
      "Escalated for review"
    );
  };

  // ================= GEMINI AI =================

  const analyzeWithAI = async () => {
    if (!selectedInvoice) return;

    setAiLoading(true);
    setAiAnalysis("");
    setAiError("");

    const risk = getRisk(selectedInvoice);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze-invoice",
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
            receivedQuantity:
              selectedInvoice.receivedQuantity,
            invoiceQuantity:
              selectedInvoice.invoiceQuantity,
            mismatchPercentage:
              risk.mismatch.toFixed(1),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI analysis failed."
        );
      }

      setAiAnalysis(data.analysis);

      addAuditLog(
        selectedInvoice.id,
        "AI Analysis",
        `Risk identified: ${risk.level}`
      );

    } catch (error) {
      console.error("AI Error:", error);

      setAiError(
        "Unable to get AI analysis. Please check that the AI server is running."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ================= KPI CALCULATIONS =================

  const totalInvoices = invoices.length;

  const matchedInvoices = invoices.filter(
    (invoice) =>
      getStatus(invoice) === "Matched"
  ).length;

  const exceptionInvoices = invoices.filter(
    (invoice) =>
      getStatus(invoice) === "Exception"
  ).length;

  const highRiskInvoices = invoices.filter(
    (invoice) =>
      getRisk(invoice).level === "High"
  ).length;

  const mediumRiskInvoices = invoices.filter(
    (invoice) =>
      getRisk(invoice).level === "Medium"
  ).length;

  const lowRiskInvoices = invoices.filter(
    (invoice) =>
      getRisk(invoice).level === "Low"
  ).length;

  const exceptionRate =
    (exceptionInvoices / totalInvoices) * 100;

  const autoMatchRate =
    (matchedInvoices / totalInvoices) * 100;

  // ================= BUSINESS VALUE =================

  const blockedValue = invoices
    .filter(
      (invoice) =>
        getRisk(invoice).level !== "Low"
    )
    .reduce(
      (total, invoice) =>
        total + invoice.amount,
      0
    );

  // ================= FILTER + SEARCH =================

  const filteredInvoices = invoices
    .filter((invoice) => {

      if (activeFilter === "Matched") {
        return getStatus(invoice) === "Matched";
      }

      if (activeFilter === "Exceptions") {
        return getStatus(invoice) === "Exception";
      }

      if (activeFilter === "High Risk") {
        return getRisk(invoice).level === "High";
      }

      return true;
    })
    .filter((invoice) => {

      const search = searchTerm.toLowerCase();

      return (
        invoice.id.toLowerCase().includes(search) ||
        invoice.supplier.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {

      const priority = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      return (
        priority[getRisk(b).level] -
        priority[getRisk(a).level]
      );
    });

  // ================= CURRENT AUDIT LOGS =================

  const currentAuditLogs = auditLogs.filter(
    (log) =>
      selectedInvoice &&
      log.invoiceId === selectedInvoice.id
  );

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>

          <h1>
            Invoice Exception Cockpit
          </h1>

          <p>
            P2P Invoice Review & Exception Management
          </p>

        </div>

        <div className="user">
          Finance / AP
        </div>

      </header>

      <main className="container">

        {/* ================= KPI CARDS ================= */}

        <section className="kpi-grid">

          <div className="kpi-card">

            <span>
              Total Invoices
            </span>

            <strong>
              {totalInvoices}
            </strong>

          </div>

          <div className="kpi-card success">

            <span>
              Auto-Match Rate
            </span>

            <strong>
              {autoMatchRate.toFixed(0)}%
            </strong>

          </div>

          <div className="kpi-card warning">

            <span>
              Exception Rate
            </span>

            <strong>
              {exceptionRate.toFixed(0)}%
            </strong>

          </div>

          <div className="kpi-card danger">

            <span>
              High-Risk Invoices
            </span>

            <strong>
              {highRiskInvoices}
            </strong>

          </div>

        </section>

        {/* ================= BUSINESS IMPACT ================= */}

        <section className="impact-panel">

          <div>

            <span>
              Blocked Invoice Value
            </span>

            <strong>
              ₹{blockedValue.toLocaleString("en-IN")}
            </strong>

          </div>

          <div>

            <span>
              Invoices Requiring Review
            </span>

            <strong>
              {exceptionInvoices}
            </strong>

          </div>

          <div>

            <span>
              Processing Focus
            </span>

            <strong>
              Risk-Based
            </strong>

          </div>

        </section>

        {/* ================= EXCEPTION SUMMARY ================= */}

        <section className="exception-summary">

          <div className="summary-header">

            <div>

              <h2>
                Exception Summary
              </h2>

              <p>
                Current invoice risk distribution
              </p>

            </div>

            <div className="summary-total">

              <span>
                Review Value
              </span>

              <strong>
                ₹{blockedValue.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

          <div className="summary-grid">

            {/* HIGH */}

            <div className="summary-card high">

              <div className="summary-card-top">

                <span>
                  High Risk
                </span>

                <strong>
                  {highRiskInvoices}
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill high-fill"
                  style={{
                    width: `${
                      (highRiskInvoices /
                        totalInvoices) *
                      100
                    }%`,
                  }}
                />

              </div>

              <small>
                Immediate attention required
              </small>

            </div>

            {/* MEDIUM */}

            <div className="summary-card medium">

              <div className="summary-card-top">

                <span>
                  Medium Risk
                </span>

                <strong>
                  {mediumRiskInvoices}
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill medium-fill"
                  style={{
                    width: `${
                      (mediumRiskInvoices /
                        totalInvoices) *
                      100
                    }%`,
                  }}
                />

              </div>

              <small>
                Review recommended
              </small>

            </div>

            {/* LOW */}

            <div className="summary-card low">

              <div className="summary-card-top">

                <span>
                  Low Risk
                </span>

                <strong>
                  {lowRiskInvoices}
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill low-fill"
                  style={{
                    width: `${
                      (lowRiskInvoices /
                        totalInvoices) *
                      100
                    }%`,
                  }}
                />

              </div>

              <small>
                Normal processing
              </small>

            </div>

          </div>

        </section>

        {/* ================= PROJECTED BUSINESS IMPACT ================= */}

        <section className="before-after-panel">

          <div className="section-heading">

            <h2>
              Projected Business Impact
            </h2>

            <p>
              Illustrative target improvements from
              the proposed workflow.
            </p>

          </div>

          <div className="impact-table">

            <div className="impact-row impact-header">

              <span>
                Business KPI
              </span>

              <span>
                Before
              </span>

              <span>
                Target After
              </span>

              <span>
                Improvement
              </span>

            </div>

            <div className="impact-row">

              <span>
                Invoice Exception Rate
              </span>

              <strong>
                25%
              </strong>

              <strong>
                10%
              </strong>

              <span className="improvement">
                ↓ 60%
              </span>

            </div>

            <div className="impact-row">

              <span>
                Manual Review Time
              </span>

              <strong>
                3 days
              </strong>

              <strong>
                1 day
              </strong>

              <span className="improvement">
                ↓ 67%
              </span>

            </div>

            <div className="impact-row">

              <span>
                Blocked Invoice Value
              </span>

              <strong>
                ₹10L
              </strong>

              <strong>
                ₹4L
              </strong>

              <span className="improvement">
                ↓ 60%
              </span>

            </div>

          </div>

        </section>

        {/* ================= INVOICE LIST ================= */}

        {!selectedInvoice && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>
                  Invoice Exceptions
                </h2>

                <p>
                  Prioritized invoices requiring
                  Finance/AP attention.
                </p>

              </div>

            </div>

            {/* SEARCH + FILTER */}

            <div className="invoice-controls">

              <input
                type="text"
                placeholder="🔍 Search invoice or supplier..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="search-input"
              />

              <div className="filter-group">

                {[
                  "All",
                  "Matched",
                  "Exceptions",
                  "High Risk",
                ].map((filter) => (

                  <button
                    key={filter}
                    className={`filter-button ${
                      activeFilter === filter
                        ? "active-filter"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                  >
                    {filter}
                  </button>

                ))}

              </div>

            </div>

            <div className="result-count">

              Showing{" "}

              <strong>
                {filteredInvoices.length}
              </strong>{" "}

              of {totalInvoices} invoices

            </div>

            {/* TABLE */}

            <table>

              <thead>

                <tr>

                  <th>
                    Invoice
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Match Status
                  </th>

                  <th>
                    Risk
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => (

                    <tr
                      key={invoice.id}
                      onClick={() =>
                        openInvoice(invoice)
                      }
                      className="clickable-row"
                    >

                      <td>
                        {invoice.id}
                      </td>

                      <td>
                        {invoice.supplier}
                      </td>

                      <td>
                        ₹
                        {invoice.amount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>

                        <span
                          className={`badge ${
                            getStatus(invoice) ===
                            "Matched"
                              ? "matched"
                              : "review"
                          }`}
                        >
                          {getStatus(invoice)}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`risk-badge risk-${getRisk(
                            invoice
                          ).level.toLowerCase()}`}
                        >
                          {getRisk(invoice).level}
                        </span>

                      </td>

                    </tr>

                  )
                )}

                {filteredInvoices.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="no-results"
                    >
                      No invoices found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </section>

        )}

        {/* ================= INVOICE DETAILS ================= */}

        {selectedInvoice && (

          <section className="panel">

            <div className="detail-header">

              <div>

                <h2>
                  Invoice {selectedInvoice.id}
                </h2>

                <p>
                  Supplier:{" "}
                  {selectedInvoice.supplier}
                </p>

              </div>

              <button
                className="filter-button"
                onClick={goBack}
              >
                ← Back
              </button>

            </div>

            {/* THREE WAY MATCH */}

            <div className="match-grid">

              <div className="match-card">

                <h3>
                  Purchase Order
                </h3>

                <p>
                  Ordered Quantity
                </p>

                <strong>
                  {selectedInvoice.poQuantity} units
                </strong>

              </div>

              <div className="match-card">

                <h3>
                  Goods Receipt
                </h3>

                <p>
                  Received Quantity
                </p>

                <strong>
                  {selectedInvoice.receivedQuantity} units
                </strong>

              </div>

              <div className="match-card">

                <h3>
                  Supplier Invoice
                </h3>

                <p>
                  Invoice Quantity
                </p>

                <strong>
                  {selectedInvoice.invoiceQuantity} units
                </strong>

              </div>

            </div>

            {/* EXCEPTION ANALYSIS */}

            <div className="analysis-box">

              <h3>
                Exception Analysis
              </h3>

              <p>
                Difference between received and
                invoiced quantity:
              </p>

              <strong>

                {Math.abs(
                  selectedInvoice.invoiceQuantity -
                  selectedInvoice.receivedQuantity
                )}{" "}
                units

              </strong>

              <p>

                Mismatch Percentage:{" "}

                {getRisk(
                  selectedInvoice
                ).mismatch.toFixed(1)}
                %

              </p>

            </div>

            {/* RULE BASED RISK */}

            <div className="ai-box">

              <h3>
                Initial Risk Assessment
              </h3>

              <div className="risk-score">

                {getRisk(
                  selectedInvoice
                ).score}
                %

              </div>

              <p>

                {getRisk(selectedInvoice).level ===
                  "Low" &&
                  "Invoice matches the received quantity. Low risk."
                }

                {getRisk(selectedInvoice).level ===
                  "Medium" &&
                  `Small quantity mismatch detected: ${getRisk(
                    selectedInvoice
                  ).mismatch.toFixed(
                    1
                  )}%. Review recommended.`
                }

                {getRisk(selectedInvoice).level ===
                  "High" &&
                  `Significant quantity mismatch detected: ${getRisk(
                    selectedInvoice
                  ).mismatch.toFixed(
                    1
                  )}%. Do not approve automatically.`
                }

              </p>

            </div>

            {/* GEMINI AI */}

            <div className="ai-analysis-panel">

              <div className="ai-analysis-header">

                <div>

                  <h3>
                    ✨ Gemini AI Analysis
                  </h3>

                  <p>
                    AI-assisted exception analysis
                    and recommendation.
                  </p>

                </div>

                <button
                  className="ai-button"
                  onClick={analyzeWithAI}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? "Analyzing..."
                    : "✨ Analyze with AI"}
                </button>

              </div>

              {aiLoading && (

                <div className="ai-loading">
                  Gemini is analyzing the invoice...
                </div>

              )}

              {aiError && (

                <div className="ai-error">
                  {aiError}
                </div>

              )}

              {aiAnalysis && (
  <div className="ai-result">

    <div className="ai-result-header">
      <div>
        <h4>AI Recommendation</h4>
        <p>
          Gemini has analyzed the invoice exception
          and provided a decision-support recommendation.
        </p>
      </div>

      <span className="ai-confidence">
        AI Assisted
      </span>
    </div>

    <div className="ai-recommendation-content">
      <pre>{aiAnalysis}</pre>
    </div>

    <div className="ai-disclaimer">
      <strong>Human-in-the-loop:</strong>
      {" "}
      AI provides a recommendation. Final approval,
      rejection, or escalation remains with the Finance/AP user.
    </div>

  </div>
)}

            </div>

            {/* ACTIONS */}

            <div className="actions">

              <button
                className="approve-button"
                onClick={approveInvoice}
              >
                Approve
              </button>

              <button
                className="reject-button"
                onClick={rejectInvoice}
              >
                Reject
              </button>

              <button
                className="escalate-button"
                onClick={escalateInvoice}
              >
                Escalate
              </button>

            </div>

            {actionMessage && (

              <div className="action-message">
                {actionMessage}
              </div>

            )}

            {/* AUDIT TRAIL */}

            <div className="audit-panel">

              <div className="audit-header">

                <div>

                  <h3>
                    Audit Trail
                  </h3>

                  <p>
                    Activity history for this invoice.
                  </p>

                </div>

                <span className="audit-count">

                  {currentAuditLogs.length} events

                </span>

              </div>

              {currentAuditLogs.length === 0 ? (

                <div className="audit-empty">
                  No activity recorded yet.
                </div>

              ) : (

                <div className="audit-list">

                  {currentAuditLogs.map(
                    (log) => (

                      <div
                        className="audit-item"
                        key={log.id}
                      >

                        <div className="audit-icon">
                          ✓
                        </div>

                        <div className="audit-content">

                          <strong>
                            {log.action}
                          </strong>

                          <span>
                            {log.result}
                          </span>

                          <small>
                            {log.user} • {log.time}
                          </small>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;