import { Link } from "react-router-dom";

function TaskB() {
  return (
    <div className="taskb-page">
      <header className="taskb-hero">
        <p className="eyebrow">DIGITAL HEROES · FULL STACK DEVELOPER</p>

        <h1>Inherit and Improve</h1>

        <p>
          A production-safe modernization strategy for a working legacy
          application — improving security, reliability and maintainability
          without a big-bang rewrite.
        </p>

        <div className="taskb-author">
          Prepared by <strong>Sofia Naushad</strong>
        </div>
      </header>

      <main className="taskb-content">
        <section>
          <span className="taskb-number">01</span>
          <h2>Technical Assessment</h2>

          <p>
            My first priority would be reducing production risk rather than
            immediately rewriting the application.
          </p>

          <div className="taskb-grid">
            <article>
              <strong>P0 · Secrets in repository</strong>
              <p>
                Rotate exposed credentials immediately and move secrets to
                environment variables or a secret manager.
              </p>
            </article>

            <article>
              <strong>P0 · Direct database access</strong>
              <p>
                Move sensitive operations behind authenticated backend APIs to
                restore authorization and data-integrity boundaries.
              </p>
            </article>

            <article>
              <strong>P1 · No automated tests</strong>
              <p>
                Add smoke, characterization and integration tests around
                customer-critical workflows before refactoring them.
              </p>
            </article>

            <article>
              <strong>P1 · Logic inside routes</strong>
              <p>
                Gradually extract business rules into services and persistence
                into a dedicated data-access layer.
              </p>
            </article>
          </div>

          <blockquote>
            Protect customers first, create a safety net second, then improve
            the architecture incrementally.
          </blockquote>
        </section>

        <section>
          <span className="taskb-number">02</span>
          <h2>Migration Without a Rewrite</h2>

          <div className="migration-timeline">
            <article>
              <h3>Week 1</h3>
              <strong>Stabilize & Secure</strong>
              <p>
                Rotate secrets, add monitoring and smoke tests, inventory
                direct database access and move the highest-risk operation
                behind an API.
              </p>
            </article>

            <article>
              <h3>Month 1</h3>
              <strong>Create Boundaries</strong>
              <p>
                Migrate one domain at a time toward thin routes, service-layer
                business logic and isolated persistence. Add CI quality gates.
              </p>
            </article>

            <article>
              <h3>Quarter 1</h3>
              <strong>Make Reliability Default</strong>
              <p>
                Complete API boundaries, expand risk-based tests, introduce
                database migrations, security scanning, monitoring and
                documented rollback procedures.
              </p>
            </article>
          </div>
        </section>

        <section>
          <span className="taskb-number">03</span>
          <h2>Refactoring Strategy</h2>

          <p>
            Instead of rewriting every route, I would refactor high-risk and
            frequently changed workflows behind their existing interfaces.
          </p>

          <div className="architecture-flow">
            <span>React Client</span>
            <b>→</b>
            <span>API Route</span>
            <b>→</b>
            <span>Service</span>
            <b>→</b>
            <span>Repository</span>
            <b>→</b>
            <span>Database</span>
          </div>

          <p>
            Routes handle HTTP concerns, services own business rules and the
            repository/data layer owns persistence. This makes critical rules
            independently testable while keeping the external API stable.
          </p>
        </section>

        <section>
          <span className="taskb-number">04</span>
          <h2>Engineering Standards</h2>

          <div className="taskb-grid">
            <article>
              <strong>Pull Requests</strong>
              <p>Small changes, protected main branch and peer review.</p>
            </article>

            <article>
              <strong>Automated Quality</strong>
              <p>Linting, tests and security checks enforced through CI.</p>
            </article>

            <article>
              <strong>Security</strong>
              <p>
                No repository secrets and no sensitive information in logs.
              </p>
            </article>

            <article>
              <strong>Production Safety</strong>
              <p>
                Monitoring and a rollback path for every risky deployment.
              </p>
            </article>
          </div>
        </section>

        <section>
          <span className="taskb-number">05</span>
          <h2>Getting the Team to Adopt It</h2>

          <p>
            I would not introduce twenty rules on day one. Security and
            production safety come first, followed by automated linting,
            critical-flow testing and finally architectural standards for new
            or touched code.
          </p>

          <blockquote>
            The goal is not more process. The goal is safer changes with less
            recovery work.
          </blockquote>
        </section>

        <section className="taskb-ai">
          <h2>AI Tool Usage</h2>
          <p>
            AI tools were used as a development assistant for structuring the
            response, reviewing implementation approaches, debugging and
            improving documentation clarity. I reviewed and adapted the
            suggestions and retained responsibility for the final technical
            decisions, implementation and verification.
          </p>
        </section>

        <Link className="taskb-back" to="/">
          ← View LeadFlow Project
        </Link>
      </main>

      <footer className="taskb-footer">
        <p>
          Built for{" "}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noreferrer"
          >
            Digital Heroes Training Task
          </a>
        </p>

        <span>Sofia Naushad · Full Stack Developer</span>
      </footer>
    </div>
  );
}

export default TaskB;