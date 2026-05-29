"use client";

import { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { censorProfanity } from "@/lib/censor-profanity";
import type { ReviewAuthor } from "@/types/media";

interface ReviewExcerptProps {
  title?: string | null;
  body: string;
  author?: string | ReviewAuthor | null;
}

const MAX_PREVIEW_CHARS = 220;

export default function ReviewExcerpt({
  title,
  body,
  author,
}: ReviewExcerptProps) {
  const [expanded, setExpanded] = useState(false);

  const authorName = useMemo(() => {
    if (!author) return "Unknown user";
    if (typeof author === "string") return author.trim() || "Unknown user";
    return (author.name ?? author.username)?.trim() || "Unknown user";
  }, [author]);

  const isLong = body.length > MAX_PREVIEW_CHARS;
  const censoredTitle = title ? censorProfanity(title) : null;
  const censoredBody = censorProfanity(body);
  const bodyParagraphs = censoredBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const previewBody =
    isLong && !expanded
      ? `${censoredBody.slice(0, MAX_PREVIEW_CHARS).trimEnd()}...`
      : censoredBody;
  const previewParagraphs = previewBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {censoredTitle ? (
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {censoredTitle}
        </Typography>
      ) : null}

      <Box
        sx={{
          maxHeight: expanded && isLong ? 240 : "none",
          overflowY: expanded && isLong ? "auto" : "visible",
          pr: expanded && isLong ? 0.75 : 0,
        }}
      >
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {(expanded ? bodyParagraphs : previewParagraphs).map(
            (paragraph, index) => (
              <Typography
                key={`${index}-${paragraph.slice(0, 24)}`}
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
              >
                {paragraph}
              </Typography>
            ),
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", pt: 0.25 }}
          >
            - {authorName}
          </Typography>
        </Box>
      </Box>

      {isLong ? (
        <Button
          variant="text"
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ mt: 1, px: 0, minWidth: 0 }}
        >
          {expanded ? "Hide full review" : "View whole review"}
        </Button>
      ) : null}
    </Box>
  );
}
