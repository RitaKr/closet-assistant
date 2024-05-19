import { useEffect, useState } from "react";

import { writeOutfit } from "../utils/DBManipulations";
import SuccessAlert from "../components/SuccessAlert";
import ErrorAlert from "../components/ErrorAlert";
import OutfitFigure from "../components/OutfitFigure";
import NoClothes from "./NoClothes";



export default function OutfitGeneration({ clothes, weatherData }) {
	const [outfitOptions, setOutfitOptions] = useState(null);
	const [outfit, setOutfit] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		filterClothesForWeather();
	}, [clothes]);

	useEffect(() => {
		console.log("outfitOptions", outfitOptions);
		if (outfitOptions) generateOutfit();
	}, [outfitOptions]);

	function parseTempRange(rangeStr) {
		//console.log(rangeStr)
		let range = rangeStr.split(" to ").map((t) => parseInt(t.trim()));
		if (range.length < 2) {
			if (rangeStr.indexOf("less than") >= 0) {
				range = [-100, parseInt(rangeStr.split(" ")[2].trim())];
			} else if (rangeStr.indexOf("more then") >= 0) {
				range = [parseInt(rangeStr.split(" ")[2].trim()), 100];
			}
		}
		//console.log(range);
		return range;
	}
	function fitsIntoRange(rangesArr, temp) {
		console.log(rangesArr, temp);

		return (
			rangesArr.filter((range) => temp >= range[0] && temp <= range[1]).length >
			0
		);
	}

	function filterClothesForWeather() {
		console.log("clothes:",clothes)
		const filteredClothes = {
			headwear: [],
			accessory: [],
			upper3: [],
			upper2: [],
			upper1: [],
			lower1: [],
			underwear1: [],
			underwear2: [],
			shoes: [],
		};
		filteredClothes.headwear = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			console.log(fitsIntoRange(tempRanges, weatherData.apparentTemperature));
			return (
				cl.type === "Headwear" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.accessory = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				(cl.type === "Scarf" || cl.type === "Other") &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.upper3 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				cl.type === "Coat/jacket" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.upper2 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				cl.type === "Hoodie/sweatshirt or sweater" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.upper1 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				(cl.type === "T-shirt/shirt" || cl.type === "Dress") &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.lower1 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				cl.type === "Pants/skirt" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.underwear1 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				(cl.type === "Underpants" || cl.type === "Socks") &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.underwear2 = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				cl.type === "Underpants" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		filteredClothes.shoes = clothes.filter((cl) => {
			const tempRanges = cl.temperatures.map(parseTempRange);
			return (
				cl.type === "Shoes" &&
				!cl.inLaundry &&
				fitsIntoRange(tempRanges, weatherData.apparentTemperature)
			);
		});
		console.log("matches for the weather: ", filteredClothes);
		setOutfitOptions(filteredClothes);
		//console.log("setOutfitOptions: ", outfitOptions)
	}

	function randomItem(arr) {
		const i = Math.floor(Math.random() * arr.length);
		return arr[i];
	}
	async function generateOutfit() {
		console.log(outfitOptions);
		const outfit = await Object.values(outfitOptions).reduce(
			(acc, optionsArr) => {
				console.log(acc, optionsArr);
				let random = randomItem(optionsArr);
				console.log("random:", random);
				if (typeof random !== "undefined") {
					while (acc.includes(random) && outfitOptions.length > 1)
						random = randomItem(optionsArr);
					if (!acc.includes(random)) acc.push(random);
				}
				return acc;
			},
			[]
		);
		console.log(outfit);
		setOutfit(outfit);
	}
	function addToCollection(e) {
		console.log(e.target.dataset.collection, outfit);
		try{
			writeOutfit(e.target.dataset.collection, outfit);
			setError(false);
			setTimeout(()=>setError(null), 5000);
		} catch (error) {
			setError(true);
			setTimeout(()=>setError(null), 5000);
		}
		
		
	}
	return (
		<>
			{outfit &&
				(outfit.length > 0 ? (
					<div className="result-container">
						<h1 className="page-title">Here's your outfit for today</h1>
						<OutfitFigure clothes={outfit} />
						<div className="action-panel">
							<button className="button" onClick={generateOutfit}>
								Regenerate
							</button>
							<button className="button add-to-collection-btn" disabled={!outfit}>
								<span>Add to collection</span>
							<ul className="sub-menu">
								<li className="add-to-collection-sub-btn" data-collection="Winter" onClick={addToCollection}>Winter</li>
								<li className="add-to-collection-sub-btn" data-collection="Spring" onClick={addToCollection}>Spring</li>
								<li className="add-to-collection-sub-btn" data-collection="Summer" onClick={addToCollection}>Summer</li>
								<li className="add-to-collection-sub-btn" data-collection="Autumn" onClick={addToCollection}>Autumn</li>
							</ul>
							</button>
						</div>
						{error===false ? <SuccessAlert>Outfit added to collection</SuccessAlert>
						: error===true ?
						<ErrorAlert>Error occurred while adding outfit to collection</ErrorAlert>
						:""
						}
					</div>
				) : (
					<NoClothes>
						No clothes matching current weather found. Consider uploading some
					</NoClothes>
				))}
		</>
	);
}