/**
 * Global Constants & Dynamic Variables
 * Central configuration for volatile state income limits, portal details, and default site constants.
 * Updating values here updates calculations and configurations sitewide.
 */

export const SITE_CONFIG = {
  name: "IndiaScholarships",
  domain: "indiascholarships.in",
  supportEmail: "support@indiascholarships.in",
  defaultVerificationYear: 2026,
};

// 🏛️ STANDARD STATE INCOME LIMITS (INR per year)
export const STATE_INCOME_LIMITS: Record<string, number> = {
  OBC_CREAMY_LAYER_MAX: 800000,     // Standard OBC non-creamy layer cap
  SC_ST_POST_MATRIC_MAX: 250000,    // Standard SC/ST post-matric cap
  GENERAL_EWS_MAX: 800000,          // Standard General EWS cap
  KARNATAKA_SSP_OBC_MAX: 250000,    // SSP Karnataka OBC family income cap
  GUJARAT_MYSY_MAX: 600000,         // Digital Gujarat MYSY limit
  WEST_BENGAL_SVMCM_MAX: 250000,    // West Bengal SVMCM limit
};

// 📞 DEFAULT SITE HELPLINE FALLBACKS
export const HELPLINE_FALLBACKS = {
  GENERAL: "1800-11-0033",          // National Toll-Free Helpline
  NSP: "0120-6619540",              // NSP Helpdesk
  SSP_KARNATAKA: "080-22634300",     // SSP Karnataka Helpdesk
  MAHADBT: "022-49150800",          // MahaDBT Maharashtra Helpdesk
};
