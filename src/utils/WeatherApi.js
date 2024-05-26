import { fetchWeatherApi } from "openmeteo";
import { weatherConditions } from "./utils";
async function fetchForecastData(setWeatherData) {
		
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
        daily: [
            "uv_index_max",
            "apparent_temperature_max",
            "apparent_temperature_min"
        ],
        forecast_days: 14,
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
//console.log("weather response: ",response);

    const hourly = response.hourly();
    const daily = response.daily();
    
    const weatherData = {
        hourly: {
            apparentTemperature: hourly.variables(0).valuesArray(),
            precipitationProbability: hourly.variables(1).valuesArray(),
            precipitation: hourly.variables(2).valuesArray(),
            snowfall: hourly.variables(3).valuesArray(),
            weatherCode: hourly.variables(4).valuesArray(),
            windSpeed10m: hourly.variables(5).valuesArray(),
        },
        daily: {
        uv_index_max: Array.from(daily.variables(0).valuesArray()),
        apparent_temperature_max: Array.from(daily.variables(1).valuesArray()),
        apparent_temperature_min: Array.from(daily.variables(2).valuesArray()),
        }
    };
    //console.log("weatherData.daily: ",weatherData.daily);
    
    const thisHour = currentTime.getHours();
    //console.log(thisHour)
    
    
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
        apparentTemperatureMax: weatherData.daily.apparent_temperature_max[0],
        apparentTemperatureMin: weatherData.daily.apparent_temperature_min[0],
        uvIndexMax: weatherData.daily.uv_index_max[0],
        forecast: weatherData.daily.apparent_temperature_max.map((item, i) => {
            return {
                "apparentTemperatureMax": weatherData.daily.apparent_temperature_max[i],
                "apparentTemperatureMin": weatherData.daily.apparent_temperature_min[i],
                "uvIndexMax": weatherData.daily.uv_index_max[i],
            }
})
    };
    
    setWeatherData(thisHourForecast);
    //console.log("weather forecast: ",thisHourForecast.forecast);
}

export function parseTempRange(rangeStr) {
    //console.log(rangeStr)
    let range = rangeStr.split(" to ").map((t) => parseInt(t.trim()));
    if (range.length < 2) {
        if (rangeStr.indexOf("less than") >= 0) {
            range = [-100, parseInt(rangeStr.split(" ")[2].trim())];
        } else if (rangeStr.indexOf("more than") >= 0) {
            range = [parseInt(rangeStr.split(" ")[2].trim()), 100];
        }
    }
    //console.log(range);
    return range;
}
function fitsIntoRange(rangesArr, temp) {
    //console.log(rangesArr, temp);

    return (
        rangesArr.filter((range) => temp >= range[0] && temp <= range[1]).length >
        0
    );
}

function filterClothesForWeather(clothes, temperature, color, style, includeWhite, includeBlack) {
    //console.log("clothes:", clothes);
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
//console.log("matches for the weather: ", filteredClothes);

    //color themed generation
    if (color) {
    //console.log("color:", color);
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
    //console.log("style:", style);
        for (const key in filteredClothes) {
            filteredClothes[key] = filteredClothes[key].filter((cl) => {
                return Array.isArray(cl.styles) && cl.styles.includes(style);
            });
        }
    }
//console.log("matches for the color: ", filteredClothes);
    return filteredClothes;
    

    //console.log("setOutfitOptions: ", outfitOptions)
}

function randomItem(arr) {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}
async function generateOutfit(outfitOptions) {
    //console.log(outfitOptions);
    return await Object.values(outfitOptions).reduce(
        (acc, optionsArr) => {
            //console.log(acc, optionsArr);
            let random = randomItem(optionsArr);
            //console.log("random:", random);
            if (typeof random !== "undefined") {
                while (acc.includes(random) && outfitOptions.length > 1)
                    random = randomItem(optionsArr);
                if (!acc.includes(random)) acc.push(random);
            }
            return acc;
        },
        []
    )
    
}

export {fetchForecastData, generateOutfit, filterClothesForWeather};