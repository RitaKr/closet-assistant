import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import {
	getOutfits,
	database,
	getCollections,
	writeCollection,
} from "../utils/DBmanipulations";
import { updateUser } from "../utils/AuthManipulations";
import {
	onChildAdded,
	onChildChanged,
	onChildRemoved,
	ref,
} from "firebase/database";
import Loader from "../components/Loader";
import DetailsForm from "../components/DetailsForm";
import Required from "../components/Required";
import InvalidFeedback from "../components/InvalidFeedback";
import SuccessAlert from "../components/SuccessAlert";
import ErrorAlert from "../components/ErrorAlert";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSlug, validCollectionName } from "../utils/utils";


export default function Collections() {
	const [user, setUser] = useState(null);
	const [formData, setFormData] = useState({
		valid: false,
		name: "",
		isNameTouched: false,
	});
	const [collections, setCollections] = useState(null);
	const [error, setError] = useState(null);
	const [formSubmitted, setFormSubmitted] = useState(false);

	useEffect(() => {
		updateUser(setUser);
	}, []);

	useEffect(() => {
		if (user) {
			//setUser(auth.currentUser);
			//getClothes(setClothes);
			getCollections().then((data) => {
				//console.log(data);
				setCollections(data);
			});
			onChildRemoved(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
			onChildChanged(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
			onChildAdded(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					//console.log("outfits fetched", data);
					setCollections(data);
				});
			});
		}
	}, [user]);

	

	function handleSubmit(e) {
		e.preventDefault();
		if (formData.valid) {
			try {
				writeCollection({
					name: formData.name.trim(),
					slug: createSlug(formData.name),
					outfits: []
				});
				setFormData({ valid: false, name: "", isNameTouched: false });
				setFormSubmitted(true);
				setTimeout(() => {
					setFormSubmitted(false);
				}, 3000);
			} catch (error) {
				console.error("Error creating collection", error);
				setError(error);
			}
		}
	}
	function handleClear(e) {
		e.preventDefault();
		setFormData({ valid: false, name: "", isNameTouched: false });
		setFormSubmitted(false);
		setError(null);
	}
	function getOutfitsCount(outfits) {
		if (Array.isArray(outfits)) return outfits.length;
		if (typeof outfits === "object") return Object.values(outfits).length;
		return "no";
	}

	return (
		<>
			<Nav />
			<main className="page-main">
				<h1 className="page-title">Collections</h1>
				{collections ? (
					<>
						<DetailsForm title="Create new collection">
							<form className="add-collection-form" onSubmit={handleSubmit}>
								<div className="row">
									<div className="col col-12">
										<label htmlFor="collection-name" className="form-label">
											Collection name <Required />
										</label>
										<input
											type="text"
											id="collection-name"
											name="collection-name"
											placeholder="Enter collection name"
											required
											className={`form-control  form-input ${
												formData.isNameTouched
													? validCollectionName(formData.name, collections)
														? "is-valid"
														: "is-invalid"
													: ""
											}`}
											value={formData.name}
											onChange={(e) => {
												setFormData({
													valid: validCollectionName(e.target.value, collections),
													isNameTouched: true,
													name: e.target.value,
												});
											}}
										/>
										<InvalidFeedback>
											{formData.name && formData.name !== ""
												? "Collection with this name already exists"
												: "Name can't be empty"}
										</InvalidFeedback>
									</div>
								</div>
								<div className="row">
									<div className="col col-12">
										<button
											type="submit"
											className="button"
											disabled={!formData.valid}
										>
											Create
										</button>
										<button
											type="reset"
											className="button"
											onClick={handleClear}
										>
											Clear form
										</button>
									</div>
								</div>
								{formSubmitted && (
									<SuccessAlert>
										Collection was created successfully!
									</SuccessAlert>
								)}
								{error && (
									<ErrorAlert>
										Error occurred creating this collection. Clear form and try
										again
									</ErrorAlert>
								)}
							</form>
						</DetailsForm>
						<div className="collections-wrapper">
							<h2 className="page-sub-title">
								Select a collection to view outfits
							</h2>
							{collections.length > 0 ? (
								<div className="collections-container">
									{collections.map((collection) => {
										
										return (
										<Link
											to={`/collections/${collection.slug}`}
											key={collection.slug}
										>
											<div className="info">
												{collection.name === "Favorites" && (
													<span className="icons">
														<FontAwesomeIcon icon="fa-solid fa-star" />
													</span>
												)}
												<div>
													<h3>{collection.name}</h3>
													<span className="add-date">
														Created on{" "}
														{new Date(collection.addDate).toLocaleDateString()}
													</span>{" "}
													|{" "}
													<span>
														Has{" "}
														{getOutfitsCount(collection.outfits)}{" "}
														outfit{getOutfitsCount(collection.outfits) === 1 ? "" : "s"}
													</span>
												</div>
											</div>
											<FontAwesomeIcon icon="fa-solid fa-chevron-right" />
										</Link>
									)})}
								</div>
							) : (
								<div className="outfits-container">
									<p>There's no collections yet. It's time to create some!</p>
								</div>
							)}
						</div>
					</>
				) : (
					<Loader />
				)}
			</main>
			<Footer />
		</>
	);
}
