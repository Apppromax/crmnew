import { Users, Loader2 } from "lucide-react";

export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        <p className="font-bold animate-pulse">Đang tải dữ liệu Đội Nhóm...</p>
      </div>
    </div>
  );
}
