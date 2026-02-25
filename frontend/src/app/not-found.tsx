export default function GlobalNotFound() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = "/es";`,
        }}
      />
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-xl text-primary font-medium">Cargando...</div>
      </div>
    </>
  );
}
