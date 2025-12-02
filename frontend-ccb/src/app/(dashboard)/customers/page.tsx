import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CustomersClient } from './customers-client';

async function getCustomers() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/customer?page=1&limit=10`,
    {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
}

export default async function CustomersPage() {
  const queryClient = new QueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ['customers', { page: 1, limit: 10 }],
    queryFn: getCustomers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomersClient />
    </HydrationBoundary>
  );
}
