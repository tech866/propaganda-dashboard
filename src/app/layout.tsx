import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProviderWrapper } from "@/components/providers/ClerkProvider";
import { RoleProvider } from "@/contexts/RoleContext";
import { AgencyProvider } from "@/contexts/AgencyContext";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ClerkProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <RoleProvider>
              <AgencyProvider>
                {children}
              </AgencyProvider>
            </RoleProvider>
          </ThemeProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
