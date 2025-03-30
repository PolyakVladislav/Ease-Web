import React, { forwardRef } from "react";
import styles from "../css/FormField.module.css"; 

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isTextArea?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  className?: string;
}

const FormField = forwardRef<HTMLTextAreaElement, FormFieldProps>(
  ({ label, value, onChange, isTextArea, textareaRef, className }, ref) => {
    return (
      <div className={`${styles.formField} ${isTextArea ? styles.textareaField : styles.inputField} ${className || ""}`}>
        <label className={styles.label}>{label}</label>
        {isTextArea ? (
          <textarea
            ref={textareaRef || ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${styles.textarea} ${className || ""}`}
            rows={3} 
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${styles.input} ${className || ""}`}
          />
        )}
      </div>
    );
  }
);

export default FormField;
