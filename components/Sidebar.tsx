'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, User, Heart } from 'lucide-react';

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

  const IconComponent = user.role === 'super_admin' ? Heart : null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-4 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
            {IconComponent ? <IconComponent className="w-5 h-5 text-white" /> : <Heart className="w-5 h-5 text-white" />}
          </div>
          <h1 className="text-lg font-semibold text-slate-800">SkinClinic</h1>
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
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
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

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
        <Link
          href="/perfil"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
            pathname === '/perfil'
              ? 'bg-slate-100 text-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
          Mi Perfil
        </Link>
      </div>
    </aside>
  );
}