import React, { useState } from "react";
import styles from "../../css/TimeSelectionModal.module.css";
import { getFreeSlots } from "../../Services/scheduleService";
import {
  getStartOfCurrentWeek,
  stripTime,
  toISODateString,
  formatSlot,
} from "../../utiles/dateUtils";

interface Props {
  onTimeSelect: (dateTime: string, isEmergency: boolean, notes: string) => void;
  onClose: () => void;
}

const TimeSelectionModal: React.FC<Props> = ({ onTimeSelect, onClose }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfCurrentWeek());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [chosenSlot, setChosenSlot] = useState<string>("");

  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState("");

  function handlePreviousWeek() {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
    resetSlots();
  }

  function handleNextWeek() {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
    resetSlots();
  }

  function resetSlots() {
    setSelectedDay(null);
    setSlots([]);
    setChosenSlot("");
  }

  async function handleSelectDay(dayIndex: number) {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    if (dayDate <= stripTime(new Date())) {
      setError("Cannot book past days");
      setTimeout(() => setError(""), 2000);
      return;
    }

    setSelectedDay(dayDate);
    setIsSlotsLoading(true);
    setSlots([]);
    setChosenSlot("");

    try {
      const doctorId = localStorage.getItem("userId");
      if (!doctorId) {
        setError("No doctorId found");
        setIsSlotsLoading(false);
        return;
      }
      const dateString = toISODateString(dayDate);
      const data = await getFreeSlots(doctorId, dateString);
      setSlots(data.slots || []);
    } catch (err) {
      console.error("Error loading slots:", err);
      setError("Failed to load slots.");
    } finally {
      setIsSlotsLoading(false);
    }
  }

  function confirmSlot() {
    if (!chosenSlot) {
      setError("Please select a slot first");
      setTimeout(() => setError(""), 2000);
      return;
    }
    onTimeSelect(chosenSlot, isEmergency, notes);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Select Appointment</h3>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.weekSelector}>
            <button onClick={handlePreviousWeek}>Previous Week</button>
            <button onClick={handleNextWeek}>Next Week</button>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.daysRow}>
            {Array.from({ length: 7 }, (_, i) => {
              const dayDate = new Date(currentWeekStart);
              dayDate.setDate(dayDate.getDate() + i);

              const dayLabel = dayDate.toLocaleString("default", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const isPast = dayDate <= stripTime(new Date());

              return (
                <button
                  key={i}
                  className={styles.dayButton}
                  onClick={() => handleSelectDay(i)}
                  disabled={isPast}
                >
                  {dayLabel}
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div className={styles.slotList}>
              <strong>Slots for {selectedDay.toDateString()}:</strong>
              {isSlotsLoading ? (
                <p>Loading slots...</p>
              ) : slots.length > 0 ? (
                slots.map((slot) => (
                  <div key={slot} className={styles.slotItem}>
                    <label>
                      <input
                        type="radio"
                        name="slot"
                        value={slot}
                        checked={chosenSlot === slot}
                        onChange={(e) => setChosenSlot(e.target.value)}
                      />
                      {"  "}
                      {formatSlot(slot)}
                    </label>
                  </div>
                ))
              ) : (
                <p>No slots available.</p>
              )}
            </div>
          )}

          <div style={{ marginTop: "15px" }}>
            <div>
              <input
                type="checkbox"
                id="emergencyCheck"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                style={{ marginRight: "5px" }}
              />
              <label htmlFor="emergencyCheck">Emergency</label>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.notesInput}
              placeholder="Enter any additional comments..."
              maxLength={15}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={confirmSlot} className={styles.confirmButton}>
            Confirm
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionModal;
