import { Lot, LotCalculation, SecurityDepositType, EmdType } from "@/types/calculator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/calculations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LotInputRowProps {
  lot: Lot;
  calculation: LotCalculation;
  onUpdate: (id: number, field: keyof Lot, value: string | number) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
  isRcmEnabled: boolean;
  securityDepositType: SecurityDepositType;
  emdType: EmdType;
  isTransactionFees: boolean;
}

const MAX_VALUE = 999999999;
const MAX_QUANTITY = 999999;

export function LotInputRow({ 
  lot, 
  calculation, 
  onUpdate, 
  onDelete, 
  canDelete, 
  isRcmEnabled,
  securityDepositType,
  emdType,
  isTransactionFees
}: LotInputRowProps) {
  const isQuantityInvalid = lot.quantity < 0;
  const isBidValueInvalid = lot.bidValue < 0;
  const isPenaltyInvalid = lot.penaltyPercent < 0 || lot.penaltyPercent > 100;
  const isSdValueInvalid = lot.sdValue < 0 || (securityDepositType === 'percentage' && lot.sdValue > 100);
  const isEmdValueInvalid = lot.emdValue < 0 || (emdType === 'percentage' && lot.emdValue > 100);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onUpdate(lot.id, "quantity", 0);
      return;
    }
    const clampedValue = Math.max(0, Math.min(MAX_QUANTITY, value));
    onUpdate(lot.id, "quantity", clampedValue);
  };

  const handleBidValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onUpdate(lot.id, "bidValue", 0);
      return;
    }
    const clampedValue = Math.max(0, Math.min(MAX_VALUE, Math.round(value * 100) / 100));
    onUpdate(lot.id, "bidValue", clampedValue);
  };

  const handlePenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onUpdate(lot.id, "penaltyPercent", 0);
      return;
    }
    const clampedValue = Math.max(0, Math.min(100, Math.round(value * 100) / 100));
    onUpdate(lot.id, "penaltyPercent", clampedValue);
  };

  const handleSdValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onUpdate(lot.id, "sdValue", 0);
      return;
    }
    const maxVal = securityDepositType === 'percentage' ? 100 : MAX_VALUE;
    const clampedValue = Math.max(0, Math.min(maxVal, Math.round(value * 100) / 100));
    onUpdate(lot.id, "sdValue", clampedValue);
  };

  const handleEmdValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      onUpdate(lot.id, "emdValue", 0);
      return;
    }
    const maxVal = emdType === 'percentage' ? 100 : MAX_VALUE;
    const clampedValue = Math.max(0, Math.min(maxVal, Math.round(value * 100) / 100));
    onUpdate(lot.id, "emdValue", clampedValue);
  };

  const showSdInput = securityDepositType !== 'notApplicable';
  const showEmdInput = emdType !== 'notApplicable';

  return (
    <tr className="border-b border-border hover:bg-muted/40 transition-colors group even:bg-muted/20">
      <td className="p-3">
        <span className="font-medium text-foreground px-3 py-2 inline-block">{lot.name}</span>
      </td>
      <td className="p-3">
        <TooltipProvider>
          <Tooltip open={isQuantityInvalid}>
            <TooltipTrigger asChild>
              <Input
                type="number"
                min={0}
                max={MAX_QUANTITY}
                step={1}
                value={lot.quantity || ""}
                onChange={handleQuantityChange}
                className={cn(
                  "w-20 number-input font-mono text-right",
                  isQuantityInvalid && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="0"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
              Quantity cannot be negative
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="p-3">
        <TooltipProvider>
          <Tooltip open={isBidValueInvalid}>
            <TooltipTrigger asChild>
              <Input
                type="number"
                min={0}
                max={MAX_VALUE}
                step={0.01}
                value={lot.bidValue || ""}
                onChange={handleBidValueChange}
                className={cn(
                  "w-24 number-input font-mono text-right",
                  isBidValueInvalid && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="0"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
              Bid value cannot be negative
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="p-3">
        {isRcmEnabled ? (
          <div className="w-20 px-3 py-2 text-center font-mono text-muted-foreground bg-muted rounded-md">
            RCM
          </div>
        ) : (
          <Select
            value={lot.gstPercent.toString()}
            onValueChange={(value) => onUpdate(lot.id, "gstPercent", parseFloat(value))}
          >
            <SelectTrigger className="w-20 font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
            </SelectContent>
          </Select>
        )}
      </td>
      <td className="p-3">
        <Select
          value={lot.tcsPercent === 0 ? "NA" : lot.tcsPercent.toString()}
          onValueChange={(value) => onUpdate(lot.id, "tcsPercent", value === "NA" ? 0 : parseFloat(value))}
        >
          <SelectTrigger className="w-20 font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="NA">NA</SelectItem>
            <SelectItem value="1">1%</SelectItem>
            <SelectItem value="2">2%</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <TooltipProvider>
          <Tooltip open={isPenaltyInvalid}>
            <TooltipTrigger asChild>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={lot.penaltyPercent || ""}
                onChange={handlePenaltyChange}
                className={cn(
                  "w-16 number-input font-mono text-right",
                  isPenaltyInvalid && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="0"
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
              {lot.penaltyPercent < 0 ? "Cannot be negative" : "Cannot exceed 100%"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      {showEmdInput && (
        <td className="p-3">
          <TooltipProvider>
            <Tooltip open={isEmdValueInvalid}>
              <TooltipTrigger asChild>
                <Input
                  type="number"
                  min={0}
                  max={emdType === 'percentage' ? 100 : MAX_VALUE}
                  step={0.01}
                  value={lot.emdValue || ""}
                  onChange={handleEmdValueChange}
                  className={cn(
                    "w-24 number-input font-mono text-right",
                    isEmdValueInvalid && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder={emdType === 'percentage' ? "%" : "Amount"}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                {lot.emdValue < 0 ? "Cannot be negative" : "Cannot exceed 100%"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
      )}
      {showSdInput && (
        <td className="p-3">
          <TooltipProvider>
            <Tooltip open={isSdValueInvalid}>
              <TooltipTrigger asChild>
                <Input
                  type="number"
                  min={0}
                  max={securityDepositType === 'percentage' ? 100 : MAX_VALUE}
                  step={0.01}
                  value={lot.sdValue || ""}
                  onChange={handleSdValueChange}
                  className={cn(
                    "w-24 number-input font-mono text-right",
                    isSdValueInvalid && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder={securityDepositType === 'percentage' ? "%" : "Amount"}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                {lot.sdValue < 0 ? "Cannot be negative" : "Cannot exceed 100%"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
      )}
      <td className="p-3 font-mono text-right text-foreground bg-muted/30">
        {formatNumber(calculation.materialValue)}
      </td>
      <td className="p-3 font-mono text-right text-foreground">
        {formatNumber(calculation.gst)}
      </td>
      <td className="p-3 font-mono text-right text-foreground">
        {formatNumber(calculation.tcs)}
      </td>
      <td className="p-3 font-mono text-right text-foreground">
        {formatNumber(calculation.penalty)}
      </td>
      {isTransactionFees && (
        <td className="p-3 font-mono text-right text-foreground">
          {formatNumber(calculation.transactionFees)}
        </td>
      )}
      {showSdInput && (
        <td className="p-3 font-mono text-right text-foreground">
          {formatNumber(calculation.sdAmount)}
        </td>
      )}
      <td className="p-3 font-mono text-right font-semibold text-accent bg-accent/5">
        {formatNumber(calculation.total)}
      </td>
      <td className="p-3">
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lot.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </td>
    </tr>
  );
}
