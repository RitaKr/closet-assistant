import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function SuccessAlert ({ children })  {
	return (

			<div className="alert alert-success" role="alert">
				<span className="icons"><FontAwesomeIcon icon="fa-solid fa-check" /></span> 
				{children}
			</div>

	);
}; 

