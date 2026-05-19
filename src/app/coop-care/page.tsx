import { CoopCareForm } from "../../features/coop-care/CoopCareForm";
import Link from "next/link";

export default function CoopCarePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center w-fit"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
      <div className="py-6">
        <CoopCareForm />
      </div>
    </main>
  );
}
