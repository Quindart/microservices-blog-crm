type AvatarProps = { initials: string; tone?: 'blue' | 'orange' };
export function Avatar({ initials, tone = 'blue' }: AvatarProps) {
  return (
    <div className={`avatar ${tone === 'orange' ? 'orange' : ''}`}>
      {initials}
    </div>
  );
}
