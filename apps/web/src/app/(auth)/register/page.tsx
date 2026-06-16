'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      const data = response.data;
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('userName', data.data.user.name);
      router.push('/onboarding');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 animate-fade-in-up">
      <Card className="w-full max-w-md shadow-2xl shadow-forest/10 border-white/50">
        <CardHeader className="space-y-3 text-center pb-8 pt-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest to-leaf flex items-center justify-center mx-auto shadow-inner mb-2">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-[family-name:var(--font-heading)]">Create an account</CardTitle>
          <CardDescription className="text-base">Start tracking and reducing your carbon footprint</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {error && <div className="text-sm font-medium text-danger bg-danger/10 p-3 rounded-lg border border-danger/20 text-center">{error}</div>}
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </CardContent>
          <CardFooter className="flex-col gap-5 px-8 pb-8 pt-4">
            <Button type="submit" className="w-full shadow-lg shadow-forest/20 text-md py-3" isLoading={isLoading}>
              Sign Up
            </Button>
            <p className="text-sm text-text-muted text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-forest font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
