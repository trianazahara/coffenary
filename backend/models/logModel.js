addLog: (aktivitas, admin) => {
  console.log("🔥 Masuk ke LogModel.addLog dengan data:", aktivitas, admin); // DEBUG

  const logs = readLogs();
  const newLog = {
    id: logs.length + 1,
    aktivitas,
    admin,
    waktu: new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  };
  logs.unshift(newLog);
  writeLogs(logs);

  console.log("✅ Log baru tersimpan:", newLog);
}
