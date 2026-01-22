import { Lot, Config, LotBreakdown } from "@/types/calculator";
import { calculateLotBreakdown, formatCurrency } from "@/lib/calculations";
import { Receipt } from "lucide-react";
interface BreakdownTableProps {
  lots: Lot[];
  config: Config;
}
export function BreakdownTable({
  lots,
  config
}: BreakdownTableProps) {
  const breakdowns: LotBreakdown[] = lots.map(lot => calculateLotBreakdown(lot, config));
  const isTransactionFees = config.mstcPaymentType === 'transactionFees';
  const showSd = config.securityDepositType !== 'notApplicable';
  const showEmd = config.emdType !== 'notApplicable';
  const totals = breakdowns.reduce((acc, b) => ({
    sdAmount: acc.sdAmount + b.sdAmount,
    emdAmount: acc.emdAmount + b.emdAmount,
    balancePayment: acc.balancePayment + b.balancePayment,
    serviceChargeAmount: acc.serviceChargeAmount + b.serviceChargeAmount,
    transactionFeesAmount: acc.transactionFeesAmount + b.transactionFeesAmount,
    tdsOnServiceCharge: acc.tdsOnServiceCharge + b.tdsOnServiceCharge,
    itTdsAmount: acc.itTdsAmount + b.itTdsAmount,
    tcsOnGstAmount: acc.tcsOnGstAmount + b.tcsOnGstAmount,
    grandTotal: acc.grandTotal + b.grandTotal
  }), {
    sdAmount: 0,
    emdAmount: 0,
    balancePayment: 0,
    serviceChargeAmount: 0,
    transactionFeesAmount: 0,
    tdsOnServiceCharge: 0,
    itTdsAmount: 0,
    tcsOnGstAmount: 0,
    grandTotal: 0
  });

  // Calculate breakup sums for merged cells
  const sellerBreakupSum = totals.sdAmount + totals.emdAmount + totals.balancePayment;
  const mstcBreakupSum = (isTransactionFees ? totals.transactionFeesAmount : totals.serviceChargeAmount) + totals.itTdsAmount + totals.tcsOnGstAmount;

  // Row definitions
  const rows = [...(showEmd ? [{
    label: "EMD Amount",
    getValue: (b: LotBreakdown) => b.emdAmount,
    getTotal: () => totals.emdAmount,
    breakupGroup: 'seller' as const,
    isFirstInGroup: true
  }] : []), ...(showSd ? [{
    label: "Non-adjustable Security Deposit (SD Amount)",
    getValue: (b: LotBreakdown) => b.sdAmount,
    getTotal: () => totals.sdAmount,
    breakupGroup: 'seller' as const,
    isFirstInGroup: !showEmd
  }] : []), {
    label: "Balance Payment to Seller",
    getValue: (b: LotBreakdown) => b.balancePayment,
    getTotal: () => totals.balancePayment,
    breakupGroup: 'seller' as const,
    isFirstInGroup: !showEmd && !showSd
  }, {
    label: isTransactionFees ? "MSTC Transaction Fees" : "MSTC Service Charge",
    getValue: (b: LotBreakdown) => isTransactionFees ? b.transactionFeesAmount : b.serviceChargeAmount,
    getTotal: () => isTransactionFees ? totals.transactionFeesAmount : totals.serviceChargeAmount,
    breakupGroup: 'mstc' as const,
    isFirstInGroup: true
  }, {
    label: "MSTC IT TDS",
    getValue: (b: LotBreakdown) => b.itTdsAmount,
    getTotal: () => totals.itTdsAmount,
    breakupGroup: 'mstc' as const,
    isFirstInGroup: false
  }, {
    label: "MSTC TCS on GST",
    getValue: (b: LotBreakdown) => b.tcsOnGstAmount,
    getTotal: () => totals.tcsOnGstAmount,
    breakupGroup: 'mstc' as const,
    isFirstInGroup: false
  }, {
    label: "Total Payable",
    getValue: (b: LotBreakdown) => b.grandTotal,
    getTotal: () => totals.grandTotal,
    isTotal: true,
    breakupGroup: 'total' as const,
    isFirstInGroup: true
  }];

  // Calculate seller row count: 1 for balance payment + conditionally EMD and SD
  const sellerRowCount = 1 + (showEmd ? 1 : 0) + (showSd ? 1 : 0);
  const mstcRowCount = 3;

  // Column count for seller group (SD, EMD, Balance Payment)
  const sellerColCount = 1 + (showSd ? 1 : 0) + (showEmd ? 1 : 0);

  // Column definitions for transposed table
  const serviceChargeHeaderLabel = isTransactionFees
    ? "Transaction Fees"
    : config.tdsOnSc === 1
      ? `Service Charge (Excl S/C TDS: ${formatCurrency(totals.tdsOnServiceCharge)})`
      : "Service Charge";

  const columns = [...(showSd ? [{
    label: "SD Amount",
    getValue: (b: LotBreakdown) => b.sdAmount,
    getTotal: () => totals.sdAmount
  }] : []), ...(showEmd ? [{
    label: "EMD Amount",
    getValue: (b: LotBreakdown) => b.emdAmount,
    getTotal: () => totals.emdAmount
  }] : []), {
    label: "Balance Payment",
    getValue: (b: LotBreakdown) => b.balancePayment,
    getTotal: () => totals.balancePayment
  }, {
    label: serviceChargeHeaderLabel,
    getValue: (b: LotBreakdown) => isTransactionFees ? b.transactionFeesAmount : b.serviceChargeAmount,
    getTotal: () => isTransactionFees ? totals.transactionFeesAmount : totals.serviceChargeAmount
  }, {
    label: "IT TDS",
    getValue: (b: LotBreakdown) => b.itTdsAmount,
    getTotal: () => totals.itTdsAmount
  }, {
    label: "TCS on GST",
    getValue: (b: LotBreakdown) => b.tcsOnGstAmount,
    getTotal: () => totals.tcsOnGstAmount
  }, {
    label: "Total Payable",
    getValue: (b: LotBreakdown) => b.grandTotal,
    getTotal: () => totals.grandTotal,
    isTotal: true
  }];
  return <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-slide-up">
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="p-2 rounded-lg bg-primary">
          <Receipt className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment Breakdown</h2>
          <p className="text-sm text-muted-foreground">Detailed breakdown by lot</p>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-20">
            {/* Group header row */}
            <tr className="border-b border-border">
              <th
                className="sticky left-0 top-0 z-30 bg-card p-2 text-left font-semibold text-muted-foreground min-w-[120px]"
                rowSpan={2}
              >
                Lot
              </th>
              <th colSpan={sellerColCount} className="p-2 text-center font-semibold text-foreground bg-accent/30 border-r border-border">
                Seller Payment
              </th>
              <th colSpan={3} className="p-2 text-center font-semibold text-foreground bg-secondary/30 border-r border-border">
                MSTC Payment
              </th>
              <th className="p-2 bg-primary/10 text-right font-semibold text-foreground" rowSpan={2}>
                Total Payment
              </th>
            </tr>
            {/* Column header row */}
            <tr className="bg-muted/50 border-b border-border">
              {columns.slice(0, sellerColCount).map((col, index) => <th key={index} className={`p-3 text-right font-semibold min-w-[120px] text-muted-foreground ${index === sellerColCount - 1 ? 'border-r border-border' : ''}`}>
                  {col.label}
                </th>)}
              {columns.slice(sellerColCount, sellerColCount + 3).map((col, index) => <th key={index + sellerColCount} className={`p-3 text-right font-semibold min-w-[120px] text-muted-foreground ${index === 2 ? 'border-r border-border' : ''}`}>
                  {col.label}
                </th>)}
              
            </tr>
          </thead>
          <tbody>
            {breakdowns.map((breakdown, rowIndex) => <tr key={rowIndex} className="border-b border-border hover:bg-muted/30 transition-colors even:bg-muted/20">
                <td className="sticky left-0 z-10 bg-inherit p-3 font-medium text-foreground">{breakdown.lotName}</td>
                {columns.map((col, colIndex) => <td key={colIndex} className={`p-3 font-mono text-right ${col.isTotal ? 'font-bold text-primary' : 'text-foreground'}`}>
                    {formatCurrency(col.getValue(breakdown))}
                  </td>)}
              </tr>)}
            {/* Column totals row */}
            <tr className="border-b border-border bg-muted/40 font-semibold">
              <td className="sticky left-0 z-10 bg-inherit p-3 font-bold text-foreground">Column Total</td>
              {columns.map((col, colIndex) => <td key={colIndex} className={`p-3 font-mono text-right ${col.isTotal ? 'font-bold text-primary' : 'text-foreground'}`}>
                  {formatCurrency(col.getTotal())}
                </td>)}
            </tr>
            {/* Group subtotals row */}
            <tr className="border-b border-border bg-info/5 font-semibold">
              <td className="sticky left-0 z-10 bg-inherit p-3 font-bold text-info">Group Subtotal</td>
              {/* Seller Payment subtotal - spans seller columns */}
              <td colSpan={sellerColCount} className="p-3 font-mono text-center font-bold text-accent-foreground bg-accent/20 border-r border-border">
                Seller: {formatCurrency(sellerBreakupSum)}
              </td>
              {/* MSTC Payment subtotal - spans MSTC columns */}
              <td colSpan={3} className="p-3 font-mono text-center font-bold text-secondary-foreground bg-secondary/20 border-r border-border">
                MSTC: {formatCurrency(mstcBreakupSum)}
              </td>
              {/* Grand total */}
              <td className="p-3 font-mono text-right font-bold text-primary bg-primary/10">
                {formatCurrency(totals.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
}