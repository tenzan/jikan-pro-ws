'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      // Send a magic link or verification email
      const response = await fetch('/api/auth/email-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Show success message
      setEmailSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/onboarding' });
  };

  const handleMicrosoftSignIn = () => {
    signIn('azure-ad', { callbackUrl: '/onboarding' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">Jikan Pro</span>
          </Link>
          <Link href="/signin" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Log In
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Sign up for your account
            </h2>
            <p className="text-gray-500 mb-8">Always free! No credit card required.</p>
            
            {emailSubmitted ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a sign-up link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  The link expires in 10 minutes. If you don't see the email, check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Connect your calendar by signing up with:
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={handleGoogleSignIn}
                    className="relative overflow-hidden group flex items-center justify-center px-4 py-3 border-0 rounded-lg shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                    style={{ boxShadow: '0 2px 10px rgba(66, 133, 244, 0.2)' }}
                  >
                    <div className="absolute inset-0 w-3 bg-gradient-to-r from-blue-500 to-blue-600 group-hover:w-full transition-all duration-300 z-0"></div>
                    <div className="relative flex items-center justify-center z-10 group-hover:text-white transition-colors duration-300">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                          <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                          <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                          <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                          <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                        </g>
                      </svg>
                      Sign up with Google
                    </div>
                  </button>
                  
                  <button
                    onClick={handleMicrosoftSignIn}
                    className="relative overflow-hidden group flex items-center justify-center px-4 py-3 border-0 rounded-lg shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                    style={{ boxShadow: '0 2px 10px rgba(0, 120, 212, 0.2)' }}
                  >
                    <div className="absolute inset-0 w-3 bg-gradient-to-r from-[#05a6f0] to-[#ffba08] group-hover:w-full transition-all duration-300 z-0"></div>
                    <div className="relative flex items-center justify-center z-10 group-hover:text-white transition-colors duration-300">
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
                        <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                        <path fill="#f35325" d="M1 1h10v10H1z"/>
                        <path fill="#81bc06" d="M12 1h10v10H12z"/>
                        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                        <path fill="#ffba08" d="M12 12h10v10H12z"/>
                      </svg>
                      Sign up with Microsoft
                    </div>
                  </button>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                
                <form onSubmit={handleEmailSignUp}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">{error}</div>
                  )}
                  
                  <div className="mb-4">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border-0 rounded-lg shadow-md text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </form>
              </>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/signin" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all duration-200">
                Log In
              </Link>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            By creating a Jikan Pro account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
