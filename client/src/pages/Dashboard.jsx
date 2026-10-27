import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import api, { errorMessage } from "../api";

const CATEGORIES = ["Electrical", "Network", "Plumbing", "Lab Equipment", "Other"];
const STATUSES = ["Open", "In Progress", "Resolved"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user.role === "admin";
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "Electrical", location: "" });

  async function load() {
    try {
      const { data } = await api.get("/issues", { params: filter ? { status: filter } : {} });
      setIssues(data.issues);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function createIssue(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/issues", form);
      setForm({ title: "", description: "", category: "Electrical", location: "" });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function changeStatus(id, status) {
    setError("");
    try {
      await api.patch(`/issues/${id}`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="page">
      <header>
        <h1>CampusFix</h1>
        <span>{user.name} ({user.role})</span>
        <button onClick={logout}>Log out</button>
      </header>

      {error && <p className="error">{error}</p>}

      {!isAdmin && (
        <form className="card wide" onSubmit={createIssue}>
          <h2>Report an issue</h2>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <button type="submit">Submit issue</button>
        </form>
      )}

      <div className="card wide">
        <h2>{isAdmin ? "All issues" : "My issues"}</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Location</th>
              {isAdmin && <th>Reported by</th>}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i._id}>
                <td>{i.title}</td>
                <td>{i.category}</td>
                <td>{i.location}</td>
                {isAdmin && <td>{i.createdBy?.name}</td>}
                <td>
                  {isAdmin ? (
                    <select value={i.status} onChange={(e) => changeStatus(i._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    i.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {issues.length === 0 && <p>No issues found.</p>}
      </div>
    </div>
  );
}
