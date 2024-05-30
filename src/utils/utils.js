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


const styles = ["Casual", "Business casual", "Classic", "Official", "Sporty", "Soft", "Preppy", "Edgy", "Bohemian", "Glam", "Vintage", "Old money", "Goth",  "Punk",  "Artie",  "Dacha"];

const colors = {
	beige: "#e0c4b2",
	black: "#39373b",
	blue: "#2f5e97",
	brown: "#574039",
	"dark green": "#176352",
	gold: "#dcba60",
	green: "#359369",
	greige: "#a4b39f",
	grey: "#8c8c8c",
	"hot pink": "#c73d77",
	lavender: "#6a6378",
	"light blue": "#99b1cb",
	"light brown": "#ac8a64",
	"light green": "#aec98e",
	"olive green": "#7f8765",
	"light grey": "#bcb8b8",
	"light pink": "#e6c1be",
	magenta: "#a7346e",
	maroon: "#6c2135",
	mauve: "#ac6075",
	"navy blue": "#2b2e43",
	orange: "#e2855e",
	pink: "#e3768c",
	plum: "#58304e",
	purple: "#875287",
	red: "#ae2935",
	teal: "#426972",
	turquoise: "#38afcd",
	violet: "#473854",
	white: "#f4f5f0",
	yellow: "#ebd07f",
	skin: "#bd9769",
};

const temperatureRanges = [
	"less than -12",
	"-12 to -9",
	"-9 to -6",
	"-6 to -3",
	"-3 to 0",
	"0 to 3",
	"3 to 6",
	"6 to 9",
	"9 to 12",
	"12 to 15",
	"15 to 18",
	"18 to 22",
	"22 to 25",
	"25 to 29",
	"29 to 32",

	"more than 32",
];
const weatherConditionsShortlist = {
	"Clear sky": [0, 1],
	Drizzle: [51, 53, 55],
	Rain: [61, 63, 65],
	"Snow fall": [71, 73, 75, 77],
	"Rain showers": [80, 81, 82],
	"Snow showers": [85, 86],
	Thunderstorm: [95],
	"Thunderstorm with hail": [96, 99],
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function formatDate(date) {
    const day = date.getDay();
    return `${dayNames[day]} ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}
function createSlug(name) {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s/g, "-")
		.replace(/[^a-zA-Z0-9/-]/g, "");
}

function validCollectionName(name, collections) {
	const slug = createSlug(name);
	const collectionNames = collections.map((col) => col.slug);

	if (!name || collectionNames.includes(slug) || name.trim() === "") {
		return false;
	}
	return true;
}

export {weatherConditions, styles, colors, weatherConditionsShortlist, temperatureRanges, formatDate, validCollectionName, createSlug}