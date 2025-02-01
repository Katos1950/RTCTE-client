import { useState } from "react";
import "./Login.css";
import ThreeD from "./ThreeD";
import axios from "axios";
import { Link } from "react-router-dom";
import * as Yup from "yup";

export const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object({
    emailId: Yup.string().required("Email is required").email("Invalid email format"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors before validation

    try {
      await validationSchema.validate({ emailId, password }, { abortEarly: false });

      const response = await axios.post("http://localhost:4000/users/login", {
        emailId,
        password,
      });

      console.log(response.data);
    } catch (error) {
      const newErrors = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
      } else if (error.response && error.response.data) {
        Object.keys(error.response.data).forEach((key) => {
          newErrors[key] = error.response.data[key];
        });
      }
      setErrors(newErrors);
    }
  };

  return (
    <div className="Page-container">
      <div className="Login-container">
        <form className="Form" onSubmit={handleLogin}>
          <h1 className="text-3xl">Welcome Back!</h1>
          <hr className="divider" />

          <div className="input-container">
            <i className="bi bi-envelope px-1" />
            <input
              placeholder="Email Id"
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
          </div>
          {errors.emailId && <p className="error">{errors.emailId}</p>}

          <div className="input-container">
            <i className="bi bi-lock px-1"></i>
            <input
              placeholder="Password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit" className="btn">Sign In</button>
          <hr className="divider" />

          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>

      <div className="Image-container">
        <ThreeD />
      </div>
    </div>
  );
};
