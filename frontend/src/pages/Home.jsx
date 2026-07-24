import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Users,
  Activity,
} from "lucide-react";
import api from "../services/api";

function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ========================================================
  // FORM CHANGE
  // ========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (success) {
      setSuccess(false);
    }

    if (error) {
      setError("");
    }
  };

  // ========================================================
  // SUBMIT PUBLIC LEAD
  // ========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      message: form.message.trim() || null,
    };

    try {
      console.log("Submitting lead:", payload);

      await api.post("/api/leads", payload);

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    } catch (err) {
      console.error(
        "Lead submission error:",
        err.response?.data || err
      );

      const detail = err.response?.data?.detail;

      // FastAPI/Pydantic validation errors
      if (Array.isArray(detail)) {
        const validationMessage = detail
          .map((item) => {
            const field =
              item.loc?.[item.loc.length - 1] || "field";

            return `${field}: ${item.msg}`;
          })
          .join(", ");

        setError(validationMessage);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Unable to submit your enquiry. Please check the form and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      {/* ================= NAVBAR ================= */}

      <header className="public-nav">
        <Link to="/" className="public-brand">
          <div className="brand-icon">L</div>

          <div>
            <strong>LeadFlow</strong>
            <span>Sales Workspace</span>
          </div>
        </Link>

        <Link to="/login" className="nav-login">
          Team login
          <ArrowRight size={16} />
        </Link>
      </header>

      <main>
        {/* ================= HERO ================= */}

        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-label">
              SIMPLE LEAD MANAGEMENT
            </p>

            <h1>
              Turn every enquiry into an
              <span> opportunity.</span>
            </h1>

            <p className="hero-copy">
              LeadFlow gives sales teams one place to capture,
              assign and follow every prospect from first contact
              to close.
            </p>

            <a href="#contact" className="hero-button">
              Talk to our team
              <ArrowRight size={18} />
            </a>

            <div className="hero-points">
              <span>
                <CheckCircle2 size={17} />
                Simple pipeline
              </span>

              <span>
                <CheckCircle2 size={17} />
                Team assignment
              </span>

              <span>
                <CheckCircle2 size={17} />
                Complete activity history
              </span>
            </div>
          </div>

          {/* HERO DASHBOARD PREVIEW */}

          <div className="hero-preview">
            <div className="preview-top">
              <span>Pipeline overview</span>
              <span className="preview-live">Live</span>
            </div>

            <div className="preview-stats">
              <div>
                <Users size={20} />
                <span>New leads</span>
                <strong>24</strong>
              </div>

              <div>
                <LayoutDashboard size={20} />
                <span>Qualified</span>
                <strong>11</strong>
              </div>

              <div>
                <Activity size={20} />
                <span>Won</span>
                <strong>7</strong>
              </div>
            </div>

            <div className="preview-leads">
              <div>
                <span className="preview-avatar">
                  AS
                </span>

                <p>
                  <strong>Aarav Sharma</strong>
                  <small>Nova Technologies</small>
                </p>

                <span className="status-badge status-qualified">
                  Qualified
                </span>
              </div>

              <div>
                <span className="preview-avatar">
                  RM
                </span>

                <p>
                  <strong>Riya Mehta</strong>
                  <small>Pixel Works</small>
                </p>

                <span className="status-badge status-contacted">
                  Contacted
                </span>
              </div>

              <div>
                <span className="preview-avatar">
                  AK
                </span>

                <p>
                  <strong>Arjun Kapoor</strong>
                  <small>Orbit Labs</small>
                </p>

                <span className="status-badge status-new">
                  New
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}

        <section className="public-features">
          <div>
            <LayoutDashboard size={22} />

            <h3>Clear pipeline</h3>

            <p>
              See where every opportunity stands without digging
              through spreadsheets.
            </p>
          </div>

          <div>
            <Users size={22} />

            <h3>Built for teams</h3>

            <p>
              Assign prospects to the right sales member and keep
              ownership clear.
            </p>
          </div>

          <div>
            <Activity size={22} />

            <h3>Full context</h3>

            <p>
              Notes, status changes and activity stay attached to
              each lead.
            </p>
          </div>
        </section>

        {/* ================= LEAD CAPTURE ================= */}

        <section
          id="contact"
          className="capture-section"
        >
          <div className="capture-copy">
            <p className="hero-label">
              START A CONVERSATION
            </p>

            <h2>
              Tell us what you're working on.
            </h2>

            <p>
              Share a few details and our team will get back to
              you. Your enquiry goes directly into our sales
              workspace so nothing gets lost.
            </p>

            <div className="capture-benefit">
              <CheckCircle2 size={19} />

              <div>
                <strong>Fast follow-up</strong>

                <span>
                  Your enquiry is immediately available to our
                  sales team.
                </span>
              </div>
            </div>

            <div className="capture-benefit">
              <CheckCircle2 size={19} />

              <div>
                <strong>Clear ownership</strong>

                <span>
                  Every enquiry can be assigned to a dedicated
                  team member.
                </span>
              </div>
            </div>
          </div>

          {/* ================= FORM CARD ================= */}

          <div className="capture-card">
            <h3>Contact our team</h3>

            <p>
              Fill in the form and we'll take it from there.
            </p>

            {/* SUCCESS */}

            {success && (
              <div className="success-message">
                <CheckCircle2 size={19} />

                <div>
                  <strong>
                    Enquiry received
                  </strong>

                  <span>
                    Thanks! Our team will get back to you.
                  </span>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="capture-row">
                {/* NAME */}

                <div className="form-group">
                  <label htmlFor="name">
                    Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* COMPANY */}

                <div className="form-group">
                  <label htmlFor="company">
                    Company
                  </label>

                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="capture-row">
                {/* EMAIL */}

                <div className="form-group">
                  <label htmlFor="email">
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    disabled={loading}
                  />
                </div>

                {/* PHONE */}

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* MESSAGE */}

              <div className="form-group">
                <label htmlFor="message">
                  How can we help?
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us a little about what you need..."
                  disabled={loading}
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="primary-button capture-submit"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : "Send enquiry"}

                {!loading && (
                  <ArrowRight size={17} />
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="public-footer">
        <div>
          <strong>LeadFlow</strong>

          <span>
            Simple lead management for growing teams.
          </span>
        </div>

        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noreferrer"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
}

export default Home;