import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend
} from "recharts";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const STORAGE_KEY = "healthAndFitness";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const emptyForm = () => ({ date: today(), calorieIntake: "", calorieBurned: "", description: "" });

function readSavedData() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function displayDate(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

export default function App() {
  const [records, setRecords] = useState(readSavedData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const weeklyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const sameDay = records.filter((r) => r.date === key);
      days.push({
        date: key,
        label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        calorieIntake: sameDay.reduce((sum, r) => sum + Number(r.calorieIntake || 0), 0),
        calorieBurned: sameDay.reduce((sum, r) => sum + Number(r.calorieBurned || 0), 0)
      });
    }
    return days;
  }, [records]);

  const totals = useMemo(() => records.reduce((sum, r) => ({
    intake: sum.intake + Number(r.calorieIntake || 0),
    burned: sum.burned + Number(r.calorieBurned || 0)
  }), { intake: 0, burned: 0 }), [records]);

  const pieData = [
    { name: "Intake", value: totals.intake || 1, actual: totals.intake, color: "#a100ff" },
    { name: "Burned", value: totals.burned || 1, actual: totals.burned, color: "#ff9800" }
  ];

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  }
  function openEdit(record) {
    setEditingId(record.id);
    setForm({
      date: record.date,
      calorieIntake: String(record.calorieIntake),
      calorieBurned: String(record.calorieBurned),
      description: record.description || ""
    });
    setError("");
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setError("");
  }
  function updateField(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    if (!form.date || form.calorieIntake === "" || form.calorieBurned === "" || !form.description.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (Number(form.calorieIntake) < 0 || Number(form.calorieBurned) < 0) {
      setError("Calories cannot be negative.");
      return;
    }
    const entry = {
      id: editingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: form.date,
      calorieIntake: Number(form.calorieIntake),
      calorieBurned: Number(form.calorieBurned),
      description: form.description.trim()
    };
    setRecords((old) => editingId
      ? old.map((item) => item.id === editingId ? entry : item)
      : [...old, entry]
    );
    closeModal();
  }
  function deleteRecord(id) {
    if (window.confirm("Delete this health record?")) {
      setRecords((old) => old.filter((record) => record.id !== id));
    }
  }

  return (
    <main className="app-shell">
      <h1>Health And Fitness Tracker</h1>

      <section className="dashboard">
        <div className="add-panel">
          <div className="add-panel-title">Update Today's Data</div>
          <button className="add-button" onClick={openAdd}>+ Add data</button>
        </div>

        {records.length > 0 ? (
          <div className="weekly-panel">
            <h2>Weekly Health Trends:</h2>
            <div className="bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 12, left: 0, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#858585" />
                  <XAxis dataKey="label" tick={{ fill: "#202020", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#202020", fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="calorieIntake" name="calorieIntake" fill="#8981d8" />
                  <Bar dataKey="calorieBurned" name="calorieBurned" fill="#80c99d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="no-data">No data available</div>
        )}
      </section>

      <section className="lower-grid">
        <div className="recent-section">
          <h2>Recent Health Statistics</h2>
          {sortedRecords.length === 0 ? (
            <p className="empty-message">No Progress to show!</p>
          ) : (
            <div className="record-list">
              {sortedRecords.map((record) => (
                <article className="record-card" key={record.id}>
                  <div className="record-copy">
                    <p className="record-description">{record.description}</p>
                    <p className="record-calories">
                      Calories Intake = {record.calorieIntake} &nbsp; Calories Burned = {record.calorieBurned}
                    </p>
                  </div>
                  <time className="record-date">{displayDate(record.date)}</time>
                  <div className="record-actions">
                    <button className="icon-button delete-button" aria-label="Delete data" title="Delete" onClick={() => deleteRecord(record.id)}><FiTrash2 /></button>
                    <button className="icon-button edit-button" aria-label="Edit data" title="Edit" onClick={() => openEdit(record)}><FiEdit2 /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="overall-section">
          <h2>Overall Data:</h2>
          <div className="pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="76%" labelLine={false} label={({ percent }) => `${Math.round(percent * 100)}%`}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [name === "Intake" ? totals.intake : totals.burned, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <button className="modal-close" aria-label="Close form" onClick={closeModal}><FiX /></button>
            <h2 id="form-title">{editingId ? "Let's see what you want to change!" : "How Much Net Calories did you take Today?"}</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="date">Date:</label>
              <input id="date" name="date" type="date" value={form.date} onChange={updateField} required />

              <label htmlFor="calorieIntake">Calorie Intake:</label>
              <input id="calorieIntake" name="calorieIntake" type="number" min="0" placeholder="Enter Today's Calorie Intake" value={form.calorieIntake} onChange={updateField} required />

              <label htmlFor="calorieBurned">Calorie Burned:</label>
              <input id="calorieBurned" name="calorieBurned" type="number" min="0" placeholder="Enter Today's Calorie Burned" value={form.calorieBurned} onChange={updateField} required />

              <label htmlFor="description">Short Description:</label>
              <input id="description" name="description" type="text" placeholder="Enter a short description" value={form.description} onChange={updateField} required />

              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="submit-button" type="submit">Submit</button>
              <button className="cancel-button" type="button" onClick={closeModal}>Cancel</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}