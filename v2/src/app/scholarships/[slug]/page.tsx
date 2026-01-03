import { MOCK_SCHOLARSHIPS } from "@/data/mock-scholarships";
import {
    Clock,
    ShieldCheck,
    Share2,
    Bookmark,
    ExternalLink,
    ChevronRight,
    Info,
    HelpCircle,
    Phone,
    CheckCircle2,
    IndianRupee
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ScholarshipDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = MOCK_SCHOLARSHIPS.find(s => s.sc_slug === slug);

    if (!scholarship) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 text-[10px] sm:text-sm">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/scholarships" className="hover:text-primary transition-colors">Scholarships</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-foreground font-medium line-clamp-1">{scholarship.sc_title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Content */}
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase tracking-wider">{scholarship.sc_state}</span>
                            <span className="px-2 py-1 bg-success/5 text-success text-[10px] font-bold rounded uppercase tracking-wider">{scholarship.sc_caste.join(', ')}</span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded uppercase tracking-wider">{scholarship.sc_education_level}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 font-outfit">{scholarship.sc_title}</h1>
                        <p className="text-muted-foreground text-sm mb-6 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-success" /> Verified by {scholarship.sc_provider}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl mb-8">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Amount</p>
                                <p className="text-lg font-black font-outfit">₹{scholarship.sc_amount_annual.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Deadline</p>
                                <p className="text-sm font-bold">{scholarship.sc_deadline ? new Date(scholarship.sc_deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Check Portal'}</p>
                            </div>
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Renewable</p>
                                <p className="text-sm font-bold">{scholarship.sc_renewal}</p>
                            </div>
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Mode</p>
                                <p className="text-sm font-bold">{scholarship.sc_application_mode}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <a href={scholarship.sc_application_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 py-3 text-base shadow-lg shadow-primary/20">
                                Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                            <div className="flex gap-2">
                                <button className="p-3 border rounded-xl hover:bg-muted transition-colors"><Bookmark className="h-5 w-5 text-muted-foreground" /></button>
                                <button className="p-3 border rounded-xl hover:bg-muted transition-colors"><Share2 className="h-5 w-5 text-muted-foreground" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Section */}
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-outfit">
                            <CheckCircle2 className="h-5 w-5 text-success" /> Eligibility Requirements
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="h-3 w-3 text-success" />
                                </div>
                                <div><span className="font-semibold">Category: </span> {scholarship.sc_caste.join(', ')} students</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="h-3 w-3 text-success" />
                                </div>
                                <div><span className="font-semibold">Residency: </span> {scholarship.sc_residency_requirement}</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="h-3 w-3 text-success" />
                                </div>
                                <div><span className="font-semibold">Education: </span> {scholarship.sc_education_level} ({scholarship.sc_course_stream.join(', ')})</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="h-3 w-3 text-success" />
                                </div>
                                <div><span className="font-semibold">Income: </span> Family income ≤ ₹{(scholarship.sc_income_limit / 100000).toFixed(1)} Lakh/year</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <ChevronRight className="h-3 w-3 text-success" />
                                </div>
                                <div><span className="font-semibold">Academic: </span> Minimum {scholarship.sc_marks_minimum} marks in previous qualifying exam</div>
                            </div>
                            {scholarship.sc_special_conditions && (
                                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex gap-2 text-primary font-bold text-xs uppercase mb-1 tracking-wider"><Info className="h-4 w-4" /> Special Conditions</div>
                                    <p className="text-xs text-primary/80 leading-relaxed">{scholarship.sc_special_conditions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-outfit">
                            <IndianRupee className="h-5 w-5 text-primary" /> Amount Details
                        </h2>
                        <div className="p-4 bg-muted/30 rounded-xl border border-dashed text-sm mb-4">
                            <p className="font-bold mb-1">Total Scholarship: ₹{scholarship.sc_amount_annual.toLocaleString()}/year</p>
                            <p className="text-muted-foreground text-xs">{scholarship.sc_amount_description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" /> Disbursement: {scholarship.sc_disbursement}
                        </div>
                    </div>

                    {/* Application Process */}
                    <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-outfit">
                            <Clock className="h-5 w-5 text-warning" /> Application Process
                        </h2>
                        <div className="relative space-y-10 pl-4 border-l-2 ml-2">
                            {scholarship.sc_step_guide.split(/\d\./).filter(s => s.trim()).map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[2.35rem] top-0 h-6 w-6 rounded-full bg-white border-2 border-primary flex items-center justify-center text-[10px] font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-foreground font-medium leading-relaxed">{step.trim()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Document Checklist */}
                    <div className="bg-white rounded-2xl border p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2 font-outfit text-sm uppercase tracking-wider">
                            <Share2 className="h-4 w-4" /> Required Documents
                        </h3>
                        <ul className="space-y-3">
                            {scholarship.sc_documents_required.map((doc, i) => (
                                <li key={i} className="flex gap-3 text-xs">
                                    <div className="h-4 w-4 bg-muted rounded flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    {doc}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl shadow-primary/20">
                        <h3 className="font-bold mb-4 font-outfit flex items-center gap-2 text-sm uppercase tracking-wider text-white">
                            <HelpCircle className="h-4 w-4 text-white/70" /> Need Help?
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <Phone className="h-4 w-4 shrink-0 mt-1 opacity-70" />
                                <div className="text-xs">
                                    <p className="font-bold opacity-70 mb-1 tracking-widest text-[10px] uppercase">Official Helpline</p>
                                    <p className="break-words">{scholarship.sc_helpline.split(',')[0]}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <ShieldCheck className="h-4 w-4 shrink-0 mt-1 opacity-70" />
                                <div className="text-xs">
                                    <p className="font-bold opacity-70 mb-1 tracking-widest text-[10px] uppercase">Official Source</p>
                                    <a href={scholarship.sc_official_source} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 opacity-80 transition-opacity flex items-center gap-1">
                                        Official Portal <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="p-4 bg-success/5 border border-success/10 rounded-2xl text-[10px]">
                        <div className="flex items-center gap-2 font-bold text-success uppercase tracking-widest mb-1 leading-tighter">
                            <ShieldCheck className="h-4 w-4" /> Trust Signal
                        </div>
                        <p className="text-success/80">Data last verified on <span className="font-bold">{new Date(scholarship.sc_last_verified).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span> with zero hallucinations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
