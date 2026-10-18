
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./App.css";

const STORAGE_KEY = "healthAndFitness";
const PIE_COLORS = ["#4f46e5", "#16a34a"];

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readHealthData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLastSevenDays(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);

  return data.filter((item) => {
    if (!item.date) return false;

    const date = new Date(`${item.date}T00:00:00`);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= startDate &&
      date <= today
    );
  });
}

function App() {
  const [healthData, setHealthData] = useState(readHealthData);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    date: getToday(),
    caloriesIntake: "",
    caloriesBurned: "",
    description: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(healthData));
  }, [healthData]);

  const weeklyData = useMemo(() => {
    const recent = getLastSevenDays(healthData);
    const grouped = new Map();

    recent.forEach((item) => {
      if (!grouped.has(item.date)) {
        grouped.set(item.date, {
          date: item.date,
          caloriesIntake: 0,
          caloriesBurned: 0,
        });
      }

      const entry = grouped.get(item.date);
      entry.caloriesIntake += Number(item.caloriesIntake) || 0;
      entry.caloriesBurned += Number(item.caloriesBurned) || 0;
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [healthData]);

  const overallData = useMemo(
    () => [
      {
        name: "Calories Intake",
        value: healthData.reduce(
          (sum, item) => sum + (Number(item.caloriesIntake) || 0),
          0
        ),
      },
      {
        name: "Calories Burned",
        value: healthData.reduce(
          (sum, item) => sum + (Number(item.caloriesBurned) || 0),
          0
        ),
      },
    ],
    [healthData]
  );

  const sortedHealthData = useMemo(
    () =>
      [...healthData].sort((a, b) => {
        const dateDifference = (b.date || "").localeCompare(a.date || "");
        return dateDifference || Number(b.id) - Number(a.id);
      }),
    [healthData]
  );

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openForm() {
    if (!showForm) {
      setFormData({
        date: getToday(),
        caloriesIntake: "",
        caloriesBurned: "",
        description: "",
      });
      setEditingId(null);
    }

    setShowForm((previous) => !previous);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: getToday(),
      caloriesIntake: "",
      caloriesBurned: "",
      description: "",
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !formData.date ||
      formData.caloriesIntake === "" ||
      formData.caloriesBurned === ""
    ) {
      return;
    }

    const entry = {
      id: editingId ?? Date.now(),
      date: formData.date,
      caloriesIntake: Number(formData.caloriesIntake),
      caloriesBurned: Number(formData.caloriesBurned),
      description: formData.description.trim(),
    };

    if (editingId !== null) {
      setHealthData((previous) =>
        previous.map((item) =>
          item.id === editingId ? entry : item
        )
      );
    } else {
      setHealthData((previous) => [...previous, entry]);
    }

    closeForm();
  }

  function handleEdit(item) {
    setFormData({
      date: item.date || getToday(),
      caloriesIntake: String(item.caloriesIntake ?? ""),
      caloriesBurned: String(item.caloriesBurned ?? ""),
      description: item.description || "",
    });

    setEditingId(item.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    setHealthData((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      closeForm();
    }
  }

  return (
    <main className="app-shell">
      <h1>Health And Fitness Tracker</h1>

      <section className="dashboard">
        <div className="add-panel">
          <h2 className="add-panel-title">Update Today's Data</h2>

          <button
            type="button"
            className="add-button"
            onClick={openForm}
          >
            + Add data
          </button>

          {healthData.length === 0 && (
            <p className="no-data">Add your daily health data to get started.</p>
          )}
        </div>

        {weeklyData.length > 0 && (
          <div className="weekly-panel">
            <h2>Weekly Health Trends</h2>

            <div className="bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#fff", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#fff", fontSize: 10 }} />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="caloriesIntake"
                    name="Calories Intake"
                    fill="#4f46e5"
                  />

                  <Bar
                    dataKey="caloriesBurned"
                    name="Calories Burned"
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      <div className="lower-grid">
        <section className="recent-section">
          <h2>Recent Health Statistics</h2>

          {sortedHealthData.length === 0 ? (
            <p className="empty-message">
              No health data available. Click + Add data to get started.
            </p>
          ) : (
            <div className="record-list">
              {sortedHealthData.map((item) => (
                <article className="record-card" key={item.id}>
                  <div className="record-copy">
                    <p className="record-description">
                      {item.description || "Daily health statistics"}
                    </p>

                    <p className="record-calories">
                      Calories Intake = {item.caloriesIntake}
                      {" | "}
                      Calories Burned = {item.caloriesBurned}
                    </p>
                  </div>

                  <time className="record-date" dateTime={item.date}>
                    {item.date}
                  </time>

                  <div className="record-actions">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      aria-label={`Edit ${item.date}`}
                      onClick={() => handleEdit(item)}
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="icon-button delete-button"
                      aria-label={`Delete ${item.date}`}
                      onClick={() => handleDelete(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="overall-section">
          <h2>Overall Data</h2>

          {healthData.length === 0 ? (
            <p className="empty-message">
              Your overall statistics will appear here after you add data.
            </p>
          ) : (
            <div className="pie-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {overallData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-form-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close form"
              onClick={closeForm}
            >
              ×
            </button>

            <h2 id="health-form-title">Update Today's Data</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="caloriesIntake">Calories Intake</label>
              <input
                id="caloriesIntake"
                name="caloriesIntake"
                type="number"
                min="0"
                placeholder="Enter Today's Calorie Intake"
                value={formData.caloriesIntake}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="caloriesBurned">Calories Burned</label>
              <input
                id="caloriesBurned"
                name="caloriesBurned"
                type="number"
                min="0"
                placeholder="Enter Today's Calorie Burned"
                value={formData.caloriesBurned}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Enter a short description"
                value={formData.description}
                onChange={handleInputChange}
              />

              <button type="submit" className="submit-button">
                Submit
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
