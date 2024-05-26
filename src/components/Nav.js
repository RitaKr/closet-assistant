import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../config";
import { useState, useEffect } from "react";
import { createUsername, getDisplayName, updateUser } from "../utils/AuthManipulations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Initialize Firebase

const auth = getAuth(app);

export default function Nav({ searchRef }) {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [searchOpen, setSearchOpen] = useState(false);

	useEffect(() => {
		updateUser(setUser);
	}, []);

	onAuthStateChanged(auth, (user) => {
		if (!user) {
			navigate("/login");
		}
	});
	function handleSearchOpen(e) {
		//console.log(e.target, searchRef.current, searchOpen);
		searchRef.current.hidden = searchOpen;

		setSearchOpen(!searchOpen);
		//console.log("after:", e.target, searchRef.current, searchOpen);
	}
	return (
		<nav className="page-nav navbar navbar-expand-md">
			<div className="container-fluid">
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarToggler"
					aria-controls="navbarToggler"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				{user && (
						<NavLink
							to="/profile"
							className={({ isActive }) => (isActive ? "active" : "")+ " profile"}
						>
							<FontAwesomeIcon icon="fa-solid fa-user-large" className="user-icon" />
							<span className="profile-info">{getDisplayName()}</span>
						</NavLink>
		
				)}
				<div className="collapse navbar-collapse" id="navbarToggler">
					<ul className="navbar-nav me-auto mb-2 mb-md-0">
						<li>
							<NavLink
								to="/"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								Home
							</NavLink>
						</li>

						<li>
							<NavLink
								to="/closet"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								Closet
							</NavLink>
						</li>
					</ul>
				</div>
			</div>

			{searchRef && (
				<button
					className={`search-icon ${searchOpen ? "search-open" : ""}`}
					onClick={handleSearchOpen}
				>
					<FontAwesomeIcon icon={["fas", "magnifying-glass"]} />
				</button>
			)}
		</nav>
	);
}
