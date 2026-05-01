'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, User, Stethoscope } from 'lucide-react';

type User = {
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  id: string;
  email: string;
};
type Props = {
  user: User;
};

const menuItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'user'],
  },
  {
    label: 'Procedimientos',
    href: '/procedimientos',
    icon: Stethoscope,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    roles: ['super_admin'],
  },
];

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-primary-200 min-h-screen">
      <div className="p-4 border-b border-primary-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">S</span>
          </div>
          <h1 className="text-lg font-semibold text-primary-700">SkinClinic</h1>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {filteredItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-primary-200">
        <Link
          href="/perfil"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
            pathname === '/perfil'
              ? 'bg-primary-50 text-primary-700'
              : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
          }`}
        >
          <User className="w-5 h-5" />
          Mi Perfil
        </Link>
      </div>
    </aside>
  );
}