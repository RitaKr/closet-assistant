
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged   } from "firebase/auth";
import {app } from "../config";
// Initialize Firebase


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export let user = auth.currentUser;
export let uid;


export function signUp(email, password, setError) {
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    user = userCredential.user;
    
  })
  .catch((error) => {
    console.error(error)
    setError(error)
    // ..
  });
}
export function signIn(email, password, setError) {
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    user = userCredential.user;
    //navigate('/home');
    // ...
  })
  .catch((error) => {
    console.error(error);
    setError(error)
  });
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    uid = user.uid;
  } 
});

export function signOut(){
  signOut(auth).then(() => {
    // Sign-out successful.
    
  }).catch((error) => {
    // An error happened.
    console.error("error while signing out: ",error);

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

export function getUsername() {
  return auth.currentUser.email.split("@")[0];
}