"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import type { ProfileAward } from "@/lib/profile-awards";

interface ProfileAwardsPanelProps {
  awards: ProfileAward[];
  unlockedCount: number;
  nextMilestone: string;
}

export default function ProfileAwardsPanel({
  awards,
  unlockedCount,
  nextMilestone,
}: ProfileAwardsPanelProps) {
  const [open, setOpen] = useState(false);

  const unlockedAwards = useMemo(
    () => awards.filter((award) => award.unlocked),
    [awards],
  );
  const featuredAwards = unlockedAwards.slice(0, 6);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(145deg, rgba(245,197,24,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              color="primary.main"
            >
              Awards
            </Typography>
            <Typography color="text.secondary">
              Earn badges by rating more titles and sharing reviews.
            </Typography>
          </Box>

          <Divider />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<EmojiEventsIcon />}
                label={`${unlockedCount}/${awards.length} unlocked`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<LocalFireDepartmentIcon />}
                label={nextMilestone}
                sx={{
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </Stack>

            <Button variant="contained" onClick={() => setOpen(true)}>
              View Badge Case
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {featuredAwards.length > 0 ? (
              featuredAwards.map((award) => (
                <Tooltip
                  key={award.id}
                  arrow
                  title={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {award.name}
                      </Typography>
                      <Typography variant="body2">
                        {award.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.75, opacity: 0.85 }}
                      >
                        {award.requirement}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.75 }}
                      >
                        Progress: {award.progressLabel}
                      </Typography>
                    </Box>
                  }
                  slotProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 240,
                        bgcolor: "#171717",
                        border: "1px solid rgba(255,255,255,0.12)",
                      },
                    },
                  }}
                >
                  <Stack
                    spacing={0.75}
                    sx={{ alignItems: "center", width: 86 }}
                  >
                    <BadgeArt award={award} compact />
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        lineHeight: 1.2,
                      }}
                    >
                      {award.name}
                    </Typography>
                  </Stack>
                </Tooltip>
              ))
            ) : (
              <Typography color="text.secondary">
                No badges unlocked yet. Your first rating will earn one.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Badge Case</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {awards.map((award) => (
              <Paper
                key={award.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: award.unlocked ? "primary.main" : "divider",
                  backgroundColor: award.unlocked
                    ? "rgba(245,197,24,0.08)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <BadgeArt award={award} />
                    <Box>
                      <Typography fontWeight={700}>{award.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {award.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    spacing={0.5}
                    alignItems={{ xs: "flex-start", sm: "flex-end" }}
                  >
                    <Chip
                      label={award.unlocked ? "Unlocked" : "Locked"}
                      color={award.unlocked ? "primary" : "default"}
                      variant={award.unlocked ? "filled" : "outlined"}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {award.requirement}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Progress: {award.progressLabel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Badge ID: {award.badgeCode}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BadgeArt({
  award,
  compact = false,
}: {
  award: ProfileAward;
  compact?: boolean;
}) {
  const size = compact ? 56 : 72;
  const hue = (award.artIndex * 29) % 360;
  const accentHue = (hue + 48) % 360;
  const thirdHue = (hue + 140) % 360;
  const ring = award.unlocked
    ? `hsl(${hue} 92% 58%)`
    : "rgba(255,255,255,0.16)";
  const bgA = award.unlocked ? `hsl(${hue} 78% 18%)` : "rgba(255,255,255,0.05)";
  const bgB = award.unlocked
    ? `hsl(${accentHue} 76% 28%)`
    : "rgba(255,255,255,0.08)";
  const bgC = award.unlocked
    ? `hsl(${thirdHue} 70% 42%)`
    : "rgba(255,255,255,0.14)";
  const symbol = compact ? award.badgeCode.split("-")[0] : award.badgeCode;
  const patternType = award.artIndex % 5;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: compact ? 2.5 : 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: ring,
        boxShadow: award.unlocked
          ? `0 0 0 1px ${ring}, 0 10px 18px rgba(0,0,0,0.28)`
          : "inset 0 0 0 1px rgba(255,255,255,0.04)",
        bgcolor: "rgba(0,0,0,0.18)",
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        sx={{ display: "block", width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient
            id={`badge-gradient-${award.id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={bgA} />
            <stop offset="55%" stopColor={bgB} />
            <stop offset="100%" stopColor={bgC} />
          </linearGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="22"
          fill={`url(#badge-gradient-${award.id})`}
        />

        {patternType === 0 && (
          <>
            <circle cx="50" cy="32" r="20" fill="rgba(255,255,255,0.12)" />
            <circle cx="50" cy="32" r="10" fill="rgba(255,255,255,0.18)" />
          </>
        )}
        {patternType === 1 && (
          <>
            <path d="M18 76 L50 16 L82 76 Z" fill="rgba(255,255,255,0.14)" />
            <path d="M33 74 L50 42 L67 74 Z" fill="rgba(255,255,255,0.18)" />
          </>
        )}
        {patternType === 2 && (
          <>
            <rect
              x="18"
              y="20"
              width="64"
              height="18"
              rx="9"
              fill="rgba(255,255,255,0.12)"
            />
            <rect
              x="18"
              y="44"
              width="64"
              height="12"
              rx="6"
              fill="rgba(255,255,255,0.16)"
            />
            <rect
              x="18"
              y="62"
              width="64"
              height="12"
              rx="6"
              fill="rgba(255,255,255,0.1)"
            />
          </>
        )}
        {patternType === 3 && (
          <>
            <path
              d="M50 16 L60 38 L84 40 L66 56 L72 80 L50 68 L28 80 L34 56 L16 40 L40 38 Z"
              fill="rgba(255,255,255,0.14)"
            />
            <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.2)" />
          </>
        )}
        {patternType === 4 && (
          <>
            <circle cx="30" cy="32" r="12" fill="rgba(255,255,255,0.12)" />
            <circle cx="70" cy="32" r="12" fill="rgba(255,255,255,0.18)" />
            <circle cx="50" cy="62" r="18" fill="rgba(255,255,255,0.14)" />
          </>
        )}

        <rect
          x="14"
          y="68"
          width="72"
          height="18"
          rx="9"
          fill="rgba(0,0,0,0.28)"
        />
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fontSize={compact ? "16" : "14"}
          fontWeight="700"
          fill={award.unlocked ? "#fff" : "rgba(255,255,255,0.72)"}
          fontFamily="Inter, Arial, sans-serif"
          letterSpacing="0.8"
        >
          {symbol}
        </text>
      </Box>
    </Box>
  );
}
