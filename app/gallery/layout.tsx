import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Image Gallery',
  description: 'A beautiful, animated image gallery with GSAP animations',
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </body>
    </html>
  );
}