import { Dashboard } from "./Dashboard";
import { Login } from "./Login/Login";
import {SignUp} from './Login/SignUp';  
import {ForgotPassword} from './Login/ForgotPassword';  
import {Route,Routes, BrowserRouter as Router} from "react-router-dom"
import { TextEditor } from "./textEditor/TextEditor";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/signup" element={<SignUp/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
        <Route path="/document/:id" element={<TextEditor/>}></Route>  
        <Route path="/forgotpassword" element={<ForgotPassword/>}></Route>  
      </Routes>
    </Router>
  )
}

export default App;