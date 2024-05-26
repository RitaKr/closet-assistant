import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useRef, useEffect, useState, useCallback } from "react";
import { emptyForm } from "../assets/DBManipulations";

import AddClothingDialog from "../components/AddClothingDialog";
import ClothingFigure from "../components/ClothingFigure";
import FiltersContainer from "../components/FiltersContainer";
import Loader from "../components/Loader";
import PaginationPanel from "../components/PaginationPanel";

export default function Closet() {
	const [dialogOpen, setDialogOpen] = useState(false);
	//const [clothes, setClothes] = useState(null);
	const [filteredClothes, setFilteredClothes] = useState(null);
	const searchContainer = useRef(null);
	const [dialogData, setDialogData] = useState({
		clothing: emptyForm,
		editingMode: false,
	});
	const [dialogDataBeforeEdit, setDialogDataBeforeEdit] = useState(dialogData);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [subset, setSubset] = useState(null);
	const [itemsPerPage, setItemsPerPage] = useState(14);

	const adjustItemsPerPage = useCallback(() => {
		const width = window.innerWidth;
		if (width > 1244) {
			setItemsPerPage(14);
		} else if (width > 1024) {
			setItemsPerPage(11);
		} else if (width > 768) {
			setItemsPerPage(8);
		} else if (width > 576) {
			setItemsPerPage(7);
		}else {
			setItemsPerPage(5);
		}

	}, [setItemsPerPage]);


	useEffect(() => {
		adjustItemsPerPage();
		window.addEventListener("resize", adjustItemsPerPage);

		//remove the event listener when the component is unmounted
		return () => {
			window.removeEventListener("resize", adjustItemsPerPage);
		};
	}, [adjustItemsPerPage]);

	useEffect(() => {
		//console.log("filteredClothes in useEffect:", filteredClothes);
		if (filteredClothes) {
			setTotalPages(Math.ceil(filteredClothes.length / itemsPerPage));
			let updatedCurrentPage = currentPage;
			if (currentPage >= Math.ceil(filteredClothes.length / itemsPerPage)) {
				updatedCurrentPage = totalPages > 0 ? totalPages - 1 : 0;
				setCurrentPage(updatedCurrentPage);
			  }
			  const startIndex = updatedCurrentPage * itemsPerPage;
			  const endIndex = startIndex + itemsPerPage;
			setSubset(filteredClothes.slice(startIndex, endIndex));
			
			//console.log(subset);
		}
	}, [filteredClothes, itemsPerPage, currentPage]);

	const handlePageChange = (e) => {
		//console.log(currentPage);
		setCurrentPage(e.selected);
		const startIndex = e.selected * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		setSubset(filteredClothes.slice(startIndex, endIndex));
	};

	const handleDialogOpen = (data, editingMode) => {
		if (!editingMode) {
			setDialogData(dialogDataBeforeEdit);
			setDialogDataBeforeEdit(dialogDataBeforeEdit);
		} else {
			if (!Array.isArray(data.styles)) data.styles = [];
			if (!data.color) data.color = "";
		//console.log("handleDialogOpen edit mode data:", data);
			setDialogData({ clothing: data, editingMode: true });
		}
	//console.log("data passed to dialog open: ", data);
		setDialogOpen(true);
		//console.log(dialogOpen);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
	};
	return (
		<>
			<Nav searchRef={searchContainer} />

			<main className="page-main">
				<h1 className="page-title">Your closet</h1>
				<FiltersContainer
					searchRef={searchContainer}
					//filteredClothes={filteredClothes}
					setFilteredClothes={setFilteredClothes}
				/>
				<PaginationPanel
					currentPage={currentPage}
					totalPages={totalPages}
					handlePageChange={handlePageChange}
				/>
				<div className="items-count">
					{filteredClothes && <p>Total: {filteredClothes.length} items</p>}
					{subset && <p>Shown: {subset.length} items</p>}
				</div>
				{subset ? (
					<div className="closet-container">
						<button
							className="add-clothing-button"
							onClick={() => handleDialogOpen(dialogDataBeforeEdit, false)}
							data-tooltip="Upload clothing item"
						>
							+
						</button>

						{subset.map((clothing) => (
							<ClothingFigure
								key={clothing.id}
								data={clothing}
								dialogOpen={dialogOpen}
								handleDialogOpen={() => handleDialogOpen(clothing, true)}
							/>
						))}
					</div>
				) : (
					<Loader />
				)}

				<PaginationPanel
					currentPage={currentPage}
					totalPages={totalPages}
					handlePageChange={handlePageChange}
				/>
			</main>
			<Footer />
			<AddClothingDialog
				data={dialogData}
				dialogOpen={dialogOpen}
				handleDialogClose={handleDialogClose}
			/>
		</>
	);
}
