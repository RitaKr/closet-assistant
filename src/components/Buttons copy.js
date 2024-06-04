import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export function DeleteButton({ handleDelete}) {
    return (<button
        className="icon-btn clothing-card-btn delete-btn"
        onClick={handleDelete}
        alt="Delete"
        title="Delete"
        aria-roledescription="Delete"
    ><FontAwesomeIcon icon="fa-solid fa-trash-can" /></button>)

}
export function CancelButton({ handleCancel}) {
    return (<button
        className="icon-btn clothing-card-btn delete-btn"
        onClick={handleCancel}
        alt="Cancel editing"
        title="Cancel editing"
        aria-roledescription="Cancel editing"
    ><FontAwesomeIcon icon="fa-solid fa-xmark" /></button>)

}
export function EditButton({ handleEdit}) {
    return (<button
        className="icon-btn clothing-card-btn edit-btn"
        onClick={handleEdit}
        alt="Edit"
        title="Edit"
        aria-roledescription="Edit"
    ><FontAwesomeIcon icon="fa-solid fa-pen" /></button>)

}

export function ApplyButton({ handleApply, disabled}) {
    return (<button
        className="icon-btn clothing-card-btn edit-btn"
        onClick={handleApply}
        alt="Apply changes"
        title="Apply changes"
        aria-roledescription="Apply changes"
        disabled={disabled}
    ><FontAwesomeIcon icon="fa-solid fa-check" /></button>)

}