// Scholarship Detail Template Types

export interface ScholarshipData {
    // Core required fields
    title: string;
    provider: string;
    slug: string;
    applyUrl: string;

    // Hero section
    icon?: string; // Emoji or icon identifier
    providerType?: string;

    // Optional intro
    scIntroSeo?: string;

    // Quick Facts
    quickFacts: {
        provider: string;
        providerType?: string;
        level?: string;
        caste?: string[];
        gender?: string;
        state?: string;
        incomeLimit?: number | null;
        selection?: string;
        applicationMode?: string;
        officialSource?: string;
        lastVerified?: string;
    };

    // Benefits & Amount
    benefits: {
        amountMin?: number;
        amountAnnual?: number | string;
        amountDescription?: string;
        renewal?: string;
        benefitsText?: string;
    };

    // Eligibility Criteria
    eligibility?: {
        category?: {
            caste?: string[];
            residencyRequirement?: string;
        };
        education?: {
            level?: string;
            minMarks?: number;
            courseStream?: string[];
        };
        income?: {
            limit?: number;
        };
        other?: {
            ageLimit?: string;
            specialConditions?: string;
        };
    };

    // Application Process
    applicationProcess?: {
        steps?: Array<{
            title: string;
            description: string;
        }>;
        textContent?: string;
    };

    // Required Documents
    requiredDocuments?: string[];

    // Selection & Renewal
    selectionRenewal?: {
        selectionProcess?: string;
        renewalPolicy?: string;
        textContent?: string;
    };

    // Important Dates
    importantDates?: Array<{
        event: string;
        date: string;
    }>;
    deadline?: string;

    // FAQs
    faqs?: Array<{
        question: string;
        answer: string;
    }>;

    // Trust & Verification
    trustVerification?: {
        verifiedBy?: string;
        lastVerified?: string;
        officialSource?: string;
        textContent?: string;
    };

    // Similar Scholarships
    similarScholarships?: Array<{
        title: string;
        slug: string;
        provider: string;
        amount?: string;
    }>;

    // Disclaimer
    disclaimer?: string;

    // Related Resources
    relatedResources?: Array<{
        title: string;
        url: string;
    }>;

    // CTA
    isApplicationClosed?: boolean;
}

// Helper type for conditional sections
export type SectionData<T> = T | null | undefined;
