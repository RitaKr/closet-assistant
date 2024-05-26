import { colors } from "../utils/utils";

export default function ColorsSelect({ colorsArr, selectedColor, handleChange }) {

    // const handleChange = (event) => {
    //     setSelectedColor(event.target.value);
    // };

    return (
        <select className={`form-control  form-input`}
        id="color" value={selectedColor ===null ? "" : selectedColor} onChange={handleChange}  style={{backgroundColor: colors[selectedColor]}}>
            <option value="">Unspecified</option>
            {colorsArr.map((colorName, index) => (
                colorName &&
                <option key={index} value={colorName} style={{backgroundColor: colors[colorName]}}>
                    {colorName}
                </option>
            ))}
        </select>
    );
}