import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Football Scores Today – Real-Time Match Updates | Platinum Picks",
  description: "Track live football scores and match updates in real-time. Follow today's games across all leagues with instant results. Free live score service by Platinum Picks.",
  alternates: {
    canonical: '/livescores',
  },
  openGraph: {
    title: "Live Football Scores Today – Real-Time Match Updates",
    description: "Track live football scores in real-time. Follow today's games across all leagues.",
    url: '/livescores',
  },
};

export default function LivescoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
