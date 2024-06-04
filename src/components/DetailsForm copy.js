import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';


export default function DetailsForm({title, children }) {
const [detailsOpen, setDetailsOpen] = useState(false);

return(
    <details className="generation-settings-wrapper"  >
							<summary onClick={(e)=>{setDetailsOpen(!detailsOpen)}}>
								<FontAwesomeIcon icon={['fas', detailsOpen ? 'chevron-up' : 'chevron-down' ]} />
								<h3>{title}</h3>
							</summary>
							
							{children}
						</details>
)
}