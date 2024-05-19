import { removeOutfit } from "../utils/DBManipulations";

export default function OutfitFigure({ clothes, id, collection }) {
	function handleDelete(e) {
		if (window.confirm("Are you sure you want to delete this outfit?")) {
			removeOutfit(id, collection);
		}
	}
	return (
		<div className="outfit">
			{collection && (
				<button
					className="icon-btn clothing-card-btn delete-btn"
					onClick={handleDelete}
				></button>
			)}

			{clothes.map((cl) => (
				<img
					src={cl.imageUrl}
					className="outfit-item"
					alt={cl.name}
					key={cl.id}
				/>
			))}
		</div>
	);
}
