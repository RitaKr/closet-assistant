export default function Select({ options, selected, handleChange, id }) {

    // const handleChange = (event) => {
    //     setSelectedColor(event.target.value);
    // };

    return (
        <select className={`form-control  form-input`}
        id={id} value={selected ===null ? "" : selected} onChange={handleChange}>
            <option value="">Unspecified</option>
            {options.map((value, index) => (
                value &&
                <option key={index} value={value}>
                    {value}
                </option>
            ))}
        </select>
    );
}