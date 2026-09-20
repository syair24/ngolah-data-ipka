'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock } from 'lucide-react';

import Button from '@/components/Button';
import Input from '@/components/Input';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Bersihkan error sebelumnya
    setErrorMessage('');

    // Cek password
    if (password !== confirmPassword) {
      setErrorMessage('Password dan Confirm Password tidak sama.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Registrasi gagal.');
        return;
      }

      // Berhasil → langsung ke login
      router.push('/login');
    } catch (error) {
      console.error('REGISTER ERROR:', error);

      setErrorMessage('Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1e40af] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bubble */}
      <div className="absolute -top-[250px] -left-[200px] w-[600px] h-[600px] bg-[#2563eb] rounded-full pointer-events-none z-0"></div>

      <div className="absolute -bottom-[200px] -left-[300px] w-[650px] h-[650px] bg-[#3b82f6] rounded-full pointer-events-none z-0 opacity-80"></div>

      <div className="absolute -bottom-[150px] -right-[250px] w-[700px] h-[700px] bg-[#1d4ed8] rounded-full pointer-events-none z-0"></div>

      <div className="absolute top-[10%] -right-[100px] w-[300px] h-[300px] bg-[#2563eb] rounded-full pointer-events-none z-0 opacity-60"></div>

      <div className="w-full max-w-sm z-10 text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">Register</h1>

        <p className="text-blue-100 text-sm mb-8">Create your account to get started</p>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div className="w-full rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            icon={<User className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            icon={<Lock className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            icon={<Lock className="h-5 w-5" />}
            className="!bg-transparent !border-blue-300 !text-white !placeholder-blue-200 focus:!border-white"
          />

          <Button
            type="submit"
            variant="outline"
            isLoading={isLoading}
            className="w-full py-3.5 !border-green-500 !text-green-400 hover:!bg-green-500 hover:!text-white focus:!ring-green-400 rounded-xl font-semibold transition-all duration-300 mt-4"
          >
            Register
          </Button>
        </form>

        <p className="text-xs text-blue-200 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 font-semibold hover:underline">
            Login here!
          </Link>
        </p>
      </div>
    </div>
  );
}
