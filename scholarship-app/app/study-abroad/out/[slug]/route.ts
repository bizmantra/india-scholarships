// Outbound links to loan and blocked-account providers (/study-abroad/out/<id>).
// Pages mark these links rel="sponsored" and disclose that some may be affiliate links.
import { NextResponse } from 'next/server';

const PROVIDER_LINKS: Record<string, string> = {
    expatrio: 'https://www.expatrio.com',
    fintiba: 'https://www.fintiba.com',
    coracle: 'https://www.coracle.de',
    prodigy: 'https://prodigyfinance.com',
    mpower: 'https://www.mpowerfinancing.com',
    sbi: 'https://sbi.co.in',
    icici: 'https://www.icicibank.com',
    idfc: 'https://www.idfcfirstbank.com',
    credila: 'https://www.credila.com',
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const target = PROVIDER_LINKS[slug];
    return NextResponse.redirect(target || new URL('/study-abroad/tools', request.url), target ? 302 : 307);
}
