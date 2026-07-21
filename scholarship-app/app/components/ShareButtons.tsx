"use client";

import { Share2, Link as LinkIcon, Twitter, Facebook, Linkedin } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
    title: string;
    url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    // We need to encode the params
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0-1 0V9a.5.5 0 0 0-1 0v3a.5.5 0 0 0 1 0v-1a.5.5 0 0 0 1 0" />
                    <path d="M15 10a.5.5 0 0 0-1 0V9a.5.5 0 0 0-1 0v3a.5.5 0 0 0 1 0v-1a.5.5 0 0 0 1 0" />
                </svg>
            ),
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            color: "bg-green-50 hover:bg-green-100",
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-5 h-5 text-sky-500" />,
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: "bg-sky-50 hover:bg-sky-100",
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="w-5 h-5 text-blue-700" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "bg-blue-50 hover:bg-blue-100",
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5 text-blue-600" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "bg-blue-50 hover:bg-blue-100",
        },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="py-4 border-t border-b border-gray-150">
            <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Share this Scholarship
                </h3>
            </div>

            <div className="flex flex-wrap gap-2">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-lg transition-all ${link.color} border border-gray-200/60`}
                        aria-label={`Share on ${link.name}`}
                    >
                        {link.icon}
                    </a>
                ))}

                <button
                    onClick={handleCopy}
                    className="p-2.5 bg-surface-gray hover:bg-gray-100 rounded-lg transition-all border border-gray-200/60 relative group"
                    aria-label="Copy Link"
                >
                    {copied ? (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap">
                            Copied!
                        </span>
                    ) : null}
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
