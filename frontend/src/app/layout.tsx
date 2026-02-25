import { Inter } from "next/font/google";
import "./[locale]/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Absolute top-level patch for Performance APIs
              // Prevents crashes in Next.js/React 19 internal telemetry (#86060)
              (function() {
                try {
                  const p = window.Performance ? window.Performance.prototype : (window.performance ? Object.getPrototypeOf(window.performance) : null);
                  const target = p || window.performance;
                  if (target) {
                    ['measure', 'mark'].forEach(m => {
                      if (typeof target[m] === 'function') {
                        const original = target[m];
                        target[m] = function() {
                          try { return original.apply(this, arguments); } catch (e) { return null; }
                        };
                      }
                    });
                  }
                } catch (e) {}
                if (typeof window !== 'undefined') {
                  window.grammarly = { isExtensionInstalled: false };
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
