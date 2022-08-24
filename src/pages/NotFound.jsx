import { Container, Typography, Card, CardContent, CardActions } from "@mui/material";
import DirectionsOffIcon from "@mui/icons-material/DirectionsOff";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <DirectionsOffIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        404
      </Typography>
      <Card>
        <CardContent>
          <Typography
            sx={{ marginTop: 2, minHeight: 400 }}
            variant="h5"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Page not found
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton color="primary" aria-label="home" size="large" onClick={handleClick}>
            <HomeIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Container>
  );
};

export default NotFound;
