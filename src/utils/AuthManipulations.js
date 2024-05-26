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
import { removeAllUserData, removeCollection } from "./DBManipulations";
import { deleteAllUserImagesFromStorage } from "./StorageManipulations";
import { set } from "firebase/database";
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
				//console.error(error)
				setError(error);
				// ..
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
				//navigate('/home');
				// ...
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
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/auth.user
		uid = user.uid;
	}
});

export function signOut() {
	signOutFromFirebase(auth)
		.then(() => {
			// Sign-out successful.
		})
		.catch((error) => {
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
			// Password reset email sent!
			// ..
		//console.log("Password reset email sent");
		setMessage({type: "success", text: "Password reset link was sent to your email"});
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
			//console.log("images deleted successfully");
				deleteUser(user)
					.then(() => {
					//console.log("User deleted");

						//signOut(auth);
					})
					.catch((error) => {
						console.error("Error deleting user: ", error);
						setError(error);
					});
			})
			.catch((error) => {
				console.error("error while deleting images: ", error);
			});
	}
}

export function getUserInfo() {
  const user = auth.currentUser;
  if (user) {
   //console.log(`user:`, user);
   //console.log(`Creation time: ${user.metadata.creationTime}`);
    // More fields...
  } else {
   //console.log('No user is signed in.');
  }
}