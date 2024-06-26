import { removeOutfit } from "../assets/DBManipulations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DeleteButton } from "./Buttons";
import { colors, formatDate } from "../assets/utils";

export default function OutfitFigure({
	outfit,
	clothes,
	id,
	collectionID,
}) {
	function handleDelete(e) {
		if (window.confirm("Are you sure you want to delete this outfit?")) {
			removeOutfit(id, collectionID);
		}
	}
	return (
		<figure className="outfit">
			{outfit && outfit.addDate && (
				<span className="tag outfit-date">
					Added: {new Date(outfit.addDate).toLocaleDateString()}{" "}
					{new Date(outfit.addDate).getHours()}:{new Date(outfit.addDate).getMinutes().toString().padStart(2, "0")}

				</span>
			)}
			{collectionID && <DeleteButton handleDelete={handleDelete} />}

			<div className="additional-tags">
			{outfit && outfit.color && (
					<span
						className="tag outfit-color"
						style={{ background: colors[outfit.color] }}
					>
						<FontAwesomeIcon icon="fa-solid fa-droplet" /> {outfit.color}
					</span>
				)}
				{outfit && outfit.style && (
					<span className="tag outfit-style">
						<FontAwesomeIcon icon="fa-solid fa-shirt" /> {outfit.style}
					</span>
				)}
				
			</div>
			{outfit && outfit.temperature && (<span className="tag outfit-temp">
				<FontAwesomeIcon icon="fa-solid fa-temperature-quarter" /> {outfit.temperature}
				{" "}C°
			</span>)}
			{clothes.length > 0 ? (
				clothes.map((cl) => (
					<img
						src={cl.imageUrl}
						className="outfit-item"
						alt={cl.name}
						key={cl.id}
					/>
				))
			) : (
				<p>No clothes found for this weather</p>
			)}
		</figure>
	);
}
