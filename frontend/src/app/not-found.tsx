export default function GlobalNotFound() {
    return (
        <html lang="es">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              // Absolute top-level patch for Performance APIs (Global Catch)
              (function() {
                try {
                  const p = window.Performance ? window.Performance.prototype : (window.performance ? Object.getPrototypeOf(window.performance) : null);
                  const target = p || window.performance;
                  if (target) {
                    ['measure', 'mark'].forEach(m => {
                      if (typeof target[m] === 'function') {
                        const orig = target[m];
                        target[m] = function() {
                          try { return orig.apply(this, arguments); } catch (e) { return null; }
                        };
                      }
                    });
                  }
                } catch (e) {}
              })();
            `,
                    }}
                />
                <meta httpEquiv="refresh" content="0;url=/es" />
            </head>
            <body>
            </body>
        </html>
    );
}
