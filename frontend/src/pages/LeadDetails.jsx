import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock, Mail, Phone, Building2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [error, setError] = useState("");

  const loadLeadData = useCallback(async () => {
    try {
      setError("");

      const [leadResponse, notesResponse, activityResponse] =
        await Promise.all([
          api.get(`/api/leads/${id}`),
          api.get(`/api/leads/${id}/notes`),
          api.get(`/api/leads/${id}/activities`),
        ]);

      setLead(leadResponse.data);
      setNotes(notesResponse.data);
      setActivities(activityResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load lead details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

  const updateStatus = async (event) => {
    const newStatus = event.target.value;

    setSavingStatus(true);
    setError("");

    try {
      const response = await api.patch(`/api/leads/${id}`, {
        status: newStatus,
      });

      setLead(response.data);

      const activityResponse = await api.get(
        `/api/leads/${id}/activities`
      );

      setActivities(activityResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update lead status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async (event) => {
    event.preventDefault();

    if (!noteText.trim()) {
      return;
    }

    setAddingNote(true);
    setError("");

    try {
      await api.post(`/api/leads/${id}/notes`, {
        content: noteText.trim(),
      });

      setNoteText("");

      const [notesResponse, activityResponse] =
        await Promise.all([
          api.get(`/api/leads/${id}/notes`),
          api.get(`/api/leads/${id}/activities`),
        ]);

      setNotes(notesResponse.data);
      setActivities(activityResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to add note."
      );
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return <p>Loading lead...</p>;
  }

  if (!lead) {
    return (
      <div>
        <button
          className="text-button"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft size={17} />
          Back to leads
        </button>

        <div className="error-message">
          {error || "Lead not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        className="text-button"
        onClick={() => navigate("/leads")}
      >
        <ArrowLeft size={17} />
        Back to leads
      </button>

      <div className="lead-detail-header">
        <div>
          <p className="eyebrow">LEAD #{lead.id}</p>
          <h1>{lead.name}</h1>

          <div className="lead-meta">
            <span>
              <Mail size={15} />
              {lead.email}
            </span>

            {lead.phone && (
              <span>
                <Phone size={15} />
                {lead.phone}
              </span>
            )}

            {lead.company && (
              <span>
                <Building2 size={15} />
                {lead.company}
              </span>
            )}
          </div>
        </div>

        <span className={`status-badge status-${lead.status}`}>
          {lead.status}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="lead-detail-grid">
        <div className="lead-detail-main">
          <section className="detail-card">
            <div className="detail-card-header">
              <div>
                <h2>Lead overview</h2>
                <p>Contact information and current pipeline state.</p>
              </div>
            </div>

            <div className="detail-fields">
              <div>
                <span>Email</span>
                <strong>{lead.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{lead.phone || "Not provided"}</strong>
              </div>

              <div>
                <span>Company</span>
                <strong>{lead.company || "Not provided"}</strong>
              </div>

              <div>
                <span>Assigned to</span>
                <strong>
                  {lead.assigned_to_id
                    ? `User #${lead.assigned_to_id}`
                    : "Unassigned"}
                </strong>
              </div>
            </div>

            {lead.message && (
              <div className="lead-message">
                <span>Initial enquiry</span>
                <p>{lead.message}</p>
              </div>
            )}

            <div className="status-control">
              <label htmlFor="lead-status">Pipeline status</label>

              <select
                id="lead-status"
                value={lead.status}
                onChange={updateStatus}
                disabled={savingStatus}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1)}
                  </option>
                ))}
              </select>

              {savingStatus && <small>Saving...</small>}
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-header">
              <div>
                <h2>Notes</h2>
                <p>
                  Keep context from calls, emails and follow-ups.
                </p>
              </div>
            </div>

            <form className="note-form" onSubmit={addNote}>
              <textarea
                rows="4"
                placeholder="Add a note about this lead..."
                value={noteText}
                onChange={(event) =>
                  setNoteText(event.target.value)
                }
              />

              <button
                className="primary-button"
                type="submit"
                disabled={addingNote || !noteText.trim()}
              >
                {addingNote ? "Adding..." : "Add note"}
              </button>
            </form>

            <div className="notes-list">
              {notes.length === 0 ? (
                <p className="muted-text">
                  No notes have been added yet.
                </p>
              ) : (
                notes.map((note) => (
                  <div className="note-item" key={note.id}>
                    <div>
                      <strong>User #{note.author_id}</strong>

                      <span>
                        {new Date(
                          note.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p>{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="activity-card">
          <div className="detail-card-header">
            <div>
              <h2>Activity</h2>
              <p>Audit trail for this lead.</p>
            </div>
          </div>

          <div className="activity-list">
            {activities.length === 0 ? (
              <p className="muted-text">
                No activity recorded.
              </p>
            ) : (
              activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-icon">
                    <Clock size={14} />
                  </div>

                  <div>
                    <strong>
                      {activity.action
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                        )}
                    </strong>

                    {activity.details && (
                      <p>{activity.details}</p>
                    )}

                    <span>
                      {new Date(
                        activity.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {user.role === "admin" && (
        <p className="admin-hint">
          Admin account — lead assignment controls will be enabled next.
        </p>
      )}
    </div>
  );
}

export default LeadDetails;