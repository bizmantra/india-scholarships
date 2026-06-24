'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

interface SubscribeFormProps {
    slug: string;
    buttonText?: string;
}

export default function SubscribeForm({ slug, buttonText = 'Alert Me When Cycle Opens' }: SubscribeFormProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, slug }),
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage('✅ Alerts configured! We will notify you.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please check your connection.');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-white text-xs font-medium flex items-start gap-2.5 animate-fade-in relative z-10">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold block text-emerald-300">Successfully Subscribed!</span>
                    We will email you at <span className="underline">{email}</span> the moment the new application cycle opens.
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10 w-full">
            <div className="relative">
                <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 transition-all"
                />
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-blue-200" />
            </div>
            
            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-white text-blue-700 text-center font-black text-sm rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
                        Saving Request...
                    </>
                ) : (
                    buttonText
                )}
            </button>

            {status === 'error' && (
                <p className="text-red-200 text-xs font-bold pl-2 animate-fade-in">{message}</p>
            )}
        </form>
    );
}
