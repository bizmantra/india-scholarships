'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ExternalLink, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface StateInfo {
    name: string;
    slug: string;
    count: number;
    region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'UT';
    portalName?: string;
    featured?: boolean;
}

const REGIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central', 'North-East', 'UT'];

const MAJOR_PORTALS = [
    { title: 'National Scholarship Portal (NSP)', tag: 'Central Govt', url: '/guides/nsp', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { title: 'SSP Karnataka State Portal', tag: 'Karnataka', url: '/guides/ssp', color: 'bg-green-50 text-green-700 border-green-100' },
    { title: 'MahaDBT Post-Matric Portal', tag: 'Maharashtra', url: '/guides/mahadbt', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { title: 'e-Kalyan Welfare Portal', tag: 'Jharkhand / Bihar', url: '/guides/e-kalyan-jharkhand', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { title: 'Aikyashree Portal', tag: 'West Bengal', url: '/guides/aikyashree-west-bengal', color: 'bg-red-50 text-red-700 border-red-100' },
    { title: 'Digital Gujarat Portal', tag: 'Gujarat', url: '/guides/digital-gujarat', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
];

export default function StateScholarshipsClient({ 
    statesList, 
    countsMap 
}: { 
    statesList: string[]; 
    countsMap: Record<string, number>; 
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All Regions');

    const totalActiveSchemes = useMemo(() => {
        return Object.values(countsMap).reduce((acc, c) => acc + c, 0);
    }, [countsMap]);

    // Map raw state strings into rich state metadata
    const stateData: StateInfo[] = useMemo(() => {
        const regionMapping: Record<string, 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'UT'> = {
            'Uttar Pradesh': 'North', 'Delhi': 'UT', 'Punjab': 'North', 'Haryana': 'North', 'Himachal Pradesh': 'North', 'Jammu and Kashmir': 'UT', 'Uttarakhand': 'North', 'Ladakh': 'UT',
            'Karnataka': 'South', 'Tamil Nadu': 'South', 'Andhra Pradesh': 'South', 'Kerala': 'South', 'Telangana': 'South', 'Puducherry': 'UT',
            'West Bengal': 'East', 'Bihar': 'East', 'Jharkhand': 'East', 'Odisha': 'East',
            'Maharashtra': 'West', 'Gujarat': 'West', 'Rajasthan': 'North', 'Goa': 'West',
            'Madhya Pradesh': 'Central', 'Chhattisgarh': 'Central',
            'Assam': 'North-East', 'Meghalaya': 'North-East', 'Manipur': 'North-East', 'Tripura': 'North-East', 'Mizoram': 'North-East', 'Nagaland': 'North-East', 'Arunachal Pradesh': 'North-East', 'Sikkim': 'North-East',
            'Chandigarh': 'UT', 'Andaman and Nicobar Islands': 'UT', 'Dadra and Nagar Haveli and Daman and Diu': 'UT', 'Lakshadweep': 'UT'
        };

        const portalMapping: Record<string, string> = {
            'Uttar Pradesh': 'UP Scholarship Portal',
            'Maharashtra': 'MahaDBT Portal',
            'Karnataka': 'SSP Karnataka',
            'West Bengal': 'Aikyashree / Bikash Bhavan',
            'Tamil Nadu': 'Pudhumai Penn / TN e-Scholarship',
            'Andhra Pradesh': 'Jagananna Vidya Deevena',
            'Jharkhand': 'e-Kalyan Jharkhand',
            'Gujarat': 'Digital Gujarat',
            'Odisha': 'State Scholarship Portal (SAMS)',
            'Madhya Pradesh': 'MPTAAS Portal',
            'Rajasthan': 'SJMS Rajasthan',
            'Bihar': 'PMS Online Bihar'
        };

        const featuredStates = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Andhra Pradesh'];

        return statesList.map(s => {
            const trimmed = s.trim();
            return {
                name: trimmed,
                slug: slugify(trimmed),
                count: countsMap[trimmed] || 0,
                region: regionMapping[trimmed] || 'Central',
                portalName: portalMapping[trimmed] || 'State Scholarship Portal',
                featured: featuredStates.includes(trimmed)
            };
        });
    }, [statesList, countsMap]);

    const filteredStates = useMemo(() => {
        return stateData.filter(item => {
            const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
            const matchesRegion = selectedRegion === 'All Regions' || item.region === selectedRegion;
            return matchesSearch && matchesRegion;
        });
    }, [stateData, searchQuery, selectedRegion]);

    const featuredList = useMemo(() => stateData.filter(s => s.featured), [stateData]);

    return (
        <div>
            {/* Header Hero */}
            <section className="bg-gradient-to-b from-blue-50/50 via-white to-white py-12 px-4 border-b border-gray-150 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/60 text-blue-800 text-xs font-bold mb-4 border border-blue-200/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-700 animate-pulse" />
                        Live State Directory • {totalActiveSchemes}+ Active Regional Grants
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 font-serif leading-[1.1]">
                        State Scholarships in India <br className="hidden sm:inline" />
                        <span className="text-google-blue">Browse by Domicile Region</span>
                    </h1>
                    
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Find government-funded welfare schemes, post-matric fee reimbursements, and state portal grants across 36 Indian states and Union Territories.
                    </p>

                    {/* Instant Search Input */}
                    <div className="relative max-w-xl mx-auto mb-6">
                        <input
                            type="text"
                            placeholder="Type state name (e.g. Uttar Pradesh, Karnataka, Bihar)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-250 rounded-2xl text-sm shadow-xs focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue transition-all"
                        />
                        <Search className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
                    </div>

                    {/* Region Pill Filters */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {REGIONS.map(reg => (
                            <button
                                key={reg}
                                onClick={() => setSelectedRegion(reg)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    selectedRegion === reg
                                        ? 'bg-google-blue text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {reg}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-12">
                
                {/* High Priority Featured States Grid */}
                {!searchQuery && selectedRegion === 'All Regions' && (
                    <div className="mb-14">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-150">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 font-serif flex items-center gap-2">
                                    🌟 High-Traffic State Welfare Hubs
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">Largest state scholarship portals with maximum yearly beneficiaries</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredList.map(st => (
                                <Link
                                    key={st.name}
                                    href={`/scholarships-in/${st.slug}`}
                                    className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-google-blue hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md border border-blue-100">
                                                {st.portalName}
                                            </span>
                                            <span className="text-xs font-extrabold text-google-green bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                {st.count > 0 ? `${st.count} Active Schemes` : 'Open Schemes'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-google-blue transition-colors mb-1">
                                            {st.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 leading-normal mb-4">
                                            Official pre-matric & post-matric fee reimbursement guidelines for resident students.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-google-blue pt-3 border-t border-gray-100">
                                        <span>Explore All Schemes</span>
                                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Major State Portal Guides Quick Directory */}
                <div className="mb-14 bg-gray-50/70 p-6 sm:p-8 rounded-3xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-google-blue" />
                        <h3 className="text-lg font-bold text-gray-900">Official State Scholarship Portals</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-5 max-w-2xl">
                        Direct portal login links, registration requirements, and status tracking guides for state welfare departments.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {MAJOR_PORTALS.map((p, idx) => (
                            <Link
                                key={idx}
                                href={p.url}
                                className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] flex flex-col justify-between ${p.color}`}
                            >
                                <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">{p.tag}</span>
                                <span className="text-xs font-bold leading-snug">{p.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Full 36 States & UTs Directory Grid */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-150">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 font-serif">
                                {selectedRegion === 'All Regions' ? 'All 36 States & Union Territories' : `${selectedRegion} Region States`}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                Showing {filteredStates.length} state hub{filteredStates.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {filteredStates.length === 0 ? (
                        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-250">
                            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-700">No states match "{searchQuery}"</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedRegion('All Regions'); }}
                                className="mt-3 text-xs text-google-blue font-bold hover:underline"
                            >
                                Clear search filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStates.map((st) => (
                                <Link
                                    key={st.name}
                                    href={`/scholarships-in/${st.slug}`}
                                    className="group p-4 bg-white border border-gray-200 rounded-2xl hover:border-google-blue hover:shadow-xs transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-base">📍</span>
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-google-blue transition-colors">
                                                {st.name}
                                            </h3>
                                        </div>
                                        <span className="text-[11px] text-gray-500 font-medium block">
                                            {st.portalName}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="px-2.5 py-1 bg-gray-100 group-hover:bg-blue-50 group-hover:text-google-blue text-gray-700 text-xs font-bold rounded-full transition-colors inline-block">
                                            {st.count > 0 ? `${st.count} Schemes` : 'View Schemes'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* State Domicile Rules & FAQs */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 mb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">State Scholarship Rules & Domicile Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 leading-relaxed">
                        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-150">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-google-green" /> What is a State Domicile Certificate?
                            </h4>
                            <p>
                                A Domicile or Resident Certificate issued by the Tehsildar/Sub-Divisional Officer confirms your continuous legal residence in that state. It is mandatory for claiming state quota welfare schemes.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-150">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-google-green" /> Can I apply for two different state scholarships?
                            </h4>
                            <p>
                                No. Beneficiaries are strictly prohibited from receiving dual government maintenance allowances or tuition waivers for the same academic year across multiple state portals.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
