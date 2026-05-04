export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex flex-row w-full justify-between gap-3">
          <div className="w-auto h-auto rounded-lg flex items-start justify-center">
            <img
              src="/images/hca-logo.svg"
              alt="Nurse Navigator"
              width={100}
              height="auto"
            />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 font-display tracking-tight">Nurse Navigator</h1>
        </div>
      </div>
    </header>
  );
}
