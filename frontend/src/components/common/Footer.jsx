const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">EVENTFLEX</h3>
            <p className="text-gray-400 dark:text-gray-500">Connecting event organizers with talented professionals</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li><a href="/about" className="hover:text-white dark:hover:text-gray-300 transition-colors">About Us</a></li>
              <li><a href="/how-it-works" className="hover:text-white dark:hover:text-gray-300 transition-colors">How It Works</a></li>
              <li><a href="/contact" className="hover:text-white dark:hover:text-gray-300 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 dark:text-gray-500">
              <li><a href="/terms" className="hover:text-white dark:hover:text-gray-300 transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-white dark:hover:text-gray-300 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; 2025 EVENTFLEX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;