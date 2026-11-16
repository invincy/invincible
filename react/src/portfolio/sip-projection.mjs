export function projectSip({balance, payment, increase, years, annualRate}) {
  const months = years * 12;
  if (![balance, payment, increase, years, annualRate].every(Number.isFinite) ||
      Math.min(balance, payment, increase) < 0 || !Number.isInteger(years) ||
      years < 1 || years > 50 || annualRate <= -100 || annualRate > 100) return null;

  const monthlyGrowth = (1 + annualRate / 100) ** (1 / 12);
  let endingValue = balance;
  let contributed = 0;
  for (let month = 0; month < months; month++) {
    const instalment = payment + month * increase;
    endingValue = endingValue * monthlyGrowth + instalment;
    contributed += instalment;
  }
  return {
    endingValue, contributed,
    growth: endingValue - balance - contributed,
    finalPayment: payment + (months - 1) * increase,
  };
}
