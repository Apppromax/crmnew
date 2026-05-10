"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseNoteWithAI, createCustomerFromAI } from "@/actions/ai";

export default function AddCustomerPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleParse = async () => {
    if (!note.trim()) {
      setError("Vui lòng nhập thông tin hoặc ghi chú về khách hàng.");
      return;
    }
    
    setError(null);
    setIsParsing(true);
    
    try {
      const res = await parseNoteWithAI(note);
      if (res.error) {
        setError(res.error);
      } else if (res.success && res.data) {
        setParsedData(res.data);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi gọi AI.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    
    setIsSaving(true);
    try {
      const res = await createCustomerFromAI({ parsedData, rawNote: note });
      if (res.error) {
        setError(res.error);
      } else {
        // Success
        router.push("/");
      }
    } catch (err) {
      setError("Lỗi lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-24">
      <header className="flex items-center justify-between py-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thêm bằng AI
        </h1>
        <button 
          onClick={() => router.push("/")}
          className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-full"
        >
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Input Text Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Nhập ghi chú hoặc paste tin nhắn (Zalo/FB):
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isParsing || isSaving}
            className="w-full h-32 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
            placeholder="Ví dụ: Anh Khang 0901234567 muốn mua căn 2PN Q7 tài chính 3 tỷ, cần vay bank 50%, tháng sau mua..."
          />
          
          {!parsedData && (
            <button
              onClick={handleParse}
              disabled={isParsing || !note.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {isParsing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang phân tích...
                </>
              ) : (
                <>
                  ✨ Phân tích bằng AI
                </>
              )}
            </button>
          )}
        </div>

        {/* Parsed Result Preview */}
        {parsedData && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-indigo-200 dark:border-indigo-900/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Kết quả phân tích</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-md">
                  Độ nét: {parsedData.clarityScore}/100
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                  parsedData.heatLevel === 'Hot' ? 'bg-red-100 text-red-700' :
                  parsedData.heatLevel === 'Warm' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {parsedData.heatLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="col-span-2">
                <span className="block text-slate-500 text-xs mb-1">Họ tên & SĐT</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {parsedData.name || "—"} • {parsedData.phone || "—"}
                </p>
              </div>
              <div>
                <span className="block text-slate-500 text-xs mb-1">Nhu cầu</span>
                <p className="font-medium text-slate-900 dark:text-white">{parsedData.demand || "—"}</p>
              </div>
              <div>
                <span className="block text-slate-500 text-xs mb-1">Tài chính</span>
                <p className="font-medium text-slate-900 dark:text-white">{parsedData.budget || "—"}</p>
              </div>
              <div>
                <span className="block text-slate-500 text-xs mb-1">Khu vực</span>
                <p className="font-medium text-slate-900 dark:text-white">{parsedData.area || "—"}</p>
              </div>
              <div>
                <span className="block text-slate-500 text-xs mb-1">Thời gian mua</span>
                <p className="font-medium text-slate-900 dark:text-white">{parsedData.timeline || "—"}</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl transition-all"
            >
              {isSaving ? "Đang lưu..." : "Lưu Khách Hàng"}
            </button>
            
            <button
              onClick={() => setParsedData(null)}
              disabled={isSaving}
              className="w-full mt-2 py-3 bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium rounded-xl transition-all"
            >
              Sửa lại ghi chú
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
