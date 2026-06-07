import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Creator Grove</h1>
          <p className="text-gray-500 text-base">
            Tools built for UGC creators. Start by checking whether a brand deal
            message is legitimate.
          </p>
        </div>

        <Link href="/scamdetector">
          <Button size="lg" className="w-full sm:w-auto px-8">
            Check a deal →
          </Button>
        </Link>

        <p className="text-xs text-gray-400">
          Free and ungated — no account required.
        </p>
      </div>
    </div>
  );
}
