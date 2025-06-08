import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addDayOff,
  deleteDayOff,
  getDayOffs,
} from "../../Services/dayOffService";
import { DayOff } from "../../types/schedule";
import dayOffStyles from "../../css/DayOffEditor.module.css";

interface DayOffEditorProps {
  doctorId: string;
}

const DayOffEditor: React.FC<DayOffEditorProps> = ({ doctorId }) => {
  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const [newDayOffDate, setNewDayOffDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    getDayOffs(doctorId)
      .then((data) => {
        setDayOffs(data.dayOffs || []);
      })
      .catch((err) => {
        console.error("Error fetching dayOffs:", err);
        setError("Failed to load dayOffs.");
      })
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleAddDayOff = async () => {
    if (!newDayOffDate) return;
    if (!newDayOffDate || newDayOffDate < minDateString) {
      return toast.error("Please choose a date of tomorrow or later.");
    }
    try {
      await addDayOff({ doctorId, date: newDayOffDate, reason });
      const data = await getDayOffs(doctorId);
      setDayOffs(data.dayOffs || []);
      setNewDayOffDate("");
      setReason("");
    } catch (err) {
      console.error("Error adding dayOff:", err);
      setError("Failed to add dayOff.");
    }
  };

  const handleDeleteDayOff = async (dayOffId: string) => {
    try {
      await deleteDayOff(dayOffId);
      setDayOffs((prev) => prev.filter((d) => d._id !== dayOffId));
    } catch (err) {
      console.error("Error deleting dayOff:", err);
      setError("Failed to delete dayOff.");
    }
  };

  if (loading) {
    return <p>Loading DayOff data...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={dayOffStyles.dayOffSection}>
      <h3>Day Off</h3>
      <table className={dayOffStyles.dayOffTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dayOffs.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.date).toLocaleDateString("en-GB")}</td>
              <td>{item.reason || "-"}</td>
              <td>
                <button
                  className={dayOffStyles.deleteDayOffButton}
                  onClick={() => handleDeleteDayOff(item._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={dayOffStyles.addDayOffForm}>
        <label htmlFor="dayOffDate">Date:</label>
        <input
          type="date"
          id="dayOffDate"
          className={dayOffStyles.addDayOffInput}
          value={newDayOffDate}
          onChange={(e) => setNewDayOffDate(e.target.value)}
        />
        <label htmlFor="reason">Reason:</label>
        <input
          type="text"
          id="reason"
          className={dayOffStyles.addDayOffInput}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          className={dayOffStyles.addDayOffButton}
          onClick={handleAddDayOff}
        >
          Add Day Off
        </button>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default DayOffEditor;
