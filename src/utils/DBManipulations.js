import { getDatabase, set, ref, get, remove, update } from "firebase/database";
import { deleteImageFromStorage } from "./StorageManipulations";
import { app } from "../config";
import { v4 as uuidv4 } from "uuid";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { parseTempRange } from "./WeatherApi";
const auth = getAuth(app);
let uid = "";
onAuthStateChanged(auth, (user) => {
	if (user) {
		uid = user.uid;
		clothesRef = ref(database, `clothes/${uid}/`);
		ensureFavoritesCollection();
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
	styles: [],
	color: null,
};
export async function removeClothing(id, imageName) {
	try {
		remove(ref(database, `clothes/${uid}/${id}`));

		try {
			deleteImageFromStorage(imageName);
		} catch (e) {
			console.error("error deleting image " + imageName + ":", e);
		}

		//console.log("clothing ", id, "removed: ", clothesRef);
	} catch (error) {
		console.error("error deleting clothing " + imageName + ":", error);
	}
}
export function removeOutfit(id, collection) {
	remove(ref(database, `collections/${uid}/${collection}/outfits/${id}`));
	//console.log("outfit ", id, "removed: ", clothesRef);
}

export function removeCollection(id) {
	remove(ref(database, `collections/${uid}/${id}`));
	//console.log("outfit ", id, "removed: ", clothesRef);
}

export function writeCollection(collection) {
	try {
		const id = collection.id ? collection.id : uuidv4();
		//console.log("outfit id:", id);
		//console.log("outfit collection:", collection);
		//console.log("outfit data:", data);
		set(ref(database, `collections/${uid}/${id}/`), {
			outfits: collection.outfits ? collection.outfits : [],
			id: id,
			name: collection.name,
			slug: collection.slug,
			addDate: collection.addDate
				? collection.addDate
				: new Date().toISOString(),
		});
	} catch (e) {
		console.error("error adding collection " + collection + ":", e);
	}
}

export async function writeClothing(data) {
	try {
		const id = data.id && data.id !== "" ? data.id : uuidv4();
		//console.log(data.id);
		set(ref(database, `clothes/${uid}/${id}`), {
			name: data.name,
			temperatures: data.temperatures,
			//conditions: data.conditions,
			type: data.type,
			//layer: data.layer,
			inLaundry: data.inLaundry,
			imageUrl: data.imageUrl,
			imageName: data.imageName,
			id: id,
			color: data.color ? data.color : "",
			styles: data.styles ? data.styles : [],
			addDate: data.addDate ? data.addDate : new Date().toISOString(),
		});

		//removing clothing from all outfits that contained it
	} catch (error) {
		console.error("error adding clothing " + data + ":", error);
	}
}

export function writeOutfit(collection, data, temperature, style, color) {
	const id = uuidv4();
	//console.log("outfit id:", id);
	//console.log("outfit collection:", collection);
	//console.log("outfit data:", data);
	set(ref(database, `collections/${uid}/${collection}/outfits/${id}`), {
		clothes: data,
		style: style,
		color: color,
		id: id,
		temperature: temperature,
		addDate: data.addDate ? data.addDate : new Date().toISOString(),
	});
}

export async function updateClothing(data) {
	//console.log(data);
	await writeClothing(data);
	//console.log("clothing ", data.id, "updated to", data, ".", clothesRef);
}


export async function getClothes() {
	try {
		const snapshot = await get(clothesRef);
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort(
				(a, b) => new Date(b.addDate) - new Date(a.addDate)
			);
			//console.log("Clothing items:", itemsArray);
			// 	itemsArray.forEach((item) => {
			////console.log(item.temperatures.map(t=>parseTempRange(t))	)
			// })
			itemsArray.forEach((item) => {
				item.temperatures = item.temperatures.sort(
					(a, b) => parseTempRange(a)[0] - parseTempRange(b)[0]
				);
			});
			return itemsArray;
		} else {
			//console.log("No items found");
			return [];
		}
	} catch (error) {
		console.error("Error fetching items:", error);
		return [];
	}
}
export async function getCollections() {
	try {
		//console.log(`outfits/${uid}/${collection}/`);
		const snapshot = await get(ref(database, `collections/${uid}/`));
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort((a, b) => {
				if (a.name === "Favorites") return -1;
				if (b.name === "Favorites") return 1;
				return new Date(b.addDate) - new Date(a.addDate);
			});
			if (
				itemsArray.length === 1 &&
				!Object.keys(itemsArray[0]).includes("id")
			) {
				//console.log("wrong formatting")
				return Object.values(itemsArray[0]);
			}

			//console.log("Collections:", itemsArray);
			return itemsArray;
		} else {
			//console.log("No items found");
			return [];
		}
	} catch (error) {
		console.error("Error fetching collections:", error);
		return [];
	}
}

export async function ensureFavoritesCollection() {
	const collections = await getCollections();
	const hasFavorites = collections.some(
		(collection) => collection.slug === "favorites"
	);

	if (!hasFavorites) {
		writeCollection({
			name: "Favorites",
			slug: "favorites",
			outfits: [],
			addDate: new Date().toISOString(),
		});
	}
}

export function removeAllUserData(uid) {
//console.log("Removing user data, UID:", uid)
	remove(ref(database, `clothes/${uid}/`)).catch((error)=>console.error("Error removing clothes:",error));
	remove(ref(database, `collections/${uid}/`)).catch((error)=>console.error("Error removing collections:",error));
}
