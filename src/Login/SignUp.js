import { useState } from "react";
import "./Login.css";
import ThreeD from "./ThreeD";
import axios from "axios";
import { Link } from "react-router-dom";
import * as Yup from "yup";

export const SignUp = () => {
  const [userName, setUsername] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object({
    userName: Yup.string().required("Username is required"),
    emailId: Yup.string()
      .required("Email is required")
      .email("Invalid email format"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must have at least one symbol")
      .matches(/[0-9]/, "Password must have at least one number")
      .matches(/[A-Z]/, "Password must have at least one uppercase letter")
      .matches(/[a-z]/, "Password must have at least one lowercase letter"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm your password"),
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      await validationSchema.validate(
        { userName, emailId, password, confirmPassword },
        { abortEarly: false }
      );

      const response = await axios.post("http://localhost:5000/users/signUp", {
        userName,
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
      }
      else if (error.response && error.response.data) {
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
          <div className="w-full h-2/6 justify-items-center place-content-center">
            <h1 className="text-3xl">Create An Account</h1>
          </div>
          <hr className="w-full border-t-2 border-black" />

          <div className="w-full flex flex-col place-content-center justify-items-center items-center">
            <div className="w-auto p-4 m-1">
              <i className="bi bi-person-circle px-1"></i>
              <input
                placeholder="Username"
                type="text"
                className="border border-black"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.userName && <p className="text-red-500">{errors.userName}</p>}
            </div>

            <div className="w-auto p-4 m-1">
              <i className="bi bi-envelope px-1" />
              <input
                placeholder="Email Id"
                type="email"
                className="border border-black"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
              {errors.emailId && <p className="text-red-500">{errors.emailId}</p>}
            </div>

            <div className="w-auto p-4 m-1">
              <i className="bi bi-lock px-1"></i>
              <input
                placeholder="Password"
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500">{errors.password}</p>}
            </div>

            <div className="w-auto p-4 m-1">
              <i className="bi bi-file-earmark-lock-fill px-1"></i>
              <input
                placeholder="Re-type Password"
                type={isVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-auto h-5 p-4 border border-black flex items-center justify-center m-1"
            >
              Register
            </button>
          </div>

          <hr className="w-full border-t-2 border-black" />

          <div className="w-full h-1/6 px-3 place-content-end">
            <h6 className="p-1">
              Already Have an account? <Link to="/">Log In</Link>
            </h6>
          </div>
        </form>
      </div>
    </div>
  );
};
