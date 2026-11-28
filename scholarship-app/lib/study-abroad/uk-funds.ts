// Pure calculation helpers for the UK Student visa proof-of-funds calculator.
// Kept free of React/DB imports so it can be unit-tested directly with node --test.

export interface UkFundsRates {
    monthlyLondonGbp: number;
    monthlyOutsideLondonGbp: number;
    maxMonths: number;
    holdDays: number;
    holdWindowDays: number;
    ihsAnnualGbp: number;
    gbpToInr: number;
}

export interface UkFundsInput {
    annualTuitionGbp: number;
    depositPaidGbp: number;
    courseMonths: number;
    isLondon: boolean;
    rates: UkFundsRates;
}

export interface UkFundsResult {
    feesToShowGbp: number;
    livingMonths: number;
    monthlyLivingGbp: number;
    livingMoneyGbp: number;
    totalFundsGbp: number;
    totalFundsInr: number;
    ihsGbp: number;
    ihsInr: number;
    holdDays: number;
    holdWindowDays: number;
}

const nonNeg = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Months of Student visa for a course, applying from outside the UK: the course plus the extra time Appendix Student
 * ST 25.3 grants (1 month before and 4 months after a course of 12 months or longer; 1 month before and 2 months after
 * a course of 6 to under 12 months). A course under 6 months gets 7 days either side, which we count as no extra month
 * (this assumes it is not a pre-sessional course, which gets 1 month either side).
 */
export function visaMonths(courseMonths: number): number {
    const m = nonNeg(courseMonths);
    if (m === 0) return 0;
    if (m >= 12) return m + 5;
    if (m >= 6) return m + 3;
    return m;
}

/**
 * Years of surcharge for a visa length, applying from outside the UK (gov.uk: how much you have to pay):
 * 6 months or less: none; more than 6 months and under a year: a full year; each full year costs a year;
 * a part year of 6 months or less costs half a year, and more than 6 months costs a full year
 * (so 12 to 18 months is 1.5 years and over 18 months and under 2 years is 2 years).
 */
export function ihsYears(visaLengthMonths: number): number {
    const m = nonNeg(visaLengthMonths);
    if (m <= 6) return 0;
    const years = Math.floor(m / 12);
    const rest = m - years * 12;
    return years + (rest === 0 ? 0 : rest <= 6 ? 0.5 : 1);
}

/**
 * Computes UK Student visa maintenance funds, unpaid tuition to show, and
 * the separate Immigration Health Surcharge (IHS) estimate.
 */
export function calculateUkFunds(input: UkFundsInput): UkFundsResult {
    const tuition = nonNeg(input.annualTuitionGbp);
    const deposit = nonNeg(input.depositPaidGbp);
    const courseMonths = nonNeg(input.courseMonths);
    const fx = nonNeg(input.rates.gbpToInr);
    const maxMonths = nonNeg(input.rates.maxMonths);
    const ihsAnnual = nonNeg(input.rates.ihsAnnualGbp);

    const feesToShowGbp = Math.max(0, tuition - deposit);
    const livingMonths = courseMonths > 0 ? Math.min(maxMonths, Math.ceil(courseMonths)) : 0;
    const monthlyLivingGbp = nonNeg(
        input.isLondon ? input.rates.monthlyLondonGbp : input.rates.monthlyOutsideLondonGbp
    );
    const livingMoneyGbp = livingMonths * monthlyLivingGbp;

    const totalFundsGbp = feesToShowGbp + livingMoneyGbp;
    const totalFundsInr = totalFundsGbp * fx;

    // IHS is charged on the length of the visa, not the course (gov.uk: how much you have to pay)
    const ihsGbp = ihsYears(visaMonths(courseMonths)) * ihsAnnual;
    const ihsInr = ihsGbp * fx;

    return {
        feesToShowGbp,
        livingMonths,
        monthlyLivingGbp,
        livingMoneyGbp,
        totalFundsGbp,
        totalFundsInr,
        ihsGbp,
        ihsInr,
        holdDays: nonNeg(input.rates.holdDays),
        holdWindowDays: nonNeg(input.rates.holdWindowDays),
    };
}
