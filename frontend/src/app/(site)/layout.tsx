import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] overflow-x-clip">{children}</main>
      <Footer />
    </>
  );
}
