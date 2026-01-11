import "./globals.scss";
import { Montserrat } from "next/font/google";
import Header from "@/components/shared/Header/Header";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext";

const montserrat = Montserrat({
  subsets: ["cyrillic"]
})

export const metadata = { title: 'App', description: 'Client app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.className}>
      <body className="overflow-x-hidden">
        <AuthProvider>
          <Toaster position="top-right" />
          <Header />
          <main className="relative px-16 mt-40 mb-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}