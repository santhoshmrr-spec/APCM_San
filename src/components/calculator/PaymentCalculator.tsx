import { useState, useMemo } from "react";
import { Lot, Config } from "@/types/calculator";
import { calculateSummary } from "@/lib/calculations";
import { ConfigPanel } from "./ConfigPanel";
import { LotTable } from "./LotTable";
import { BreakdownTable } from "./BreakdownTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calculator, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const defaultConfig: Config = {
  gstOnRcm: 0,
  itTds: 1,
  tcsOnGst: 0,
  tdsOnSc: 0,
  mstcPaymentType: 'serviceCharge',
  mstcScPercent: 2.5,
  securityDepositType: 'notApplicable',
  emdType: 'percentage',
};

const createEmptyLot = (id: number): Lot => ({
  id,
  name: `LOT ${id}`,
  quantity: 0,
  bidValue: 0,
  gstPercent: 0,
  tcsPercent: 0,
  penaltyPercent: 0,
  sdValue: 0,
  emdValue: 25,
});

const defaultLots: Lot[] = [createEmptyLot(1)];

export function PaymentCalculator() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [lots, setLots] = useState<Lot[]>(defaultLots);
  const [showConfig, setShowConfig] = useState(true);

  const summary = useMemo(() => calculateSummary(lots, config), [lots, config]);

  const handleUpdateLot = (id: number, field: keyof Lot, value: string | number) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === id
          ? { ...lot, [field]: typeof value === "string" && field !== "name" ? parseFloat(value) || 0 : value }
          : lot
      )
    );
  };

  const handleDeleteLot = (id: number) => {
    setLots((prev) => prev.filter((lot) => lot.id !== id));
    toast.success("Lot deleted successfully");
  };

  const handleAddLot = () => {
    const newId = lots.length > 0 ? Math.max(...lots.map((l) => l.id)) + 1 : 1;
    setLots([...lots, createEmptyLot(newId)]);
    toast.success("New lot added");
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    // Reset all lots to zero values while keeping the same lot names
    setLots(lots.map((lot) => ({ ...createEmptyLot(lot.id), name: lot.name })));
    toast.info("All values reset to zero");
  };

  const handleSavePdf = () => {
    // Uses the browser print dialog; users can choose "Save as PDF".
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 gradient-header border-b border-border/50 shadow-md no-print">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  Auction Payment Computation Module
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">APCM</span>
                  <span className="text-white/40">•</span>
                  <span className="text-xs text-white/60">Internal Tool</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="gap-2 text-white/90 hover:text-white hover:bg-white/10"
              >
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSavePdf} className="gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/20">
                <Download className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Print Header - only visible when printing */}
      <div className="print-only container mx-auto px-4 py-6 border-b border-border mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auction Payment Computation Module (APCM)</h1>
            <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Config Panel */}
        {showConfig && (
          <ConfigPanel config={config} onConfigChange={setConfig} />
        )}

        {/* Lot Table */}
        <LotTable
          lots={lots}
          config={config}
          onUpdateLot={handleUpdateLot}
          onDeleteLot={handleDeleteLot}
          onAddLot={handleAddLot}
        />

        {/* Payment Breakdown Table */}
        <BreakdownTable lots={lots} config={config} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4 no-print bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-foreground">
            Auction Payment Computation Module (APCM)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Built for accurate lot-based payment calculations — designed by S@N
          </p>
        </div>
      </footer>
    </div>
  );
}
