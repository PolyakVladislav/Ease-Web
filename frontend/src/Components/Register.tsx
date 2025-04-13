import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../css/Register.module.css";
import CONFIG from "../config";

const Register = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null); 

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Please enter a username.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Your username must be at least 3 characters long.";
    }

    if (!formData.email) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "The email address format is invalid.";
    }

    if (!formData.password) {
      newErrors.password = "Please create a password.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Your password must be at least 8 characters long.";
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Your password must include at least one letter, one number, and one special character.";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "The passwords you entered do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const dataToSend = new FormData();
        dataToSend.append("username", formData.username);
        dataToSend.append("email", formData.email);
        dataToSend.append("password", formData.password);
        if (selectedFile) {
          dataToSend.append("profilePicture", selectedFile);
        }
  
        const response = await fetch(`${CONFIG.SERVER_URL}/auth/register`, {
          method: 'POST',
          body: dataToSend,
        });
  
        if (response.ok) {
          setSuccessMessage('Registration successful! Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          const errorData = await response.json();
          if (errorData.message?.includes('Email')) {
            setErrors({ email: 'This email is already registered.' });
          } else if (errorData.message?.includes('Username')) {
            setErrors({ username: 'This username is already taken.' });
          } else {
            setErrors({ server: errorData.message || 'Registration failed' });
          }
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ server: 'Something went wrong. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    }
  };
  

  return (
    <div className={styles.fullscreenBg}>
      <div className={styles.registerContainer}>
        <h2 className={styles.headline}>Register</h2>
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.username ? styles.inputError : ""
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className={styles.error}>{errors.username}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
              placeholder="Create a password"
            />
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.confirmPassword ? styles.inputError : ""
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className={styles.error}>{errors.confirmPassword}</p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="profilePicture" className={styles.label}>
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className={styles.input}
            />
          </div>

          {errors.server && <p className={styles.error}>{errors.server}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button
            type="submit"
            className={styles.registerButton}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
          <p className={styles.loginPrompt}>
            Already have an account?{" "}
            <Link to="/login" className={styles.loginLink}>
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
