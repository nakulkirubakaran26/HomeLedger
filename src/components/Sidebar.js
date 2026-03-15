import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, PieChart, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between py-8 px-6">
      <div className="space-y-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-white tracking-widest">HL</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">HomeLedger</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
             <NavLink
             key={item.path}
             to={item.path}
             className={({ isActive }) => `
               flex items-center gap-4 px-4 py-3 rounded-lg transition-all
               ${isActive 
                 ? 'bg-primary/10 text-primary font-medium' 
                 : 'text-text-secondary hover:bg-border hover:text-text-primary'}
             `}
           >
             <item.icon className="w-5 h-5" />
             {item.label}
           </NavLink>
          ))}
        </nav>
      </div>

      <button 
        onClick={logout}
        className="flex items-center gap-4 px-4 py-3 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
