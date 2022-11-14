import { useContext } from "react";
import { NumericFormat } from "react-number-format";
import { UIContext } from "../../context/UIContext";

/**
 *
 * @param allowNegative default false
 * @param props.decimalScale default 2
 * @param props.customInput default MUI Input
 * @param props.value default undefined
 * @param props.placeholder default undefined
 * @param props.maxLength default 11
 * @param props.mt
 *
 */
const ValueInput = (props) => {
  const { darkMode } = useContext(UIContext);

  return (
    <NumericFormat
      thousandSeparator=" "
      allowNegative={props.allowNegative}
      allowLeadingZeros={props.allowLeadingZeros}
      decimalScale={props.decimalScale}
      customInput={props.customInput}
      value={props.value}
      onValueChange={props.onValueChange}
      sx={{
        mt: props.mt,
        mb: props.mb,
        // ml: "6px",
        "& ::placeholder": {
          color: "primary.main",
        },
        backgroundColor: darkMode ? "#232323" : "#FFFFFF",
      }}
      inputProps={{
        style: {
          textAlign: "right",
          marginRight: "12px",
          fontWeight: 600,
        },
        maxLength: `${props.maxLength}`,
      }}
      disabled={props.disabled}
      // disableUnderline={true}
      placeholder={props.placeholder}
    />
  );
};

export default ValueInput;
