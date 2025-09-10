import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#232629' }} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold mb-4 flex gap-3">
              <span>VN</span>
              <span className="text-[#a96b11]">GOOGLE</span>
            </h3>
            <div className="flex flex-col text-gray-300">
              <p className="text-center text-lg font-bold mb-2">Title here</p>
              <p className="text-gray-400 text-sm">
                {(() => {
                  const text = "Chuyên trang dictum, eget fermentum metus finibus. Donec ut gravida turpis, a malesuada odio. In sagittis accumsan massa. Praesent dictum lorem orci, tincidunt imperdiet magna rutrum non. Fusce non egestas urna. Vivamus hendrerit laoreet eros eget porta. Proin consequat imperdiet risus eget elementum. Praesent convallis, diam luctus imperdiet vestibulum, dui risus cursus mauris, ac pharetra erat leo et mi. Maecenas hendrerit odio sit amet scelerisque mattis. Donec in dui nibh. Pellentesque euismod ipsum vel egestas feugiat. Morbi tortor nisi, maximus eget odio eu, tempor iaculis dolor.";
                  return text.length > 300 ? `${text.substring(0, 300)}...` : text;
                })()}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Useful links</h4>
            <ul className="grid grid-cols-2 gap-2 mb-6 list-disc list-inside pl-6">
              <li><Link href="/merchants" className="text-gray-400 hover:text-white">Add bookies</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white">Place ads</Link></li>
              <li><Link href="/write-review" className="text-gray-400 hover:text-white">Feedback</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Dream decoding</Link></li>
              <li><Link href="/merchants" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white">Sports betting</Link></li>
              <li><Link href="/write-review" className="text-gray-400 hover:text-white">Clause</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Betting experience</Link></li>
            </ul>
            <ul className="space-y-2">
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 text-center text-gray-400">
          <p>Gambling involves risk, please play responnsibly and safely. Win big</p>
        </div>
      </div>
    </footer>
  );
}