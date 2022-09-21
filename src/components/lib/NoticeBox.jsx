import { Box, DialogContent, Typography, Stack } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const NoticeBox = (props) => {
  return (
    <Box component={DialogContent} sx={{ mt: props.mt, border: 2, borderColor: "warning.light" }}>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          mt: "-12px",
          mb: "-12px",
          width: props.width,
        }}
      >
        <WarningIcon color="warning" sx={{ fontSize: "24px", ml: "-12px", mr: "12px" }} />
        <Typography align="left">{props.text}</Typography>
      </Stack>
    </Box>
  );
};

export default NoticeBox;
