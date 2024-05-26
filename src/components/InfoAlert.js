import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function InfoAlert  ({ children }) {
	return (

			<div className="alert alert-info" role="alert">
				<span className="icons">
				<FontAwesomeIcon icon="fa-solid fa-circle-info" />
				</span>
				{children}
			</div>

	);
};