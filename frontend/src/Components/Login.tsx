import  { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../css/Login.module.css";
import EaseLogo from "../images/EaseLogo.png";
import { IoLockClosedOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FcGoogle } from "react-icons/fc";
import CONFIG from "../config";
import { handleLogin, handleKeyDown, handleGoogleLogin } from "../utiles/authHelpers";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  return (
    <div className={styles.loginPage}>
      <div className={styles.containerLogin}>
        <div className={styles.left}>
          <div className={styles.formContainer}>
            <h1 className={styles.headline}>LOGIN</h1>
            <p className={styles.subHeadline}>How do I get started with Ease?</p>
            <form
              onSubmit={(e) =>
                handleLogin(e, email, password, setErrorMessage, navigate)
              }
              className={styles.loginForm}
            >
              <div className={styles.inputContainer}>
                <RxAvatar className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () =>
                      handleLogin(e, email, password, setErrorMessage, navigate)
                    )
                  }
                  className={`${styles.input} ${
                    errorMessage && !email ? styles.inputError : ""
                  }`}
                  aria-label="Email"
                />
              </div>
              <div className={styles.inputContainer}>
                <IoLockClosedOutline className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () =>
                      handleLogin(e, email, password, setErrorMessage, navigate)
                    )
                  }
                  className={`${styles.input} ${
                    errorMessage && !password ? styles.inputError : ""
                  }`}
                  aria-label="Password"
                />
              </div>
              <button type="submit" className={styles.loginButton} aria-label="Login Now">
                Login Now
              </button>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </form>
            <div className={styles.footer}>
              <p>
                Don't have an account?{" "}
                <Link to="/register" className={styles.registerLink}>
                  Register here
                </Link>
              </p>
              <p className={styles.orText}>or Sign in with</p>
              <button
                className={styles.googleLogin}
                onClick={() => handleGoogleLogin(CONFIG.SERVER_URL)}
                aria-label="Sign in with Google"
              >
                <FcGoogle className={styles.googleIcon} />
                Google
              </button>
            </div>
            <img src={EaseLogo} alt="Ease Logo" className={styles.easeLogo} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.textBox}>
            <p>Empowering</p>
            <p>Therapists</p>
            <p>Transforming</p>
            <p>Lives</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
