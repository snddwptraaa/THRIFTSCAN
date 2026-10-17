const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIdrCurrency(amount: number): string {
  return IDR_FORMATTER.format(amount);
}
