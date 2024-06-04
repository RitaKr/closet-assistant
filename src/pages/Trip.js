import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getClothes } from "../utils/db";
import "firebase/database";

import {
	fetchForecastData,
	filterClothesForWeather,
	randomItem,
} from "../utils/WeatherApi";
import { updateUser } from "../utils/auth";
import OutfitFigure from "../components/OutfitFigure";
import Required from "../components/Required";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const luggageOptions = [
	{
		type: "Backpack",
		capacity: {
			shoes: 1,
			upper1: 2,
			upper2: 1,
			lower: 2,
			other: 1,
		},
		description: "Ideal for short trips.",
	},
	{
		type: "Carry-On Suitcase",
		capacity: {
			shoes: 1,
			upper1: 3,
			upper2: 2,
			lower: 2,
			other: 2,
		},
		description: "Ideal for weekend trips or 3-4 days trips.",
	},
	{
		type: "Medium Suitcase",
		capacity: {
			shoes: 2,
			upper1: 5,
			upper2: 3,
			lower: 3,
			other: 3,
		},
		description: "Ideal for week-long trips or family visits.",
	},
	{
		type: "Large Suitcase",
		capacity: {
			shoes: 3,
			upper1: 6,
			upper2: 3,
			lower: 4,
			other: 4,
		},
		description: "Ideal for long trips or vacations.",
	},
];

const MapComponent = ({ location, setLocation }) => {
	const MapEvents = () => {
		useMapEvents({
			click: (e) => {
				setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
			},
		});
		return null;
	};

	const MapZoomHandler = ({ location }) => {
		const map = useMap();
		useEffect(() => {
			map.setView([location.lat, location.lng], 5);
		}, [location, map]);
		return null;
	};

	return (
		<MapContainer
			center={[location.lat, location.lng]}
			zoom={5}
			style={{ height: "400px", width: "100%" }}
		>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			/>
			{location && <Marker position={[location.lat, location.lng]} />}
			<MapEvents />
			<MapZoomHandler location={location} />
		</MapContainer>
	);
};

export default function Trip() {
	const [clothes, setClothes] = useState([]);
	const [packedClothes, setPackedClothes] = useState(null);
	const [outfitOptions, setOutfitOptions] = useState(null);
	const [weatherData, setWeatherData] = useState(null);
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [form, setForm] = useState({
		location: null,
		start: "",
		end: "",
		luggage: luggageOptions[0],
	});
	const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
	const [initialLoad, setInitialLoad] = useState(true);
	const [temperatures, setTemperatures] = useState(null);

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				setLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
				setForm({
					...form,
					location: location,
				});
				setInitialLoad(false);
			});
		}
	}, []);

	useEffect(() => {
		setForm({
			...form,
			location: location,
		});
	}, [location]);

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

	function handleSubmit(e) {
		e.preventDefault();
		fetchForecastData(setWeatherData, form.location, form.start, form.end);
	}

	function getTemp(day) {
		if (weatherData) {
			return {
				evening: weatherData.hourly.apparentTemperature[day * 24 + 21],
				morning: weatherData.hourly.apparentTemperature[day * 24 + 8],
			};
		} else {
			console.error("no weather data");
		}
	}

	useEffect(() => {
		if (weatherData && weatherData.daily) {
			const maxTemps = weatherData.daily.map(
				(forecast) => forecast.apparentTemperatureMax
			);
			const maxTempsAverage =
				maxTemps.reduce((acc, t) => acc + t, 0) / maxTemps.length;

			const minTemps = weatherData.daily.map((_, i) => getTemp(i).evening);
			const minTempsAverage =
				minTemps.reduce((acc, t) => acc + t, 0) / minTemps.length;

			const maxTemp = Math.max(...maxTemps);
			const minTemp = Math.min(...minTemps);
			setTemperatures({
				min: minTemp,
				max: maxTemp,
				minAverage: minTempsAverage,
				maxAverage: maxTempsAverage,
			});

			let options = filterClothesForWeather(clothes, minTempsAverage);
			let maxTempAverageOptions = filterClothesForWeather(
				clothes,
				maxTempsAverage
			);
			Object.keys(options).forEach((key) => {
				if (maxTempAverageOptions[key]) {
					options[key] = Array.from(
						new Set(options[key].concat(maxTempAverageOptions[key]))
					);
				}
			});

			setOutfitOptions({
				max: filterClothesForWeather(clothes, maxTemp),
				min: filterClothesForWeather(clothes, minTemp),
				middle: options,
			});
		}
	}, [clothes, weatherData]);

	function capacityLeft(capacityCopy, type) {
		if (type) {
			let left = false;
			switch (type) {
				case "upper1":
					if (capacityCopy.upper1 > 0) {
						return true;
					}
					break;
				case "lower1":
					if (capacityCopy.lower > 0) {
						return true;
					}
					break;
				case "upper2":
					if (capacityCopy.upper2 > 0) {
						return true;
					}
					break;
				case "upper3":
					if (capacityCopy.upper2 > 0) {
						return true;
					}
					break;
				case "shoes":
					if (capacityCopy.shoes > 0) {
						return true;
					}
					break;
				default:
					if (capacityCopy.other > 0) {
						return true;
					}
					break;
			}
			if (!left && onlyOtherLeft(capacityCopy) && capacityCopy.other > 0) {
				return true;
			}
			return left;
		} else {
			return Object.values(capacityCopy).some((c) => c > 0);
		}
	}
	function capacityDecrease(capacityCopy, type) {
		switch (type) {
			case "upper1":
				if (capacityCopy.upper1 > 0) {
					capacityCopy.upper1--;
				}
				break;
			case "lower1":
				if (capacityCopy.lower > 0) {
					capacityCopy.lower--;
				}
				break;
			case "upper2":
				if (capacityCopy.upper2 > 0) {
					capacityCopy.upper2--;
				}
				break;
			case "upper3":
				if (capacityCopy.upper2 > 0) {
					capacityCopy.upper2--;
				}
				break;
			case "shoes":
				if (capacityCopy.shoes > 0) {
					capacityCopy.shoes--;
				}
				break;
			default:
				if (capacityCopy.other > 0) {
					capacityCopy.other--;
				}
				break;
		}
	}
	function onlyOtherLeft(capacityCopy) {
		return Object.keys(capacityCopy).every((key) => {
			return (
				key === "other" || capacityCopy[key] <= 0 || isNaN(capacityCopy[key])
			);
		});
	}
	function balance(capacityCopy, options, type, packed) {
		if (
			type === "lower1" &&
			(options.length < capacityCopy.lower ||
				options.every((o) => packed.includes(o)))
		) {
			capacityCopy.lower--;
			return true;
		}
		if (
			type === "upper1" &&
			(options.length < capacityCopy.upper1 ||
				options.every((o) => packed.includes(o)))
		) {
			capacityCopy.upper1--;
			return true;
		}
		if (
			(type === "upper2" || type === "upper3") &&
			((outfitOptions.middle["upper2"] < capacityCopy.upper2 &&
				outfitOptions.middle["upper3"] < capacityCopy.upper2) ||
				(outfitOptions.middle["upper2"].every((o) => packed.includes(o)) &&
					outfitOptions.middle["upper3"].every((o) => packed.includes(o))))
		) {
			capacityCopy.upper2--;
			return true;
		}

		if (
			type === "shoes" &&
			(options.length < capacityCopy.shoes ||
				options.every((o) => packed.includes(o)))
		) {
			capacityCopy.shoes--;
			return true;
		}
	}

	function chooseClothes() {
		if (outfitOptions) {
			const packed = [];
			const capacityCopy = { ...form.luggage.capacity };
			Object.keys(outfitOptions.max).forEach((type) => {
				let cl = randomItem(outfitOptions.max[type]);
				while (cl && packed.includes(cl)) {
					cl = randomItem(outfitOptions.max[type]);

					let allItemsPacked = outfitOptions.max[type].every((opt) =>
						packed.includes(opt)
					);
					if (allItemsPacked) {
						break;
					}
				}

				if (cl && !packed.includes(cl) && capacityLeft(capacityCopy, type)) {
					packed.push(cl);
					capacityDecrease(capacityCopy, type);
					outfitOptions.min[type] = outfitOptions.min[type].filter(
						(item) => item.id !== cl.id
					);

					outfitOptions.middle[type] = outfitOptions.middle[type].filter(
						(item) => item.id !== cl.id
					);
				}
			});
			Object.keys(outfitOptions.min).forEach((type) => {
				let cl = randomItem(outfitOptions.min[type]);

				while (cl && packed.includes(cl)) {
					cl = randomItem(outfitOptions.min[type]);
					let allItemsPacked = outfitOptions.min[type].every((opt) =>
						packed.includes(opt)
					);
					if (allItemsPacked) {
						break;
					}
				}
				if (cl && !packed.includes(cl) && capacityLeft(capacityCopy, type)) {
					packed.push(cl);
					capacityDecrease(capacityCopy, type);
					outfitOptions.middle[type] = outfitOptions.middle[type].filter(
						(item) => item.id !== cl.id
					);
				}
			});

			while (
				capacityLeft(capacityCopy) &&
				Object.values(outfitOptions.middle).some(
					(clo) => clo.length > 0 && clo.some((c) => !packed.includes(c))
				)
			) {
				if (Object.values(capacityCopy).reduce((acc, cap) => acc + cap, 0) <= 0)
					break;
				Object.keys(outfitOptions.middle)
					.sort(
						(a, b) =>
							outfitOptions.middle[a].length - outfitOptions.middle[b].length
					)
					.forEach((type) => {
						if (
							!outfitOptions.middle[type].every((opt) => packed.includes(opt))
						) {
							let cl = randomItem(outfitOptions.middle[type]);

							while (cl && packed.includes(cl)) {
								cl = randomItem(outfitOptions.middle[type]);
							}

							if (
								cl &&
								!packed.includes(cl) &&
								capacityLeft(capacityCopy, type)
							) {
								packed.push(cl);
								capacityDecrease(capacityCopy, type);
								outfitOptions.middle[type] = outfitOptions.middle[type].filter(
									(item) => item.id !== cl.id
								);
							}
						}
						balance(capacityCopy, outfitOptions.middle[type], type, packed);
					});
			}
			setPackedClothes(packed.sort((a, b) => a.type.localeCompare(b.type)));
		}
	}

	useEffect(() => {
		chooseClothes();
	}, [outfitOptions]);

	const handleLuggageChange = (e) => {
		const selectedType = e.target.value;
		const luggage = luggageOptions.find((l) => l.type === selectedType);
		setForm({ ...form, luggage: luggage });
	};
	let maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + 15);
	return (
		<>
			<Nav />
			<main className="page-main">
				<h1 className="page-title">Trip clothes packer</h1>
				<h2 className="page-sub-title">Let's pack your suitcase together!</h2>

				<form
					action=""
					method="POST"
					onSubmit={handleSubmit}
					className="add-collection-form"
				>
					<div className="row">
						<div className="col col-12">
							<h4>
								Choose your trip destination
								<Required />
							</h4>
							<MapComponent location={location} setLocation={setLocation} />
						</div>
					</div>
					<div className="row">
						<h4>
							Choose your trip dates <Required />{" "}
							<span className="form-info">**</span>
						</h4>
						<div className="col col-sm-6 col-12">
							<label htmlFor="startDate">Start date: </label>
							<input
								type="date"
								name="startDate"
								id="startDate"
								className="form-input text-lighter"
								value={form.start}
								min={new Date().toISOString().slice(0, 10)}
								max={form.end ? form.end : maxDate.toISOString().slice(0, 10)}
								onChange={(e) => setForm({ ...form, start: e.target.value })}
								required
							/>
						</div>
						<div className="col col-sm-6 col-12">
							<label htmlFor="endDate" className="form-label">
								Return date:
							</label>

							<input
								type="date"
								name="endDate"
								id="endDate"
								className="form-input text-lighter"
								value={form.end}
								min={form.start}
								max={maxDate.toISOString().slice(0, 10)}
								onChange={(e) => setForm({ ...form, end: e.target.value })}
								required
							/>
						</div>
					</div>
					<div className="row">
						<div className="col col-12">
							<label htmlFor="capacity" className="form-label">
								<h4>
									Choose your luggage capacity: <Required />
								</h4>
							</label>

							<select
								name="capacity"
								id="capacity"
								onChange={handleLuggageChange}
								defaultValue={form.luggage}
								className="form-input text-lighter form-control"
							>
								{luggageOptions.map((option) => (
									<option key={option.type} value={option.type}>
										{option.type} - {option.description}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<p className="red">* - Required fields</p>
							<p className="form-info">
								** - The furthest we can fetch weather forecast is 15 days from
								today, all dates later than that are not allowed
							</p>
						</div>
					</div>
					<div className="row">
						<button className="button" disabled={!form.start || !form.end}>
							Pack clothes for this trip
						</button>
					</div>
				</form>

				<div className="wrapper">
					{packedClothes ? (
						temperatures &&
						(!error ? (
							<div className="trip-weather-info">
								<p>
									Average mid-day temperature:{" "}
									{temperatures.maxAverage.toFixed(1)} C°
								</p>
								<p>
									The highest mid-day temperature: {temperatures.max.toFixed(1)}{" "}
									C°
								</p>
								<p>
									Average evening temperature:{" "}
									{temperatures.minAverage.toFixed(1)} C°
								</p>
								<p>
									The lowest evening temperature: {temperatures.min.toFixed(1)}{" "}
									C°
								</p>
								<h2>Clothes suggestions for your trip:</h2>
								<OutfitFigure clothes={packedClothes} />
							</div>
						) : (
							<div className="outfits-container">
								<p>Oops, something went wrong</p>
							</div>
						))
					) : (
						<div className="outfits-container">
							<p>Here will be your clothes</p>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</>
	);
}
