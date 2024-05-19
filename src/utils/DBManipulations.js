
import { getDatabase, set, ref, get, remove } from "firebase/database";
import { deleteImageFromStorage } from "./StorageManipulations";
import { app } from "../config";
import { v4 as uuidv4 } from "uuid";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth(app);
let uid = "";
onAuthStateChanged(auth, (user) => {
	if (user) {
		uid = user.uid;
		clothesRef = ref(database, `clothes/${uid}/`);
		//outfitsRef = ref(database, `outfits/${uid}/`);
		// ...
	}
});
export const database = getDatabase(app);
export let clothesRef = ref(database, `clothes/${uid}/`);
//export let outfitsRef = ref(database, `outfits/${uid}/`);
export const emptyForm = {
	name: "",
	temperatures: [],
	type: "none",
	layer: null,
	inLaundry: false,
	imageUrl: null,
	imageName: null,
	color: null,
};
export function removeClothing(id, imageName) {
	try {
		remove(ref(database, `clothes/${uid}/${id}`));
		deleteImageFromStorage(imageName);
		
		//removing all outfits that contained this clothing item
		const collections = ["Winter", "Spring", "Summer", "Autumn"];
		collections.forEach((col) => {
			getOutfits(col).then((outfits) => {
				outfits.forEach((outfit) => {
					const imageNames = outfit.clothes.map((cl) => cl.imageName);
					console.log("imageNames: ", imageNames);
					if (imageNames.includes(imageName)) removeOutfit(outfit.id, col);
				});
			});
		});
		console.log("clothing ", id, "removed: ", clothesRef);
	} catch (error) {
		console.log("error deleting clothing "+imageName+":", error)
	}
	
}
export function removeOutfit(id, collection) {
	remove(ref(database, `outfits/${uid}/${collection}/${id}`));
	console.log("outfit ", id, "removed: ", clothesRef);
}
export function writeClothing(data) {
	try {
		if (!data.id || data.id === "") data.id = uuidv4();
		console.log(data.id);
		set(ref(database, `clothes/${uid}/${data.id}`), {
			name: data.name,
			temperatures: data.temperatures,
			//conditions: data.conditions,
			type: data.type,
			//layer: data.layer,
			inLaundry: data.inLaundry,
			imageUrl: data.imageUrl,
			imageName: data.imageName,
			id: data.id,
			color: data.color,
			addDate: data.addDate ? data.addDate : new Date().toISOString(),
		});
	}catch (error) {
		console.log("error adding clothing "+data+":", error)
	}
	
}
export function writeOutfit(collection, data) {
	const id = uuidv4();
	console.log("outfit id:", id);
	console.log("outfit collection:", collection);
	console.log("outfit data:", data);
	set(ref(database, `outfits/${uid}/${collection}/${id}`), {
		clothes: data,
		id: id,
		addDate: data.addDate ? data.addDate : new Date().toISOString(),
	});
}
export function updateClothing(data) {
	console.log(data);
	writeClothing(data);
	console.log("clothing ", data.id, "updated to", data, ".", clothesRef);
}
export async function getClothes() {
	try {
		const snapshot = await get(clothesRef);
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort(
				(a, b) => new Date(a.addDate) - new Date(b.addDate)
			);
			console.log("Clothing items:", itemsArray);
			return itemsArray;
		} else {
			console.log("No items found");
			return [];
		}
	} catch (error) {
		console.error("Error fetching items:", error);
		return [];
	}
}
export async function getOutfits(collection) {
	try {
		console.log(`outfits/${uid}/${collection}/`);
		const snapshot = await get(ref(database, `outfits/${uid}/${collection}/`));
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort(
				(a, b) => new Date(a.addDate) - new Date(b.addDate)
			);
			console.log("Outfits:", itemsArray);
			return itemsArray;
		} else {
			console.log("No items found");
			return [];
		}
	} catch (error) {
		console.error("Error fetching items:", error);
		return [];
	}
}
export const temperatureRanges = [
	"less than -12",
	"-12 to -9",
	"-9 to -6",
	"-6 to -3",
	"-3 to 0",
	"0 to 3",
	"3 to 6",
	"6 to 9",
	"9 to 12",
	"12 to 15",
	"15 to 18",
	"18 to 22",
	"22 to 25",
	"25 to 29",
	"29 to 32",

	"more than 32",
];
export const weatherConditions = {
	"Clear sky": [0, 1],
	Drizzle: [51, 53, 55],
	Rain: [61, 63, 65],
	"Snow fall": [71, 73, 75, 77],
	"Rain showers": [80, 81, 82],
	"Snow showers": [85, 86],
	Thunderstorm: [95],
	"Thunderstorm with hail": [96, 99],
};
