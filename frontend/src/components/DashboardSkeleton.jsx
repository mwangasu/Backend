function DashboardSkeleton() {
  return (
    <main className="page-container">

      <div className="skeleton" style={{ height: 148, borderRadius: 24, marginBottom: 32 }} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 12, marginBottom: 18 }} />
            <div className="skeleton" style={{ width: "60%", height: 12, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "40%", height: 30 }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ width: "50%", height: 16, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "100%", height: 260, borderRadius: 12 }} />
          </div>
        ))}
      </div>

      <div className="card mt-8">
        <div className="skeleton" style={{ width: "35%", height: 16, marginBottom: 20 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: 44, marginBottom: 10, borderRadius: 8 }} />
        ))}
      </div>

    </main>
  );
}

export default DashboardSkeleton;
