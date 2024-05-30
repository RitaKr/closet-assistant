import { useState } from "react";
import {
	removeClothing,
	updateClothing,
} from "../utils/DBManipulations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EditButton, DeleteButton } from "./Buttons";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


export default function ClothingFigure({ data, handleDialogOpen }) {
	const [inLaundry, setInLaundry] = useState(data.inLaundry);
	async function updateInLaundry(e) {
		setInLaundry(!inLaundry);
		data.inLaundry = !inLaundry;
	//console.log("new inLaundry: " + data.inLaundry);
		await updateClothing(data);
	}
	async function handleDelete(e) {
		if (window.confirm("Are you sure you want to delete " + data.name + "? All your outfits that contained this item will be deleted as well")) {
			await removeClothing(data.id, data.imageName);
		}
	}
	function handleEdit(e) {
		handleDialogOpen();
	}
	
	return (
		<figure className={"clothing-card " + (inLaundry && " inLaundry")}>
			{handleDialogOpen && (
				<>
					<EditButton handleEdit={handleEdit} />
					<DeleteButton handleDelete={handleDelete} />
				</>
			)}

			<LazyLoadImage
				src={data.imageUrl}
				effect="blur"
				className="clothing-card-image"
				alt={data.imageName}
			/>
			<figcaption className="clothing-card-info">
				<h2 className="card-title">{data.name}</h2>
				<h3 className="card-sub-title">{data.type}{data.color && (" | "+data.color)}</h3>

				{/* <h3>Temperature tags:</h3> */}
				<div className="tags-container">
					{data.temperatures.map((temp) => (
						<span key={temp} className="temperature-tag">
							<FontAwesomeIcon icon="fa-solid fa-temperature-quarter" />{temp} C°
						</span>
					))}
				</div>
				{data.styles && <div className="tags-container">
				{data.styles.map((st) => (
						<span key={st} className="style-tag"><FontAwesomeIcon icon="fa-solid fa-shirt" />{st}</span>
					))}
					
					</div>}
			</figcaption>

			<div className="laundry-check-container checkbox-container">
				{handleDialogOpen ? <>
				<input
					type="checkbox"
					name="inLaundry"
					checked={inLaundry}
					className="check-input"
					onChange={updateInLaundry}
				/>
				<label>is in laundry</label>
				</>
				:
				<label>{data.inLaundry ? "In laundry":"Not in laundry"}</label>}
			</div>
		</figure>
	);
}
