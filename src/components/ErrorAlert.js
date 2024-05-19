export default function ErrorAlert ({ children })  {
	return (
		<div className="row">
			<div className="alert alert-danger" role="alert">
				{children}
			</div>
		</div>
	);
};
