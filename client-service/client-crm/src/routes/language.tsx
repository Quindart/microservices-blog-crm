import { createFileRoute } from '@tanstack/react-router';
import App from '../App';
export const Route = createFileRoute('/language')({
  component: () => <App initialModule="Language" />,
});
