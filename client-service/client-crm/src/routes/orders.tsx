import { createFileRoute } from '@tanstack/react-router';
import App from '../App';
export const Route = createFileRoute('/orders')({
  component: () => <App initialModule="Orders" />,
});
