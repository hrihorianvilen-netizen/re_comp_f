import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Trusted <span className="text-blue-200">Merchants</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Read authentic reviews, compare businesses, and make informed decisions. 
            Join thousands of users sharing their experiences.
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex bg-white rounded-lg p-2">
              <input
                type="text"
                placeholder="Search for merchants, products, or services..."
                className="flex-1 px-4 py-3 text-gray-900 bg-transparent outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-medium transition-colors">
                Search
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/merchants"
              className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse All Merchants
            </Link>
            <Link
              href="/write-review"
              className="bg-blue-500 hover:bg-blue-400 px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}