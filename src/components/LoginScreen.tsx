import React, { useState } from 'react';
import { Employee } from '../types';
import { Lock, User, Sparkles, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
  centerName: string;
}

export default function LoginScreen({ employees, onLogin, centerName }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    
    // Find employee by username (case-insensitive) and match password
    const user = employees.find(
      (emp) => emp.username.toLowerCase() === trimmedUser && emp.isActive
    );

    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('მომხმარებლის სახელი ან პაროლი არასწორია, ან ანგარიში დეაქტივირებულია.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <h2 className="text-3xl font-bold font-display tracking-tight text-stone-800">
          {centerName}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          სილამაზისა და ესთეტიკის სამართავი სისტემა
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-100 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-1">
                მომხმარებლის სახელი
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="h-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all bg-stone-50/50"
                  placeholder="მაგ: admin, tamar"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                პაროლი
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all bg-stone-50/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 flex items-start gap-2.5 border border-red-100 text-red-800 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all cursor-pointer font-display"
              >
                ავტორიზაცია
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-6">
            <div className="text-xs text-stone-400 text-center space-y-2">
              <p>საწყისი სატესტო ანგარიშები შესასვლელად:</p>
              <div className="grid grid-cols-2 gap-2 text-left bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div>
                  <p className="font-semibold text-stone-600">ადმინისტრატორი:</p>
                  <p>Username: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">admin</code></p>
                  <p>Password: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">password123</code></p>
                </div>
                <div>
                  <p className="font-semibold text-stone-600">თანამშრომელი:</p>
                  <p>Username: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">tamar</code></p>
                  <p>Password: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">user123</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
