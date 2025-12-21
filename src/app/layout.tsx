import "./globals.scss";
import { Montserrat } from "next/font/google";
import Header from "@/components/shared/Header/Header";
import { Toaster } from "@/components/ui/sonner"

const montserrat = Montserrat({
  subsets: ["cyrillic"]
})

export const metadata = { title: 'App', description: 'Client app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.className}>
      <body>
        <Toaster position="top-right" />
        <Header />
        {children}
      </body>
    </html>
  );
}