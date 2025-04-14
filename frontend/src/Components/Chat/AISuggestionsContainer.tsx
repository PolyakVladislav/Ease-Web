import React from "react";
import styles from "../../css/MeetingChat.module.css";

interface AISuggestionsProps {
  suggestion: string;
  onRequestSuggestion: () => void;
  onAcceptSuggestion: () => void;
}

const AISuggestionsContainer: React.FC<AISuggestionsProps> = ({
  suggestion,
  onRequestSuggestion,
  onAcceptSuggestion,
}) => {
  return (
    <div className={styles.aiChat}>
      <h3>AI Suggestions</h3>

      <div className={styles.aiMessages}>
        {suggestion ? (
          <div className={styles.aiMessage}>{suggestion}</div>
        ) : (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            No suggestion yet
          </div>
        )}
      </div>

      <button className={styles.aiButton} onClick={onRequestSuggestion}>
        Request Another AI Suggestion
      </button>
      <button
        className={styles.aiButton}
        style={{ marginTop: "8px", backgroundColor: "#4caf50" }}
        onClick={onAcceptSuggestion}
      >
        Accept Suggestion
      </button>
    </div>
  );
};

export default AISuggestionsContainer;
