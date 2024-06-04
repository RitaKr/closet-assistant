import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import {
	updateUser,
	signOut,
	auth,
	deleteAccount,
} from "../utils/auth";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { ApplyButton, CancelButton, EditButton } from "../components/Buttons";

export default function Profile() {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [name, setName] = useState(null);
	const [editing, setEditing] = useState(false);
	const nameInput = useRef(null);

	useEffect(() => {
		updateUser(setUser);
	}, []);

	useEffect(() => {
		if (user) {
			setName(user.displayName);
		}
	}, [user]);

	async function handleEdit(e) {
		await setEditing(true);
		if (nameInput.current) nameInput.current.focus();
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (name && name.trim() !== "") {
			try {
				updateProfile(user, { displayName: name }).then(() => {
					updateUser(setUser);
					setEditing(false);
				});
			} catch (error) {
				console.error("Error creating collection", error);
				setError(error);
			}
		}
	}

	function handleCancel(e) {
		if (window.confirm("Are you sure you want to cancel your changes?")) {
			setName(user.displayName);
			setEditing(false);
		}
	}

	return (
		<>
			<Nav />
			{user ? (
				<main className="page-main">
					<h1 className="page-title">Your account</h1>
					<div className="profile-container">
						<div className="profile-details">
							<p>
								Date of registration:{" "}
								<span className="profile-value">
									{user.metadata.creationTime}
								</span>
							</p>
							<h3 className="editable-title">
								<span>Username:</span>
								{editing ? (
									<input
										type="text"
										className="collection-name"
										ref={nameInput}
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								) : (
									<span className="profile-value">{user.displayName}</span>
								)}
								{!editing ? (
									<div className="action-panel">
										<EditButton handleEdit={handleEdit} />
									</div>
								) : (
									<div className="action-panel">
										<ApplyButton
											handleApply={handleSubmit}
											disabled={!name || name === ""}
										/>
										<CancelButton handleCancel={handleCancel} />
									</div>
								)}
							</h3>
							<h3>
								Email: <span className="profile-value">{user.email}</span>
							</h3>
						</div>
						<div className="profile-details action-panel">
							<button
								className="button"
								onClick={() => {
									signOut(auth);
								}}
							>
								Log out
							</button>
							<button
								className="button delete-btn"
								onClick={() => {
									if (
										window.prompt(
											"Are you sure you want to delete your account? All your data will be permanently deleted. Type 'DELETE' to confirm."
										) === "DELETE"
									) {
										try {
											deleteAccount(setError);
										} catch {
											console.error("error deleting account:", error);

											setError(error);
											setTimeout(() => setError(null), 10000);
										}
									}
								}}
							>
								Delete account
							</button>
						</div>
						{error && (
							<ErrorAlert>
								Cannot delete an account that was not logged in yet. Please,
								logout and login again in order to delete this account
							</ErrorAlert>
						)}
					</div>
				</main>
			) : (
				<Loader />
			)}
			<Footer />
		</>
	);
}
