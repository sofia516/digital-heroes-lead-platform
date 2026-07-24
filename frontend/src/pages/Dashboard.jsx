import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  PhoneCall,
  BadgeCheck,
  Trophy,
  CircleX,
} from "lucide-react";
import api from "../services/api";

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get(
          "/api/leads?page=1&page_size=100"
        );

        setLeads(response.data.items);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const countStatus = (status) =>
    leads.filter((lead) => lead.status === status).length;

  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: Users,
    },
    {
      label: "New",
      value: countStatus("new"),
      icon: UserPlus,
    },
    {
      label: "Contacted",
      value: countStatus("contacted"),
      icon: PhoneCall,
    },
    {
      label: "Qualified",
      value: countStatus("qualified"),
      icon: BadgeCheck,
    },
    {
      label: "Won",
      value: countStatus("won"),
      icon: Trophy,
    },
    {
      label: "Lost",
      value: countStatus("lost"),
      icon: CircleX,
    },
  ];

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>

          <h1>
            Welcome, {user.name || "Team Member"}
          </h1>

          <p className="page-description">
            Here&apos;s an overview of your current sales pipeline.
          </p>
        </div>

        <span className="role-badge">
          {user.role || "member"}
        </span>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon">
                <Icon size={20} />
              </div>

              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent leads</h2>
            <p>
              Latest opportunities in your pipeline.
            </p>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="empty-state">
            No leads available yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.name}</strong>
                      <span>{lead.email}</span>
                    </td>

                    <td>{lead.company || "—"}</td>

                    <td>
                      <span
                        className={`status-badge status-${lead.status}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;