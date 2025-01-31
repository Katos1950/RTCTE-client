import { Login } from "./Login/Login";
import {SignUp} from './Login/SignUp';  
import {Route,Routes, BrowserRouter as Router} from "react-router-dom"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/signup" element={<SignUp/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;