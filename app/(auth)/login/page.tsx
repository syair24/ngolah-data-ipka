'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock } from 'lucide-react';

import Button from '@/components/Button';
import Input from '@/components/Input';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Username atau password salah.');
        return;
      }

      // Simpan username dari akun yang benar-benar berhasil login
      const loggedInUsername = data.user.username;

      localStorage.setItem('username', loggedInUsername);
      sessionStorage.setItem('username', loggedInUsername);

      // Setelah login, masuk ke halaman utama
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      setErrorMessage('Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1e40af] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute -top-[250px] -left-[200px] w-[600px] h-[600px] bg-[#2563eb] rounded-full pointer-events-none z-0" />
      <div className="absolute -bottom-[200px] -left-[300px] w-[650px] h-[650px] bg-[#3b82f6] rounded-full pointer-events-none z-0 opacity-80" />
      <div className="absolute -bottom-[150px] -right-[250px] w-[700px] h-[700px] bg-[#1d4ed8] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[10%] -right-[100px] w-[300px] h-[300px] bg-[#2563eb] rounded-full pointer-events-none z-0 opacity-60" />

      {/* Login */}
      <div className="w-full max-w-sm z-10 text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">Login</h1>

        <p className="text-blue-100 text-sm mb-8">Please enter your Username and your Password</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Error */}
          {errorMessage && (
            <div className="w-full rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Username */}
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessage('');
            }}
            required
            icon={<User className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          {/* Password */}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage('');
            }}
            required
            icon={<Lock className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          {/* Forgot Password */}
          <div className="text-right">
            <span>Forgot password?</span>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="outline"
            isLoading={isLoading}
            className="w-full py-3.5 !border-green-500 !text-green-400 hover:!bg-green-500 hover:!text-white focus:!ring-green-400 rounded-xl font-semibold transition-all duration-300 mt-2"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
