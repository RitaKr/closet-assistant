import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	sendPasswordResetEmail,
	updateProfile,
	signOut as signOutFromFirebase,
	deleteUser,
} from "firebase/auth";
import { app } from "../config";
import { removeAllUserData } from "./db";
import { deleteAllUserImagesFromStorage } from "./storage";

// Initialize Firebase

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export let user = auth.currentUser;
export let uid;

export function signUp(email, password, displayName, setError) {
	try {
		createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				// Signed up
				user = userCredential.user;
				if (!displayName || displayName === "") displayName = createUsername();
				updateProfile(user, { displayName: displayName });
				signIn(email, password, setError);
			})
			.catch((error) => {
				if (setError) setError(error);
			});
	} catch (error) {
		setError(error);
	}
}
export function signIn(email, password, setError) {
	try {
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				// Signed in
				user = userCredential.user;
				const displayName = user.displayName
					? user.displayName
					: createUsername();
				updateProfile(user, { displayName: displayName });
			})
			.catch((error) => {
				//console.error(error);
				setError(error);
			});
	} catch (error) {
		setError(error);
	}
}
onAuthStateChanged(auth, (user) => {
	if (user) {
		uid = user.uid;
	}
});

export function signOut() {
	signOutFromFirebase(auth).catch((error) => {
		// An error happened.
		console.error("error while signing out: ", error);
	});
}

export function updateUser(setUser) {
	onAuthStateChanged(auth, (user) => {
		if (user) {
			setUser(user);
		}
		return user;
	});
}

export function createUsername() {
	return auth.currentUser.email.split("@")[0];
}

export function resetPassword(email, setError, setMessage) {
	sendPasswordResetEmail(auth, email)
		.then(() => {
			setMessage({
				type: "success",
				text: "Password reset link was sent to your email",
			});
		})
		.catch((error) => {
			console.error(error);
			setError(error);
		});
}

export function getDisplayName() {
	return auth.currentUser.displayName;
}
export function deleteAccount(setError) {
	const user = auth.currentUser;

	if (user) {
		removeAllUserData(user.uid);
		deleteAllUserImagesFromStorage(user.uid)
			.then(() => {
				deleteUser(user).catch((error) => {
					console.error("Error deleting user: ", error);
					setError(error);
				});
			})
			.catch((error) => {
				console.error("error while deleting images: ", error);
			});
	}
}
