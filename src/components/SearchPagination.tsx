'use client';

import { Pagination } from '@mui/material';
import { useRouter } from 'next/navigation';

interface Props {
  q: string;
  type: string;
  page: number;
  totalPages: number;
}

export default function SearchPagination({ q, type, page, totalPages }: Props) {
  const router = useRouter();

  function handleChange(_: React.ChangeEvent<unknown>, value: number) {
    const params = new URLSearchParams({ q, type, page: String(value) });
    router.push(`/search?${params}`);
  }

  return (
    <Pagination
      count={totalPages}
      page={page}
      onChange={handleChange}
      color="primary"
      sx={{ display: 'flex', justifyContent: 'center' }}
    />
  );
}