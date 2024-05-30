import { useState, useEffect } from "react"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Homepage from './pages/Homepage';
import Closet from './pages/Closet';
import Login from './pages/Login';
import Collections from './pages/Collections';
import { getCollections, database } from './utils/DBManipulations';
import Calendar from './pages/Calendar';
import Collection from "./pages/Collection";
import Loader from "./components/Loader";
import { updateUser } from "./utils/AuthManipulations";
import { onChildChanged, onChildRemoved, onChildAdded, ref } from "firebase/database";
import Profile from "./pages/Profile";

export default function App(){
    const [collections, setCollections] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (user){
            getCollections().then((data) => {
                setCollections(data);           
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
		updateUser(setUser);
	}, []);

	useEffect(() => {
		if (user) {
			//setUser(auth.currentUser);
			//getClothes(setClothes);
			getCollections().then((data) => {
				//console.log(data);
				setCollections(data);
			});
			onChildRemoved(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
			onChildChanged(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
			onChildAdded(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
		}
	}, [user]);

    if (isLoading) {
        return <Loader/>; // or your loading spinner
    }

    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login isSignUp={false} />} />
          <Route path="/signup" element={<Login isSignUp={true} />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/closet" element={<Closet />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/calendar" element={<Calendar />} />
          {collections && collections.map((collection, i) => {
           //console.log(collections)
            return (
            <Route key={i} path={`/collections/${collection.slug}`} element={<Collection collection={collection} />} />
          )})}
          <Route path="/profile" element={<Profile />} />
        </Routes>
        
      </Router>
    )
}