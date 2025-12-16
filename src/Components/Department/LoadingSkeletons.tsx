export const PieChartLoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-between h-[235px] w-full">
    <div className="flex items-center justify-center h-full mt-3">
      <div className="w-[150px] h-[150px] rounded-full bg-input-bg animate-pulse"></div>
    </div>
    <div className="flex items-center gap-2 w-full mt-2 mb-1">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-4 h-2 rounded-sm bg-input-bg animate-pulse"></div>
          <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SystemBalanceLoadingSkeleton = () => (
  <div className="h-[70px] bg-card rounded-lg px-4 py-3 shadow-md flex flex-col gap-2 items-start justify-center">
    <div className="flex items-center gap-2">
      <div className="w-[150px] h-3 rounded-sm bg-input-bg animate-pulse"></div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-[50px] h-3 rounded-sm bg-input-bg animate-pulse"></div>
      <div className="h-3 w-20 bg-input-bg rounded animate-pulse"></div>
    </div>
  </div>
);
