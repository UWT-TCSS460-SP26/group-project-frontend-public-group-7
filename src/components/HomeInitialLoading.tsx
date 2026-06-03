import { Box, Stack, Typography } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";

export default function HomeInitialLoading() {
  return (
    <Box
      role="status"
      aria-label="Loading home screen"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        bgcolor: "#050505",
        color: "common.white",
        position: "relative",
        "@keyframes curtainOpen": {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(0.92)" },
        },
        "@keyframes marqueePulse": {
          "0%, 100%": { opacity: 0.35, transform: "scale(0.92)" },
          "50%": { opacity: 1, transform: "scale(1)" },
        },
        "@keyframes projectorSweep": {
          "0%": { transform: "translateX(-120%) skewX(-12deg)" },
          "100%": { transform: "translateX(120%) skewX(-12deg)" },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(68,9,13,0.92) 0%, rgba(18,3,4,0.94) 24%, transparent 48%, rgba(18,3,4,0.94) 76%, rgba(68,9,13,0.92) 100%)",
          transformOrigin: "center",
          animation: "curtainOpen 1.8s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "18%",
          bottom: "18%",
          width: "38%",
          background:
            "linear-gradient(90deg, transparent, rgba(245,197,24,0.24), transparent)",
          filter: "blur(8px)",
          animation: "projectorSweep 1.65s linear infinite",
        },
      }}
    >
      <Stack
        spacing={2.5}
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: 1,
          px: 3,
          py: 4,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.72)",
          border: "1px solid rgba(245,197,24,0.22)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.62)",
          minWidth: { xs: 240, sm: 300 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 8px)",
            gap: 1,
          }}
        >
          {Array.from({ length: 7 }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: "marqueePulse 900ms ease-in-out infinite",
                animationDelay: `${index * 90}ms`,
              }}
            />
          ))}
        </Box>

        <MovieIcon
          sx={{
            fontSize: 54,
            color: "primary.main",
            filter: "drop-shadow(0 0 14px rgba(245,197,24,0.44))",
          }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            component="div"
            fontWeight={800}
            sx={{ color: "primary.main", letterSpacing: 0 }}
          >
            7MDB
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Starting the show
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
