export const member = {
  name: "Amara Okafor",
  initials: "AO",
};

export const subscription = {
  businessName: "Ironcore Gym",
  businessInitials: "IG",
  planLabel: "Monthly membership",
  monthlyAmount: 35.0,
  nextCharge: "12 Apr 2026",
};

export const paymentHistory = [
  {
    id: "pay-1",
    business: "Ironcore Gym",
    date: "12 Mar 2026, 09:14",
    status: "success",
    processingFee: 3.5,
    amount: 35.0,
  },
  {
    id: "pay-2",
    business: "Ironcore Gym",
    date: "10 Mar 2026, 08:04",
    status: "failed",
    processingFee: 0.0,
    amount: 35.0,
  },
  {
    id: "pay-3",
    business: "Ironcore Gym",
    date: "12 Feb 2026, 09:11",
    status: "success",
    processingFee: 3.5,
    amount: 35.0,
  },
  {
    id: "pay-4",
    business: "Ironcore Gym",
    date: "12 Jan 2026, 09:08",
    status: "success",
    processingFee: 3.5,
    amount: 35.0,
  },
];

export const connectedWallet = {
  url: "https://wallet.example/amara",
};

export function formatCurrency(value) {
  return `€${value.toFixed(2)}`;
}
