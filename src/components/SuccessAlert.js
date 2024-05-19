
export default function SuccessAlert ({ children })  {
	return (
		<div className="row">
			<div className="alert alert-success" role="alert">
				{children}
			</div>
		</div>
	);
}; 

