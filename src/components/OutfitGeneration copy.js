import { useEffect, useState, useRef } from "react";

import { writeOutfit, getCollections } from "../assets/DBManipulations";
import SuccessAlert from "../components/SuccessAlert";
import ErrorAlert from "../components/ErrorAlert";
import OutfitFigure from "../components/OutfitFigure";
import NoClothes from "./NoClothes";
import ColorsSelect from "./ColorsSelect";
import WarningAlert from "./WarningAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "./Select";
import { generateOutfit, filterClothesForWeather } from "../assets/WeatherApi";
import DetailsForm from "./DetailsForm";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fas);

export default function OutfitGeneration({ clothes, weatherData }) {
	const [outfitOptions, setOutfitOptions] = useState(null);
	const [outfit, setOutfit] = useState(null);
	const [error, setError] = useState(null);
	const [color, setColor] = useState(null);
	const [style, setStyle] = useState(null);
	const [includeWhite, setIncludeWhite] = useState(true);
	const [includeBlack, setIncludeBlack] = useState(true);
	const [collections, setCollections] = useState([]);
	const [messages, setMessages] = useState({
		"No t-shirt/shirt or dress found for the current weather. Consider uploading some": false,
		"No pants/shirts/skirt found for the current weather. Consider uploading some": false,
		"No shoes found for the current weather. Consider uploading some": false,
		"No coat/jacket found for the current weather. Consider uploading some": false,
		"No hoodie/sweatshirt or sweater found for the current weather. Consider uploading some": false,
		"No underwear found for the current weather. Consider uploading some": false,
	});
	useEffect(() => {
		getCollections().then((data) => {
			setCollections(data);
		});
	}, []);

	useEffect(() => {
		setOutfitOptions(
			filterClothesForWeather(
				clothes,
				weatherData.apparentTemperature,
				color,
				style,
				includeWhite,
				includeBlack
			)
		);
		//updateMessages(outfitOptions);
	}, [clothes, color, includeBlack, includeWhite, style]);

	useEffect(() => {
		//console.log("outfitOptions", outfitOptions);
		if (outfitOptions) handleGeneration();
	}, [outfitOptions]);

	useEffect(() => {
		//console.log("outfitOptions", outfitOptions);
		updateMessages();
	}, [outfit, includeBlack, includeWhite, style]);

	function handleGeneration() {
		generateOutfit(outfitOptions)
			.then((data) => {
				setOutfit(data);
			})
			.catch((e) => {
				console.error(e);
				setError(true);
				setTimeout(() => setError(null), 5000);
			});
	}

	function updateMessages() {
		if (outfit) {
			//console.log("outfit:",outfit);
			const missingShoes = !outfit.some((item) => item.type === "Shoes");
			const missingCoat =
				(!outfit.some(
					(item) =>
						item.type === "Coat/jacket" ||
						item.type === "Hoodie/sweatshirt or sweater"
				) &&
					weatherData.apparentTemperature <= 18) ||
				(!outfit.some((item) => item.type === "Coat/jacket") &&
					weatherData.apparentTemperature <= 8);
			const missingHoodie =
				!outfit.some((item) => item.type === "Hoodie/sweatshirt or sweater") &&
				weatherData.apparentTemperature <= 18;
			const missingTshirt = !outfit.some(
				(item) => item.type === "T-shirt/shirt"
			);
			const missingPants = !outfit.some(
				(item) =>
					item.type === "Pants/shirts/skirt" || item.type === "Pants/skirt"
			);
			const missingUnderwear =
				!outfit.some((item) => item.type === "Underwear") &&
				weatherData.apparentTemperature <= 5;
			//console.log("missingTshirt:",missingTshirt, ", missingPants:",missingPants, ", missingUnderwear:", missingUnderwear, ", missingShoes:",missingShoes, ", missingCoat:",missingCoat, ", missingHoodie:",missingHoodie);

			setMessages({
				"No t-shirt/shirt or dress found for the current weather. Consider uploading some":
					missingTshirt,
				"No pants/shirts/skirt found for the current weather. Consider uploading some":
					missingPants,
				"No shoes found for the current weather. Consider uploading some":
					missingShoes,
				"No coat/jacket found for the current weather. Consider uploading some":
					missingCoat,
				"No hoodie/sweatshirt or sweater found for the current weather. Consider uploading some":
					missingHoodie,
				"No underwear found for the current weather. Consider uploading some":
					missingUnderwear,
			});

			//console.log("messages", messages);
		}
	}

	function addToCollection(e) {
		//console.log(e.target.dataset.collection, outfit);
		try {
			writeOutfit(e.currentTarget.dataset.collection, outfit, weatherData.apparentTemperature.toFixed(1), style, color);
			setError(false);
			setTimeout(() => setError(null), 3000);
		} catch (error) {
			setError(true);
			setTimeout(() => setError(null), 3000);
		}
	}

	return (
		<>
			{outfit && collections && (
				<div className="result-container">
					<h1 className="page-title">Here's your outfit for today</h1>

					<DetailsForm title="Generation settings">
						<section className="generation-settings">
							<div className="setting-group">
								<h4>Color preferences</h4>
								<div>
									<label>Outfit color theme:</label>
									<ColorsSelect
										colorsArr={[...new Set(clothes.map((cl) => cl.color))]}
										selectedColor={color}
										handleChange={(e) => setColor(e.target.value)}
									/>
								</div>

								<div>
									<label>Include black?</label>
									<input
										type="checkbox"
										checked={includeBlack}
										onChange={() => setIncludeBlack(!includeBlack)}
									/>
								</div>
								<div>
									<label htmlFor="color">Include white?</label>
									<input
										type="checkbox"
										checked={includeWhite}
										onChange={() => setIncludeWhite(!includeWhite)}
									/>
								</div>
							</div>
							<div className="setting-group">
								<h4>Style preferences</h4>
								<div>
									<label htmlFor="style">Outfit style:</label>
									<Select
										id="style"
										options={[...new Set(clothes.flatMap((cl) => cl.styles))]}
										selected={style}
										handleChange={(e) => setStyle(e.target.value)}
									/>
								</div>
							</div>
						</section>
					</DetailsForm>

					{outfit.length > 0 ? (
						<>
							<OutfitFigure clothes={outfit} />
							<div className="action-panel">
								<button
									className="button"
									onClick={handleGeneration}
									title="Regenerate"
								>
									<FontAwesomeIcon icon={["fas", "rotate-right"]} />
								</button>
								<button
									className="button add-to-collection-btn"
									disabled={!outfit}
								>
									<span>Add to collection</span>
									<ul className="sub-menu">
										{collections.map((collection) => {
											return (
												<li
													className="add-to-collection-sub-btn"
													data-collection={collection.id}
													onClick={addToCollection}
													key={collection.id}
												>
													{collection.name === "Favorites" ? (
														<span className="info">
															{" "}
															<FontAwesomeIcon icon="fa-solid fa-star" />
															{" "}
															{collection.name}
														</span>
													) : (
														collection.name
													)}
												</li>
											);
										})}
									</ul>
								</button>
							</div>
							<div className="warning-messages-container">
								{Object.entries(messages)
									.filter(([m, incl]) => incl)
									.map(([m, incl], i) => {
										return (
											<WarningAlert key={i}>
												<span className="icons">
													<FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
												</span>
												{m}
											</WarningAlert>
										);
									})}
							</div>
							{error === false ? (
								<SuccessAlert>Outfit added to collection</SuccessAlert>
							) : error === true ? (
								<ErrorAlert>
									Error occurred while adding outfit to collection
								</ErrorAlert>
							) : (
								""
							)}
						</>
					) : (
						<NoClothes>
							No clothes matching current weather found. Consider uploading some
						</NoClothes>
					)}
				</div>
			)}
		</>
	);
}
