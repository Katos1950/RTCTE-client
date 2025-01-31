import { useState } from "react"
import "./Login.css"
import ThreeD from "./ThreeD"
import axios from "axios"
import { Link } from "react-router-dom"
import {SignUp} from "./SignUp"

export const Login = () => {
  const [emailId,setEmailId] = useState("")
  const [password,setPassword] = useState("")
  const [isVisible,setIsVisible] = useState(false)

  const handleLogin = async (e) =>{
    e.preventDefault();

    try{
      const response = await axios.post("http://localhost:4000/users/login",{
        emailId,
        password
      })
      console.log(response.data)
    }
    catch(error){
      console.log(error.response.data)
    }
  }

  return (
    <div className="Page-container">
      <div className="Login-container" >
        <form className = "Form" onSubmit={handleLogin}>

          {/* Sign In Text */}
          <div className="w-full h-2/6 justify-items-center place-content-center">
            <h1 className="text-3xl">Welcome Back!</h1>
          </div>
          <hr className="w-full border-t-2 border-black" />
          
          {/* Email, password and sign in button */}
          <div className="w-full flex flex-col place-content-center justify-items-center items-center">
            <div className="w-auto p-4 m-1">
              <i className="bi bi-envelope px-1"/>
              <input 
              placeholder="Email Id" 
              type="email" 
              className="border border-black"
              onChange={(e) => setEmailId(e.target.value)}/>
            </div>

            <div className="w-auto p-4 m-1">
              <i className="bi bi-lock px-1"></i>
              <input 
                placeholder="Password" 
                type={isVisible?"text":"password"}
                onChange={(e) => setPassword(e.target.value)} />            
            </div>
            
            <button type="submit" className="w-auto h-5 p-4 border border-black flex items-center justify-center m-1">Sign In</button>
          </div>

          <hr className="w-full border-t-2 border-black" />
          
          {/* Sign up link */}
          <div className="w-full h-1/6 px-3 place-content-end">
            <h6 className="p-1">Dont have an account? <Link to="/signup" >Sign Up</Link> </h6>
          </div>
        </form>
      </div>

      {/* 3d render */}
      <div className="Image-container">
        <ThreeD/>
      </div>
    </div>
  )
}
