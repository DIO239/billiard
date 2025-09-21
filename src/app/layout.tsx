import "./globals.scss";
import { Montserrat } from "next/font/google";
import Header from "@/app/components/Header/Header";

const montserrat = Montserrat({
  subsets: ["cyrillic"]
})

export const metadata = { title: 'App', description: 'Client app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.className}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}