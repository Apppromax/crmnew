"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseNoteWithAI, createCustomerFromAI } from "@/actions/ai";
import { createCustomer } from "@/actions/customers";
import { X, Sparkles, Pen, Loader2 } from "lucide-react";

export default function AddCustomerPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState("ai"); // 'ai' | 'manual'

  // AI State
  const [note, setNote] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // Manual State
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualNote, setManualNote] = useState("");

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

  const handleSaveAI = async () => {
    if (!parsedData) return;
    
    setIsSaving(true);
    try {
      const res = await createCustomerFromAI({ parsedData, rawNote: note });
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Lỗi lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      setError("Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      await createCustomer({ name: manualName, phone: manualPhone, note: manualNote });
      router.push("/");
    } catch (err) {
      setError("Lỗi lưu khách hàng thủ công.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F4F8FB] dark:bg-slate-950 font-sans pb-24">
      {/* City Skyline Background */}
      <div 
        className="absolute top-0 right-0 w-full max-w-lg h-[400px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: "url('/bg-city.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)'
        }}
      />
      
      {/* Soft Wave Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[400px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[60%] h-[500px] rounded-full bg-blue-300/30 dark:bg-blue-800/20 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 px-5 pt-safe pt-6">
        <header className="flex items-center justify-between py-2 mb-4">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">
            Thêm khách hàng
          </h1>
          <button 
            onClick={() => router.push("/")}
            className="w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full shadow-sm active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </header>

      {/* Mode Switcher */}
      <div className="flex glass p-1.5 rounded-2xl mb-6">
        <button
          onClick={() => setActiveMode("ai")}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeMode === "ai" 
              ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Dùng AI
        </button>
        <button
          onClick={() => setActiveMode("manual")}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeMode === "manual" 
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Pen className="w-4 h-4" /> Thủ công
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-xl text-sm animate-in fade-in">
          {error}
        </div>
      )}

      {activeMode === "ai" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="glass rounded-3xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-slate-500 mb-3">
              Nhập ghi chú hoặc paste tin nhắn (Zalo/FB):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isParsing || isSaving}
              className="w-full h-36 bg-white/50 dark:bg-slate-900/50 backdrop-blur text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded-2xl p-4 resize-none border border-slate-200/60 dark:border-slate-800/60"
              placeholder="Ví dụ: Anh Khang 0901234567 muốn mua căn 2PN Q7 tài chính 3 tỷ, cần vay bank 50%..."
            />
            
            {!parsedData && (
              <button
                onClick={handleParse}
                disabled={isParsing || !note.trim()}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98]"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Phân tích bằng AI
                  </>
                )}
              </button>
            )}
          </div>

          {parsedData && (
            <div className="glass rounded-3xl p-5 shadow-sm border border-primary-200/50 dark:border-primary-900/30 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Kết quả phân tích</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-primary-100/80 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-lg">
                    Độ nét: {parsedData.clarityScore}/100
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    parsedData.heatLevel === 'Hot' ? 'bg-red-100 text-red-700' :
                    parsedData.heatLevel === 'Warm' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {parsedData.heatLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="col-span-2">
                  <span className="block text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Họ tên & SĐT</span>
                  <p className="font-semibold text-base text-slate-900 dark:text-white">
                    {parsedData.name || "—"} • {parsedData.phone || "—"}
                  </p>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Nhu cầu</span>
                  <p className="font-medium text-slate-900 dark:text-white">{parsedData.demand || "—"}</p>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Tài chính</span>
                  <p className="font-medium text-slate-900 dark:text-white">{parsedData.budget || "—"}</p>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Khu vực</span>
                  <p className="font-medium text-slate-900 dark:text-white">{parsedData.area || "—"}</p>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Thời gian mua</span>
                  <p className="font-medium text-slate-900 dark:text-white">{parsedData.timeline || "—"}</p>
                </div>
              </div>

              <button
                onClick={handleSaveAI}
                disabled={isSaving}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-md"
              >
                {isSaving ? "Đang lưu..." : "Lưu Khách Hàng"}
              </button>
              
              <button
                onClick={() => setParsedData(null)}
                disabled={isSaving}
                className="w-full mt-3 py-3.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white font-bold rounded-2xl transition-all border border-slate-200/50 dark:border-slate-700/50"
              >
                Sửa lại ghi chú
              </button>
            </div>
          )}
        </div>
      )}

      {activeMode === "manual" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="glass rounded-3xl p-5 shadow-sm space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú ban đầu
              </label>
              <textarea
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Nhu cầu, tài chính, khu vực quan tâm..."
                className="w-full h-28 px-4 py-3.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200/60 dark:border-slate-800/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleSaveManual}
              disabled={isSaving || !manualName.trim() || !manualPhone.trim()}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98]"
            >
              {isSaving ? "Đang lưu..." : "Lưu khách hàng"}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
