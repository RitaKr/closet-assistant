import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function ErrorAlert({ children }) {
	return (
		<div className="alert alert-danger" role="alert">
			<span className="icons">
				<FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
			</span>
			{children}
		</div>
	);
}
