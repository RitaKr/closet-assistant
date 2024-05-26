
import ReactPaginate from "react-paginate";

export default function PaginationPanel({handlePageChange, currentPage, totalPages}) {

    return (
        <div className="pagination-controls">
					<ReactPaginate
						breakLabel="..."
						nextLabel=">>"
						onPageChange={handlePageChange}
						forcePage={currentPage}
						pageRangeDisplayed={1}
						marginPagesDisplayed={1}
						pageCount={totalPages}
						previousLabel="<<"
						renderOnZeroPageCount={null}
						containerClassName="pagination-list"
					/>
				</div>
    )
}