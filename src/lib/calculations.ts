import { Lot, LotCalculation, Config, Summary, LotBreakdown } from "@/types/calculator";

export function calculateLot(lot: Lot, config: Config): LotCalculation {
  const materialValue = lot.quantity * lot.bidValue;
  const penalty = (materialValue * lot.penaltyPercent) / 100;
  
  // If GST on RCM basis is enabled, GST is treated as zero
  const effectiveGstPercent = config.gstOnRcm === 1 ? 0 : lot.gstPercent;
  const gst = (materialValue * effectiveGstPercent) / 100;
  const tcs = ((materialValue + gst) * lot.tcsPercent) / 100;
  
  // Security Deposit calculation
  let sdAmount = 0;
  if (config.securityDepositType === 'percentage') {
    sdAmount = (materialValue * lot.sdValue) / 100;
  } else if (config.securityDepositType === 'lumpsum') {
    sdAmount = lot.sdValue;
  }
  
  // EMD calculation (similar to Security Deposit)
  let emd = 0;
  if (config.emdType === 'percentage') {
    emd = (materialValue * lot.emdValue) / 100;
  } else if (config.emdType === 'lumpsum') {
    emd = lot.emdValue;
  }
  
  // TDS on service charge = 2% of service charge without GST (only if enabled)
  const serviceChargeWithoutGst = (materialValue * config.mstcScPercent) / 100;
  const tds = config.tdsOnSc === 1 ? serviceChargeWithoutGst * 0.02 : 0;
  
  // Service charge = service charge percent × material value × 1.18 (for GST) - TDS on S/C
  const serviceChargeGross = serviceChargeWithoutGst * 1.18;
  const serviceCharge = serviceChargeGross - tds;
  
  // Transaction fees (same calculation as service charge, used when in transaction fees mode)
  const isTransactionFees = config.mstcPaymentType === 'transactionFees';
  const transactionFees = isTransactionFees ? serviceCharge : 0;
  
  // Total Payment differs by mode:
  // Service Charge Mode: Material Value + Penalty + GST + TCS + SD Amount
  // Transaction Fees Mode: Material Value + Penalty + GST + TCS + SD Amount + Transaction Fees
  const total = materialValue + penalty + gst + tcs + sdAmount + (isTransactionFees ? transactionFees : 0);
  
  // TDS on service charge is already calculated above
  
  // IT TDS = 0.1% of material value (only if enabled)
  const itTds = config.itTds === 1 ? materialValue * 0.001 : 0;
  
  // TCS on GST = 0.5% of material value (only if enabled)
  const tcsOnGst = config.tcsOnGst === 1 ? materialValue * 0.005 : 0;
  
  const sellerPayment = materialValue + gst + tcs - itTds - serviceCharge;
  const mstcSc = serviceCharge;

  return {
    ...lot,
    materialValue,
    penalty,
    gst,
    tcs,
    total,
    emd,
    serviceCharge,
    serviceChargeWithoutGst,
    transactionFees,
    tds,
    tcsOnGst,
    sellerPayment,
    itTds,
    mstcSc,
    sdAmount,
  };
}

export function calculateLotBreakdown(lot: Lot, config: Config): LotBreakdown {
  const calc = calculateLot(lot, config);
  const isTransactionFees = config.mstcPaymentType === 'transactionFees';
  
  // EMD Amount (already calculated in calc)
  const emdAmount = calc.emd;
  
  // Security Deposit Amount
  const sdAmount = calc.sdAmount;
  
  // Service charge amount = service charge percent × material value × 1.18
  const serviceChargeAmount = isTransactionFees ? 0 : calc.serviceCharge;
  
  // Transaction fees = transaction fee percent × material value × 1.18
  const transactionFeesAmount = isTransactionFees ? calc.serviceCharge : 0;
  
  // IT TDS = 0.1% of material value (only if enabled)
  const itTdsAmount = config.itTds === 1 ? calc.materialValue * 0.001 : 0;
  
  // TCS on GST = 0.5% of material value (only if enabled)
  const tcsOnGstAmount = config.tcsOnGst === 1 ? calc.materialValue * 0.005 : 0;
  
  // TDS on service charge = 2% of service charge without GST (only for service charge mode and if enabled)
  const tdsOnServiceCharge = (!isTransactionFees && config.tdsOnSc === 1) ? calc.serviceChargeWithoutGst * 0.02 : 0;
  
  let mstcPayment: number;
  let balancePayment: number;
  let sellerPaymentTotal: number;
  
  if (isTransactionFees) {
    // Mode 2: Transaction Fees Mode
    // MSTC Payment = Transaction Fees + IT TDS + TCS on GST
    mstcPayment = transactionFeesAmount + itTdsAmount + tcsOnGstAmount;
    // Balance Payment = Total Payment − EMD − MSTC Payment + Transaction Fees − SD
    balancePayment = calc.total - emdAmount - mstcPayment + transactionFeesAmount - sdAmount;
    // Seller Payment = EMD + Balance Payment + SD
    sellerPaymentTotal = emdAmount + balancePayment + sdAmount;
  } else {
    // Mode 1: Service Charge Mode
    // MSTC Payment = Service Charge (already net of TDS) + IT TDS + TCS on GST
    mstcPayment = serviceChargeAmount + itTdsAmount + tcsOnGstAmount;
    // Balance Payment = Total Payment − EMD − MSTC Payment − SD
    balancePayment = calc.total - emdAmount - mstcPayment - sdAmount;
    // Seller Payment = EMD + Balance Payment + SD
    sellerPaymentTotal = emdAmount + balancePayment + sdAmount;
  }
  
  // Total = MSTC Payment + Seller Payment (SD is already included in Total Payment)
  const grandTotal = mstcPayment + sellerPaymentTotal;
  
  return {
    lotName: lot.name,
    sdAmount,
    emdAmount,
    balancePayment,
    tdsOnServiceCharge,
    sellerPaymentTotal,
    serviceChargeAmount,
    transactionFeesAmount,
    itTdsAmount,
    tcsOnGstAmount,
    mstcPaymentTotal: mstcPayment,
    grandTotal,
  };
}

export function calculateSummary(lots: Lot[], config: Config): Summary {
  let totalEmd = 0;
  let totalMstcSc = 0;
  let totalTcsOnGst = 0;
  let totalItTds = 0;
  let totalSellerPayment = 0;
  let totalPayment = 0;
  let totalSdAmount = 0;

  lots.forEach((lot) => {
    const calc = calculateLot(lot, config);
    totalEmd += calc.emd;
    totalMstcSc += calc.mstcSc;
    totalTcsOnGst += calc.tcsOnGst;
    totalItTds += calc.itTds;
    totalSellerPayment += calc.sellerPayment;
    totalPayment += calc.total;
    totalSdAmount += calc.sdAmount;
  });

  const totalBalance = totalPayment - totalEmd;
  const mstcPayment = totalMstcSc;
  const grandTotal = totalPayment + totalMstcSc + totalSdAmount;

  return {
    totalEmd,
    totalBalance,
    totalMstcSc,
    totalTcsOnGst,
    totalItTds,
    totalSellerPayment,
    totalPayment,
    mstcPayment,
    balanceSellerPayment: totalSellerPayment - totalEmd,
    balanceMstcSc: totalMstcSc,
    balanceTcsOnGst: totalTcsOnGst,
    balanceItTds: totalItTds,
    balanceTotal: totalBalance + totalMstcSc,
    totalSdAmount,
    grandTotal,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}
