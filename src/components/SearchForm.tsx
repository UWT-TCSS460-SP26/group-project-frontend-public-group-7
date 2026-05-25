'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  initialQ?: string;
}

export default function SearchForm({ initialQ = '' }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!q.trim()) return;
    const params = new URLSearchParams({ q: q.trim(), page: '1' });
    router.push(`/search?${params}`);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
    >
      <TextField
        label="Search movies & TV shows"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ flexGrow: 1, minWidth: 240 }}
        autoFocus
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<SearchIcon />}
        disabled={!q.trim()}
      >
        Search
      </Button>
    </Box>
  );
}