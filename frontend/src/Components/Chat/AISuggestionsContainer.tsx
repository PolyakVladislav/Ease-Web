import React from "react";
import styles from "../../css/MeetingChat.module.css";

interface AISuggestionsProps {
  suggestions: string[];
  onRequestSuggestion: () => void;
}

const AISuggestionsContainer: React.FC<AISuggestionsProps> = ({ suggestions, onRequestSuggestion }) => {
  return (
    <div className={styles.aiChat}>
      <h3>AI Suggestions</h3>
      <div className={styles.aiMessages}>
        {suggestions.map((sugg, index) => (
          <div key={index} className={styles.aiMessage}>
            {sugg}
          </div>
        ))}
      </div>
      <button className={styles.aiButton} onClick={onRequestSuggestion}>
        Request AI Suggestion
      </button>
    </div>
  );
};

export default AISuggestionsContainer;