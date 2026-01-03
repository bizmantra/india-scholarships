'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Header() {
    const [showScholarshipsDropdown, setShowScholarshipsDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                            <Image
                                src="/logo/logo-is.png"
                                alt="IS"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <span className="text-xl font-black tracking-tight text-blue-700 font-serif group-hover:text-blue-800 transition-colors">
                            IndiaScholarships
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        {/* Find Scholarships Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowScholarshipsDropdown(true)}
                            onMouseLeave={() => setShowScholarshipsDropdown(false)}
                        >
                            <button
                                className="flex items-center gap-1 transition-colors hover:text-blue-700"
                                onClick={() => setShowScholarshipsDropdown(!showScholarshipsDropdown)}
                            >
                                Find Scholarships
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {showScholarshipsDropdown && (
                                <div className="absolute top-full left-0 pt-2 w-56">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                                        <Link href="/state-scholarships" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            By State
                                        </Link>
                                        <Link href="/scholarships-by-category" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            By Category
                                        </Link>
                                        <Link href="/scholarships-by-education" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            By Education Level
                                        </Link>
                                        <Link href="/scholarships-by-income" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            By Income
                                        </Link>
                                        <div className="border-t border-gray-100 my-2"></div>
                                        <Link href="/government-scholarships" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            Government Scholarships
                                        </Link>
                                        <Link href="/private-scholarships" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            Private Scholarships
                                        </Link>
                                        <Link href="/corporate-scholarships" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                                            Corporate Scholarships
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/eligibility-checker" className="transition-colors hover:text-blue-700">
                            Check Eligibility
                        </Link>
                        <Link href="/guides" className="transition-colors hover:text-blue-700">
                            Guides
                        </Link>
                    </nav>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    aria-label="Toggle menu"
                >
                    {showMobileMenu ? (
                        <X className="h-6 w-6 text-gray-700" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-700" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
                <div className="md:hidden border-t bg-white">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        <Link
                            href="/state-scholarships"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            By State
                        </Link>
                        <Link
                            href="/scholarships-by-category"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            By Category
                        </Link>
                        <Link
                            href="/scholarships-by-education"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            By Education Level
                        </Link>
                        <Link
                            href="/scholarships-by-income"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            By Income
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                            href="/government-scholarships"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Government Scholarships
                        </Link>
                        <Link
                            href="/private-scholarships"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Private Scholarships
                        </Link>
                        <Link
                            href="/corporate-scholarships"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Corporate Scholarships
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                            href="/eligibility-checker"
                            className="block py-2 text-sm font-semibold hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Check Eligibility
                        </Link>
                        <Link
                            href="/guides"
                            className="block py-2 text-sm hover:text-blue-700"
                            onClick={() => setShowMobileMenu(false)}
                        >
                            Guides
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
