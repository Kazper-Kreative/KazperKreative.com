import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 py-8 text-zinc-500 text-sm text-center">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="mb-4 md:mb-0">© 2026 Kazper Kreative LLC</p>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/kazperkreative" // Placeholder GitHub URL
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            GitHub
          </a>
          <span className="flex items-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="ml-2">Status: Operational</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
