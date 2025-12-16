const DeviceGridLoadingSkeleton = () => {
  return (
    <>
      <div className="bg-primary px-4 pt-1 pb-3 rounded-md">
        <div className="bg-primary flex items-start md:items-center justify-between flex-col md:flex-row">
          <div className="flex items-center gap-3">
            <div>
              <div className="h-6 w-48 bg-input-bg rounded animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
              <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
              <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
              <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2 bg-card shadow-sm border border-border-primary"
          >
            <div className="flex items-center justify-between mb-3 gap-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-3 h-3 rounded-full bg-input-bg animate-pulse shrink-0"></div>
                <div className="h-4 w-32 bg-input-bg rounded animate-pulse"></div>
              </div>
              <div className="h-5 w-16 bg-input-bg rounded-lg animate-pulse"></div>
            </div>

            <div className="space-y-3 mb-2">
              <div className="bg-overlay/20 rounded-lg py-2 px-3">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <div className="w-10 h-10 bg-input-bg rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between mb-2 gap-1">
                  <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                  <div className="h-4 w-28 bg-input-bg rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-20 bg-input-bg rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-12 bg-input-bg rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-input-bg rounded animate-pulse"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-input-bg rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
                  <div className="h-3 w-20 bg-input-bg rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-24 bg-input-bg rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DeviceGridLoadingSkeleton;
