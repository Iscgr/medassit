import React from "react";
import { VeterinaryGlossary } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlossaryViewer() {
  const [terms, setTerms] = React.useState([]);
  const [filtered, setFiltered] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await VeterinaryGlossary.list("-usage_count", 200);
      setTerms(list);
      setFiltered(list);
      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(terms);
      return;
    }
    const f = terms.filter(t => {
      const en = (t.term_english || "").toLowerCase();
      const fa = (t.term_persian || "").toLowerCase();
      const defFa = (t.definition_fa || "").toLowerCase();
      const defEn = (t.definition_en || "").toLowerCase();
      const synEn = (t.synonyms_en || []).join(" ").toLowerCase();
      const synFa = (t.synonyms_fa || []).join(" ").toLowerCase();
      return en.includes(q) || fa.includes(q) || defFa.includes(q) || defEn.includes(q) || synEn.includes(q) || synFa.includes(q);
    });
    setFiltered(f);
  }, [query, terms]);

  const selectTerm = async (term) => {
    setSelected(term);
    try {
      await VeterinaryGlossary.update(term.id, { usage_count: (term.usage_count || 0) + 1 });
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-rose-600" />
        <h1 className="text-2xl font-bold text-gray-800">فرهنگ اصطلاحات دامپزشکی</h1>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
        <Input
          placeholder="جستجوی اصطلاح انگلیسی/فارسی یا تعریف..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-8 rounded-2xl"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          در حال بارگیری اصطلاحات...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 lg:col-span-1">
            <CardContent className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-8">اصطلاحی یافت نشد.</div>
              )}
              {filtered.map(term => (
                <button
                  key={term.id}
                  onClick={() => selectTerm(term)}
                  className={`w-full text-right p-3 rounded-xl transition ${
                    selected?.id === term.id ? "bg-rose-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-gray-800">{term.term_persian}</div>
                  <div className="text-xs text-gray-500">{term.term_english}</div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">{term.category}</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-0 lg:col-span-2 min-h-[300px]">
            <CardContent className="p-6">
              {!selected ? (
                <div className="text-center text-gray-500 py-12">
                  یک اصطلاح را از لیست انتخاب کنید.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">{selected.term_persian}</h2>
                    <span className="text-sm text-gray-500">({selected.term_english})</span>
                    {selected.pronunciation_fa && (
                      <Badge variant="outline" className="text-xs">[{selected.pronunciation_fa}]</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">تعریف فارسی</div>
                    <p className="leading-relaxed text-gray-800">{selected.definition_fa || selected.definition || "—"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">تعریف انگلیسی</div>
                    <p className="leading-relaxed text-gray-800">{selected.definition_en || "—"}</p>
                  </div>

                  {(selected.synonyms_fa?.length > 0 || selected.synonyms_en?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {selected.synonyms_fa?.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">مترادف‌های فارسی</div>
                          <div className="flex flex-wrap gap-1">
                            {selected.synonyms_fa.map((s, i) => <Badge key={i} className="bg-rose-100 text-rose-700">{s}</Badge>)}
                          </div>
                        </div>
                      )}
                      {selected.synonyms_en?.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">مترادف‌های انگلیسی</div>
                          <div className="flex flex-wrap gap-1">
                            {selected.synonyms_en.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.examples?.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">مثال‌ها</div>
                      <ul className="list-disc pr-5 text-gray-800 space-y-1">
                        {selected.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                      </ul>
                    </div>
                  )}

                  {selected.related_terms?.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">اصطلاحات مرتبط</div>
                      <div className="flex flex-wrap gap-1">
                        {selected.related_terms.map((rt, i) => <Badge key={i} variant="outline" onClick={() => setQuery(rt)} className="cursor-pointer">{rt}</Badge>)}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {selected.source && <span>منبع: {selected.source}</span>}
                    <span>• استفاده: {selected.usage_count || 0}</span>
                    {selected.is_active === false && <Badge variant="destructive">غیرفعال</Badge>}
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(null)}>بازگشت به لیست</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}