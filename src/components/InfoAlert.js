export default function InfoAlert  ({ children }) {
	return (
		<div className="row">
			<div className="alert alert-info" role="alert">
				{children}
			</div>
		</div>
	);
};