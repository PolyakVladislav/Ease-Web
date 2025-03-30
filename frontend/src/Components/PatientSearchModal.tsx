import React, { useState, ChangeEvent } from "react";
import styles from "../css/PatientSearchModal.module.css";
import { searchPatients } from "../Services/userService";
import { User } from "../types/user";

interface PatientSearchModalProps {
  onPatientSelect: (patient: User) => void;
  onClose: () => void;
}

const PatientSearchModal: React.FC<PatientSearchModalProps> = ({ onPatientSelect, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = async () => {
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
