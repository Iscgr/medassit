import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bone } from "lucide-react";

export default function AnatomyContext({ procedure }) {
  const ctx = procedure?.anatomical_context || {};
  const imgs = ctx.labeled_images || [];
  const cross = ctx.cross_sections || [];
  const species = ctx.species_variations || [];
  const path = ctx.pathology_variations || [];

  return (
    <Card className="bg-white/60 border-0">
      <CardHeader>
        <CardTitle className="text-emerald-700 flex items-center gap-2">
          <Bone className="w-5 h-5" /> زمینه آناتومیک
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {imgs.length ? (
          <div className="grid grid-cols-2 gap-2">
            {imgs.map((url, i) => <img key={i} src={url} alt={`anatomy-${i}`} className="rounded-lg object-cover w-full h-28" />)}
          </div>
        ) : <div className="text-sm text-gray-600">تصاویر برچسب‌دار ثبت نشده‌اند.</div>}
        {cross.length ? (
          <div>
            <div className="font-semibold text-sm mb-1">برش‌های مقطعی:</div>
            <div className="grid grid-cols-2 gap-2">
              {cross.map((url, i) => <img key={i} src={url} alt={`cross-${i}`} className="rounded-lg object-cover w-full h-24" />)}
            </div>
          </div>
        ) : null}
        {species.length ? <div className="text-sm text-gray-700">تنوع گونه‌ای: {species.join("، ")}</div> : null}
        {path.length ? <div className="text-sm text-gray-700">تنوع پاتولوژیک: {path.join("، ")}</div> : null}
      </CardContent>
    </Card>
  );
}