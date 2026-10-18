
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

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStoredData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : [];

    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
}

function formatDate(dateString) {
  // Keep YYYY-MM-DD unchanged to avoid timezone-related date shifts.
  return dateString;
}

function getLastSevenDaysData(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  return data.filter((item) => {
    if (!item.date) return false;

    const date = new Date(`${item.date}T00:00:00`);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= sevenDaysAgo &&
      date <= today
    );
  });
}

function App() {
  const [healthData, setHealthData] = useState(getStoredData);
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
    const lastSevenDays = getLastSevenDaysData(healthData);

    return lastSevenDays
      .reduce((result, item) => {
        const existing = result.find((entry) => entry.date === item.date);

        if (existing) {
          existing.caloriesIntake += Number(item.caloriesIntake) || 0;
          existing.caloriesBurned += Number(item.caloriesBurned) || 0;
        } else {
          result.push({
            date: item.date,
            caloriesIntake: Number(item.caloriesIntake) || 0,
            caloriesBurned: Number(item.caloriesBurned) || 0,
          });
        }

        return result;
      }, [])
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [healthData]);

  const overallData = useMemo(() => {
    return [
      {
        name: "Calories Intake",
        value: healthData.reduce(
          (total, item) => total + (Number(item.caloriesIntake) || 0),
          0
        ),
      },
      {
        name: "Calories Burned",
        value: healthData.reduce(
          (total, item) => total + (Number(item.caloriesBurned) || 0),
          0
        ),
      },
    ];
  }, [healthData]);

  const sortedHealthData = useMemo(() => {
    return [...healthData].sort((a, b) => {
      const dateComparison = (b.date || "").localeCompare(a.date || "");
      if (dateComparison !== 0) return dateComparison;

      return Number(b.id) - Number(a.id);
    });
  }, [healthData]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData({
      date: getToday(),
      caloriesIntake: "",
      caloriesBurned: "",
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const entry = {
      id: editingId ?? Date.now(),
      date: formData.date,
      caloriesIntake: Number(formData.caloriesIntake),
      caloriesBurned: Number(formData.caloriesBurned),
      description: formData.description.trim(),
    };

    if (!entry.date) return;

    if (
      formData.caloriesIntake === "" ||
      formData.caloriesBurned === ""
    ) {
      return;
    }

    if (editingId !== null) {
      setHealthData((previous) =>
        previous.map((item) =>
          item.id === editingId ? entry : item
        )
      );
    } else {
      setHealthData((previous) => [...previous, entry]);
    }

    resetForm();
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
      resetForm();
    }
  }

  const pieColors = ["#4f46e5", "#16a34a"];

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Health And Fitness Tracker</h1>
        <button
          type="button"
          className="add-data-button"
          onClick={() => {
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
          }}
        >
          + Add data
        </button>
      </header>

      {showForm && (
        <section className="form-section">
          <h2>Update Today's Data</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="caloriesIntake">
                Calories Intake
              </label>
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
            </div>

            <div className="form-group">
              <label htmlFor="caloriesBurned">
                Calories Burned
              </label>
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
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="Enter a short description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                Submit
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="charts-container">
        {weeklyData.length > 0 && (
          <section className="chart-card">
            <h2>Weekly Health Trends</h2>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
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
          </section>
        )}

        <section className="chart-card">
          <h2>Overall Data</h2>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {overallData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="recent-data-section">
        <h2>Recent Health Statistics</h2>

        {sortedHealthData.length === 0 ? (
          <p className="empty-message">
            No health data available. Click + Add data to get started.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="health-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Calories Intake</th>
                  <th>Calories Burned</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedHealthData.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.caloriesIntake}</td>
                    <td>{item.caloriesBurned}</td>
                    <td>{item.description || "—"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
