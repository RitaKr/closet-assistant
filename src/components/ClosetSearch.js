import { useState } from "react";
import ClothingFigure from "./ClothingFigure";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { parseTempRange } from "../utils/WeatherApi";
export default function ClosetSearch({ clothes, searchRef }) {
	const [searchResult, setSearchResult] = useState(null);
	const [query, setQuery] = useState("");
	function findClothes(query) {
		query = query.trim();
		if (query) {
			setSearchResult(
				clothes.filter((cl) => {
					return (
						cl.name.toLowerCase().includes(query.toLowerCase()) ||
						cl.type.toLowerCase().includes(query.toLowerCase()) ||
						(cl.color &&
							cl.color.toLowerCase().includes(query.toLowerCase())) ||
						cl.temperatures.filter((t) => {
							return (
								t.includes(query.toLowerCase()) ||
								(parseTempRange(t)[0] <= parseInt(query) &&
									parseTempRange(t)[1] >= parseInt(query))
							);
						}).length > 0 ||
						(cl.styles &&
							cl.styles.filter((st) => {
								return st.toLowerCase().includes(query.toLowerCase());
							}).length > 0)
					);
				})
			);
		}
	}
	return (
		<div className="search-container" ref={searchRef} hidden>
			<form
				className="search-form"
				onSubmit={(e) => {
					e.preventDefault();
					findClothes(query);
				}}
			>
				<input
					type="search"
					className="search-input"
					name="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Enter search query (name/type/temperature/style/color)"
				/>
				<button type="submit" className="button search-btn">
					<FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
				</button>
				<button
					type="reset"
					className="button clear-btn"
					onClick={(e) => {
						setQuery("");
						setSearchResult(null);
					}}
				>
					Clear
				</button>
			</form>
			<div className="search-results">
				{searchResult &&
					(searchResult.length > 0 ? (
						searchResult.map((res) => (
							<ClothingFigure key={res.id} data={res} />
						))
					) : (
						<p className="no-matches-found">No matches found</p>
					))}
			</div>
		</div>
	);
}
