import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Betting Results & Tips Archive – Verified Win/Loss Record | Platinum Picks",
  description: "View our complete betting tips archive with transparent win/loss results. Fully verified track record with historical predictions, odds & outcomes. No hiding losses.",
  alternates: {
    canonical: '/results',
  },
  openGraph: {
    title: "Betting Results & Tips Archive – Verified Win/Loss Record",
    description: "Complete betting tips archive with transparent win/loss results. Fully verified track record.",
    url: '/results',
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
