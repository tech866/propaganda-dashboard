import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProviderWrapper } from "@/components/providers/ClerkProvider";
import { RoleProvider } from "@/contexts/RoleContext";
import { AgencyProvider } from "@/contexts/AgencyContext";
import { ThemeProvider } from "@/components/theme-provider";
import { TailusProvider } from "@/components/providers/TailusProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Propaganda Dashboard",
  description: "Agency Client Tracking Database & Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TailusProvider>
              <RoleProvider>
                <AgencyProvider>
                  {children}
                </AgencyProvider>
              </RoleProvider>
            </TailusProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
