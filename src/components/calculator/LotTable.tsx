import { Lot, Config } from "@/types/calculator";
import { calculateLot, formatCurrency } from "@/lib/calculations";
import { LotInputRow } from "./LotInputRow";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

interface LotTableProps {
  lots: Lot[];
  config: Config;
  onUpdateLot: (id: number, field: keyof Lot, value: string | number) => void;
  onDeleteLot: (id: number) => void;
  onAddLot: () => void;
}

export function LotTable({ lots, config, onUpdateLot, onDeleteLot, onAddLot }: LotTableProps) {
  const showSdColumn = config.securityDepositType !== 'notApplicable';
  const showEmdColumn = config.emdType !== 'notApplicable';
  const isTransactionFees = config.mstcPaymentType === 'transactionFees';
  
  // Calculate totals for all lots
  const calculations = lots.map(lot => calculateLot(lot, config));
  const totals = calculations.reduce(
    (acc, calc) => ({
      materialValue: acc.materialValue + calc.materialValue,
      gst: acc.gst + calc.gst,
      tcs: acc.tcs + calc.tcs,
      penalty: acc.penalty + calc.penalty,
      transactionFees: acc.transactionFees + calc.transactionFees,
      sdAmount: acc.sdAmount + calc.sdAmount,
      total: acc.total + calc.total,
    }),
    { materialValue: 0, gst: 0, tcs: 0, penalty: 0, transactionFees: 0, sdAmount: 0, total: 0 }
  );
  
  return (
    <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <Package className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lot Details</h2>
            <p className="text-sm text-muted-foreground">Enter lot information for calculation</p>
          </div>
        </div>
        <Button onClick={onAddLot} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" />
          Add Lot
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-3 text-center font-semibold text-muted-foreground">Lot Name</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Qty</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Bid Value</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">GST%</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">TCS%</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Penalty%</th>
              {showEmdColumn && (
                <th className="p-3 text-center font-semibold text-muted-foreground">
                  EMD {config.emdType === 'percentage' ? '%' : 'Amt'}
                </th>
              )}
              {showSdColumn && (
                <th className="p-3 text-center font-semibold text-muted-foreground">
                  SD {config.securityDepositType === 'percentage' ? '%' : 'Amt'}
                </th>
              )}
              <th className="p-3 text-center font-semibold text-muted-foreground bg-muted/30">Material Value</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">GST</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">TCS</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Penalty</th>
              {isTransactionFees && (
                <th className="p-3 text-center font-semibold text-muted-foreground">Trans. Fees</th>
              )}
              {showSdColumn && (
                <th className="p-3 text-center font-semibold text-muted-foreground">SD</th>
              )}
              <th className="p-3 text-center font-semibold text-accent">Total</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot, index) => (
              <LotInputRow
                key={lot.id}
                lot={lot}
                calculation={calculations[index]}
                onUpdate={onUpdateLot}
                onDelete={onDeleteLot}
                canDelete={lots.length > 1}
                isRcmEnabled={config.gstOnRcm === 1}
                securityDepositType={config.securityDepositType}
                emdType={config.emdType}
                isTransactionFees={isTransactionFees}
              />
            ))}
            {lots.length > 1 && (
              <tr className="bg-info/10 border-t-2 border-info/30 font-semibold">
                <td className="p-3 text-center text-info font-bold">Total</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                {showEmdColumn && <td className="p-3"></td>}
                {showSdColumn && <td className="p-3"></td>}
                <td className="p-3 text-right font-mono text-info bg-muted/30">{formatCurrency(totals.materialValue)}</td>
                <td className="p-3 text-right font-mono text-info">{formatCurrency(totals.gst)}</td>
                <td className="p-3 text-right font-mono text-info">{formatCurrency(totals.tcs)}</td>
                <td className="p-3 text-right font-mono text-info">{formatCurrency(totals.penalty)}</td>
                {isTransactionFees && <td className="p-3 text-right font-mono text-info">{formatCurrency(totals.transactionFees)}</td>}
                {showSdColumn && <td className="p-3 text-right font-mono text-info">{formatCurrency(totals.sdAmount)}</td>}
                <td className="p-3 text-right font-mono text-accent font-bold">{formatCurrency(totals.total)}</td>
                <td className="p-3"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
