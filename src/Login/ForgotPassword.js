import { useState } from "react";
import "./Login.css";
import ThreeD from "./ThreeD";
import axios from "axios";
import { Link, useNavigate, useParams} from "react-router-dom";
import * as Yup from "yup";

export const ForgotPassword = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate()
  const validationSchema = Yup.object({
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
  const {token}=useParams()
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await validationSchema.validate(
        { password, confirmPassword },
        { abortEarly: false }
      );

      const response = await axios.post("http://18.119.123.153/api/users/resetpassword", {
        token,
        password,
      });

      if(response.status === 200){
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
        if (error.response.data.error === "Invalid or expired token") {
          alert("Your reset link has expired. Please request a new one.");
          navigate("/")
        }
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
        <form className="Form" onSubmit={handleResetPassword}>
          <h1 className="text-3xl">Reset Password</h1>
          <hr className="divider" />


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
            Reset
          </button>

          <hr className="divider" />

          <p>
            Remember your password ? <Link to="/">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
