"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { API_BASE } from "@/lib/api";
import {
  checkForNewAwards,
  getAwardStorageKey,
  getAwardUserKey,
} from "@/lib/award-unlocks";
import { censorProfanity } from "@/lib/censor-profanity";
import { deleteReview, updateReview } from "@/lib/user-content-api";
import type { MediaType, ReviewRecord } from "@/types/media";

interface UserReviewBoxProps {
  tmdbId: number;
  mediaType: MediaType;
}

export default function UserReviewBox({
  tmdbId,
  mediaType,
}: UserReviewBoxProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [existingReview, setExistingReview] = useState<ReviewRecord | null>(
    null,
  );
  const [loadingExisting, setLoadingExisting] = useState(true);

  // New review form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // Delete dialog state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadExistingReview() {
      if (!session?.accessToken) {
        setLoadingExisting(false);
        return;
      }

      try {
        let page = 1;
        let totalPages = 1;
        let found: ReviewRecord | undefined;

        while (page <= totalPages && !found) {
          const response = await fetch(
            `${API_BASE}/v1/reviews/me?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
              cache: "no-store",
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to load your review: ${response.status}`);
          }

          const data = (await response.json()) as {
            totalPages: number;
            results: ReviewRecord[];
          };

          totalPages = data.totalPages;
          found = data.results.find(
            (r) => r.tmdbId === tmdbId && r.mediaType === mediaType,
          );
          page += 1;
        }

        if (!cancelled) {
          setExistingReview(found ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoadingExisting(false);
        }
      }
    }

    void loadExistingReview();

    return () => {
      cancelled = true;
    };
  }, [mediaType, session?.accessToken, tmdbId]);

  const canPost = body.trim().length > 0 && !!session?.accessToken;

  async function handlePost() {
    if (!canPost || !session?.accessToken) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/v1/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          title: title.trim() ? censorProfanity(title.trim()) : null,
          body: censorProfanity(body.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post review: ${response.status}`);
      }

      const posted = (await response.json()) as ReviewRecord;

      const userKey = getAwardUserKey(session.user);
      if (userKey) {
        await checkForNewAwards(
          session.accessToken,
          getAwardStorageKey(userKey),
        );
      }

      setTitle("");
      setBody("");
      setExistingReview(posted);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Couldn't post your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit() {
    if (!existingReview) return;
    setEditTitle(existingReview.title ?? "");
    setEditBody(existingReview.body);
    setEditOpen(true);
  }

  async function handleUpdateReview() {
    if (!session?.accessToken || !existingReview) return;

    try {
      const updated = await updateReview(
        session.accessToken,
        existingReview.id,
        {
          title: editTitle.trim() ? censorProfanity(editTitle.trim()) : "",
          body: censorProfanity(editBody),
        },
      );
      setExistingReview(updated);
      setEditOpen(false);
      router.refresh();
    } catch {
      alert("Failed to update review.");
    }
  }

  async function handleDelete() {
    if (!session?.accessToken || !existingReview) return;

    setDeleting(true);

    try {
      await deleteReview(session.accessToken, existingReview.id);
      setExistingReview(null);
      setDeleteConfirm(false);
      router.refresh();
    } catch {
      alert("Couldn't delete your review.");
    } finally {
      setDeleting(false);
    }
  }

  if (loadingExisting) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Loading your review...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {existingReview ? (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              Your review
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={openEdit}
                aria-label="Edit review"
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteConfirm(true)}
                aria-label="Delete review"
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
          {existingReview.title && (
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {censorProfanity(existingReview.title)}
            </Typography>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {censorProfanity(existingReview.body)}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary.main"
            sx={{ mb: "20px" }}
          >
            Write a review
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 1.5 }}>
            <TextField
              placeholder="Review title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              fullWidth
              size="small"
              disabled={submitting}
              slotProps={{
                htmlInput: {
                  "aria-label": "Review title",
                },
              }}
            />
            <TextField
              placeholder="Comment or review"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              fullWidth
              multiline
              minRows={4}
              disabled={submitting}
              slotProps={{
                htmlInput: {
                  "aria-label": "Comment or review",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                disabled={!canPost || submitting}
                onClick={() => void handlePost()}
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {submitting ? "Posting..." : "Post review"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Review Dialog — same pattern as UserContentList */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <TextField
              label="Review"
              fullWidth
              multiline
              rows={4}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleUpdateReview()}
            variant="contained"
            disabled={!editBody.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog — same pattern as UserContentList */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button
            onClick={() => void handleDelete()}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
