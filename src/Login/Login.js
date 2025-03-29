import { useEffect, useState } from "react";
import "./Login.css";
import ThreeD from "./ThreeD";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";


export const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Hook to handle navigation

  useEffect(()=>{
    localStorage.setItem("token",null);
    localStorage.setItem("refreshToken",null);

  },[])
  const handleResetClick = async(e)=>{

    const resetPassvalidationSchema = Yup.object({
      emailId: Yup.string().required("Email is required").email("Invalid email format"),
    })

    e.preventDefault();
    setErrors({}); // Reset errors before validation
    
    try {
      await resetPassvalidationSchema.validate({ emailId}, { abortEarly: false });

      const response = await axios.post(`http://${process.env.REACT_APP_EC2_IP}/api/users/sendPassResetLink`, {
        emailId
      });
      if(response.status===200) alert("Password reset link sent to the email.")

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
  }

  const validationSchema = Yup.object({
    emailId: Yup.string().required("Email is required").email("Invalid email format"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset errors before validation
    
    try {
      await validationSchema.validate({ emailId, password }, { abortEarly: false });
      const response = await axios.post(`http://${process.env.REACT_APP_EC2_IP}/auth/users/login`, {
        emailId,
        password,
      });

      console.log(response.status);
      if(response.status === 200){
        localStorage.setItem("token",response.data.accessToken)
        localStorage.setItem("refreshToken",response.data.refreshToken)
        navigate("/dashboard");
      }
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
          Forgot Password?  <span onClick={handleResetClick} style={{ color: 'blue', cursor: 'pointer' }}>Reset</span>
          </p>

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
