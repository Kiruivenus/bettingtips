import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Betting Tips Today – Daily Football Predictions & Sure Odds",
  description: "Get free football betting tips updated daily. Expert-analyzed predictions with match odds, league picks & sure bets. No signup required – start winning today!",
  alternates: {
    canonical: '/free-tips',
  },
  openGraph: {
    title: "Free Betting Tips Today – Daily Football Predictions & Sure Odds",
    description: "Free football betting tips updated daily. Expert-analyzed predictions with match odds & sure bets.",
    url: '/free-tips',
  },
};

export default function FreeTipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
