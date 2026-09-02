import { Bell, Menu, X } from 'lucide-react';
import { Avatar } from '../atoms/Avatar';
import type { Module } from '../../types';
export function AppHeader({
  active,
  open,
  onToggle,
}: {
  active: Module;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <header>
      <button className="menu-button" onClick={onToggle}>
        {open ? <X /> : <Menu />}
      </button>
      <div className="breadcrumb">
        <span>Workspace</span>
        <b>/</b>
        <strong>{active}</strong>
      </div>
      <div className="header-actions">
        <button className="icon-button">
          <Bell size={18} />
          <i />
        </button>
        <Avatar initials="AL" tone="orange" />
      </div>
    </header>
  );
}
