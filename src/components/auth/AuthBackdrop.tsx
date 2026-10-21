export function AuthBackdrop() {
  return (
    <>
      <div className="absolute top-10 left-0 sm:top-20 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-0 sm:bottom-20 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl" />
    </>
  );
}