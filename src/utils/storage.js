import {
	uploadBytesResumable,
	getStorage,
	ref,
	getDownloadURL,
	deleteObject,
	listAll,
} from "firebase/storage";
import { app } from "../config";
import { writeClothing, emptyForm } from "./db";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(app);
let uid = "";
onAuthStateChanged(auth, (user) => {
	if (user) {
		uid = user.uid;
	}
});
export const storage = getStorage(app);

export async function uploadToStorageAndDB(
	file,
	clothing,
	setClothing,
	setUploadingProgress,
	setStorageError
) {
	const storageRef = ref(storage, `images/${uid}/${clothing.imageName}`);
	const metadata = {
		contentType: file.type,
	};
	const uploadTask = uploadBytesResumable(storageRef, file, metadata);

	// Listen for state changes, errors, and completion of the upload.
	await uploadTask.on(
		"state_changed",
		(snapshot) => {
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			setUploadingProgress(progress);
			switch (snapshot.state) {
				case "paused":
					//console.log("Upload is paused");
					break;
				case "running":
					//console.log("Upload is running");
					break;
				default:
					break;
			}
		},
		(error) => {
			console.error("uploadTask error:", error);
			setStorageError(error);
			switch (error.code) {
				case "storage/unauthorized":
					// User doesn't have permission to access the object
					break;
				case "storage/canceled":
					// User canceled the upload
					break;

				// ...

				case "storage/unknown":
					// Unknown error occurred, inspect error.serverResponse
					break;
				default:
					break;
			}
		},
		async function () {
			// Upload completed successfully, now we can get the download URL
			await getDownloadURL(uploadTask.snapshot.ref)
				.then(async (downloadURL) => {
					// Write to DB after the picture URL is set
					await writeClothing({ ...clothing, imageUrl: downloadURL })
						.then(() => {
							setClothing(emptyForm);
						})
						.catch((er) => {
							console.error("Error writing clothing:", er);
						});
				})
				.catch((err) => console.error(err));
		}
	);
}

export function deleteImageFromStorage(imageName) {
	const imageRef = ref(storage, `images/${uid}/${imageName}`);

	getDownloadURL(imageRef)
		.then(() => {
			// File exists, delete it
			deleteObject(imageRef).catch((error) => {
				console.error(error, "error occurred while deleting image ", imageName);
			});
		})
		.catch((error) => {
			// File doesn't exist, log an error or handle it
			console.error("No such image: ", imageName);
		});
}

export async function deleteAllUserImagesFromStorage(uid) {
	const imageRef = ref(storage, `images/${uid}/`);
	const res = await listAll(imageRef);
	res.items.forEach((itemRef) => {
		deleteObject(itemRef).catch((error) => {
			console.error("Error deleting image: ", error);
		});
	});
}
