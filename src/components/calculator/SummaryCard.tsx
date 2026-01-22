import { Summary } from "@/types/calculator";
import { formatCurrency } from "@/lib/calculations";
import { Banknote, Building2, Wallet } from "lucide-react";

interface SummaryCardProps {
  summary: Summary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* EMD Summary */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-info">
            <Wallet className="h-5 w-5 text-info-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">EMD Payment</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Payment to Seller</span>
            <span className="font-mono font-semibold text-foreground">{formatCurrency(summary.totalEmd * 0.67)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">MSTC S/C</span>
            <span className="font-mono text-foreground">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">TCS on GST</span>
            <span className="font-mono text-foreground">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">IT TDS</span>
            <span className="font-mono text-foreground">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 bg-info/10 -mx-6 px-6 py-3 -mb-6 rounded-b-lg">
            <span className="font-semibold text-foreground">Total EMD</span>
            <span className="font-mono font-bold text-lg text-info">{formatCurrency(summary.totalEmd)}</span>
          </div>
        </div>
      </div>

      {/* Balance Payment */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-accent">
            <Banknote className="h-5 w-5 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Balance Payment</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Payment to Seller</span>
            <span className="font-mono font-semibold text-foreground">{formatCurrency(summary.balanceSellerPayment)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">MSTC S/C</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalMstcSc)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">TCS on GST</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalTcsOnGst)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">IT TDS</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalItTds)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 bg-accent/10 -mx-6 px-6 py-3 -mb-6 rounded-b-lg">
            <span className="font-semibold text-foreground">Total Balance</span>
            <span className="font-mono font-bold text-lg text-accent">{formatCurrency(summary.totalBalance)}</span>
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Total Summary</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Seller Payment</span>
            <span className="font-mono font-semibold text-foreground">{formatCurrency(summary.totalSellerPayment)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">MSTC S/C</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalMstcSc)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">TCS on GST</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalTcsOnGst)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">IT TDS</span>
            <span className="font-mono text-foreground">{formatCurrency(summary.totalItTds)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 gradient-primary -mx-6 px-6 py-3 -mb-6 rounded-b-lg">
            <span className="font-semibold text-primary-foreground">Grand Total</span>
            <span className="font-mono font-bold text-lg text-primary-foreground">{formatCurrency(summary.totalPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
