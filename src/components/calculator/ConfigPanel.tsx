import { Config, MstcPaymentType, SecurityDepositType, EmdType } from "@/types/calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

interface ConfigPanelProps {
  config: Config;
  onConfigChange: (config: Config) => void;
}

export function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  const updateConfig = <K extends keyof Config>(key: K, value: Config[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const handlePaymentTypeChange = (value: MstcPaymentType) => {
    // When switching to transaction fees, disable TDS on S/C
    if (value === 'transactionFees') {
      onConfigChange({ ...config, mstcPaymentType: value, tdsOnSc: 0 });
    } else {
      onConfigChange({ ...config, mstcPaymentType: value });
    }
  };

  const isTransactionFees = config.mstcPaymentType === 'transactionFees';

  return (
    <div className="bg-card rounded-lg p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary">
          <Settings className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* EMD Type */}
        <div className="space-y-2">
          <Label htmlFor="emdType" className="text-sm font-medium text-muted-foreground">
            EMD
          </Label>
          <Select
            value={config.emdType}
            onValueChange={(value) => updateConfig("emdType", value as EmdType)}
          >
            <SelectTrigger className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="notApplicable">Not Applicable</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="lumpsum">Lumpsum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Security Deposit Type */}
        <div className="space-y-2">
          <Label htmlFor="securityDepositType" className="text-sm font-medium text-muted-foreground">
            Security Deposit
          </Label>
          <Select
            value={config.securityDepositType}
            onValueChange={(value) => updateConfig("securityDepositType", value as SecurityDepositType)}
          >
            <SelectTrigger className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="notApplicable">Not Applicable</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="lumpsum">Lumpsum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* MSTC Payment Type with Radio Buttons */}
        <div className="space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
          <Label className="text-sm font-medium text-muted-foreground">
            MSTC Payment
          </Label>
          <RadioGroup
            value={config.mstcPaymentType}
            onValueChange={(value) => handlePaymentTypeChange(value as MstcPaymentType)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="serviceCharge" id="serviceCharge" />
              <Label htmlFor="serviceCharge" className="text-sm font-medium cursor-pointer">
                Service Charge
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transactionFees" id="transactionFees" />
              <Label htmlFor="transactionFees" className="text-sm font-medium cursor-pointer">
                Transaction Fees
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Percentage input - shown after radio selection */}
        <div className="space-y-2">
          <Label htmlFor="mstcScPercent" className="text-sm font-medium text-muted-foreground">
            {isTransactionFees ? 'Transaction Fees %' : 'Service Charge %'}
          </Label>
          <Input
            id="mstcScPercent"
            type="number"
            step="0.1"
            min={0}
            max={100}
            value={config.mstcScPercent}
            onChange={(e) => updateConfig("mstcScPercent", Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
            className="number-input font-mono"
          />
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg ${isTransactionFees ? 'bg-muted/20 opacity-50' : 'bg-muted/50'}`}>
          <Label htmlFor="tdsOnSc" className="text-sm font-medium text-foreground">
            TDS on S/C (2%)
          </Label>
          <Switch
            id="tdsOnSc"
            checked={config.tdsOnSc === 1}
            onCheckedChange={(checked) => updateConfig("tdsOnSc", checked ? 1 : 0)}
            disabled={isTransactionFees}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <Label htmlFor="gstOnRcm" className="text-sm font-medium text-foreground">
            GST on RCM Basis
          </Label>
          <Switch
            id="gstOnRcm"
            checked={config.gstOnRcm === 1}
            onCheckedChange={(checked) => updateConfig("gstOnRcm", checked ? 1 : 0)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <Label htmlFor="itTds" className="text-sm font-medium text-foreground">
            IT TDS (0.1%)
          </Label>
          <Switch
            id="itTds"
            checked={config.itTds === 1}
            onCheckedChange={(checked) => updateConfig("itTds", checked ? 1 : 0)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <Label htmlFor="tcsOnGst" className="text-sm font-medium text-foreground">
            TCS on GST (0.5%)
          </Label>
          <Switch
            id="tcsOnGst"
            checked={config.tcsOnGst === 1}
            onCheckedChange={(checked) => updateConfig("tcsOnGst", checked ? 1 : 0)}
          />
        </div>
      </div>
    </div>
  );
}
