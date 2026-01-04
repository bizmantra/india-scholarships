import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="border-t bg-gray-900 text-gray-400 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white/10 p-1">
                                <Image
                                    src="/logo/logo-is.png"
                                    alt="IS"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-white font-bold text-xl font-serif">IndiaScholarships</h3>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering Indian students with verified scholarship information.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Browse</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/scholarships" className="hover:text-white transition-colors">All Scholarships</Link></li>
                            <li><Link href="/state-scholarships" className="hover:text-white transition-colors">By State</Link></li>
                            <li><Link href="/scholarships-by-category" className="hover:text-white transition-colors">By Category</Link></li>
                            <li><Link href="/scholarships-by-education" className="hover:text-white transition-colors">By Education Level</Link></li>
                            <li><Link href="/scholarships-by-income" className="hover:text-white transition-colors">By Income</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/eligibility-checker" className="hover:text-white transition-colors">Eligibility Checker</Link></li>
                            <li><Link href="/guides" className="hover:text-white transition-colors">How to Apply Guides</Link></li>
                            <li><Link href="/government-scholarships" className="hover:text-white transition-colors">Government Scholarships</Link></li>
                            <li><Link href="/private-scholarships" className="hover:text-white transition-colors">Private Scholarships</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                    <p>© 2026 IndiaScholarships. All rights reserved. | Last updated: January 2026</p>
                </div>
            </div>
        </footer>
    );
}
