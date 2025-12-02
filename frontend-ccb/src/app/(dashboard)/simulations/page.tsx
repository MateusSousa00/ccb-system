import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { SimulationsClient } from './simulations-client';

async function getSimulations() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/simulations?page=1&limit=10`,
    {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch simulations');
  }

  return response.json();
}

export default async function SimulationsPage() {
  const queryClient = new QueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ['simulations', { page: 1, limit: 10 }],
    queryFn: getSimulations,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SimulationsClient />
    </HydrationBoundary>
  );
}
