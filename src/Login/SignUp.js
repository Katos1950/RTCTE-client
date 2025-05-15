import { useState } from "react";
import "./Login.css";
import ThreeD from "./ThreeD";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

export const SignUp = () => {
  const [userName, setUsername] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate()
  const validationSchema = Yup.object({
    userName: Yup.string().required("Username is required"),
    emailId: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must have at least one symbol")
      .matches(/[0-9]/, "Must have at least one number")
      .matches(/[A-Z]/, "Must have at least one uppercase letter")
      .matches(/[a-z]/, "Must have at least one lowercase letter"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm your password"),
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await validationSchema.validate(
        { userName, emailId, password, confirmPassword },
        { abortEarly: false }
      );

      const response = await axios.post(`https://api.co-write.online/api/users/signUp`, {
        userName,
        emailId,
        password,
      });

      if(response.status===201) alert("Email verification link sent to the email. Do check the spam folder.")
        
      if(response.status === 201){
        navigate("/");
      }
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
      <div className="Image-container">
        <ThreeD />
      </div>

      <div className="Login-container">
        <form className="Form" onSubmit={handleSignUp}>
          <h1 className="text-3xl">Create An Account</h1>
          <hr className="divider" />

          <div className="input-container">
            <i className="bi bi-person-circle px-1"></i>
            <input
              placeholder="Username"
              type="text"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.userName && <p className="error">{errors.userName}</p>}
          </div>

          <div className="input-container">
            <i className="bi bi-envelope px-1"></i>
            <input
              placeholder="Email Id"
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
            {errors.emailId && <p className="error">{errors.emailId}</p>}
          </div>

          <div className="input-container">
            <i className="bi bi-lock px-1"></i>
            <input
              placeholder="Password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="input-container">
            <i className="bi bi-file-earmark-lock-fill px-1"></i>
            <input
              placeholder="Re-type Password"
              type={isVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn">
            Register
          </button>

          <hr className="divider" />

          <p>
            Already have an account? <Link to="/" style={{ color: 'blue', cursor: 'pointer' }}>Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
