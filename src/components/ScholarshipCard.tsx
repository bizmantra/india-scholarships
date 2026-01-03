import { Scholarship } from "@/types/scholarship";
import { IndianRupee, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ScholarshipCardProps {
    scholarship: Scholarship;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
    return (
        <div className="scholarship-card group overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                            {scholarship.sc_state}
                        </span>
                        <span className="px-2 py-0.5 bg-success/5 text-success text-[10px] font-bold rounded uppercase tracking-wider">
                            {scholarship.sc_caste[0]}
                        </span>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-success opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>

                <Link href={`/scholarships/${scholarship.sc_slug}`} className="block">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors font-outfit">
                        {scholarship.sc_title}
                    </h3>
                </Link>

                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black font-outfit">₹{scholarship.sc_amount_annual.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">/per year</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{scholarship.sc_deadline ? new Date(scholarship.sc_deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Check Portal'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>95%+ Success</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/scholarships/${scholarship.sc_slug}`}
                        className="flex-1 btn-primary py-2 text-xs"
                    >
                        View Details
                    </Link>
                    <button className="p-2 border rounded-md hover:bg-muted transition-colors">
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="h-1 w-full bg-primary/10 group-hover:bg-primary transition-all scale-x-0 group-hover:scale-x-100 origin-left" />
        </div>
    );
}
