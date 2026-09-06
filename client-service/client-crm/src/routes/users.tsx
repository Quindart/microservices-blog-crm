import { createFileRoute } from '@tanstack/react-router';
import App from '../App';
import { customersQueryOptions } from '../hooks/useCustomer';

export const Route = createFileRoute('/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(customersQueryOptions),
  component: () => <App initialModule="Users" />,
});
