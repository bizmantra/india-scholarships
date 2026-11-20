import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUkFunds, type UkFundsRates } from './uk-funds.ts';

const RATES: UkFundsRates = {
    monthlyLondonGbp: 1529,
    monthlyOutsideLondonGbp: 1171,
    maxMonths: 9,
    holdDays: 28,
    holdWindowDays: 31,
    ihsAnnualGbp: 776,
    gbpToInr: 123.5,
};

test('outside London 12-month MBA caps living money at 9 months', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 34600,
        depositPaidGbp: 2000,
        courseMonths: 12,
        isLondon: false,
        rates: RATES,
    });
    assert.equal(res.feesToShowGbp, 32600);
    assert.equal(res.livingMonths, 9);
    assert.equal(res.monthlyLivingGbp, 1171);
    assert.equal(res.livingMoneyGbp, 10539);
    assert.equal(res.totalFundsGbp, 43139);
    assert.equal(res.totalFundsInr, 43139 * 123.5);
    assert.equal(res.ihsGbp, 776);
    assert.equal(res.holdDays, 28);
    assert.equal(res.holdWindowDays, 31);
});

test('London rate uses monthlyLondonGbp and caps at 9 months', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 30000,
        depositPaidGbp: 5000,
        courseMonths: 12,
        isLondon: true,
        rates: RATES,
    });
    assert.equal(res.feesToShowGbp, 25000);
    assert.equal(res.livingMonths, 9);
    assert.equal(res.monthlyLivingGbp, 1529);
    assert.equal(res.livingMoneyGbp, 13761);
    assert.equal(res.totalFundsGbp, 38761);
});

test('short courses under 9 months round up fractional months', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 18000,
        depositPaidGbp: 0,
        courseMonths: 6.5,
        isLondon: false,
        rates: RATES,
    });
    assert.equal(res.livingMonths, 7);
    assert.equal(res.livingMoneyGbp, 7 * 1171);
    assert.equal(res.ihsGbp, 776); // minimum 1 year
});

test('16-month course computes 1.5x annual IHS separately', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 25000,
        depositPaidGbp: 1000,
        courseMonths: 16,
        isLondon: false,
        rates: RATES,
    });
    assert.equal(res.livingMonths, 9);
    assert.equal(res.ihsGbp, 1164); // 776 + 388
});

test('deposit larger than tuition clamps unpaid fees to zero', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 15000,
        depositPaidGbp: 20000,
        courseMonths: 9,
        isLondon: false,
        rates: RATES,
    });
    assert.equal(res.feesToShowGbp, 0);
    assert.equal(res.totalFundsGbp, 9 * 1171);
});

test('zero and negative values are handled safely', () => {
    const res = calculateUkFunds({
        annualTuitionGbp: 0,
        depositPaidGbp: 0,
        courseMonths: 0,
        isLondon: true,
        rates: RATES,
    });
    assert.equal(res.feesToShowGbp, 0);
    assert.equal(res.livingMonths, 0);
    assert.equal(res.livingMoneyGbp, 0);
    assert.equal(res.totalFundsGbp, 0);
    assert.equal(res.totalFundsInr, 0);
    assert.equal(res.ihsGbp, 0);
});
