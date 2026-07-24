import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUSES = [
  "all",
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
];

function Leads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  // ========================================================
  // LOAD LEADS
  // ========================================================

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          page_size: pageSize,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (search) {
          params.search = search;
        }

        const response = await api.get(
          "/api/leads",
          { params }
        );

        setLeads(response.data.items);
        setTotal(response.data.total);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load leads."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page, statusFilter, search]);

  // ========================================================
  // SEARCH
  // ========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  // ========================================================
  // STATUS FILTER
  // ========================================================

  const changeStatus = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            PIPELINE
          </p>

          <h1>Leads</h1>

          <p className="page-description">
            Search, filter and manage opportunities
            across your sales pipeline.
          </p>
        </div>

        <div className="lead-count">
          <strong>{total}</strong>
          <span>Total leads</span>
        </div>
      </div>

      {/* SEARCH + FILTER */}

      <div className="lead-toolbar">
        <form
          className="search-box"
          onSubmit={handleSearch}
        >
          <Search size={18} />

          <input
            type="search"
            placeholder="Search name, email or company..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          className="status-filter"
          value={statusFilter}
          onChange={changeStatus}
        >
          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status === "all"
                ? "All statuses"
                : status.charAt(0).toUpperCase() +
                  status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* LEADS TABLE */}

      <div className="leads-panel">
        {loading ? (
          <div className="empty-state">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <h3>No leads found</h3>

            <p>
              Try changing your search or
              status filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(
                        `/leads/${lead.id}`
                      )
                    }
                  >
                    {/* LEAD */}

                    <td>
                      <strong>
                        {lead.name}
                      </strong>

                      <span>
                        {lead.email}
                      </span>
                    </td>

                    {/* COMPANY */}

                    <td>
                      {lead.company || "—"}
                    </td>

                    {/* PHONE */}

                    <td>
                      {lead.phone || "—"}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={
                          `status-badge status-${lead.status}`
                        }
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* ASSIGNED USER */}

                    <td>
                      {lead.assigned_to_id
                        ? `User #${lead.assigned_to_id}`
                        : "Unassigned"}
                    </td>

                    {/* CREATED */}

                    <td>
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString()}
                    </td>

                    {/* OPEN */}

                    <td>
                      <ExternalLink
                        size={16}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}

        <div className="pagination">
          <span>
            Page {page} of {totalPages}
          </span>

          <div>
            <button
              disabled={
                page <= 1 || loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              disabled={
                page >= totalPages ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leads;