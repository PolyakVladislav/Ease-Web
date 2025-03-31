import React, { useEffect, useState } from "react";
import scheduleStyles from "../../css/ScheduleEditor.module.css";
import {
  getDoctorSchedule,
  createOrUpdateSchedule,
  deleteScheduleEntry,
} from "../../Services/scheduleService";
import { Schedule } from "../../types/schedule";

interface ScheduleEditorProps {
  doctorId: string;
}

const daysOfWeekLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ doctorId }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tempSchedules, setTempSchedules] = useState<Schedule[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);   
  const [error, setError] = useState("");

  useEffect(() => {
    loadSchedules();
  }, [doctorId]);

  async function loadSchedules() {
    if (!doctorId) return;
    setLoading(true);
    try {
      const data = await getDoctorSchedule(doctorId);
      const arr = data.schedules || [];
      setSchedules(arr);
      setTempSchedules(JSON.parse(JSON.stringify(arr)));
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError("Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setTempSchedules(JSON.parse(JSON.stringify(schedules)));
  }

  async function handleSaveAll() {
    try {
      setLoading(true);
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const tempItem = tempSchedules.find((s) => s.dayOfWeek === dayOfWeek);
        if (!tempItem) {
          const realItem = schedules.find((s) => s.dayOfWeek === dayOfWeek);
          if (realItem && realItem._id) {
            await deleteScheduleEntry(realItem._id);
          }
        } else {
          await createOrUpdateSchedule({
            doctorId,
            dayOfWeek,
            startHour: tempItem.startHour,
            endHour: tempItem.endHour,
            slotDuration: tempItem.slotDuration,
          });
        }
      }
      await loadSchedules();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError("Failed to update schedule.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setTempSchedules(JSON.parse(JSON.stringify(schedules)));
    setIsEditing(false);
  }

  function updateTemp(dayOfWeek: number, field: "startHour" | "endHour" | "slotDuration", value: number) {
    setTempSchedules((prev) => {
      const copy = [...prev];
      let item = copy.find((s) => s.dayOfWeek === dayOfWeek);
      if (!item) {
        item = {
          _id: "",
          doctorId,
          dayOfWeek,
          startHour: 8,
          endHour: 17,
          slotDuration: 60,
        } as Schedule;
        copy.push(item);
      }
      item[field] = value;
      return copy;
    });
  }

  if (error) {
    return <p>{error}</p>;
  }

  const tempMap = new Map<number, Schedule>();
  tempSchedules.forEach((s) => tempMap.set(s.dayOfWeek, s));

  return (
    <div className={scheduleStyles.scheduleSection}>
      <h2>My Weekly Schedule</h2>

      <div className={scheduleStyles.loadingWrapper}>
  {loading && <p className={scheduleStyles.loadingText}>Saving changes...</p>}
</div>

      <table className={scheduleStyles.scheduleTable}>
        <thead>
          <tr>
            <th>Day</th>
            <th>Start Hour</th>
            <th>End Hour</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeekLabels.map((dayLabel, idx) => {
            const tempItem = tempMap.get(idx);
            const startHour = tempItem?.startHour ?? 0;
            const endHour = tempItem?.endHour ?? 0;
            const slotDuration = tempItem?.slotDuration ?? 60;

            return (
              <tr key={idx}>
                <td>{dayLabel}</td>
                <td>
                  <select
                    className={scheduleStyles.timeSelect}
                    disabled={!isEditing}
                    value={startHour}
                    onChange={(e) => updateTemp(idx, "startHour", Number(e.target.value))}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hr) => (
                      <option key={hr} value={hr}>
                        {hr}:00
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className={scheduleStyles.timeSelect}
                    disabled={!isEditing}
                    value={endHour}
                    onChange={(e) => updateTemp(idx, "endHour", Number(e.target.value))}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hr) => (
                      <option key={hr} value={hr}>
                        {hr}:00
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className={scheduleStyles.durationInput}
                    disabled={!isEditing}
                    value={slotDuration}
                    min={15}
                    step={15}
                    max={120}
                    onChange={(e) => updateTemp(idx, "slotDuration", Number(e.target.value))}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={scheduleStyles.bottomButtons}>
        {isEditing ? (
          <>
            <button className={scheduleStyles.saveButton} onClick={handleSaveAll}>
              Save
            </button>
            <button className={scheduleStyles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button className={scheduleStyles.editButton} onClick={handleEdit}>
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleEditor;
