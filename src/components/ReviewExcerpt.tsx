"use client";

import { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

interface ReviewExcerptProps {
  title?: string | null;
  body: string;
  author?: string | { name?: string | null } | null;
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
    if (typeof author === "string") return author;
    return author.name?.trim() || "Unknown user";
  }, [author]);

  const isLong = body.length > MAX_PREVIEW_CHARS;
  const previewBody =
    isLong && !expanded
      ? `${body.slice(0, MAX_PREVIEW_CHARS).trimEnd()}...`
      : body;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
      }}
    >
      {title ? (
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
      ) : null}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ whiteSpace: "pre-line" }}
      >
        {previewBody}
        {"\n"}
        <Box
          component="span"
          sx={{ display: "block", mt: 1, fontStyle: "italic" }}
        >
          - {authorName}
        </Box>
      </Typography>

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
