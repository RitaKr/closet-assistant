
import { Link } from "react-router-dom";
export default function NoClothes({ children }) {
	return (
		<div className="no-clothes-yet">
			<p>{children}</p>

			<button className="button">
				<Link to="/closet">Upload clothes</Link>
			</button>
		</div>
	);
}