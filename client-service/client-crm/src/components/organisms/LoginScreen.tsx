import { LoginCard } from '../molecules/LoginCard';
export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="login-page">
      <div className="login-art">
        <div className="art-copy">
          <span className="eyebrow">NORTHSTAR / CONTROL ROOM</span>
          <h1>
            Make the next
            <br />
            <em>move</em> count.
          </h1>
          <p>A calm, clear view of the work that keeps your business moving.</p>
        </div>
        <div className="art-mark">✦</div>
      </div>
      <LoginCard onLogin={onLogin} />
    </main>
  );
}
