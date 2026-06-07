import {
  Avatar,
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AppNavBar from "@/components/AppNavBar";
import { APP_CONFIG } from "@/config";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import StorageIcon from "@mui/icons-material/Storage";
import CodeIcon from "@mui/icons-material/Code";
import PersonIcon from "@mui/icons-material/Person";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppNavBar callbackUrl={APP_CONFIG.routes.about} />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 4,
            textAlign: "center",
          }}
        >
          About 7MDB
        </Typography>

        <Paper sx={{ p: 4, mb: 6, borderRadius: 2, borderLeft: "6px solid", borderColor: "primary.main" }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudQueueIcon fontSize="large" color="primary" />
            Hosting & Infrastructure
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem" }}>
            Our entire ecosystem is built for scale and reliability. We are proud to mention that 
            <strong> both our Frontend and Backend services are hosted on Render</strong>, 
            providing us with a seamless CI/CD pipeline and high availability.
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 2 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CodeIcon color="primary" />
                Frontend Stack
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    Next.js 15 (App Router)
                  </Typography>
                  <Typography variant="body2">
                    Leveraging React 19 features, Server Components, and optimized streaming.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    Material UI (MUI)
                  </Typography>
                  <Typography variant="body2">
                    Utilizing the latest MUI components for a responsive and modern user interface.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    Auth.js v5
                  </Typography>
                  <Typography variant="body2">
                    Secure OIDC-compliant authentication integrated with Auth^2, our identity provider, for secure token-based identification.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, height: "100%", borderRadius: 2 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StorageIcon color="primary" />
                Backend & Data
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    RESTful API
                  </Typography>
                  <Typography variant="body2">
                    A robust Java-based backend (hosted on Render) that aggregates movie and TV data.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    Identity Management
                  </Typography>
                  <Typography variant="body2">
                    Scoped JWT-based authorization ensuring data privacy and secure user actions.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    TMDB Integration
                  </Typography>
                  <Typography variant="body2">
                    Real-time synchronization with The Movie Database for up-to-date media metadata.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 8 }} />

        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: 4,
            textAlign: "center",
          }}
        >
          Team & Contributions
        </Typography>

        <Grid container spacing={3}>
          {[
            { 
              name: "Kassie Whitney", 
              role: "Fullstack Developer", 
              contributions: [
                "Api Development: TV, Movie, Ratings, Front End Api",
                "Database Design: Ratings",
                "Bug Report: Front End",
                "Render Setup: Front End and Backend",
                "Identity Management: Configure Auth^2 with frontend",
                "Frontend: Foundation, movie by genre selection grid, search filter, profile page, award system"
              ] 
            },
            { 
              name: "Duy-Hung C. Le", 
              role: "Fullstack Developer", 
              contributions: [
                "Api Development: TV, Movie, Reviews, Issues, Front End Api (upvotes, downvotes)",
                "Database Design: Reviews, Issues",
                "Bug Report: Back End",
                "Frontend: Carousel, comment and ratings log page"
              ] 
            },
            { 
              name: "Skyler Z. Broussard", 
              role: "Fullstack Developer", 
              contributions: [
                "Api Development: TV, Movie, User",
                "Database Design: Users",
                "Identity Management: Configure Auth^2",
                "Frontend: search page and search on nav bar, search filter"
              ] 
            },
          ].map((member) => (
            <Grid key={member.name} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, height: "100%", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {member.role}
                </Typography>
                <Box sx={{ width: '100%' }}>
                  {member.contributions.map((item, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, textAlign: 'left' }}>
                      <Box component="span" sx={{ color: 'primary.main', mr: 1, fontWeight: 'bold' }}>•</Box>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: "center", opacity: 0.8 }}>
          <Typography variant="body2" color="text.secondary">
            Project developed for {APP_CONFIG.course.code} &bull; {APP_CONFIG.course.university}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} {APP_CONFIG.app.title}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
