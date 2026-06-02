import { useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/api/boardroom/analyze";

const BOT_META = {
  "Financial Manager": {
    shortName: "Finance",
    accent: "finance",
    metric: "Runway",
    focus: "Liquidity, burn control, vendor cost, revenue exposure",
  },
  "Legal Expert": {
    shortName: "Legal",
    accent: "legal",
    metric: "Risk",
    focus: "Contracts, notices, compliance, force majeure",
  },
  "Project Manager": {
    shortName: "PMO",
    accent: "pmo",
    metric: "Execution",
    focus: "Owners, timeline, cadence, measurable recovery",
  },
};

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

function MarkdownView({ content }) {
  const elements = [];
  const lines = content.split("\n");
  let listBuffer = [];
  let orderedListBuffer = [];

  const flushLists = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {listBuffer.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }

    if (orderedListBuffer.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`}>
          {orderedListBuffer.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      orderedListBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushLists();
      return;
    }

    if (trimmed.startsWith("- ")) {
      orderedListBuffer = [];
      listBuffer.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      listBuffer = [];
      orderedListBuffer.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    flushLists();

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={index}>{renderInline(trimmed.slice(4))}</h3>);
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={index}>{renderInline(trimmed.slice(3))}</h2>);
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={index}>{renderInline(trimmed.slice(2))}</h1>);
      return;
    }

    elements.push(<p key={index}>{renderInline(trimmed)}</p>);
  });

  flushLists();

  return <div className="markdown-block">{elements}</div>;
}

function BotPanel({ name, response, selected, onSelect }) {
  const meta = BOT_META[name] || {
    shortName: name,
    accent: "default",
    metric: "Analysis",
    focus: "Specialist review",
  };

  return (
    <button
      className={`bot-window ${selected ? "is-selected" : ""} ${meta.accent}`}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="bot-window-topline">
        <span className="bot-avatar">{meta.shortName}</span>
        <span className="bot-status">Complete</span>
      </span>
      <span className="bot-name">{name}</span>
      <span className="bot-focus">{meta.focus}</span>
      <span className="bot-snippet">{response.replaceAll("#", "").slice(0, 142)}...</span>
    </button>
  );
}

function App() {
  const [businessCategory, setBusinessCategory] = useState("SaaS Startup");
  const [crisisDescription, setCrisisDescription] = useState(
    "A major enterprise customer representing 35% of monthly recurring revenue has announced they may cancel within 30 days, while vendor costs and payroll obligations remain unchanged."
  );
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeBot, setActiveBot] = useState("Financial Manager");

  const botEntries = useMemo(() => {
    if (!session?.bot_consultations) {
      return [];
    }

    return Object.entries(session.bot_consultations);
  }, [session]);

  const activeBotContent = useMemo(() => {
    if (!session?.bot_consultations) {
      return "";
    }

    return session.bot_consultations[activeBot] || botEntries[0]?.[1] || "";
  }, [activeBot, botEntries, session]);

  const charCount = crisisDescription.trim().length;
  const statusLabel = loading ? "Analyzing" : session ? "Report ready" : "Ready";

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSession(null);
    setActiveBot("Financial Manager");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_category: businessCategory,
          crisis_description: crisisDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "The boardroom analysis request failed.";
        throw new Error(detail);
      }

      setSession(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to connect to the AI backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="navigation-rail" aria-label="Workspace">
          <div className="brand-mark">BG</div>
          <div className="rail-items">
            <div className="rail-item active" title="Boardroom">
              B
            </div>
            <div className="rail-item" title="Sessions">
              S
            </div>
            <div className="rail-item" title="Reports">
              R
            </div>
          </div>
        </aside>

        <section className="dashboard">
          <header className="topbar">
            <div>
              <p className="eyebrow">AI Boardroom</p>
              <h1>Business Guide AI Platform</h1>
            </div>
            <div className={`system-state ${loading ? "is-live" : ""}`}>
              <span className="state-dot" />
              {statusLabel}
            </div>
          </header>

          <section className="summary-strip" aria-label="Boardroom summary">
            <div className="summary-card">
              <span className="summary-label">Specialists</span>
              <strong>3</strong>
              <span>Finance, Legal, PMO</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Sequence</span>
              <strong>F-L-P</strong>
              <span>Context handoff active</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Session</span>
              <strong>{session ? session.session_id.slice(0, 8) : "Pending"}</strong>
              <span>{session ? new Date(session.created_at).toLocaleString() : "Not started"}</span>
            </div>
          </section>

          <section className="layout-grid">
            <form className="intake-panel" onSubmit={handleSubmit}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Crisis Intake</p>
                  <h2>Boardroom Brief</h2>
                </div>
                <span className="count-chip">{charCount}/8000</span>
              </div>

              <div className="field-group">
                <label htmlFor="business-category">Business Category</label>
                <input
                  id="business-category"
                  value={businessCategory}
                  onChange={(event) => setBusinessCategory(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="crisis-description">Crisis Description</label>
                <textarea
                  id="crisis-description"
                  value={crisisDescription}
                  onChange={(event) => setCrisisDescription(event.target.value)}
                  minLength={20}
                  maxLength={8000}
                  required
                />
              </div>

              <button className="primary-button" type="submit" disabled={loading}>
                <span className="button-icon" aria-hidden="true" />
                {loading ? "Running Boardroom" : "Generate Recovery Plan"}
              </button>

              {errorMessage && (
                <div className="error-box" role="alert">
                  <strong>Request failed</strong>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="timeline-card">
                <div className="timeline-step done">
                  <span />
                  <p>Financial review</p>
                </div>
                <div className={`timeline-step ${loading || session ? "done" : ""}`}>
                  <span />
                  <p>Legal review</p>
                </div>
                <div className={`timeline-step ${session ? "done" : ""}`}>
                  <span />
                  <p>Master plan</p>
                </div>
              </div>
            </form>

            <section className="output-panel">
              {!session && !loading && (
                <div className="empty-state">
                  <div className="signal-card">
                    <div className="signal-header">
                      <span>Boardroom Pipeline</span>
                      <strong>Idle</strong>
                    </div>
                    <div className="signal-bars">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <h2>No active recovery report</h2>
                  <p>
                    Create a brief on the left to open a specialist review and master strategy workspace.
                  </p>
                </div>
              )}

              {loading && (
                <div className="loading-state" aria-live="polite">
                  <div className="loader-ring" />
                  <h2>Boardroom in session</h2>
                  <p>Specialist agents are building the recovery report.</p>
                  <div className="skeleton-grid">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              {session && (
                <>
                  <div className="output-header">
                    <div>
                      <p className="eyebrow">Recovery Workspace</p>
                      <h2>{session.business_category}</h2>
                    </div>
                    <span className="report-chip">Saved to Firestore</span>
                  </div>

                  <div className="bot-grid">
                    {botEntries.map(([botName, response]) => (
                      <BotPanel
                        key={botName}
                        name={botName}
                        response={response}
                        selected={activeBot === botName}
                        onSelect={() => setActiveBot(botName)}
                      />
                    ))}
                  </div>

                  <section className="analysis-layout">
                    <article className="specialist-panel">
                      <div className="section-title">
                        <span>Specialist Window</span>
                        <strong>{activeBot}</strong>
                      </div>
                      <MarkdownView content={activeBotContent} />
                    </article>

                    <article className="master-plan">
                      <div className="section-title dark">
                        <span>Master Recovery Strategy</span>
                        <strong>Integrated Report</strong>
                      </div>
                      <MarkdownView content={session.final_recovery_plan} />
                    </article>
                  </section>
                </>
              )}
            </section>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
