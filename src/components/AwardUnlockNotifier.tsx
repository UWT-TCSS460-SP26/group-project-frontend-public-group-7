"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { ReactElement } from "react";
import type { TransitionProps } from "@mui/material/transitions";

import {
  AWARD_UNLOCK_EVENT,
  getAwardStorageKey,
  getAwardUserKey,
  initializeSeenAwards,
} from "@/lib/award-unlocks";
import type { ProfileAward } from "@/lib/profile-awards";
import { BadgeArt } from "@/components/ProfileAwardsPanel";

export default function AwardUnlockNotifier() {
  const { data: session } = useSession();
  const [earnedAwards, setEarnedAwards] = useState<ProfileAward[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accessToken = session?.accessToken;
    const userKey = getAwardUserKey(session?.user);

    if (!accessToken || !userKey) return;

    void initializeSeenAwards(accessToken, getAwardStorageKey(userKey)).catch(
      (error) => {
        console.error(error);
      },
    );
  }, [session?.accessToken, session?.user]);

  useEffect(() => {
    function handleAwardUnlock(event: Event) {
      const customEvent = event as CustomEvent<{ awards: ProfileAward[] }>;
      const nextAwards = customEvent.detail?.awards ?? [];

      if (nextAwards.length === 0) return;

      setEarnedAwards((current) => {
        const seen = new Set(current.map((award) => award.id));
        return [
          ...current,
          ...nextAwards.filter((award) => !seen.has(award.id)),
        ];
      });
      setOpen(true);
    }

    window.addEventListener(AWARD_UNLOCK_EVENT, handleAwardUnlock);
    return () => {
      window.removeEventListener(AWARD_UNLOCK_EVENT, handleAwardUnlock);
    };
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth="sm"
      TransitionComponent={AwardUnlockTransition}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(10, 10, 10, 0.72)",
          },
        },
        paper: {
          sx: {
            overflow: "hidden",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "rgba(245,197,24,0.24)",
            background:
              "linear-gradient(180deg, rgba(245,197,24,0.14) 0%, rgba(31,31,31,0.98) 22%, rgba(24,24,24,1) 100%)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,197,24,0.08)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ px: { xs: 2.25, sm: 3 }, pt: { xs: 2.25, sm: 2.75 }, pb: 1.5 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.75}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{
                width: 58,
                height: 58,
                borderRadius: "18px",
                color: "primary.contrastText",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,224,122,0.95) 0%, rgba(245,197,24,0.92) 42%, rgba(201,160,0,0.92) 100%)",
                boxShadow:
                  "0 10px 24px rgba(245,197,24,0.24), inset 0 1px 0 rgba(255,255,255,0.36)",
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 30 }} />
            </Stack>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: "primary.main",
                  letterSpacing: 1.4,
                  textShadow: "0 0 12px rgba(245,197,24,0.2)",
                }}
              >
                Award Earned
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  lineHeight: 1.15,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                New award unlocked
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, maxWidth: 420, color: "rgba(255,255,255,0.78)" }}
              >
                {earnedAwards.length === 1
                  ? "Your latest contribution earned a new badge."
                  : `Your latest activity unlocked ${earnedAwards.length} new badges.`}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              width: { xs: "100%", sm: "auto" },
              justifyContent: "space-between",
            }}
          >
            <Chip
              label={`${earnedAwards.length} new`}
              size="small"
              sx={{
                bgcolor: "rgba(245,197,24,0.14)",
                color: "primary.main",
                border: "1px solid rgba(245,197,24,0.24)",
                fontWeight: 700,
              }}
            />
            <Button
              variant="text"
              color="inherit"
              onClick={() => setOpen(false)}
              sx={{
                minWidth: 0,
                px: 1,
                color: "rgba(255,255,255,0.72)",
                "&:hover": {
                  color: "#ffffff",
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
              aria-label="Close new award popup"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(245,197,24,0.16)" }} />

      <DialogContent sx={{ px: { xs: 2.25, sm: 3 }, py: 2.25 }}>
        <Stack spacing={1.5} sx={{ pb: 1 }}>
          {earnedAwards.map((award) => (
            <Paper
              key={award.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                borderColor: "rgba(245,197,24,0.22)",
                background:
                  "linear-gradient(145deg, rgba(245,197,24,0.12) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.01) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BadgeArt award={award} />
                <Box>
                  <Typography fontWeight={700} sx={{ color: "#f6f7f8" }}>
                    {award.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.25, color: "rgba(255,255,255,0.76)" }}
                  >
                    {award.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "inline-block",
                      mt: 1,
                      px: 1,
                      py: 0.35,
                      borderRadius: 999,
                      color: "primary.main",
                      bgcolor: "rgba(245,197,24,0.12)",
                      border: "1px solid rgba(245,197,24,0.18)",
                    }}
                  >
                    {award.requirement}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function AwardUnlockTransition(
  props: TransitionProps & { children: ReactElement<unknown> },
) {
  return <Slide {...props} direction="up" />;
}
