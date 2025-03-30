import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Jikan Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/book" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow transition-all duration-200"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              <span className="block">Simplify your</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">scheduling workflow</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl">
              Jikan Pro is a modern scheduling solution designed to streamline appointment booking for businesses worldwide.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Link 
                href="/auth/signin" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
              <Link 
                href="/book" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
              >
                Book Appointment
              </Link>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Background decorative elements */}
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              
              {/* Calendar illustration */}
              <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">April 2025</h3>
                  <div className="flex space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                  <div className="text-gray-500">Su</div>
                  <div className="text-gray-500">Mo</div>
                  <div className="text-gray-500">Tu</div>
                  <div className="text-gray-500">We</div>
                  <div className="text-gray-500">Th</div>
                  <div className="text-gray-500">Fr</div>
                  <div className="text-gray-500">Sa</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center">
                  <div className="text-gray-400 py-1">28</div>
                  <div className="text-gray-400 py-1">29</div>
                  <div className="text-gray-400 py-1">30</div>
                  <div className="py-1">1</div>
                  <div className="py-1">2</div>
                  <div className="py-1">3</div>
                  <div className="py-1">4</div>
                  <div className="py-1">5</div>
                  <div className="py-1">6</div>
                  <div className="py-1">7</div>
                  <div className="py-1">8</div>
                  <div className="py-1">9</div>
                  <div className="py-1">10</div>
                  <div className="py-1">11</div>
                  <div className="py-1">12</div>
                  <div className="py-1">13</div>
                  <div className="py-1">14</div>
                  <div className="py-1">15</div>
                  <div className="py-1">16</div>
                  <div className="py-1">17</div>
                  <div className="py-1">18</div>
                  <div className="py-1">19</div>
                  <div className="py-1">20</div>
                  <div className="py-1">21</div>
                  <div className="py-1">22</div>
                  <div className="py-1">23</div>
                  <div className="py-1">24</div>
                  <div className="py-1">25</div>
                  <div className="py-1">26</div>
                  <div className="py-1">27</div>
                  <div className="py-1">28</div>
                  <div className="py-1">29</div>
                  <div className="py-1">30</div>
                  <div className="text-gray-400 py-1">1</div>
                  <div className="text-gray-400 py-1">2</div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <p className="text-sm font-medium text-gray-800">Meeting with Tanaka-san</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">10:00 AM - 10:30 AM</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                      <p className="text-sm font-medium text-gray-800">Product Review</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">2:00 PM - 3:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Designed for modern businesses
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Streamline your scheduling process and improve customer experience
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Easy Scheduling</h3>
                <p className="text-gray-500">Allow customers to book appointments online 24/7 without phone calls or emails.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Automated Reminders</h3>
                <p className="text-gray-500">Reduce no-shows with automated email reminders to both staff and customers.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Customizable Booking</h3>
                <p className="text-gray-500">Create different appointment types with custom durations, questions, and availability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to streamline your scheduling?</span>
            <span className="block text-blue-100">Get started with Jikan Pro today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Jikan Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
