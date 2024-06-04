import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	getOutfits,
	database,
	getCollections,
	updateCollection,
	removeCollection,
} from "../utils/db";
import { updateUser } from "../utils/auth";
import { onChildChanged, onChildRemoved, ref } from "firebase/database";
import Loader from "../components/Loader";
import OutfitFigure from "../components/OutfitFigure";
import { Link } from "react-router-dom";
import {
	EditButton,
	DeleteButton,
	ApplyButton,
	CancelButton,
} from "../components/Buttons";
import { validCollectionName, createSlug } from "../utils/utils";
import ErrorAlert from "../components/ErrorAlert";
const _ = require("lodash");

export default function Collection({ collection }) {
	const [user, setUser] = useState(null);
	const [outfits, setOutfits] = useState(null);
	const [editing, setEditing] = useState(false);
	const [error, setError] = useState(null);
	const [collections, setCollections] = useState(null);
	const [name, setName] = useState(collection.name);
	const [sort, setSort] = useState({ by: "addDate", asc: false });
	const navigate = useNavigate();

	useEffect(() => {
		updateUser(setUser);
	}, []);

	useEffect(() => {
		sortOutfits();
	}, [sort]);

	function sortOutfits() {
		setOutfits(
			_.orderBy(
				outfits,
				[
					(item) =>
						item[sort.by] === "" || item[sort.by] === undefined
							? "zzz"
							: item[sort.by].toLowerCase(),
				],
				[sort.asc ? "asc" : "desc"]
			)
		);
	}

	useEffect(() => {
		if (user) {
			getCollections().then((data) => {
				setCollections(data);
			});
			onChildRemoved(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					setCollections(data);
				});
			});
			onChildChanged(ref(database, `collections/${user.uid}/`), (data) => {
				getCollections().then((data) => {
					setCollections(data);
				});
			});
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			getOutfits(collection.id).then((data) => {
				setOutfits(data);
			});
			onChildRemoved(
				ref(database, `collections/${user.uid}/${collection.id}/outfits/`),
				(data) => {
					getOutfits(collection.id).then((data) => {
						setOutfits(data);
					});
				}
			);
		}
	}, [user, collection.id]);

	const nameInput = useRef(null);

	async function handleEdit(e) {
		await setEditing(true);
		if (nameInput.current) nameInput.current.focus();
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (validCollectionName(name, collections)) {
			try {
				updateCollection({
					...collection,
					name: name.trim(),
					slug: createSlug(name),
				});
				setEditing(false);
				navigate(`/collections/${createSlug(name)}`);
			} catch (error) {
				console.error("Error creating collection", error);
				setError(error);
			}
		}
	}
	function handleDelete(e) {
		if (window.confirm("Are you sure you want to delete this collection?")) {
			removeCollection(collection.id);
			navigate("/collections");
		}
	}

	function handleCancel(e) {
		if (window.confirm("Are you sure you want to cancel your changes?")) {
			setName(collection.name);
			setEditing(false);
		}
	}
	return (
		<>
			<Nav />
			<main className="page-main">
				<div className="breadcrumbs">
					<Link to="/collections">Collections</Link> &#10093;{" "}
					<span className="active">{collection.name}</span>
				</div>
				<h1 className="page-title editable-title">
					<span>Collection</span>{" "}
					<span>
						"
						{editing ? (
							<input
								type="text"
								className="editable-value"
								ref={nameInput}
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						) : (
							<span className="editable-value">{collection.name}</span>
						)}
						"
					</span>
					{collection.name !== "Favorites" &&
						(!editing ? (
							<div className="action-panel">
								<EditButton handleEdit={handleEdit} />
								<DeleteButton handleDelete={handleDelete} />
							</div>
						) : (
							<div className="action-panel">
								<ApplyButton
									handleApply={handleSubmit}
									disabled={!validCollectionName(name, collections)}
								/>
								<CancelButton handleCancel={handleCancel} />
							</div>
						))}
				</h1>
				{error && <ErrorAlert>Something went wrong...</ErrorAlert>}

				<div className="sort-container">
					<div className="wrapper">
						<label htmlFor="sort">Sort by</label>
						<select
							disabled={!outfits}
							className="closet-select"
							id="sort"
							onChange={(e) => {
								setSort({ ...sort, by: e.target.value });
							}}
							value={sort.by}
						>
							<option value="addDate">Date</option>
							<option value="temperature">Temperature</option>
							<option value="color">Color</option>
							<option value="style">Style</option>
						</select>
						<button
							disabled={!outfits}
							data-asc={sort.asc}
							className="sort-direction-btn"
							onClick={() => {
								setSort({ ...sort, asc: !sort.asc });
							}}
						>
							{sort.asc ? "↑" : "↓"}
						</button>
					</div>
				</div>

				{collection && (
					<OutfitsContainer outfits={outfits} id={collection.id} />
				)}
			</main>
			<Footer />
		</>
	);
}

function OutfitsContainer({ outfits, id }) {
	return (
		<>
			{outfits ? (
				<div className="outfits-container">
					{outfits.length > 0 ? (
						outfits.map((outfit) => (
							<OutfitFigure
								clothes={outfit.clothes}
								outfit={outfit}
								id={outfit.id}
								collectionID={id}
								key={outfit.id}
							/>
						))
					) : (
						<p>No outfits in this collection yet</p>
					)}
				</div>
			) : (
				<Loader />
			)}
		</>
	);
}
