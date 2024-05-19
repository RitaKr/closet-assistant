import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../config";
import { useState, useEffect } from "react";
import { getUsername, updateUser } from "../utils/AuthManipulations";
import userIcon from "../assets/images/user.png";
import arrowIcon from "../assets/images/arrow-down.png";

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
		console.log(e.target, searchRef.current, searchOpen);
		searchRef.current.hidden = searchOpen;

		setSearchOpen(!searchOpen);
		console.log("after:", e.target, searchRef.current, searchOpen);
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
					<div className="profile">
						<img src={userIcon} alt="user icon" className="user-icon" />
						<span className="profile-info">{getUsername()}</span>

						<div className="sub-menu">
							<button
								className="button"
								onClick={() => {
									signOut(auth);
								}}
							>
								Log out
							</button>
						</div>
					</div>
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
						<li className="sub-menu-holder">
							<p>
								Collections
								<img src={arrowIcon} alt="arrow icon" className="arrow-icon" />
							</p>

							<ul className="sub-menu navbar-nav">
								<li>
									<NavLink
										to="/winter-collection"
										className={({ isActive }) => (isActive ? "active" : "")}
									>
										Winter
									</NavLink>
								</li>
								<li>
									<NavLink
										to="/spring-collection"
										className={({ isActive }) => (isActive ? "active" : "")}
									>
										Spring
									</NavLink>
								</li>
								<li>
									<NavLink
										to="/summer-collection"
										className={({ isActive }) => (isActive ? "active" : "")}
									>
										Summer
									</NavLink>
								</li>

								<li>
									<NavLink
										to="/autumn-collection"
										//className={({ isActive }) => (isActive ? "active" : "")}
									>
										Autumn
									</NavLink>
								</li>
							</ul>
						</li>
						<li className="nav-item">
							<NavLink
								to="/contacts"
								className={({ isActive }) => (isActive ? "active" : "")}
							>
								Contacts
							</NavLink>
						</li>
					</ul>
				</div>
			</div>

			{searchRef && (
				<button
					className={`search-icon ${searchOpen ? "search-open" : ""}`}
					onClick={handleSearchOpen}
				></button>
			)}
		</nav>
	);
}
