import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Jikan Pro
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Your modern scheduling solution for small businesses in Japan
        </p>
        <div className="space-x-4">
          <Link
            href="/auth/signin"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/book"
            className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg border border-primary-600 hover:bg-primary-50 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
