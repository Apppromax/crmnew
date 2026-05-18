export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4F8FB] dark:bg-slate-950 pb-24 md:pl-64">
      <div className="sticky top-0 z-30 bg-[#F4F8FB]/80 dark:bg-slate-950/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-4 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
      
      <div className="px-4 mt-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="px-3 py-3 flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                </div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="w-16 flex flex-col items-end gap-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
