import React, { useEffect, useState } from "react";
import { SurgicalAsset } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RelatedAssets({ procedure }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!procedure) return;
      const title = (procedure.title || "").toLowerCase();
      const procKey = title.includes("ovariohysterectomy") || title.includes("اخصای مادگی")
        ? "ovariohysterectomy"
        : title.includes("castration") || title.includes("اخصای نر") || title.includes("orchidectomy")
          ? "castration"
          : procedure.title;
      const list = await SurgicalAsset.filter({ procedure_type: procKey });
      setAssets(list || []);
    };
    load();
  }, [procedure?.id]);

  if (!assets || assets.length === 0) return null;

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-indigo-700">مدیا مرتبط با این عمل</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            {a.thumbnail_url ? (
              <img src={a.thumbnail_url} alt={a.title} className="w-16 h-16 rounded-md object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gray-100" />
            )}
            <div className="flex-1">
              <div className="font-medium text-gray-800">{a.title}</div>
              <div className="text-xs text-gray-600">{a.asset_type} • {a.body_system} • {(a.species || []).join(", ")}</div>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline">مشاهده</a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}