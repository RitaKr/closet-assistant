import { useState, useEffect } from "react";
import Header from "../components/Header";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getClothes } from "../utils/DBManipulations";
import "firebase/database";

//import { weatherApiKey } from "../weatherApiKey";
import {
	fetchForecastData,
	filterClothesForWeather,
	generateOutfit,
} from "../utils/WeatherApi";
import { auth, updateUser } from "../utils/AuthManipulations";
import OutfitGeneration from "../components/OutfitGeneration";
import NoClothes from "../components/NoClothes";
import WarningAlert from "../components/WarningAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OutfitFigure from "../components/OutfitFigure";
import Loader from "../components/Loader";
import { formatDate } from "../utils/utils";

export default function Calendar() {
	const [clothes, setClothes] = useState([]);
	const [outfits, setOutfits] = useState([]);
	const [outfitOptions, setOutfitOptions] = useState(null);
	const [weatherData, setWeatherData] = useState(null);
	const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

	useEffect(() => {
		updateUser(setUser);
	}, []);

	useEffect(() => {
		//console.log(auth);
		if (user) {
			getClothes().then((data) => {
				setClothes(data);
			});
		}
	}, [user]);

	useEffect(() => {
		fetchForecastData(setWeatherData);
	}, []);

	useEffect(() => {
		if (weatherData && weatherData.forecast)
			setOutfitOptions(
				weatherData.forecast.map((forecast) => ({
					min: filterClothesForWeather(
						clothes,
						forecast.apparentTemperatureMin
					),
					max: filterClothesForWeather(
						clothes,
						forecast.apparentTemperatureMax
					),
				}))
			);

		//updateMessages(outfitOptions);
	}, [clothes, weatherData]);

	useEffect(() => {
		//console.log("outfitOptions", outfitOptions);
		if (outfitOptions) handleGeneration();
	}, [outfitOptions]);

	async function handleGeneration() {
		try {
			const newOutfits = await Promise.all(
				outfitOptions.map(async (option) => {
					const minOutfit = await generateOutfit(option.min);
					const maxOutfit = await generateOutfit(option.max);
					return { min: minOutfit, max: maxOutfit };
				})
			);
			//console.log(newOutfits);
			setOutfits(newOutfits);
		} catch (e) {
			console.error(e);
            setError(e)
		}
	}

	return (
		<>
			<Nav />
			<main className="page-main">
				<h1 className="page-title">Outfits calendar for 2 weeks</h1>

				{outfits ? (
					!error ? (
						<div className="calendar-grid">
							{outfits.map((outfit, i) => {
								let date = new Date();
								date.setDate(date.getDate() + i);

								return (
									<div className="calendar-day" key={date}>
										<header>
											<h3>{formatDate(date)}</h3>
										</header>
										<div className="outfits">
											<div className="outfit-type">
												<h4>
													Day:{" "}
													{weatherData.forecast[
														i
													].apparentTemperatureMax.toFixed(1)}{" "}
													C°
												</h4>
												<OutfitFigure
													clothes={outfit.max}
													id={`outfit-${date}`}
													key={date}
												/>
											</div>
											<div className="outfit-type">
												<h4>
													Night:{" "}
													{weatherData.forecast[
														i
													].apparentTemperatureMin.toFixed(1)}{" "}
													C°
												</h4>
												<OutfitFigure
													clothes={outfit.min}
													id={`outfit-${date}`}
													key={date}
												/>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="outfits-container">
							<p>Oops, something went wrong</p>
						</div>
					)
				) : (
					<Loader />
				)}
			</main>
			<Footer />
		</>
	);
}