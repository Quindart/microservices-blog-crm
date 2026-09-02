import {
  BookOpen,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { Module } from '../../types';
import { Brand } from '../atoms/Brand';
import { Avatar } from '../atoms/Avatar';
import { WorkspaceSwitcher } from '../molecules/WorkspaceSwitcher';
const modules = [
  { name: 'Overview', icon: LayoutDashboard, path: '/' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Blog', icon: BookOpen, path: '/blog' },
  { name: 'SEO', icon: Sparkles, path: '/seo' },
  { name: 'Language', icon: Globe2, path: '/language' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Products', icon: Package, path: '/products' },
] as const;
export function Sidebar({
  active,
  onLogout,
  open,
}: {
  active: Module;
  onLogout: () => void;
  open: boolean;
}) {
  return (
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <Brand />
      <WorkspaceSwitcher />
      <nav>
        <p>WORKSPACE</p>
        {modules.map(({ name, icon: Icon, path }) => (
          <Link
            key={name}
            to={path}
            className={active === name ? 'nav-item selected' : 'nav-item'}
          >
            <Icon size={17} />
            {name}
            {name === 'Orders' && <b>12</b>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item">
          <Settings2 size={17} />
          Settings
        </button>
        <button className="user-menu" onClick={onLogout}>
          <Avatar initials="AL" tone="orange" />
          <div>
            <strong>Alex Lee</strong>
            <small>Administrator</small>
          </div>
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
