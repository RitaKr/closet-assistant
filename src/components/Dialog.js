import * as React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function DialogWindow(props) {
	return (
		<Dialog
			open={props.open}
			keepMounted
			onClose={props.handleClose}
			fullWidth={true}
			maxWidth={"md"}
			className="add-clothing-dialog"
			aria-describedby="alert-dialog-slide-description"
		>
			<DialogTitle>
				{props.title}
				<button
					className="icon-btn close-btn"
					aria-roledescription="close button"
					onClick={props.handleClose}
				>
					{"\u00d7"}
				</button>
			</DialogTitle>
			<DialogContent>{props.children}</DialogContent>
		</Dialog>
	);
}
