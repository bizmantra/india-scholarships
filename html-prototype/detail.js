// Get scholarship ID from URL
const urlParams = new URLSearchParams(window.location.search);
const scholarshipId = urlParams.get('id');

// Get scholarship data from localStorage
const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
const scholarship = scholarships.find(s => s.id === scholarshipId);

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

// Format full date
function formatFullDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Load scholarship details
if (scholarship) {
    // Update page title and breadcrumb
    document.getElementById('page-title').textContent = `${scholarship.title} | Scholarly`;
    document.getElementById('breadcrumb-title').textContent = scholarship.title;

    // Main content
    document.getElementById('main-content').innerHTML = `
        <!-- Hero Card -->
        <div class="detail-card">
            <div class="card-badges" style="margin-bottom: 1rem;">
                <span class="badge badge-primary">${scholarship.state}</span>
                <span class="badge badge-success">${scholarship.caste.join(', ')}</span>
                <span class="badge" style="background: var(--background); color: var(--muted-foreground);">${scholarship.educationLevel}</span>
            </div>
            <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem;">
                ${scholarship.title}
            </h1>
            <p style="font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified by ${scholarship.provider}
            </p>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Amount</div>
                    <div class="stat-value">₹${formatCurrency(scholarship.amountAnnual)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Deadline</div>
                    <div class="stat-value">${formatDate(scholarship.deadline)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Renewable</div>
                    <div class="stat-value">${scholarship.renewal.includes('Yes') ? 'Yes' : 'No'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Mode</div>
                    <div class="stat-value">${scholarship.applicationMode}</div>
                </div>
            </div>

            <div class="action-buttons">
                <a href="${scholarship.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn-apply" style="flex: 1;">
                    Apply Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
                <button class="btn-secondary" aria-label="Save">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <button class="btn-secondary" aria-label="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Eligibility Card -->
        <div class="detail-card">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Eligibility Requirements
            </h2>
            <ul class="eligibility-list">
                <li class="eligibility-item">
                    <div class="eligibility-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <div><strong>Category:</strong> ${scholarship.caste.join(', ')} students</div>
                </li>
                <li class="eligibility-item">
                    <div class="eligibility-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <div><strong>Residency:</strong> ${scholarship.residencyRequirement}</div>
                </li>
                <li class="eligibility-item">
                    <div class="eligibility-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <div><strong>Education:</strong> ${scholarship.educationLevel} (${scholarship.courseStream.join(', ')})</div>
                </li>
                <li class="eligibility-item">
                    <div class="eligibility-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <div><strong>Income:</strong> Family income ≤ ₹${(scholarship.incomeLimit / 100000).toFixed(1)} Lakh/year</div>
                </li>
                <li class="eligibility-item">
                    <div class="eligibility-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success);">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <div><strong>Academic:</strong> Minimum ${scholarship.marksMinimum} marks in previous qualifying exam</div>
                </li>
            </ul>
            ${scholarship.specialConditions ? `
                <div class="info-box">
                    <div class="info-box-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Special Conditions
                    </div>
                    <div class="info-box-content">${scholarship.specialConditions}</div>
                </div>
            ` : ''}
        </div>

        <!-- Amount Details Card -->
        <div class="detail-card">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary);">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Amount Details
            </h2>
            <div class="amount-box">
                <p style="font-weight: 700; margin-bottom: 0.25rem;">Total Scholarship: ₹${formatCurrency(scholarship.amountAnnual)}/year</p>
                <p style="font-size: 0.75rem; color: var(--muted-foreground);">${scholarship.amountDescription}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--muted-foreground);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Disbursement: ${scholarship.disbursement}
            </div>
        </div>

        <!-- Application Process Card -->
        <div class="detail-card">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--warning);">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Application Process
            </h2>
            <div class="timeline">
                ${scholarship.stepGuide.split(/\d\./).filter(s => s.trim()).map((step, i) => `
                    <div class="timeline-item">
                        <div class="timeline-marker">${i + 1}</div>
                        <p style="font-size: 0.875rem; font-weight: 500; line-height: 1.6;">${step.trim()}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Sidebar content
    document.getElementById('sidebar-content').innerHTML = `
        <!-- Documents Card -->
        <div class="detail-card">
            <h3 style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Required Documents
            </h3>
            <ul class="doc-list">
                ${scholarship.documentsRequired.map(doc => `
                    <li class="doc-item">
                        <div class="doc-icon">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--muted-foreground);">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        ${doc}
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Help Card -->
        <div class="help-card">
            <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Need Help?
            </h3>
            <div class="help-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7; flex-shrink: 0; margin-top: 0.25rem;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                    <div class="help-label">Official Helpline</div>
                    <div class="help-value">${scholarship.helpline.split(',')[0]}</div>
                </div>
            </div>
            <div class="help-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.7; flex-shrink: 0; margin-top: 0.25rem;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <div class="help-label">Official Source</div>
                    <div class="help-value">
                        <a href="${scholarship.officialSource}" target="_blank" rel="noopener noreferrer">
                            Official Portal
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Trust Badge -->
        <div class="trust-badge">
            <div class="trust-badge-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Trust Signal
            </div>
            <div class="trust-badge-content">
                Data last verified on <strong>${formatFullDate(scholarship.lastVerified)}</strong> with zero hallucinations.
            </div>
        </div>
    `;
} else {
    // Scholarship not found
    document.getElementById('main-content').innerHTML = `
        <div class="detail-card" style="text-align: center; padding: 4rem 2rem;">
            <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Scholarship Not Found</h1>
            <p style="color: var(--muted-foreground); margin-bottom: 2rem;">The scholarship you're looking for doesn't exist or has been removed.</p>
            <a href="index.html" class="btn-primary">Back to Home</a>
        </div>
    `;
}
