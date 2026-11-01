// Groups country guides into the stages of a student's journey, by words in the guide's slug.
// The first stage whose keywords match wins, so order matters.
export const STAGES: { id: string; title: string; keywords: string[] }[] = [
    { id: 'fund', title: 'Costs, scholarships and funding', keywords: ['scholarship', 'daad', 'fulbright', 'loan', 'blocked', 'cost', 'financial', 'rbi', 'funding', 'assistantship', 'budget', 'tax'] },
    { id: 'visa', title: 'Visa and arrival', keywords: ['visa', 'residence', 'anmeldung', 'health-insurance', 'survival', 'arrival', 'i20', 'ds160', 'sevis', 'port-of-entry', 'housing', 'pre-departure'] },
    { id: 'work', title: 'Work during and after your studies', keywords: ['werkstudent', 'part-time', 'job', 'blue-card', 'opt', 'cpt', 'h1b', 'h-1b', 'career', 'internship', 'green-card'] },
    { id: 'tests', title: 'Tests and eligibility', keywords: ['english', 'ielts', 'toefl', 'gre', 'gmat', 'testas', 'language', 'ects', 'grade', 'gpa', 'wes', '3yr', 'fsp', 'duolingo', 'eligibility'] },
    { id: 'apply', title: 'Applications', keywords: ['uni-assist', 'aps', 'sop', 'lor', 'portal', 'offer', 'rejection', 'application', 'apply', 'tum', 'rwth', 'resume', 'cv', 'interview', 'deadline'] },
    { id: 'choose', title: 'Choosing a university and program', keywords: [] }, // everything else
];

export function stageOf(slug: string): string {
    return (STAGES.find(s => s.keywords.some(k => slug.includes(k))) || STAGES[STAGES.length - 1]).id;
}
