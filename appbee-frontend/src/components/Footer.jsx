import React from 'react';
import { Heart } from 'lucide-react';
import logo from '../appbee-logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400 gap-4">

                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="AppBee Logo"
                        className="h-6 w-auto opacity-70 dark:opacity-50 grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    <span>© {currentYear} AppBee Networks.</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-300">
                    <span>Made with</span>
                    <Heart size={14} className="text-red-500 fill-red-500" />
                    <span>for junior developers</span>
                </div>

                <div className="hidden md:block">
                    All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;