
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function NoClothes({ children }) {
	return (
		<div className="no-clothes-yet">
			<p>{children}</p>

			<button className="button">
				<Link to="/closet"><FontAwesomeIcon icon="fa-solid fa-arrow-up-from-bracket" /> Upload clothes</Link>
			</button>
		</div>
	);
}