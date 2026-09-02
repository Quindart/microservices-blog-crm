import { createFileRoute } from '@tanstack/react-router';
import App from '../App';
export const Route = createFileRoute('/payments')({
  component: () => <App initialModule="Payments" />,
});
