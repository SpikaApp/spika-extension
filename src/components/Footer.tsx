import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link, Typography } from "@mui/material";
import { useContext } from "react";
import { AccountContext } from "../context/AccountContext";

const Footer = (): JSX.Element => {
  const { currentAddress } = useContext(AccountContext);
  return (
    <Typography sx={{ mt: 2 }} variant="subtitle1" align="center" color="textPrimary">
      View account in{" "}
      <Link
        href={`https://explorer.devnet.aptos.dev/account/${currentAddress}`}
        underline="none"
        target="_blank"
        color="link"
      >
        Aptos Explorer <OpenInNewIcon sx={{ fontSize: 16 }} />
      </Link>
    </Typography>
  );
};

export default Footer;
