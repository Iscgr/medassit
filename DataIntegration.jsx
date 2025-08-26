import React, { useState } from "react";
import { UploadFile } from "@/api/integrations";
import { KnowledgeSource, KnowledgeChunk, SurgicalAsset } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Link as LinkIcon, Database, Image as ImageIcon, Plus } from "lucide-react";

export default function DataIntegration() {
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlTrust, setUrlTrust] = useState(80);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  const [dataset, setDataset] = useState({
    name: "",
    description: "",
    license: "",
    source_org: "",
    url: "",
    tags: "",
    species: "all",
    body_systems: "soft_tissue",
    trust_score: 85
  });
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetResult, setDatasetResult] = useState(null);

  const [assetUploading, setAssetUploading] = useState(false);
  const [asset, setAsset] = useState({
    title: "",
    asset_type: "image",
    url: "",
    thumbnail_url: "",
    body_system: "soft_tissue",
    procedure_type: "",
    species: "dog,cat",
    annotation_format: "none",
    labels: "",
    license: "",
    source_reference: ""
  });

  const callHarvester = async (action, payload) => {
    const res = await fetch("/api/functions/knowledgeHarvester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || res.statusText);
    }
    return res.json();
  };

  const handleIngestUrl = async () => {
    if (!url) return;
    setIngestLoading(true); setIngestResult(null);
    try {
      const data = await callHarvester("ingestUrl", {
        url, title: urlTitle || undefined, trust_score: Number(urlTrust) || 80
      });
      setIngestResult(data);
    } catch (e) {
      setIngestResult({ error: e.message });
    } finally {
      setIngestLoading(false);
    }
  };

  const handleRegisterDataset = async () => {
    if (!dataset.name.trim()) return;
    setDatasetLoading(true); setDatasetResult(null);
    try {
      const payload = {
        ...dataset,
        tags: dataset.tags ? dataset.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        species: dataset.species ? dataset.species.split(",").map(s => s.trim()).filter(Boolean) : ["all"],
        body_systems: dataset.body_systems ? dataset.body_systems.split(",").map(s => s.trim()).filter(Boolean) : ["soft_tissue"],
        trust_score: Number(dataset.trust_score) || 85
      };
      const data = await callHarvester("registerDataset", payload);
      setDatasetResult(data);
    } catch (e) {
      setDatasetResult({ error: e.message });
    } finally {
      setDatasetLoading(false);
    }
  };

  const handleUploadAssetFile = async (e, key = "url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAssetUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setAsset(prev => ({ ...prev, [key]: file_url }));
    } finally {
      setAssetUploading(false);
    }
  };

  const handleSaveAsset = async () => {
    if (!asset.title || !asset.url) return;
    const data = {
      title: asset.title,
      asset_type: asset.asset_type,
      url: asset.url,
      thumbnail_url: asset.thumbnail_url || undefined,
      body_system: asset.body_system,
      procedure_type: asset.procedure_type || "",
      species: asset.species ? asset.species.split(",").map(s => s.trim()).filter(Boolean) : ["all"],
      annotation_format: asset.annotation_format || "none",
      labels: asset.labels ? asset.labels.split(",").map(s => s.trim()).filter(Boolean) : [],
      license: asset.license || "",
      source_reference: asset.source_reference || ""
    };
    const saved = await SurgicalAsset.create(data);
    setAsset({
      title: "", asset_type: "image", url: "", thumbnail_url: "",
      body_system: "soft_tissue", procedure_type: "", species: "dog,cat",
      annotation_format: "none", labels: "", license: "", source_reference: ""
    });
    alert("دارایی با موفقیت ذخیره شد.");
    return saved;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800">مدیریت و ادغام منابع</h1>
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid grid-cols-3 rounded-2xl">
          <TabsTrigger value="url" className="rounded-2xl">ثبت URL منبع</TabsTrigger>
          <TabsTrigger value="dataset" className="rounded-2xl">معرفی دیتاست</TabsTrigger>
          <TabsTrigger value="asset" className="rounded-2xl">آپلود دارایی جراحی</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card className="bg-white/70 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <LinkIcon className="w-5 h-5" /> Ingest URL (کتاب/مقاله)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
              <Input placeholder="عنوان (اختیاری)" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} />
              <Input type="number" min={0} max={100} placeholder="Trust score (0-100)" value={urlTrust} onChange={(e) => setUrlTrust(e.target.value)} />
              <Button onClick={handleIngestUrl} disabled={ingestLoading}>
                {ingestLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                ثبت و پردازش
              </Button>
              {ingestResult && (
                <div className="text-sm mt-2">
                  {ingestResult.error ? (
                    <div className="text-red-600">خطا: {ingestResult.error}</div>
                  ) : (
                    <div className="text-green-700">منبع ثبت شد؛ شناسه: {ingestResult.source_id} | چانک‌ها: {ingestResult.chunks_created}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dataset">
          <Card className="bg-white/70 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Database className="w-5 h-5" /> ثبت دیتاست تخصصی (مثل SISVSE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="نام دیتاست (مثلاً SISVSE)" value={dataset.name} onChange={(e) => setDataset({ ...dataset, name: e.target.value })} />
              <Textarea rows={3} placeholder="توضیح" value={dataset.description} onChange={(e) => setDataset({ ...dataset, description: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="License (مثلاً CC-BY-4.0)" value={dataset.license} onChange={(e) => setDataset({ ...dataset, license: e.target.value })} />
                <Input placeholder="سازمان/ناشر" value={dataset.source_org} onChange={(e) => setDataset({ ...dataset, source_org: e.target.value })} />
                <Input placeholder="URL (اختیاری)" value={dataset.url} onChange={(e) => setDataset({ ...dataset, url: e.target.value })} />
                <Input placeholder="Trust score (0-100)" type="number" value={dataset.trust_score} onChange={(e) => setDataset({ ...dataset, trust_score: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Tags (comma-separated)" value={dataset.tags} onChange={(e) => setDataset({ ...dataset, tags: e.target.value })} />
                <Input placeholder="Species (comma-separated)" value={dataset.species} onChange={(e) => setDataset({ ...dataset, species: e.target.value })} />
                <Input placeholder="Body systems (comma-separated)" value={dataset.body_systems} onChange={(e) => setDataset({ ...dataset, body_systems: e.target.value })} />
              </div>
              <Button onClick={handleRegisterDataset} disabled={datasetLoading}>
                {datasetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                ثبت دیتاست
              </Button>
              {datasetResult && (
                <div className="text-sm mt-2">
                  {datasetResult.error ? (
                    <div className="text-red-600">خطا: {datasetResult.error}</div>
                  ) : (
                    <div className="text-green-700">دیتاست با موفقیت ثبت شد؛ شناسه: {datasetResult.dataset_id}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asset">
          <Card className="bg-white/70 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-fuchsia-800">
                <ImageIcon className="w-5 h-5" /> آپلود دارایی جراحی (تصویر/ویدئو/۳بعدی)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="عنوان" value={asset.title} onChange={(e) => setAsset({ ...asset, title: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="border rounded-md px-3 py-2" value={asset.asset_type} onChange={(e) => setAsset({ ...asset, asset_type: e.target.value })}>
                  <option value="image">image</option>
                  <option value="video">video</option>
                  <option value="model3d">model3d</option>
                </select>
                <select className="border rounded-md px-3 py-2" value={asset.body_system} onChange={(e) => setAsset({ ...asset, body_system: e.target.value })}>
                  <option value="soft_tissue">soft_tissue</option>
                  <option value="abdominal">abdominal</option>
                  <option value="thoracic">thoracic</option>
                  <option value="orthopedic">orthopedic</option>
                  <option value="ophthalmic">ophthalmic</option>
                  <option value="dental">dental</option>
                  <option value="neuro">neuro</option>
                  <option value="general">general</option>
                </select>
                <Input placeholder="نوع عمل (مثلاً Ovariohysterectomy)" value={asset.procedure_type} onChange={(e) => setAsset({ ...asset, procedure_type: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('asset-file').click()} disabled={assetUploading}>
                    {assetUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    انتخاب فایل اصلی
                  </Button>
                  <Input id="asset-file" type="file" className="hidden" onChange={(e) => handleUploadAssetFile(e, "url")} />
                  {asset.url ? <Badge className="ml-2">فایل آپلود شد</Badge> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('thumb-file').click()} disabled={assetUploading}>
                    {assetUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    انتخاب Thumbnail
                  </Button>
                  <Input id="thumb-file" type="file" className="hidden" onChange={(e) => handleUploadAssetFile(e, "thumbnail_url")} />
                  {asset.thumbnail_url ? <Badge className="ml-2">Thumbnail آپلود شد</Badge> : null}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="border rounded-md px-3 py-2" value={asset.annotation_format} onChange={(e) => setAsset({ ...asset, annotation_format: e.target.value })}>
                  <option value="none">none</option>
                  <option value="pascal_voc">pascal_voc</option>
                  <option value="coco">coco</option>
                  <option value="dicom">dicom</option>
                  <option value="custom">custom</option>
                </select>
                <Input placeholder="برچسب‌ها (comma-separated)" value={asset.labels} onChange={(e) => setAsset({ ...asset, labels: e.target.value })} />
                <Input placeholder="گونه‌ها (comma-separated)" value={asset.species} onChange={(e) => setAsset({ ...asset, species: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="License" value={asset.license} onChange={(e) => setAsset({ ...asset, license: e.target.value })} />
                <Input placeholder="Source reference (مثلاً SISVSE)" value={asset.source_reference} onChange={(e) => setAsset({ ...asset, source_reference: e.target.value })} />
              </div>
              <Button onClick={handleSaveAsset} disabled={!asset.title || !asset.url}>ذخیره دارایی</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}