import { useRef, useState, useEffect } from "react";
import { getClothes, clothesRef } from "../utils/DBManipulations";
import {
	onChildAdded,
	onChildChanged,
	onChildRemoved,
} from "firebase/database";
import { auth } from "../utils/AuthManipulations";
import ClosetSearch from "../components/ClosetSearch";
import { temperatureRanges, colors } from "../utils/utils";
const _ = require("lodash");

export default function FiltersContainer({
	searchRef,
	//filteredClothes,
	setFilteredClothes,
}) {
	const [sortDirection, setSortDirection] = useState(false);
	const [sortParam, setSortParam] = useState("addDate");
	const [clothes, setClothes] = useState(null);
	const sortSelect = useRef(null);
	const typeSelect = useRef(null);
	const tempSelect = useRef(null);
	const styleSelect = useRef(null);
	const colorSelect = useRef(null);
	const inLaundryCheck = useRef(null);
	const sortDirectionBtn = useRef(null);

	function handleFilters(e) {
		filterAndSortClothes(clothes, setFilteredClothes, sortSelect.current.value);
	}

	function filterAndSortClothes(clothes, setFilteredClothes, sortingParameter) {
		//console.log("in filterAndSortClothes:");
		if (clothes) {
			//console.log("in filterAndSortClothes:", clothes, typeSelect.current.value, tempSelect.current.value, inLaundryCheck.current.checked, sortingParameter);
			const filtered = clothes.filter((cl) => {
				return (
					(typeSelect.current.value === "all" ||
						cl.type === typeSelect.current.value) &&
					(colorSelect.current.value === "all" ||
						cl.color === colorSelect.current.value ||
						(colorSelect.current.value === "none" && !cl.color)) &&
					(tempSelect.current.value === "all" ||
						cl.temperatures.includes(tempSelect.current.value)) &&
					(styleSelect.current.value === "all" ||
						(cl.styles && cl.styles.includes(styleSelect.current.value)) ||
						(styleSelect.current.value === "none" &&
							(!cl.styles || cl.styles.length === 0))) &&
					(!inLaundryCheck.current.checked ||
						cl.inLaundry !== inLaundryCheck.current.checked)
				);
			});

			setFilteredClothes(sortClothes(filtered, sortingParameter));
		}
	}

	function sortClothes(arrayToSort, sortingParameter) {
		return _.orderBy(
			//filteredClothes,
			arrayToSort,
			[(item) => item[sortingParameter].toLowerCase()],
			[sortDirectionBtn.current.dataset.asc === "true" ? "asc" : "desc"]
		);
	}

	function handleSort(e) {
		setSortParam(e.target.value);
		filterAndSortClothes(clothes, setFilteredClothes, e.target.value);
	}

	function handleDirectionChange() {
		//console.log(sortSelect.current.value, sortDirection);
		sortDirectionBtn.current.dataset.asc = !sortDirection;
		setSortDirection(!sortDirection);
		filterAndSortClothes(clothes, setFilteredClothes, sortSelect.current.value);
	}

	function arraysAreEqual(arr1, arr2) {
		return (
			arr1.length === arr2.length &&
			arr1.every((val, index) => val === arr2[index])
		);
	}
	function equalObjects(obj1, obj2) {
		const keys1 = Object.keys(obj1).filter((key) => key !== "inLaundry");
		const keys2 = Object.keys(obj2).filter((key) => key !== "inLaundry");

		//checking if the keys are the same length
		if (keys1.length !== keys2.length) {
			return false;
		}

		// checking if values for non-inLaundry keys are equal
		for (let key of keys1) {
			if (typeof obj1[key] === "object") {
				if (!arraysAreEqual(obj1[key], obj2[key])) {
					return false;
				}
			} else if (obj1[key] !== obj2[key]) {
				return false;
			}
		}

		return true;
	}
	onChildAdded(clothesRef, (data) => {
		getClothes().then((data) => {
			if (!clothes || clothes.length !== data.length) {
				//console.log("added ", data);

				setClothes(data);
				//console.log("calling filterAndSortClothes after adding ", data);
				if (data && sortSelect && sortSelect.current) {
					filterAndSortClothes(
						data,
						setFilteredClothes,
						sortSelect.current.value
					);
				}
			}
		});
	});
	onChildChanged(clothesRef, (refData) => {
		//console.log("changed ", refData.val(),  clothes);
		if (clothes) {
			//console.log("changed (in if)", refData.val(), refData.val().id, clothes);
			const thisCl = clothes.find((cl) => cl.id === refData.val().id);
			//re-fetching and rerendering clothes only if they were changed through form (ignoring inLaundry check)
			//console.log(thisCl, data.val())
			if (
				!thisCl ||
				!refData ||
				!refData.val() ||
				!equalObjects(thisCl, refData.val())
			) {
				getClothes().then((data) => {
					//console.log("rerednder in change");

					setClothes(data);
					if (data && sortSelect && sortSelect.current) {
						filterAndSortClothes(
							data,
							setFilteredClothes,
							sortSelect.current.value
						);
					}
				});
			}
		}
	});
	onChildRemoved(clothesRef, (refData) => {
		getClothes().then((data) => {
			//console.log("data from getClothes:", data);
			//console.log("removed ", refData);

			setClothes(data);
			//console.log("calling filterAndSortClothes after removing ", data);
			if (data && sortSelect && sortSelect.current) {
				filterAndSortClothes(
					data,
					setFilteredClothes,
					sortSelect.current.value
				);
			}
		});
	});
	//handling sorting and filters on database updates
	useEffect(() => {
		async function fetchData() {
			if (auth.currentUser) {
				await getClothes().then((data) => {
					//console.log("lastClothes:", data);

					setClothes(data);
					if (data && sortSelect && sortSelect.current) {
						filterAndSortClothes(
							data,
							setFilteredClothes,
							sortSelect.current.value
						);
					}
				});
			}
		}
		fetchData();
	}, [auth.currentUser]);

	useEffect(() => {
		//console.log(clothes);
		//console.log("clothes in filterContainer: " + clothes);
		if (clothes && sortSelect && sortSelect.current) {
			//console.log("filtered and sorted");
			filterAndSortClothes(
				clothes,
				setFilteredClothes,
				sortSelect.current.value
			);
		}
	}, [clothes, setFilteredClothes, sortDirection, sortParam]);

	return (
		<>
			<ClosetSearch searchRef={searchRef} clothes={clothes} />
			<div className="closet-actions-panel">
				<div className="filters-container">
					<div>
						<label htmlFor="typeFilter">Type</label>
						<select
							ref={typeSelect}
							disabled={!clothes}
							id="typeFilter"
							name="type"
							className="closet-select"
							defaultValue="all"
							onChange={handleFilters}
						>
							<option value="all">All</option>
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
					<div>
						<label htmlFor="temperatureFilter">Temperature</label>
						<select
							ref={tempSelect}
							disabled={!clothes}
							id="temperatureFilter"
							name="temp"
							className="closet-select"
							defaultValue="all"
							onChange={handleFilters}
						>
							<option value="all">All</option>
							{temperatureRanges.map((range) => (
								<option key={range} value={range}>
									{range} C°
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="colorFilter">Main color</label>
						<select
							ref={colorSelect}
							disabled={!clothes}
							id="colorFilter"
							name="color"
							className="closet-select"
							defaultValue="all"
							onChange={handleFilters}
							style={
								colorSelect.current && {
									backgroundColor: colors[colorSelect.current.value],
								}
							}
						>
							<option value="all">All</option>
							{clothes &&
								[...new Set(clothes.map((cl) => cl.color))]
									.sort((a, b) => a.localeCompare(b))
									.map((colorName, index) => (
										<option
											key={index}
											value={colorName ? colorName : "none"}
											style={{ backgroundColor: colors[colorName] }}
										>
											{colorName ? colorName : "Not specified"}
										</option>
									))}
						</select>
					</div>
					<div>
						<label htmlFor="styleFilter">Style</label>
						<select
							ref={styleSelect}
							disabled={!clothes}
							id="styleFilter"
							name="style"
							className="closet-select"
							defaultValue="all"
							onChange={handleFilters}
						>
							<option value="all">All</option>

							{clothes &&
								[...new Set(clothes.flatMap((cl) => cl.styles))]
									.sort((a, b) => a.localeCompare(b))
									.map((stl, index) => (
										<option key={index} value={stl ? stl : "none"}>
											{stl ? stl : "Not specified"}
										</option>
									))}
						</select>
					</div>
					<div>
						<input
							ref={inLaundryCheck}
							disabled={!clothes}
							type="checkbox"
							id="notInLaundryFilter"
							name="notInLaundry"
							onChange={handleFilters}
						/>
						<label htmlFor="notInLaundryFilter">Not in laundry only</label>
					</div>
				</div>
				<div className="sort-container">
					<div>
						<label htmlFor="sort">Sort by</label>
						<select
							disabled={!clothes}
							className="closet-select"
							id="sort"
							onChange={handleSort}
							ref={sortSelect}
							value={sortParam}
						>
							<option value="addDate">Date</option>
							<option value="name">Name</option>
							<option value="type">Type</option>
						</select>
						<button
							ref={sortDirectionBtn}
							disabled={!clothes}
							data-asc={sortDirection}
							className="sort-direction-btn"
							onClick={handleDirectionChange}
						>
							{sortDirection ? "↑" : "↓" }
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
