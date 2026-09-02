import { Brand } from '../atoms/Brand';
import { Button } from '../atoms/Button';
export function LoginCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="login-panel">
      <Brand />
      <div className="login-content">
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Sign in to your workspace</h2>
        <p>Manage your business from one focused place.</p>
        <Button onClick={onLogin}>
          <span className="google">G</span> Continue with Google
        </Button>
        <Button onClick={onLogin}>
          <span className="github">●</span> Continue with GitHub
        </Button>
        <div className="divider">
          <span>or continue with email</span>
        </div>
        <label>
          Email address
          <input type="email" placeholder="you@company.com" />
        </label>
        <Button variant="primary" className="full" onClick={onLogin}>
          Continue <span>→</span>
        </Button>
        <small>
          By continuing, you agree to Northstar's Terms and Privacy Policy.
        </small>
      </div>
    </div>
  );
}
