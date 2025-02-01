import { Dashboard } from "./Dashboard";
import { Login } from "./Login/Login";
import {SignUp} from './Login/SignUp';  
import {Route,Routes, BrowserRouter as Router} from "react-router-dom"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/signup" element={<SignUp/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;