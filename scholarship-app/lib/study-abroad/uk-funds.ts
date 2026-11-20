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

    // IHS is charged in 6-month blocks with a 1-year minimum for courses requiring a Student visa.
    const ihsHalfYears = courseMonths > 0 ? Math.max(2, Math.ceil(courseMonths / 6)) : 0;
    const ihsGbp = ihsHalfYears * (ihsAnnual / 2);
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
