import z from "zod";

export const TodayPaymentVerifySchema = z.object({
  // Opening
  openingCash: z.coerce.number().min(0).nullable().optional(),
  cashIn: z.coerce.number().min(0).nullable().optional(),
  totalOpeningCash: z.coerce.number().min(0).nullable().optional(),

  // Sales
  incomeCash: z.coerce.number().min(0).nullable().optional(),
  actualIncomeCash: z.coerce.number().min(0).nullable().optional(),
  incomeTransfer: z.coerce.number().min(0).nullable().optional(),
  actualTransfer: z.coerce.number().min(0).nullable().optional(),
  totalSales: z.coerce.number().min(0).nullable().optional(),
  actualSales: z.coerce.number().min(0).nullable().optional(),

  // CashOut
  expensesCash: z.coerce.number().min(0).nullable().optional(),
  expenseRemark: z.string().nullable().optional(),
  cashDeposit: z.array(z.string()).optional(),

  // Closing
  closingCash: z.coerce.number().min(0).nullable().optional(),
  proofImages: z.array(z.string()).optional(),

  // Verification
  remark: z.string().nullable().optional(),
  verifiedById: z.coerce.number().int().min(1).optional(),
});

export type TodayPaymentVerifyFormValues = z.infer<typeof TodayPaymentVerifySchema>;
