import React, { useState, ChangeEvent, useEffect } from "react";
import styles from "../css/PatientSearchModal.module.css";
import { searchPatients, getRecentPatients } from "../Services/userService"; // ⬅️ you'll need to create this API
import { User } from "../types/user";

interface PatientSearchModalProps {
  onPatientSelect: (patient: User) => void;
  onClose: () => void;
  doctorId: string; 
}

const PatientSearchModal: React.FC<PatientSearchModalProps> = ({
  onPatientSelect,
  onClose,
  doctorId,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [recentPatients, setRecentPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // ⬅️ Fetch recent patients on mount
    const fetchRecent = async () => {
      try {
        const data = await getRecentPatients(doctorId);
        setRecentPatients(data.patients);
      } catch (err) {
        console.error("Error fetching recent patients:", err);
      }
    };
    fetchRecent();
  }, [doctorId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (query.trim().length === 0) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchPatients(query);
      setResults(data.patients);
    } catch (err) {
      setError("Error fetching patients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Search Patient</h3>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.searchRow}>
            <input
              type="text"
              placeholder="Enter patient name or email"
              value={query}
              onChange={handleInputChange}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {query.trim() === "" && recentPatients.length > 0 && (
            <div className={styles.recentPatients}>
              <h4>Recent Patients (Last 30 Days)</h4>
              <ul className={styles.recentList}>
                {recentPatients.map((patient) => (
                  <li
                    key={patient._id}
                    onClick={() => onPatientSelect(patient)}
                    className={styles.resultItem}
                  >
                    {patient.username} ({patient.email})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <ul className={styles.resultsList}>
              {results.map((patient) => (
                <li
                  key={patient._id}
                  onClick={() => onPatientSelect(patient)}
                  className={styles.resultItem}
                >
                  {patient.username} ({patient.email})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchModal;
