import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Login
      const loginResponse = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = loginResponse.data.access_token;

      localStorage.setItem("token", token);

      // Get logged-in user
      const userResponse = await api.get("/api/auth/me");

      localStorage.setItem(
        "user",
        JSON.stringify(userResponse.data)
      );

      navigate("/dashboard");
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setError(
        err.response?.data?.detail ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={17} />
          Back to LeadFlow
        </Link>

        <div className="login-icon">
          <LockKeyhole size={25} />
        </div>

        <p className="eyebrow">SALES WORKSPACE</p>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to manage your leads and sales pipeline.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="primary-button login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo Admin</strong>
          <span>admin@leadflow.com</span>
          <span>Admin@123</span>
        </div>
      </div>
    </div>
  );
}

export default Login;