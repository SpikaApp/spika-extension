import { Badge, BadgeProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: "5px",
    top: "5px",
    border: `1.5px solid ${theme.palette.background.paper}`,
    padding: "4px 4px",
  },
}));

export default StyledBadge;
