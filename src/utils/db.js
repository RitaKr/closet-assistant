import { getDatabase, set, ref, get, remove, update } from "firebase/database";
import { deleteImageFromStorage } from "./storage";
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

		const collections = await getCollections().then((data) =>
			data.map((col) => col.id)
		);
		collections.forEach((colId) => {
			getOutfits(colId).then((outfits) => {
				outfits.forEach((outfit) => {
					const otherClothes = outfit.clothes.filter((cl) => cl.id !== id);
					if (outfit.clothes.length !== otherClothes.length) {
						update(
							ref(database, `collections/${uid}/${colId}/outfits/${outfit.id}`),
							{ clothes: otherClothes }
						);
					}

					if (otherClothes.length === 0) removeOutfit(outfit.id, colId);
				});
			});
		});
		try {
			deleteImageFromStorage(imageName);
		} catch (e) {
			console.error("error deleting image " + imageName + ":", e);
		}
	} catch (error) {
		console.error("error deleting clothing " + imageName + ":", error);
	}
}
export function removeOutfit(id, collection) {
	remove(ref(database, `collections/${uid}/${collection}/outfits/${id}`));
}

export function removeCollection(id) {
	remove(ref(database, `collections/${uid}/${id}`));
}

export async function writeClothing(data) {
	try {
		const id = data.id && data.id !== "" ? data.id : uuidv4();
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
		const collections = await getCollections().then((data) =>
			data.map((col) => col.id)
		);
		collections.forEach((colId) => {
			getOutfits(colId).then((outfits) => {
				outfits.forEach((outfit) => {
					const updatedClothes = outfit.clothes.map((cl) =>
						cl.id === data.id ? data : cl
					);
					if (
						JSON.stringify(outfit.clothes) !== JSON.stringify(updatedClothes)
					) {
						update(
							ref(database, `collections/${uid}/${colId}/outfits/${outfit.id}`),
							{ clothes: updatedClothes }
						);
					}
				});
			});
		});
	} catch (error) {
		console.error("error adding clothing " + data + ":", error);
	}
}

export function writeCollection(collection) {
	try {
		const id = collection.id ? collection.id : uuidv4();
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

export function writeOutfit(collection, data, temperature, style, color) {
	const id = uuidv4();
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
	await writeClothing(data);
}

export function updateCollection(data) {
	writeCollection(data);
}

export async function getClothes() {
	try {
		const snapshot = await get(clothesRef);
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort(
				(a, b) => new Date(b.addDate) - new Date(a.addDate)
			);
			itemsArray.forEach((item) => {
				item.temperatures = item.temperatures.sort(
					(a, b) => parseTempRange(a)[0] - parseTempRange(b)[0]
				);
			});
			return itemsArray;
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching items:", error);
		return [];
	}
}
export async function getCollections() {
	try {
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
				return Object.values(itemsArray[0]);
			}

			return itemsArray;
		} else {
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
export async function getOutfits(collection) {
	try {
		const snapshot = await get(
			ref(database, `collections/${uid}/${collection}/outfits/`)
		);
		if (snapshot.exists()) {
			let itemsArray = Object.values(snapshot.val()).sort(
				(a, b) => new Date(b.addDate) - new Date(a.addDate)
			);
			return itemsArray;
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching items:", error);
		return [];
	}
}

export function removeAllUserData(uid) {
	remove(ref(database, `clothes/${uid}/`)).catch((error) =>
		console.error("Error removing clothes:", error)
	);
	remove(ref(database, `collections/${uid}/`)).catch((error) =>
		console.error("Error removing collections:", error)
	);
}
