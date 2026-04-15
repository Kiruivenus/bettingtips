import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy VIP Betting Tips – Premium Football Predictions | Platinum Picks",
  description: "Buy expert-verified VIP betting tips with 87%+ win rate. Premium football predictions, sure odds & daily picks. Pay with M-Pesa, PayPal or Card. Subscribe now!",
  alternates: {
    canonical: '/buy-tips',
  },
  openGraph: {
    title: "Buy VIP Betting Tips – Premium Football Predictions",
    description: "Expert-verified VIP betting tips with 87%+ win rate. Pay with M-Pesa, PayPal or Card.",
    url: '/buy-tips',
  },
};

export default function BuyTipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
