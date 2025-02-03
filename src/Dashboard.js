import { useState } from "react";
import "./Dashboard.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
    const [documents,setDocuments] = useState({})
    const navigate = useNavigate()
    const getDocuments = async ()=>{
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get("http://localhost:5000/users/documents",{
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          console.log(response.data)
        }
        catch(error){
            if(error.status === 403){
                const newToken = await axios.post("http://localhost:4000/users/token",{
                    token : localStorage.getItem("refreshToken")
                })
                if(newToken){
                    localStorage.setItem('token',newToken.data.accessToken)
                    return getDocuments()
                }
                else{
                    navigate("/");
                }
            }

            console.log(error)
        }
        
    }

    return (
        <div className="dashboard">
            <div className="TitleBar">
                <h1 className="w-4/5 flex justify-center items-center">LetterPad</h1>
                
                <button ><i className="bi bi-person-circle"></i></button>
            </div>
            <hr className="w-full border-t-2 border-black" />
            <div className ="w-auto h-auto flex flex-row items-start m-1">
                <button className="w-20 h-24" onClick={getDocuments}>
                    <img src="/blank.jpg"></img>
                    <span>Blank Document</span>
                </button>
            </div>
            <hr className="w-full border-t-2 border-black" />
            
        </div>
    )
}
