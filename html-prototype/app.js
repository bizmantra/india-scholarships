// Mock Scholarship Data
const scholarships = [
    {
        id: "sc_001",
        title: "Karnataka Post-Matric SC Scholarship",
        slug: "karnataka-postmatric-sc",
        provider: "Government of Karnataka - Dept of Social Welfare",
        providerType: "State Government",
        state: "Karnataka",
        caste: ["SC"],
        gender: "All",
        educationLevel: "Post-Matric",
        courseStream: ["All courses after Class 10"],
        amountAnnual: 12000,
        amountMin: 1000,
        amountDescription: "₹1,000-12,000 based on course: Engineering ₹12K, General ₹5K, Diploma ₹3K",
        incomeLimit: 250000,
        marksMinimum: "50%",
        ageLimit: "No age limit",
        specialConditions: "75% attendance required, Karnataka domicile",
        residencyRequirement: "Karnataka resident for 10+ years",
        documentsRequired: ["Aadhaar", "SC Certificate", "Income Certificate", "Marksheet", "Bank Details"],
        applicationMode: "Online",
        applicationUrl: "https://ssp.postmatric.karnataka.gov.in",
        deadline: "2025-09-30",
        deadlineDescription: "Usually September - check portal regularly",
        stepGuide: "1. Register on SSP 2. Fill form 3. Upload docs 4. Submit",
        selectionCriteria: "Need-based, eligibility verification, first-come-first-served",
        totalAwards: "12000+",
        renewal: "Yes, renewable annually for course duration",
        disbursement: "Annual, DBT to bank account",
        difficultyLevel: "Medium",
        helpline: "080-22100000, postmatric@karnataka.gov.in",
        lastVerified: "2025-12-28",
        officialSource: "https://sswelfare.karnataka.gov.in",
        notesActions: "Portal opens August, apply early",
        keywords: ["karnataka", "sc", "scholarship", "postmatric", "engineering", "degree"]
    }
];

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(amount);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Check Portal';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// Create scholarship card HTML
function createScholarshipCard(scholarship) {
    return `
        <div class="scholarship-card" onclick="window.location.href='scholarship-detail.html?id=${scholarship.id}'">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-badges">
                        <span class="badge badge-primary">${scholarship.state}</span>
                        <span class="badge badge-success">${scholarship.caste[0]}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success); opacity: 0.5;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                
                <h3 class="card-title">${scholarship.title}</h3>
                
                <div class="card-amount">
                    ₹${formatCurrency(scholarship.amountAnnual)}<span>/per year</span>
                </div>
                
                <div class="card-meta">
                    <div class="card-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${formatDate(scholarship.deadline)}</span>
                    </div>
                    <div class="card-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>95%+ Success</span>
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="btn-card" onclick="event.stopPropagation(); window.location.href='scholarship-detail.html?id=${scholarship.id}'">
                        View Details
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation();" aria-label="Quick action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="card-progress"></div>
        </div>
    `;
}

// Create skeleton card HTML
function createSkeletonCard() {
    return `
        <div class="scholarship-card skeleton-card">
            <div class="card-content">
                <div class="skeleton-box" style="height: 16px; width: 96px; margin-bottom: 12px;"></div>
                <div class="skeleton-box" style="height: 24px; width: 100%; margin-bottom: 8px;"></div>
                <div class="skeleton-box" style="height: 32px; width: 128px; margin-bottom: 16px;"></div>
                <div style="display: flex; gap: 8px; margin-bottom: 24px;">
                    <div class="skeleton-box" style="height: 20px; width: 64px; border-radius: 9999px;"></div>
                    <div class="skeleton-box" style="height: 20px; width: 64px; border-radius: 9999px;"></div>
                </div>
                <div class="skeleton-box" style="height: 40px; width: 100%;"></div>
            </div>
        </div>
    `;
}

// Load scholarships on page load
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('scholarships-grid');

    if (grid) {
        // Add real scholarships
        scholarships.forEach(scholarship => {
            grid.innerHTML += createScholarshipCard(scholarship);
        });

        // Add skeleton cards
        for (let i = 0; i < 2; i++) {
            grid.innerHTML += createSkeletonCard();
        }
    }
});

// Store scholarship data in localStorage for detail page
localStorage.setItem('scholarships', JSON.stringify(scholarships));
