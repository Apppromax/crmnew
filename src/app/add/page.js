"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, getAllTags } from "@/actions/customers";
import { X, Calendar, PhoneOff, UserPlus, FileText, ChevronRight, Activity } from "lucide-react";

const LOCAL_JOURNEY_OPTIONS = [
  "1. Phá băng và tư vấn ban đầu",
  "2. Tư vấn chuyên sâu lần 1",
  "3. Xây dựng lòng tin",
  "4. Hẹn gặp khách",
  "5. Dồn Chốt",
  "6. Chốt Cọc",
  "7. Xây dựng mối quan hệ"
];

function parseLocalToISO(dateTimeLocalString) {
  if (!dateTimeLocalString) return null;
  const [datePart, timePart] = dateTimeLocalString.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  const d = new Date(year, month - 1, day, hour, minute);
  return d.toISOString();
}

function getQuickDates() {
  const now = new Date();
  const hour = now.getHours();
  const chips = [];

  if (hour < 14) {
    const afternoon = new Date(now);
    afternoon.setHours(15, 0, 0, 0);
    chips.push({ label: 'Chiều nay', date: afternoon });
  } else {
    const tonight = new Date(now);
    tonight.setHours(20, 0, 0, 0);
    chips.push({ label: 'Tối nay', date: tonight });
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  chips.push({ label: 'Sáng mai', date: tomorrow });

  const tomorrowAfternoon = new Date(now);
  tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1);
  tomorrowAfternoon.setHours(15, 0, 0, 0);
  chips.push({ label: 'Chiều mai', date: tomorrowAfternoon });

  const in3days = new Date(now);
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(9, 0, 0, 0);
  chips.push({ label: '3 ngày nữa', date: in3days });

  return chips;
}

const SOURCE_OPTIONS = ["Tự khai thác", "Facebook", "Zalo", "Tiktok", "Khách giới thiệu", "Hotline / Website", "Khác"];
const BUDGET_OPTIONS = ["Dưới 2 tỷ", "2 - 3 tỷ", "3 - 5 tỷ", "5 - 10 tỷ", "10 - 20 tỷ", "Trên 20 tỷ", "Chưa xác định"];
const PROPERTY_TYPE_OPTIONS = ["Căn hộ chung cư", "Nhà phố/Liền kề", "Biệt thự", "Đất nền", "Shophouse/TMDV", "Văn phòng", "Khác"];
const PURPOSE_OPTIONS = [
  { value: "Để ở", label: "Mua để ở" },
  { value: "Đầu tư bán lại", label: "Đầu tư bán lại" },
  { value: "Đầu tư cho thuê", label: "Đầu tư cho thuê" },
  { value: "Giữ tiền", label: "Giữ tiền" },
  { value: "Khác", label: "Khác" }
];
const AREA_OPTIONS = ["Trung tâm thành phố", "Vùng ven/Ngoại thành", "Tỉnh lân cận", "BĐS Nghỉ dưỡng", "Khác"];
const TIMELINE_OPTIONS = [
  { value: "Mua ngay (trong tháng)", label: "Mua ngay (trong tháng)" },
  { value: "1 - 3 tháng tới", label: "1 - 3 tháng tới" },
  { value: "3 - 6 tháng tới", label: "3 - 6 tháng tới" },
  { value: "Tham khảo", label: "Tham khảo (Chưa rõ)" }
];
const HEAT_LEVEL_OPTIONS = [
  { value: "Rất Nét", label: "🌟 Rất Nét", colorClass: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20", selectedClass: "bg-red-500 text-white border-red-600" },
  { value: "Tiềm Năng", label: "🔥 Tiềm Năng", colorClass: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20", selectedClass: "bg-orange-500 text-white border-orange-600" },
  { value: "Quan Tâm", label: "👀 Quan Tâm", colorClass: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", selectedClass: "bg-amber-500 text-white border-amber-600" },
  { value: "Tham Khảo", label: "📚 Tham Khảo", colorClass: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20", selectedClass: "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-500" },
  { value: "Chưa Rõ", label: "❄️ Chưa Rõ", colorClass: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700", selectedClass: "bg-slate-500 text-white border-slate-600 dark:bg-slate-600 dark:border-slate-500" },
];

const ScrollChipSelect = ({ label, value, onChange, options }) => {
  return (
    <div className="col-span-2">
      <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">{label}</label>
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-1 px-1">
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          const colorClass = opt.colorClass || 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm';
          const selectedClass = opt.selectedClass || 'bg-primary-500 text-white border-primary-600 shadow-md shadow-primary-500/25 dark:bg-primary-600 dark:border-primary-500';
          
          const isSelected = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(isSelected ? "" : val)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isSelected ? selectedClass : colorClass
              }`}
            >
              {lbl}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AddCustomerPage() {
  const router = useRouter();

  // Basic Info
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualSource, setManualSource] = useState("");
  const [manualTags, setManualTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [teamTags, setTeamTags] = useState([]);

  useEffect(() => {
    getAllTags().then(res => {
      if (Array.isArray(res)) {
        setAvailableTags(res);
      } else {
        setAvailableTags(res.personalTags || []);
        setTeamTags(res.teamTags || []);
      }
    }).catch(console.error);
  }, []);

  // Detailed Info (shown after "Đã Tư Vấn")
  const [showDetails, setShowDetails] = useState(false);
  const [manualBudget, setManualBudget] = useState("");
  const [manualPropertyType, setManualPropertyType] = useState("");
  const [manualPurpose, setManualPurpose] = useState("");
  const [manualArea, setManualArea] = useState("");
  const [manualTimeline, setManualTimeline] = useState("");
  const [manualHeatLevel, setManualHeatLevel] = useState("Chưa Rõ");
  const [manualNote, setManualNote] = useState("");

  // Flow State
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // 'Chưa liên lạc được' | 'Mới' | null
  const [followUpDate, setFollowUpDate] = useState("");
  
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [finalJourney, setFinalJourney] = useState(LOCAL_JOURNEY_OPTIONS[0]);
  const [finalDateString, setFinalDateString] = useState("");

  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'redirecting'
  const isSaving = saveStatus !== "idle";
  const [error, setError] = useState(null);
  
  // Free Tier Limit Popup
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const handleInitialSaveClick = () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      setError("Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }
    setError(null);
    setShowStatusPopup(true);
  };

  const handleStatusSelect = (status) => {
    if (status === "Đã Tư Vấn") {
      setShowStatusPopup(false);
      setShowDetails(true);
    } else {
      setPendingStatus(status);
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const d = new Date(Date.now() - tzOffset + 2 * 3600 * 1000);
      setFollowUpDate(d.toISOString().slice(0, 16));
    }
  };

  const handleSaveWithFollowUp = async () => {
    setSaveStatus("saving");
    setShowStatusPopup(false);
    setError(null);
    
    const parts = [];
    if (manualSource) parts.push(`Nguồn: ${manualSource}`);
    const fullNote = parts.join("\n");

    try {
      await createCustomer({ 
        name: manualName, 
        phone: manualPhone, 
        note: fullNote,
        tags: manualTags,
        status: pendingStatus,
        nextFollowUp: parseLocalToISO(followUpDate)
      });
      sessionStorage.setItem('sp_save_toast', '1');
      // Redirect immediately - home page is force-dynamic so it will fetch fresh data
      router.push("/");
    } catch (err) {
      setSaveStatus("idle");
      if (err.message?.includes("FREE_LIMIT_REACHED")) {
        setShowLimitPopup(true);
      } else {
        setError(err.message || "Có lỗi xảy ra khi lưu khách hàng.");
      }
    }
  };

  const handleFinalSaveClick = () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      setError("Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }
    setShowFinalPopup(true);
  };

  const handleFinalSave = async () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      setError("Vui lòng nhập Họ tên và Số điện thoại.");
      return;
    }
    
    setSaveStatus("saving");
    setShowFinalPopup(false);
    setError(null);

    const parts = [];
    if (manualSource) parts.push(`Nguồn: ${manualSource}`);
    if (manualPurpose) parts.push(`Mục đích: ${manualPurpose}`);
    if (manualNote) parts.push(`Ghi chú: ${manualNote}`);
    const fullNote = parts.join("\n");

    try {
      await createCustomer({ 
        name: manualName, 
        phone: manualPhone, 
        note: fullNote,
        budget: manualBudget,
        area: manualArea,
        timeline: manualTimeline,
        heatLevel: manualHeatLevel,
        demand: manualPropertyType,
        tags: manualTags,
        status: "Đang chăm",
        journeyStage: finalJourney,
        nextFollowUp: parseLocalToISO(finalDateString)
      });
      sessionStorage.setItem('sp_save_toast', '1');
      // Redirect immediately - home page is force-dynamic so it will fetch fresh data
      router.push("/");
    } catch (err) {
      setSaveStatus("idle");
      if (err.message?.includes("FREE_LIMIT_REACHED")) {
        setShowLimitPopup(true);
      } else {
        setError(err.message || "Có lỗi xảy ra khi lưu khách hàng.");
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F4F8FB] dark:bg-slate-950 font-sans pb-24">


      {/* Free Limit Reached Popup */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">Đã Đạt Giới Hạn</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              Kho lưu trữ bản Miễn Phí của bạn đã đầy (10 khách hàng). Hãy nâng cấp PRO chỉ với giá 1 ly cafe (99K/tháng) để thêm khách không giới hạn!
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/profile')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                Nâng Cấp PRO Ngay
              </button>
              <button 
                onClick={() => setShowLimitPopup(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl transition-all"
              >
                Để Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Popup Overlay */}
      {showStatusPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            {!pendingStatus ? (
              <>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Trạng thái khách hàng</h3>
                <p className="text-sm text-slate-500 text-center mb-6">Chọn trạng thái để tiếp tục</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => handleStatusSelect("Đã Tư Vấn")}
                    className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 text-primary-700 dark:text-primary-400 font-bold rounded-2xl transition-colors border border-primary-100 dark:border-primary-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      Đã Tư Vấn
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </button>

                  <button 
                    onClick={() => handleStatusSelect("Chưa liên lạc được")}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold rounded-2xl transition-colors border border-orange-100 dark:border-orange-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <PhoneOff className="w-5 h-5" />
                      Chưa liên lạc được
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </button>

                  <button 
                    onClick={() => handleStatusSelect("Mới")}
                    className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl transition-colors border border-emerald-100 dark:border-emerald-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-5 h-5" />
                      Mới
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </button>
                </div>

                <button 
                  onClick={() => setShowStatusPopup(false)}
                  className="mt-6 w-full py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold transition-colors"
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                  {pendingStatus === "Chưa liên lạc được" ? "Hẹn gọi lại" : "Hẹn tư vấn"}
                </h3>
                <p className="text-sm text-slate-500 text-center mb-6">Chọn thời gian để nhắc nhở</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thời gian</label>
                  <div className="relative">
                    <input 
                      type="datetime-local" 
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${followUpDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                    />
                    {!followUpDate && (
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 font-medium">
                        Chọn ngày giờ...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setPendingStatus(null)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={handleSaveWithFollowUp}
                    disabled={isSaving || !followUpDate}
                    className="flex-1 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-primary-500/25"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Final Save Popup Overlay */}
      {showFinalPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Bước cuối</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Xác nhận hành trình và lịch chăm tiếp theo</p>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiến độ hành trình</label>
              <select
                value={finalJourney}
                onChange={(e) => setFinalJourney(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white appearance-none"
              >
                {LOCAL_JOURNEY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hẹn giờ chăm tiếp theo <span className="text-red-500">*</span></label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-1 -mx-1 px-1">
                {getQuickDates().map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      const tzOffset = new Date().getTimezoneOffset() * 60000;
                      setFinalDateString(new Date(chip.date.getTime() - tzOffset).toISOString().slice(0, 16));
                    }}
                    className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="datetime-local" 
                  value={finalDateString}
                  onChange={(e) => setFinalDateString(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${finalDateString ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                />
                {!finalDateString && (
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 font-medium">
                    Chọn ngày giờ...
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowFinalPopup(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                Quay lại
              </button>
              <button 
                onClick={handleFinalSave}
                disabled={isSaving || !finalDateString}
                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/25"
              >
                {isSaving ? "Đang lưu..." : "Hoàn tất"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City Skyline Background */}
      <div 
        className="dashboard-bg-illustration absolute top-0 right-0 w-full max-w-2xl h-[500px] z-0 pointer-events-none opacity-90 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(100% 100% at 100% 0%, black 20%, transparent 100%)'
        }}
      />
      
      {/* Soft Wave Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[400px] rounded-full bg-blue-200/50 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[60%] h-[500px] rounded-full bg-blue-300/30 dark:bg-blue-800/20 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between py-2 mb-6">
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

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-xl text-sm animate-in fade-in">
            {error}
          </div>
        )}

        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="glass rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                />
              </div>

              <ScrollChipSelect label="Nguồn khách" value={manualSource} onChange={setManualSource} options={SOURCE_OPTIONS} />
              
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Dự án / Khu vực (Tags)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {manualTags.map(tag => {
                    const isTeamTag = teamTags.includes(tag);
                    return (
                      <span key={tag} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border ${isTeamTag ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-500/20'}`}>
                        {tag}
                        <button type="button" onClick={() => setManualTags(manualTags.filter(t => t !== tag))} className={`transition-colors ml-0.5 ${isTeamTag ? 'hover:text-white/70' : 'hover:text-red-500'}`}><X className="w-3 h-3" /></button>
                      </span>
                    )
                  })}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        e.preventDefault();
                        if (!manualTags.includes(newTag.trim())) {
                          setManualTags([...manualTags, newTag.trim()]);
                        }
                        setNewTag("");
                      }
                    }}
                    placeholder="Nhập dự án/khu vực (VD: Vinhomes...)"
                    className="w-full pl-4 pr-20 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTag.trim() && !manualTags.includes(newTag.trim())) {
                        setManualTags([...manualTags, newTag.trim()]);
                      }
                      setNewTag("");
                    }}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs transition-colors flex items-center justify-center"
                  >
                    Thêm
                  </button>
                </div>
                {(availableTags.filter(t => !manualTags.includes(t) && !teamTags.includes(t)).length > 0 || teamTags.filter(t => !manualTags.includes(t)).length > 0) && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Gợi ý từ dữ liệu cũ & Team:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teamTags.filter(t => !manualTags.includes(t)).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setManualTags([...manualTags, tag])}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                        >
                          + {tag}
                        </button>
                      ))}
                      {availableTags.filter(t => !manualTags.includes(t) && !teamTags.includes(t)).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setManualTags([...manualTags, tag])}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reveal details if "Đã Tư Vấn" is selected */}
              {showDetails && (
                <div className="col-span-2 grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-500">
                  <div className="col-span-2 mb-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Cập nhật thông tin chi tiết</h3>
                  </div>
                  
                  <ScrollChipSelect label="Phân khúc tài chính" value={manualBudget} onChange={setManualBudget} options={BUDGET_OPTIONS} />
                  <ScrollChipSelect label="Loại hình quan tâm" value={manualPropertyType} onChange={setManualPropertyType} options={PROPERTY_TYPE_OPTIONS} />
                  <ScrollChipSelect label="Mục đích mua" value={manualPurpose} onChange={setManualPurpose} options={PURPOSE_OPTIONS} />
                  <ScrollChipSelect label="Khu vực quan tâm" value={manualArea} onChange={setManualArea} options={AREA_OPTIONS} />
                  <ScrollChipSelect label="Thời gian dự kiến mua" value={manualTimeline} onChange={setManualTimeline} options={TIMELINE_OPTIONS} />
                  <ScrollChipSelect label="Mức độ nét" value={manualHeatLevel} onChange={setManualHeatLevel} options={HEAT_LEVEL_OPTIONS} />

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                      Ghi chú chi tiết
                    </label>
                    <textarea
                      value={manualNote}
                      onChange={(e) => setManualNote(e.target.value)}
                      placeholder="Nhập ghi chú chi tiết về nhu cầu khách hàng..."
                      className="w-full h-24 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {!showDetails ? (
              <button
                onClick={handleInitialSaveClick}
                disabled={isSaving || !manualName.trim() || !manualPhone.trim()}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98]"
              >
                Lưu khách hàng
              </button>
            ) : (
              <button
                onClick={handleFinalSaveClick}
                disabled={isSaving || !manualName.trim() || !manualPhone.trim()}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
              >
                {isSaving ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Loading Overlay - only shows during save, not during redirect */}
      {saveStatus === "saving" && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scaleIn {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
              animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}} />
          <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/30 flex flex-col items-center max-w-xs w-full text-center animate-scale-in">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <UserPlus className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Đang lưu khách hàng</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      )}
    </div>
  );
}
