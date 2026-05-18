export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4F8FB] dark:bg-slate-950 pb-24 md:pl-64">
      <div className="sticky top-0 z-30 bg-[#F4F8FB]/80 dark:bg-slate-950/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="px-4 mt-2">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-none w-16 h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
