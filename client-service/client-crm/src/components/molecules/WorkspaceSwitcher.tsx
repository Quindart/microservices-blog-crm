import { ChevronDown } from 'lucide-react';
import { Avatar } from '../atoms/Avatar';
export function WorkspaceSwitcher() {
  return (
    <div className="workspace">
      <Avatar initials="NS" />
      <div>
        <strong>Northstar Studio</strong>
        <small>Business workspace</small>
      </div>
      <ChevronDown size={15} />
    </div>
  );
}
