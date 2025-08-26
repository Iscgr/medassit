export function formatCitationAPA(source) {
  if (!source) return "منبع نامشخص";
  const author = source.author || "";
  const year = source.year ? ` (${source.year}).` : ".";
  const title = source.title ? ` ${source.title}.` : "";
  const url = source.url ? ` بازیابی از ${source.url}` : "";
  return `${author}${year}${title}${url}`.trim();
}

export function numberCitations(sources) {
  return (sources || []).map((s, idx) => `[${idx + 1}] ${formatCitationAPA(s)}`);
}