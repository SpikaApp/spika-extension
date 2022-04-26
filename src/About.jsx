import { Container, Typography, Link, Card, CardContent } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const About = () => {
  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <InfoIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Crypto Wallet in Development
      </Typography>
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        for{" "}
        <Link href="https://aptoslabs.com/" underline="none">
          APTOS
        </Link>{" "}
        Blockchain
      </Typography>
      <Card>
        <CardContent>
          <Typography align="center" color="textPrimary" gutterBottom>
            Wallet version 0.0.1 <br />
            Aptos SDK version 0.0.15
            <br />
            Copyrights 2022 by{" "}
            <Link href="https://github.com/xorgal" underline="none">
              {" "}
              xorgal
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default About;
