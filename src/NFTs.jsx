import { Container, Typography, Link, Card, CardContent, CardActions } from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import ConstructionIcon from "@mui/icons-material/Construction";

const About = () => {
  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <PaletteIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        NFTs
      </Typography>
      <Card>
        <CardContent>
          <Typography sx={{ marginTop: 2 }} variant="h5" align="center" color="textPrimary" gutterBottom>
            Under heavy development...
          </Typography>
        </CardContent>
        <CardActions>
          <ConstructionIcon sx={{ fontSize: 72, margingTop: 4 }} color="alt" />
        </CardActions>
      </Card>
    </Container>
  );
};

export default About;
