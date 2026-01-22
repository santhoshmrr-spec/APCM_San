export type SecurityDepositType = 'notApplicable' | 'percentage' | 'lumpsum';
export type EmdType = 'notApplicable' | 'percentage' | 'lumpsum';

export interface Lot {
  id: number;
  name: string;
  quantity: number;
  bidValue: number;
  gstPercent: number;
  tcsPercent: number;
  penaltyPercent: number;
  sdValue: number; // Security Deposit value (percentage or lumpsum amount)
  emdValue: number; // EMD value (percentage or lumpsum amount)
}

export interface LotCalculation extends Lot {
  materialValue: number;
  penalty: number;
  gst: number;
  tcs: number;
  total: number;
  emd: number;
  serviceCharge: number;
  serviceChargeWithoutGst: number;
  transactionFees: number;
  tds: number;
  tcsOnGst: number;
  sellerPayment: number;
  itTds: number;
  mstcSc: number;
  sdAmount: number;
}

export type MstcPaymentType = 'serviceCharge' | 'transactionFees';

export interface Config {
  gstOnRcm: 0 | 1; // 1 for RCM basis (GST = 0), 0 for normal
  itTds: 0 | 1;
  tcsOnGst: 0 | 1;
  tdsOnSc: 0 | 1; // 1 for 2% TDS on S/C, 0 for no TDS
  mstcPaymentType: MstcPaymentType;
  mstcScPercent: number;
  securityDepositType: SecurityDepositType;
  emdType: EmdType;
}

export interface Summary {
  totalEmd: number;
  totalBalance: number;
  totalMstcSc: number;
  totalTcsOnGst: number;
  totalItTds: number;
  totalSellerPayment: number;
  totalPayment: number;
  mstcPayment: number;
  balanceSellerPayment: number;
  balanceMstcSc: number;
  balanceTcsOnGst: number;
  balanceItTds: number;
  balanceTotal: number;
  totalSdAmount: number;
  grandTotal: number;
}

export interface LotBreakdown {
  lotName: string;
  sdAmount: number;
  emdAmount: number;
  balancePayment: number;
  tdsOnServiceCharge: number;
  sellerPaymentTotal: number;
  serviceChargeAmount: number;
  transactionFeesAmount: number;
  itTdsAmount: number;
  tcsOnGstAmount: number;
  mstcPaymentTotal: number;
  grandTotal: number;
}
