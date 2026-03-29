const DEFAULT_OPERATOR_TERMS = Object.freeze({
  security_deposit_amount: "Varies by machine",
  security_deposit_policy: "Security deposit authorization applies under operator terms at pickup.",
  cancellation_policy: "Standard",
  terms_last_verified: "",
  source_terms_url: "",
});

function normalizeText(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

export function getOperatorLegalTerms(operator) {
  return {
    security_deposit_amount: normalizeText(
      operator?.security_deposit_amount,
      DEFAULT_OPERATOR_TERMS.security_deposit_amount,
    ),
    security_deposit_policy: normalizeText(
      operator?.security_deposit_policy,
      DEFAULT_OPERATOR_TERMS.security_deposit_policy,
    ),
    cancellation_policy: normalizeText(
      operator?.cancellation_policy,
      DEFAULT_OPERATOR_TERMS.cancellation_policy,
    ),
    terms_last_verified: normalizeText(
      operator?.terms_last_verified,
      DEFAULT_OPERATOR_TERMS.terms_last_verified,
    ),
    source_terms_url: normalizeText(
      operator?.source_terms_url,
      DEFAULT_OPERATOR_TERMS.source_terms_url,
    ),
  };
}

export function buildRentalLegalAcknowledgement(operator, options = {}) {
  const {
    brokerFeeLabel = "EUR 50",
    acknowledgedAt = new Date().toISOString(),
  } = options;
  const terms = getOperatorLegalTerms(operator);

  return {
    securityDepositAmount: terms.security_deposit_amount,
    securityDepositPolicy: terms.security_deposit_policy,
    cancellationPolicy: terms.cancellation_policy,
    priorityReservationFee: brokerFeeLabel,
    acknowledgedSecurityDeposit: `Acknowledged Security Deposit: ${terms.security_deposit_amount}`,
    acknowledgedCancellationPolicy: `Acknowledged Cancellation Policy: ${terms.cancellation_policy}`,
    acknowledgedDepositPolicy: `Acknowledged Deposit Policy: ${terms.security_deposit_policy}`,
    acknowledgedReservationFee: `Acknowledged Priority Reservation Fee: ${brokerFeeLabel}`,
    acknowledgedAt,
    termsLastVerified: terms.terms_last_verified,
    sourceTermsUrl: terms.source_terms_url,
  };
}

export { DEFAULT_OPERATOR_TERMS };
