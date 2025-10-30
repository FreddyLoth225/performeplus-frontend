'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/api/query-client'
import { ReactNode } from 'react'
import { UserLoader } from '@/components/auth/user-loader'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserLoader />
      {children}
    </QueryClientProvider>
  )
}