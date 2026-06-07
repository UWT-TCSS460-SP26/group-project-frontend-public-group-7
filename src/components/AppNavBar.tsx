import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";

import HomeSignInButton from "@/components/HomeSignInButton";
import RouteLoadingLink from "@/components/RouteLoadingLink";
import UserAccountMenu from "@/components/UserAccountMenu";
import { APP_CONFIG } from "@/config";
import { auth } from "@/lib/auth";
import { getCurrentUserDisplayName } from "@/lib/user-profile";

interface AppNavBarProps {
  callbackUrl?: string;
}

export default async function AppNavBar({
  callbackUrl = APP_CONFIG.routes.home,
}: AppNavBarProps) {
  const session = await auth();
  const user = session?.user;
  const savedDisplayName = session?.accessToken
    ? await getCurrentUserDisplayName(session.accessToken)
    : null;
  const userMenuLabel =
    savedDisplayName || user?.name || user?.email || "Signed in";

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "#000", borderBottom: "1px solid #333" }}
      elevation={0}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            py: { xs: 1, sm: 0 },
          }}
        >
          <Box
            component={RouteLoadingLink}
            disableLoading
            href={APP_CONFIG.routes.home}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <MovieIcon sx={{ color: "primary.main", fontSize: 32 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                letterSpacing: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            >
              {APP_CONFIG.app.title}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
            }}
          >
            <Button
              component={RouteLoadingLink}
              disableLoading
              href={APP_CONFIG.routes.home}
              color="inherit"
              sx={{ color: "text.primary", minWidth: { xs: 0, sm: 64 } }}
            >
              Home
            </Button>
            <Button
              component={RouteLoadingLink}
              disableLoading
              href={APP_CONFIG.routes.search}
              color="inherit"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                minWidth: { xs: 0, sm: 64 },
              }}
            >
              Search
            </Button>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  component={RouteLoadingLink}
                  disableLoading
                  href={APP_CONFIG.routes.about}
                  color="inherit"
                  sx={{ color: "text.primary", minWidth: 0, px: 1 }}
                >
                  About
                </Button>
                <Typography variant="body2" sx={{ color: "text.secondary", ml: 1 }}>
                  Welcome,
                </Typography>
                <UserAccountMenu label={userMenuLabel} />
              </Box>
            ) : (
              <>
                <Button
                  component={RouteLoadingLink}
                  disableLoading
                  href={APP_CONFIG.routes.about}
                  color="inherit"
                  sx={{ color: "text.primary", minWidth: { xs: 0, sm: 64 } }}
                >
                  About
                </Button>
                <HomeSignInButton callbackUrl={callbackUrl} />
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
