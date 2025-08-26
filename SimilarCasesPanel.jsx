import React from "react";
import { Case } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SimilarCasesPanel({ currentAnimal, currentCase }) {
  const [similarCases, setSimilarCases] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const findSimilarCases = React.useCallback(async () => {
    if (!currentAnimal) return;
    
    setLoading(true);
    try {
      // جستجوی کیس‌های مشابه بر اساس گونه
      const allCases = await Case.filter({ species: currentAnimal.species });
      
      // فیلتر کردن کیس‌های مشابه (حذف کیس فعلی)
      const filtered = (allCases || [])
        .filter(c => c.id !== currentCase?.id)
        .filter(c => c.status === 'completed' || c.status === 'analyzed')
        .slice(0, 5); // نمایش حداکثر ۵ کیس مشابه

      setSimilarCases(filtered);
    } catch (error) {
      console.error('خطا در جستجوی کیس‌های مشابه:', error);
      setSimilarCases([]);
    } finally {
      setLoading(false);
    }
  }, [currentAnimal?.species, currentCase?.id]);

  React.useEffect(() => {
    findSimilarCases();
  }, [findSimilarCases]);

  if (!currentAnimal) return null;

  return (
    <Card className="bg-white/70 border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          کیس‌های مشابه ({currentAnimal.species})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-600">در حال جستجو...</div>
        ) : similarCases.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            کیس مشابهی برای {currentAnimal.species} یافت نشد
          </div>
        ) : (
          <div className="space-y-3">
            {similarCases.map((case_item) => (
              <div key={case_item.id} 
                   className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{case_item.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {case_item.chief_complaint?.substring(0, 60)}...
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${
                        case_item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        case_item.status === 'analyzed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {case_item.status === 'completed' ? 'تکمیل شده' : 
                         case_item.status === 'analyzed' ? 'تحلیل شده' : 
                         case_item.status}
                      </Badge>
                      {case_item.created_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(case_item.created_date).toLocaleDateString('fa-IR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* لینک به صفحه AnimalTreatment برای مشاهده همه کیس‌ها */}
            <div className="pt-2 border-t border-blue-100">
              <Link to={createPageUrl("AnimalTreatment")}>
                <Button variant="outline" size="sm" className="w-full rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
                  مشاهده همه کیس‌های {currentAnimal.species}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}