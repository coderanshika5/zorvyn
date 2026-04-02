export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export const getMonthYear = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

export const computeSummary = (transactions) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses };
};

export const computeCategoryBreakdown = (transactions) => {
  const map = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const computeMonthlyTrend = (transactions) => {
  const map = {};
  transactions.forEach((t) => {
    const key = getMonthYear(t.date);
    if (!map[key]) map[key] = { income: 0, expenses: 0, label: getMonthLabel(t.date) };
    if (t.type === "income") map[key].income += t.amount;
    else map[key].expenses += t.amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({ ...val, key, balance: val.income - val.expenses }));
};

export const filterTransactions = (transactions, filters) => {
  let result = [...transactions];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }
  if (filters.type !== "all") result = result.filter((t) => t.type === filters.type);
  if (filters.category !== "all") result = result.filter((t) => t.category === filters.category);
  if (filters.dateFrom) result = result.filter((t) => t.date >= filters.dateFrom);
  if (filters.dateTo) result = result.filter((t) => t.date <= filters.dateTo);
  result.sort((a, b) => {
    const dir = filters.sortDir === "asc" ? 1 : -1;
    if (filters.sortBy === "date") return dir * a.date.localeCompare(b.date);
    if (filters.sortBy === "amount") return dir * (a.amount - b.amount);
    if (filters.sortBy === "description") return dir * a.description.localeCompare(b.description);
    return 0;
  });
  return result;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const exportToCSV = (transactions) => {
  const headers = ["Date", "Description", "Category", "Type", "Amount (INR)"];
  const rows = transactions.map((t) => [t.date, t.description, t.category, t.type, t.amount]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
};