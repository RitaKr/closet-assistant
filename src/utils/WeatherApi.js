import { fetchWeatherApi } from "openmeteo";
import { weatherConditions } from "./utils";

const currentTime = new Date();
export const thisHour = currentTime.getHours();
export const hours = Array.from(
	{ length: 24 - thisHour },
	(_, i) => 1 + thisHour + i
);

async function fetchForecastData(
	setWeatherData,
	coordinates,
	start_date,
	end_date
) {
	const params = {
		latitude: coordinates ? coordinates.lat : 50.4547,
		longitude: coordinates ? coordinates.lng : 30.5238,
		hourly: [
			"apparent_temperature",
			"precipitation_probability",
			"precipitation",
			"snowfall",
			"weather_code",
			"wind_speed_10m",
		],
		daily: [
			"uv_index_max",
			"apparent_temperature_max",
			"apparent_temperature_min",
		],
	};
	if (start_date && end_date) {
		params.start_date = start_date;
		params.end_date = end_date;
	} else {
		params.forecast_days = 14;
	}

	if (!coordinates) {
		await navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			params.latitude = latitude;
			params.longitude = longitude;
		});
	}
	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params);

	// Process first location. Add a for-loop for multiple locations or weather models
	const response = responses[0];

	const hourly = response.hourly();
	const daily = response.daily();

	const weatherData = {
		hourly: {
			apparentTemperature: Array.from(hourly.variables(0).valuesArray()),
			precipitationProbability: Array.from(hourly.variables(1).valuesArray()),
			precipitation: Array.from(hourly.variables(2).valuesArray()),
			snowfall: Array.from(hourly.variables(3).valuesArray()),
			windSpeed10m: Array.from(hourly.variables(5).valuesArray()),
			condition: Array.from(hourly.variables(4).valuesArray()).map((c) => {
				return { code: c, text: weatherConditions[c] };
			}),
		},
		current: {
			apparentTemperature: Array.from(hourly.variables(0).valuesArray())[
				thisHour
			],
			precipitationProbability: Array.from(hourly.variables(1).valuesArray())[
				thisHour
			],
			precipitation: Array.from(hourly.variables(2).valuesArray())[thisHour],
			snowfall: Array.from(hourly.variables(3).valuesArray())[thisHour],
			windSpeed10m: Array.from(hourly.variables(5).valuesArray())[thisHour],
			condition: {
				code: Array.from(hourly.variables(4).valuesArray())[thisHour],
				text: weatherConditions[
					Array.from(hourly.variables(4).valuesArray())[thisHour]
				],
			},
		},
		daily: Array.from(daily.variables(0).valuesArray()).map(
			(uvIndexMax, index) => {
				return {
					uvIndexMax: uvIndexMax,
					apparentTemperatureMax: Array.from(daily.variables(1).valuesArray())[
						index
					],
					apparentTemperatureMin: Array.from(daily.variables(2).valuesArray())[
						index
					],
				};
			}
		),
		apparentTemperatureMax: Array.from(daily.variables(1).valuesArray())[0],
		apparentTemperatureMin: Array.from(daily.variables(2).valuesArray())[0],
		uvIndexMax: Array.from(daily.variables(0).valuesArray())[0],
	};

	setWeatherData(weatherData);
}

export function parseTempRange(rangeStr) {
	let range = rangeStr.split(" to ").map((t) => parseInt(t.trim()));
	if (range.length < 2) {
		if (rangeStr.indexOf("less than") >= 0) {
			range = [-100, parseInt(rangeStr.split(" ")[2].trim())];
		} else if (rangeStr.indexOf("more than") >= 0) {
			range = [parseInt(rangeStr.split(" ")[2].trim()), 100];
		}
	}
	return range;
}
function fitsIntoRange(rangesArr, temp) {
	return (
		rangesArr.filter((range) => temp >= range[0] && temp <= range[1]).length > 0
	);
}

function filterClothesForWeather(
	clothes,
	temperature,
	color,
	style,
	includeWhite,
	includeBlack
) {
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
		//console.log(fitsIntoRange(tempRanges, temperature));
		return (
			cl.type === "Headwear" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.accessory = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			(cl.type === "Scarf" || cl.type === "Other") &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.upper3 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			cl.type === "Coat/jacket" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.upper2 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			cl.type === "Hoodie/sweatshirt or sweater" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.upper1 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			(cl.type === "T-shirt/shirt" || cl.type === "Dress") &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.lower1 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			cl.type === "Pants/skirt" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.underwear1 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			(cl.type === "Underpants" || cl.type === "Socks") &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.underwear2 = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			cl.type === "Underpants" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});
	filteredClothes.shoes = clothes.filter((cl) => {
		const tempRanges = cl.temperatures.map(parseTempRange);
		return (
			cl.type === "Shoes" &&
			!cl.inLaundry &&
			fitsIntoRange(tempRanges, temperature)
		);
	});

	//color themed generation
	if (color) {
		for (const key in filteredClothes) {
			filteredClothes[key] = filteredClothes[key].filter((cl) => {
				return (
					cl.color === color ||
					(includeWhite && cl.color === "white") ||
					(includeBlack && cl.color === "black")
				);
			});
		}
	}

	if (style) {
		for (const key in filteredClothes) {
			filteredClothes[key] = filteredClothes[key].filter((cl) => {
				return Array.isArray(cl.styles) && cl.styles.includes(style);
			});
		}
	}
	return filteredClothes;
}

function randomItem(arr) {
	const i = Math.floor(Math.random() * arr.length);
	return arr[i];
}
async function generateOutfit(outfitOptions, baseOutfit) {
	if (typeof baseOutfit !== "undefined" && baseOutfit !== null) {
		const newOutfit = baseOutfit.filter((clothing) =>
			Object.values(outfitOptions).some((options) => options.includes(clothing))
		);
		const updatedOutfitOptions = Object.keys(outfitOptions).reduce(
			(acc, key) => {
				const options = outfitOptions[key];
				if (!options.some((clothing) => newOutfit.includes(clothing))) {
					acc[key] = options;
				}
				return acc;
			},
			{}
		);
		return await Object.values(updatedOutfitOptions).reduce(
			(acc, optionsArr, i) => {
				let random = randomItem(optionsArr);
				if (typeof random !== "undefined") {
					while (acc.includes(random) && outfitOptions.length > 1)
						random = randomItem(optionsArr);
					if (!acc.includes(random)) acc.push(random);
				}
				return acc;
			},
			[...newOutfit]
		);
	} else {
		return await Object.values(outfitOptions).reduce((acc, optionsArr) => {
			let random = randomItem(optionsArr);
			if (typeof random !== "undefined") {
				while (acc.includes(random) && outfitOptions.length > 1)
					random = randomItem(optionsArr);
				if (!acc.includes(random)) acc.push(random);
			}
			return acc;
		}, []);
	}
}

export {
	fetchForecastData,
	generateOutfit,
	filterClothesForWeather,
	randomItem,
};
