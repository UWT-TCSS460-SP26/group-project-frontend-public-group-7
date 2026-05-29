"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { API_BASE } from "@/lib/api";

interface UserDisplayNameFormProps {
  accessToken: string;
  initialDisplayName: string;
  fallbackName: string;
  storageKey: string;
}

interface UserProfileResponse {
  displayName: string | null;
}

export default function UserDisplayNameForm({
  accessToken,
  initialDisplayName,
  fallbackName,
  storageKey,
}: UserDisplayNameFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window === "undefined") {
      return initialDisplayName;
    }

    return window.localStorage.getItem(storageKey) ?? initialDisplayName;
  });
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedDisplayName = window.localStorage.getItem(storageKey);
    setDisplayName(storedDisplayName ?? initialDisplayName);
  }, [initialDisplayName, storageKey]);

  async function saveDisplayName(nextValue: string | null) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/v1/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          displayName: nextValue,
        }),
      });

      if (!response.ok) {
        const message =
          response.status === 409
            ? "That display name is already taken."
            : "Couldn't update your display name.";
        throw new Error(message);
      }

      const savedProfile = (await response.json()) as UserProfileResponse;
      const savedDisplayName = savedProfile.displayName?.trim() ?? "";

      setDisplayName(savedDisplayName);
      if (savedDisplayName) {
        window.localStorage.setItem(storageKey, savedDisplayName);
      } else {
        window.localStorage.removeItem(storageKey);
      }
      setSuccess(
        savedDisplayName
          ? "Display name updated. New comments and reviews will use it."
          : "Display name cleared. Comments will fall back to your default name.",
      );
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update your display name.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Enter a display name or use Clear to reset it.");
      setSuccess(null);
      return;
    }

    if (trimmed.split(/\s+/).length > 1) {
      setError("Display name must be one word.");
      setSuccess(null);
      return;
    }

    await saveDisplayName(trimmed);
  }

  async function handleClear() {
    await saveDisplayName(null);
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              color="primary.main"
            >
              Comment Display Name
            </Typography>
            <Typography color="text.secondary">
              Choose the name shown on your reviews and comments.
            </Typography>
          </Box>

          {success ? <Alert severity="success">{success}</Alert> : null}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current comment name
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body1" fontWeight={600}>
                  {displayName.trim() || fallbackName}
                </Typography>
                <IconButton
                  aria-label="Edit display name"
                  onClick={() => {
                    setDisplayName(displayName.trim() || "");
                    setError(null);
                    setOpen(true);
                  }}
                  size="small"
                  sx={{
                    color: "primary.main",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Fallback: {fallbackName}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Dialog
        open={open}
        onClose={() => {
          if (submitting) return;
          setOpen(false);
          setError(null);
          setDisplayName(
            window.localStorage.getItem(storageKey) ?? initialDisplayName,
          );
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit display name</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography color="text.secondary">
                This name shows up on your comments and reviews.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={submitting}
              fullWidth
              inputProps={{ maxLength: 50 }}
              helperText={`Use one word only. Leave it cleared and use Clear to fall back to ${fallbackName}.`}
              autoFocus
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                Current comment name: {displayName.trim() || fallbackName}
              </Typography>

              <Stack direction="row" spacing={1.25}>
                <Button
                  variant="outlined"
                  onClick={() => void handleClear()}
                  disabled={submitting}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
