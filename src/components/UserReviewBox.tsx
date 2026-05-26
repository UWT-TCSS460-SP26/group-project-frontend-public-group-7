"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

interface UserReviewBoxProps {
  username: string;
}

export default function UserReviewBox({ username }: UserReviewBoxProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const canPost = body.trim().length > 0;

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
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="primary.main"
      >
        Write a review
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Posting as {username}
      </Typography>

      <Box sx={{ display: "grid", gap: 1.5 }}>
        <TextField
          label="Review title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Comment or review"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" disabled={!canPost}>
            Post review
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
