import Header from "../components/Header";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import closet from "../assets/images/closet.png";

import { getClothes } from "../utils/DBManipulations";
import "firebase/database";

import { useState, useEffect } from "react";

//import { weatherApiKey } from "../weatherApiKey";
import { fetchWeatherApi } from "openmeteo";
import { auth, updateUser } from "../utils/AuthManipulations";
import OutfitGeneration from "../components/OutfitGeneration";
import NoClothes from "../components/NoClothes";

function HomepageMain() {
	const [clothes, setClothes] = useState([]);
	const [weatherData, setWeatherData] = useState(null);
	const [user, setUser] = useState(null);
	useEffect(() => {
		updateUser(setUser);
	}, []);
	
	useEffect(() => {
		console.log(auth);
		if (user) {
			getClothes().then((data) => {
				console.log("clothes fetched", data);

				setClothes(data);
			
			});
		}
	}, [user]);
	useEffect(() => {
		fetchForecastData();
		
	}, []);

	//function that fetches data
	async function fetchForecastData() {
		
		const currentTime = new Date();
		const params = {
			latitude: 50.4547,
			longitude: 30.5238,
			hourly: [
				"apparent_temperature",
				"precipitation_probability",
				"precipitation",
				"snowfall",
				"weather_code",
				"wind_speed_10m",
			],
			forecast_days: 1,
		};
		await navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			params.latitude = latitude;
			params.longitude = longitude;
		});
		const url = "https://api.open-meteo.com/v1/forecast";
		const responses = await fetchWeatherApi(url, params);

		// Process first location. Add a for-loop for multiple locations or weather models
		const response = responses[0];
		console.log("weather response: ",response);

		const hourly = response.hourly();
		
		const weatherData = {
			hourly: {
				apparentTemperature: hourly.variables(0).valuesArray(),
				precipitationProbability: hourly.variables(1).valuesArray(),
				precipitation: hourly.variables(2).valuesArray(),
				snowfall: hourly.variables(3).valuesArray(),
				weatherCode: hourly.variables(4).valuesArray(),
				windSpeed10m: hourly.variables(5).valuesArray(),
			},
		};
		console.log("hourly weatherData: ",weatherData);
		
		const thisHour = currentTime.getHours();
		console.log(thisHour)
		const weatherConditions = {
			0: "Clear sky",
			1: "Mainly clear",
			2: "Partly cloudy",
			3: "Overcast",
			45: "Fog",
			48: "Depositing rime fog",
			51: "Drizzle: light intensity",
			53: "Drizzle: moderate intensity",
			55: "Drizzle: dense intensity",
			56: "Freezing Drizzle: light intensity",
			57: "Freezing Drizzle: dense intensity",
			61: "Rain: slight intensity",
			63: "Rain: moderate intensity",
			65: "Rain: heavy intensity",
			66: "Freezing Rain: light intensity",
			67: "Freezing Rain: heavy intensity",
			71: "Snow fall: slight intensity",
			73: "Snow fall: moderate intensity",
			75: "Snow fall: heavy intensity",
			77: "Snow grains",
			80: "Rain showers: slight",
			81: "Rain showers: moderate",
			82: "Rain showers: violent",
			85: "Snow showers slight",
			86: "Snow showers heavy",
			95: "Thunderstorm: slight or moderate",
			96: "Thunderstorm with slight hail",
			99: "Thunderstorm with heavy hail",
		};
		
		const thisHourForecast = {
			apparentTemperature: weatherData.hourly.apparentTemperature[thisHour],
			precipitationProbability:
				weatherData.hourly.precipitationProbability[thisHour],
			precipitation: weatherData.hourly.precipitation[thisHour],
			snowfall: weatherData.hourly.snowfall[thisHour],
			condition: {
				code: weatherData.hourly.weatherCode[thisHour],
				text: weatherConditions[weatherData.hourly.weatherCode[thisHour]],
			},

			windSpeed10m: weatherData.hourly.windSpeed10m[thisHour],
		};
		setWeatherData(thisHourForecast);
		console.log(thisHourForecast);
	}

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
							<h2 className="page-sub-title">
								{weatherData.condition.text}. Feels like{" "}
								{weatherData.apparentTemperature.toFixed(1)} C°
							</h2>
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

export default function Homepage() {
	
	return (
		<>
			<Header />
			<Nav />
			<HomepageMain />
			<Footer />
		</>
	);
}
