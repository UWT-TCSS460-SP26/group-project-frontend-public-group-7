import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";

import { APP_CONFIG } from "@/config";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h1" component="h1" color="secondary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>

        <Button
          component={Link}
          href={APP_CONFIG.routes.home}
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<HomeIcon />}
        >
          Return Home
        </Button>
      </Box>
    </Container>
  );
}
