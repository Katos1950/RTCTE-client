import { useState } from "react"
import "./Login.css"

export const Login = () => {

  const [password,setPassword] = useState("")
  const [isVisible,setIsVisible] = useState(false)

  return (
    <div className="Page-container">
      <div className="Login-container" >
        <form className = "Form" onSubmit={()=>{}}>

          {/* Sign In Text */}
          <div className="w-full h-2/6 justify-items-center place-content-center">
            <h1 className="text-3xl">Sign In</h1>
          </div>
          <hr className="w-full border-t-2 border-black" />
          
          {/* Email, password and sign in button */}
          <div className="w-full flex flex-col place-content-center justify-items-center items-center">
            <div className="w-auto p-4 m-1">
              <i className="bi bi-envelope px-1"/>
              <input placeholder="Email Id" type="email" className="border border-black"/>
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
            <h6 className="p-1">Dont have an account? <a href="">Sign Up</a> </h6>
          </div>
        </form>
      </div>

      {/* 3d render */}
      <div className="Image-container">
        <img src=""/>
      </div>
    </div>
  )
}
