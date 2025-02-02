import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Turnstile scripts */}
      <Script id="cf-turnstile-callback">
        {`window.onloadTurnstileCallback = function () {
                window.turnstile.render('#cfTurnstile', {
                  sitekey: '${process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}',
                })
              }`}
      </Script>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        async={true}
        defer={true}
      />
      {children}
    </>
  );
}
