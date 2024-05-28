import { useState, useEffect } from "react"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Homepage from './pages/Homepage';
import Closet from './pages/Closet';
import Login from './pages/Login';

import { getCollections, database } from './utils/DBManipulations';
import Loader from "./components/Loader";
import { updateUser } from "./utils/AuthManipulations";
import { onChildChanged, onChildRemoved, onChildAdded, ref } from "firebase/database";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";

export default function App(){
    const [user, setUser] = useState(null)



    useEffect(() => {
		updateUser(setUser);
	}, []);




    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login isSignUp={false} />} />
          <Route path="/signup" element={<Login isSignUp={true} />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/closet" element={<Closet />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        
      </Router>
    )
}