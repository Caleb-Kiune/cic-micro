import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <header className="mb-8 mt-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Select Product</h1>
        <p className="text-gray-600 mt-1 text-sm">Tap a calculator below to begin a new quote.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Active Product: Coop Care --- */}
        <Link href="/coop-care" className="block group h-full">
          <div className="border-2 border-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-colors h-full flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-blue-800 group-hover:underline">
                Coop Care Medical
              </h2>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Calculate group health premiums for Cooperatives and MFIs.
              Includes options for Inpatient and All Benefits.
            </p>
            <span className="text-blue-700 font-semibold text-sm">
              Launch Calculator →
            </span>
          </div>
        </Link>

        {/* GFE */}
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 opacity-70 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-500">
              Group Funeral Expense (GFE)
            </h2>
            <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4 flex-grow">
            Last expense cover for registered groups. Generates official roster
            breakdowns.
          </p>
        </div>
      </div>
    </div>
  );
}
