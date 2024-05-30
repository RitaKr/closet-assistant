import DialogWindow from "./Dialog";
import { useState, useEffect, useRef } from "react";

import {
	writeClothing,
	emptyForm,
} from "../utils/DBManipulations";
import {temperatureRanges, styles, colors} from "../utils/utils";
import { uploadToStorageAndDB } from "../utils/StorageManipulations";
import InvalidFeedback from "./InvalidFeedback";
import SuccessAlert from "./SuccessAlert";
import ErrorAlert from "./ErrorAlert";
import InfoAlert from "./InfoAlert";
import { imaggaApiSecret, imaggaApiKey } from "../config";
import ColorsSelect from "./ColorsSelect";
import Required from "./Required";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function AddClothingDialog({
	data,
	dialogOpen,
	handleDialogClose,
}) {
	const [clothing, setClothing] = useState(data.clothing);
	const [imageBlob, setImageBlob] = useState(null);
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [uploadingProgress, setUploadingProgress] = useState(null);
	const [error, setError] = useState(null);
	const [bgRemoveStatus, setBgRemoveStatus] = useState(null);
	const imageInput = useRef(null);

	function isTemperaturesValid() {
		return clothing.temperatures.length > 0;
	}
	function isTypeValid() {
		return clothing.type !== "none";
	}
	function validateImage() {
		if (!clothing.imageUrl) return false;
		return (
			imageBlob != null ||
			clothing.imageUrl.startsWith(
				"https://firebasestorage.googleapis.com/v0/b/outfit-generator-fa21a.appspot.com"
			)
		);
	}
	function fetchingDone(){
		return bgRemoveStatus !== "identifying color" && bgRemoveStatus !== "uploading";
	}
	function dataIsValid() {
		return isTemperaturesValid() && isTypeValid() && validateImage() && fetchingDone();
	}
	async function handleSubmit(e) {
		e.preventDefault();
		if (dataIsValid()) {
			//console.log(clothing.id);
			//console.log(imageBlob);
			if (!clothing.styles) setClothing({...clothing, styles:[]});
		//console.log(clothing);
			if (imageBlob){
			//console.log("have imageBlog, uploadToStorageAndDB")
				await uploadToStorageAndDB(
					imageBlob,
					clothing,
					setClothing,
					setUploadingProgress,
					setError
				);
			}else {
			//console.log("don't have imageBlog, writeClothing  ")
				await writeClothing(clothing);
				setUploadingProgress(100);
			}
			setFormSubmitted(true);
			setBgRemoveStatus(null);

			if (!data.editingMode) {
				setClothing(emptyForm);
				resetCheckboxes();
				setImageBlob(null);

				imageInput.current.value = null;
			}
		} else if (!validateImage()) {
			setError("You have to upload an image!");
		}
	}
	function resetCheckboxes() {
		const checkboxes = document.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach((checkbox) => {
			checkbox.checked = false;
		});
		//setClothing({ ...clothing, temperatures: [] });
	}

	useEffect(() => {
		if (!data.clothing.conditions)
			setClothing({ ...data.clothing, conditions: [] });
		else setClothing(data.clothing);
		//console.log(clothing)
		//setImageBlob(data.imageUrl);
	}, [data]);
	useEffect(() => {
		if (!dialogOpen && formSubmitted) {
			setFormSubmitted(false);
		}
		if (!dialogOpen ) {
			setBgRemoveStatus(null);

		}
	}, [data, dialogOpen, formSubmitted]);

	const handleFileInputChange = (event) => {
		//console.log("imageInput:",imageInput)
		const file = event.target.files[0];
		//console.log("file from input:",file);
		if (file) {
			setImageBlob(file);
			const tempUrl = URL.createObjectURL(file);
			const tempName = file.lastModified + file.name;
			setClothing({
				...clothing,
				imageUrl: tempUrl,
				imageName: tempName,
			});
		//console.log("clothing.imageUrl before color iden:", tempUrl, tempName);
			setFormSubmitted(false);

			if (!clothing.id){
				const reader = new FileReader();

				reader.onloadend = () => {
					uploadImageToImaggaApi(reader.result, tempUrl, tempName);
				};

				reader.readAsDataURL(file);
			}

		}
	};

	const uploadImageToImaggaApi = async (fileBase64, tempUrl, tempName) => {

		setBgRemoveStatus("identifying color");
		
		(async () => {
			try {
				const timeoutPromise = new Promise((resolve, reject) => {
					setTimeout(() => {
						reject(new Error("Request timed out"));
					}, 15000); // 10 seconds
				});

				 await Promise.race([
					axios.post('https://api.imagga.com/v2/colors', `image_base64=${encodeURIComponent(fileBase64)}`, {
					  headers: {
						'Authorization': 'Basic ' + btoa(imaggaApiKey + ':' + imaggaApiSecret),
						'Content-Type': 'application/x-www-form-urlencoded'
					  },
					}),
					timeoutPromise
				  ]).then(response=>{
					//console.log(response)
					if (response.status < 200 || response.status >= 300){
						setBgRemoveStatus("color timeout");
						throw new Error(`HTTP error! status: ${response.status}`);
					}
	
					const colorRes = response.data.result.colors.foreground_colors[0].closest_palette_color_parent;
				//console.log(colorRes);
	
					setClothing({...clothing, color: colorRes, imageUrl: tempUrl, imageName: tempName});
					setBgRemoveStatus("color done");
				  }).catch(err=>{
					console.error("imagga api error:", err)
					if (err.message === "Request timed out") {
						setBgRemoveStatus("color timeout");
					} else {
					//console.log(error);
					}
				  })

				  

				
			} catch (error) {
				if (error.message === "Request timed out") {
					setBgRemoveStatus("color timeout");
				} else {
				//console.log(error);
				}
			}
		})();
	
	}
	

	const uploadImageToClipdropApi = async (file) => {
		//const axios = require("axios");
	//console.log("click");
		setBgRemoveStatus("uploading");
		// API endpoint
		const form = new FormData();
		const fileName = file.lastModified + file.name;

		form.append("image_file", file);

		fetch("https://clipdrop-api.co/remove-background/v1", {
			method: "POST",
			headers: {
				"x-api-key":
					process.env.REACT_APP_CLIPDROP_API_KEY,
			},
			body: form,
		})
			.then((response) => {
			//console.log(response);
				if (!response.ok) {
				console.error("bg remove fetch error:");
					setBgRemoveStatus("error");
					return null;
				} else {
					return response.arrayBuffer();
				}
			})

			.then((buffer) => {
				// buffer here is a binary representation of the returned image
			//console.log(buffer);
				if (buffer){
				const blob = new Blob([buffer], {
					type: "image/png",
					modifiedName: fileName,
				});
			//console.log(blob);
				setImageBlob(blob);
				setClothing({
					...clothing,
					imageUrl: URL.createObjectURL(blob),
					imageName: fileName,
				});
				setBgRemoveStatus("done");
			}
			});
	};

	function capitalize(str) {
		if (str.length >= 1) return str[0].toUpperCase() + str.slice(1, str.length);
		else return str;
	}
	const handleCheckboxChange = (e) => {
	//console.log(e.target);
		const value = e.target.value;
		if (e.target.name.startsWith("style") && clothing.styles == null) {
			clothing.styles = [];
		}
		let updatedValues = e.target.name.startsWith("temperature")
			? [...clothing.temperatures]
			: (e.target.name.startsWith("style")
			? [...clothing.styles]
			: [...clothing.conditions]);

		if (e.target.checked) {
			updatedValues.push(value);
		} else {
			updatedValues = updatedValues.filter((val) => val !== value);
		}

		setClothing(
			e.target.name.startsWith("temperature")
				? { ...clothing, temperatures: updatedValues }
				: (e.target.name.startsWith("style")
				? { ...clothing, styles: updatedValues }
				: { ...clothing, conditions: updatedValues })
		);
		//console.log(clothing.conditions)
		setFormSubmitted(false);
	};

	return (
		<DialogWindow
			title={data.editingMode ? "Edit clothing item" : "Add a clothing item"}
			open={dialogOpen}
			handleClose={handleDialogClose}
		>
			<div className="dialog-content">
				<form className="dialog-form" onSubmit={handleSubmit}>
					<div className="row">
						<div className="col-12">
							<label htmlFor="name" className="form-label">
								Give this clothing a name <Required />
							</label>
							<input
								className={`form-control  form-input ${
									clothing.isNameTouched
										? clothing.name
											? "is-valid"
											: "is-invalid"
										: ""
								}`}
								type="text"
								name="name"
								id="name"
								placeholder="Enter a name for this specific item"
								required
								value={clothing.name}
								onChange={(e) => {
									setFormSubmitted(false);
									setClothing({
										...clothing,
										isNameTouched: true,
										name: e.target.value,
									});
								}}
							/>
							<InvalidFeedback>Name can't be empty</InvalidFeedback>
						</div>
					</div>

					<div className="row">
						<div className="col-12 justify-content-center">
							<label htmlFor="imageInput" className="form-label">
								Upload photo of your clothing <Required />
							</label>
							<p>(you can also remove background if you want to)</p>
							<div
								className={
									clothing.imageUrl ? "image-container" : "image-preview"
								}
							>
								{clothing.imageUrl ? (
									
									<LazyLoadImage
						alt="your clothing"
						effect="blur"
						src={clothing.imageUrl}
                        
					/>
								) : (
									<p>Here will be your image preview</p>
								)}
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-12 file-input-section">
							<input
								id="imageInput"
								type="file"
								accept="image/*"
								onChange={handleFileInputChange}
								ref={imageInput}
								//required
							/>
							<button
								className="button"
								onClick={() => uploadImageToClipdropApi(imageBlob)}
								disabled={(imageBlob == null || bgRemoveStatus === "uploading" || bgRemoveStatus === "identifying color")}
							>
								Remove Background
							</button>
						</div>
						{bgRemoveStatus === "uploading" ? (
							<InfoAlert>Please wait, background is removing...</InfoAlert>
						) : bgRemoveStatus === "identifying color" ? (
							<InfoAlert>Identifying clothing main color...</InfoAlert>
						) : bgRemoveStatus === "color done" ? (
							<InfoAlert>Color was identified: {clothing.color}</InfoAlert>
						) : bgRemoveStatus === "color timeout" ? (
							<ErrorAlert>Color wasn't identified</ErrorAlert>
						) : bgRemoveStatus === "done" ? (
							<SuccessAlert>Background removed successfully</SuccessAlert>
						) : (
							(bgRemoveStatus === "error" && (
								<ErrorAlert>Api error occurred. Background wasn't removed</ErrorAlert>
							))
						)}
					</div>

					<div className="row">
						<div className="col-12">
							<label htmlFor="color" className="form-label">
								You can specify clothing color manually: 
							</label>
							<ColorsSelect colorsArr={Object.keys(colors).sort((a, b) => a.localeCompare(b))} selectedColor={clothing.color} handleChange={(e)=>setClothing({...clothing, color: e.target.value})}/>
						</div>
					</div>

					<div className="row">
						<div className="col-12">
							<label htmlFor="type" className="form-label">
								Choose clothing category: <Required />
							</label>
							<select
								className={`form-control  form-input ${
									isTypeValid() ? "is-valid" : ""
								}`}
								id="type"
								value={clothing.type}
								onChange={(e) => {
									setClothing({ ...clothing, type: e.target.value });
								}}
								required
							>
								<option disabled value="none">
									Choose category...
								</option>
								<option value="Headwear">Headwear</option>
								<option value="Scarf">Scarf</option>
								<option value="Coat/jacket">Coat/jacket</option>
								<option value="Hoodie/sweatshirt or sweater">
									Hoodie/sweatshirt or sweater
								</option>
								<option value="T-shirt/shirt">T-shirt/shirt</option>
								<option value="Dress">Dress</option>
								<option value="Pants/skirt">Pants/skirt</option>
								<option value="Underpants">Underpants</option>
								<option value="Socks">Socks</option>
								<option value="Shoes">Shoes</option>
								<option value="Other">Other</option>
							</select>
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<label htmlFor="style" className="form-label">
								Choose clothing styles that this item fits in (optional):
							</label>
							<div className="multiple-columns-container">
								{styles.map((style, index) => (
									<div key={index} className="checkbox-container">
										<input
											type="checkbox"
											id={`style-${index}`}
											name={`style-${index}`}
											value={style}
											checked={clothing.styles && clothing.styles.includes(style)}
											className="check-input temperature-check"
											onChange={handleCheckboxChange}
										/>
										<label htmlFor={`style-${index}`}>{style}</label>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-12">
							<label className="form-label">
								Choose temperature ranges that you wear this in (at least one){" "}
								<Required />
							</label>
							<div className="multiple-columns-container">
								{temperatureRanges.map((range, index) => (
									<div key={index} className="checkbox-container">
										<input
											type="checkbox"
											id={`temperature-${index}`}
											name={`temperature-${index}`}
											value={range}
											checked={clothing.temperatures.includes(range)}
											className="check-input temperature-check"
											onChange={handleCheckboxChange}
										/>
										<label htmlFor={`temperature-${index}`}>{range} C°</label>
									</div>
								))}
							</div>
							{clothing.temperatures.length === 0 && (
								<p className="invalid-feedback">
									Choose at least one temperature range
								</p>
							)}
						</div>
					</div>

					{formSubmitted &&
						parseInt(uploadingProgress) >= 0 &&
						parseInt(uploadingProgress) < 100 && (
							<InfoAlert>
								Please wait, the photo is uploading to storage...{" "}
								{uploadingProgress.toFixed(2)}%
							</InfoAlert>
						)}
					{error && <ErrorAlert>{error}</ErrorAlert>}
					{formSubmitted && parseInt(uploadingProgress) === 100 && (
						<SuccessAlert>
							{data.editingMode
								? "Clothing item was successfully updated"
								: "Clothing item was successfully added to closet"}
						</SuccessAlert>
					)}
					<div className="row">
						<div className="col-12">
							<button
								type="submit"
								className="button"
								disabled={!dataIsValid()}
							>
								{data.editingMode ? "Update clothing" : "Upload clothing"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</DialogWindow>
	);
}
