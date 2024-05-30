import Header from "../components/Header";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

import { getClothes, } from "../utils/DBManipulations";
import "firebase/database";

import { useState, useEffect } from "react";

//import { weatherApiKey } from "../weatherApiKey";
import { fetchForecastData } from "../utils/WeatherApi";
import { auth, updateUser } from "../utils/AuthManipulations";
import OutfitGeneration from "../components/OutfitGeneration";
import NoClothes from "../components/NoClothes";
import WarningAlert from "../components/WarningAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const closet = process.env.PUBLIC_URL + '/images/wardrobe.png';

function GenerationMain() {
	const [clothes, setClothes] = useState([]);
	const [weatherData, setWeatherData] = useState(null);
	const [user, setUser] = useState(null);
	useEffect(() => {
		updateUser(setUser);
	}, []);
	
	useEffect(() => {
	//console.log(auth);
		if (user) {
			getClothes().then((data) => {
		//console.log("clothes fetched", data);

				setClothes(data);
			
			});
		}
	}, [user]);
	useEffect(() => {
		fetchForecastData(setWeatherData);
		
	}, []);


	return (
		<main className="page-main">
			<div className="generate-outfit-container">
				<div className="closet-img-container">
					<img src={closet} className="closet" alt="closet" />
				</div>

				<section className="generate-outfit-area">
					{weatherData &&
						weatherData.condition.text &&
						weatherData.apparentTemperature && (
							<>
							<h2 className="page-sub-title">
								{weatherData.condition.text}. Feels like{" "}
								{weatherData.apparentTemperature.toFixed(1)} C°
							</h2>
							<div className="warning-messages-container">
								{
									((weatherData.condition.code >=51 && weatherData.condition.code <= 67) || (weatherData.condition.code >= 80 && weatherData.condition.code <= 82)  || (weatherData.condition.code >= 95 && weatherData.condition.code <= 99)) &&
									<WarningAlert>
										<span className="icons">
											<FontAwesomeIcon icon="fa-solid fa-cloud-showers-heavy" /> <FontAwesomeIcon icon="fa-solid fa-umbrella" />
										</span> 
										You should take an umbrella! Rain probability is {weatherData.precipitationProbability}%</WarningAlert>
								}{	((weatherData.condition.code >= 71 && weatherData.condition.code <= 77) || (weatherData.condition.code >= 85 && weatherData.condition.code <= 86)) &&
									<WarningAlert>
										<span className="icons">
											<FontAwesomeIcon icon="fa-regular fa-snowflake" /> <FontAwesomeIcon icon="fa-solid fa-mitten" />
										</span> 
										Don't forget your hat and mittens, it's snowing!</WarningAlert>
								}{	(Math.round(weatherData.uvIndexMax) >= 4 && Math.round(weatherData.uvIndexMax) <= 6) &&
									<WarningAlert>
										<span className="icons">
											<FontAwesomeIcon icon="fa-solid fa-sun" /> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sunglasses" viewBox="0 0 16 16">
											<path d="M3 5a2 2 0 0 0-2 2v.5H.5a.5.5 0 0 0 0 1H1V9a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3 1 1 0 1 1 2 0 3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-.5h.5a.5.5 0 0 0 0-1H15V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-1.888 1.338A2 2 0 0 0 8 6a2 2 0 0 0-1.112.338A2 2 0 0 0 5 5zm0 1h.941c.264 0 .348.356.112.474l-.457.228a2 2 0 0 0-.894.894l-.228.457C2.356 8.289 2 8.205 2 7.94V7a1 1 0 0 1 1-1"/>
										</svg>
									  </span>
									 You'd better put something on your head and grab a pair of shades, it can be pretty sunny today!</WarningAlert>
								}{	(Math.round(weatherData.uvIndexMax) > 6) &&
									<WarningAlert>
										<span className="icons">
										<FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" /> <FontAwesomeIcon icon="fa-solid fa-sun" /> 
											
								  </span>
								   Don't go outside without covering your had and wearing suncream, the sun can be boiling today! It's better to stay indoors or seek shadow until the sun sets</WarningAlert>
								}
							</div>
							</>
						)}

					
						{clothes.length === 0 ? (
							<NoClothes>You haven't uploaded any clothing yet</NoClothes>
						) : weatherData && clothes.length > 0 ? (
							<OutfitGeneration weatherData={weatherData} clothes={clothes} />
						) : (
							<p>Please wait, weather data is fetching...</p>
						)}
					
				</section>
			</div>
		</main>
	);
}

export default function Generate() {
	
	return (
		<>
			<Nav />
			<GenerationMain />
			<Footer />
		</>
	);
}
