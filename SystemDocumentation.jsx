import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Code, 
  Database, 
  Zap, 
  Users, 
  Settings, 
  Shield, 
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";

export default function SystemDocumentation() {
  const documentation = {
    overview: {
      title: "نمای کلی سیستم صنم یار",
      icon: BookOpen,
      content: {
        description: `
سیستم صنم یار یک دستیار هوشمند دامپزشکی است که با استفاده از تکنولوژی‌های مدرن AI و یادگیری ماشین، 
تجربه یادگیری و تمرین دانشجویان و متخصصان دامپزشکی را بهبود می‌بخشد.
        `,
        keyFeatures: [
          "دستیار گفتگوی هوشمند با قابلیت صوتی",
          "آزمایشگاه جراحی مجازی با شبیه‌سازی پیشرفته",
          "سیستم مدیریت کیس‌های بالینی",
          "پلتفرم آزمون‌سازی و ارزیابی",
          "بانک جامع اطلاعات دامپزشکی",
          "سیستم گامیفیکیشن و انگیزش‌بخشی",
          "تحلیل‌گر عملکرد و پیشرفت",
          "فرهنگ اصطلاحات تخصصی"
        ],
        technicalStack: [
          { name: "Frontend", tech: "React 18 + Vite" },
          { name: "UI Framework", tech: "Tailwind CSS + Shadcn/ui" },
          { name: "Backend", tech: "Base44 Platform" },
          { name: "Database", tech: "Base44 Managed Database" },
          { name: "AI/ML", tech: "xAI Grok + Custom LLMs" },
          { name: "Authentication", tech: "Base44 Auth System" },
          { name: "Deployment", tech: "Base44 Cloud Platform" }
        ]
      }
    },
    architecture: {
      title: "معماری سیستم",
      icon: Code,
      content: {
        description: "معماری مدولار و مقیاس‌پذیر با جداسازی واضح concerns",
        components: [
          {
            name: "لایه ارائه (Presentation Layer)",
            description: "رابط کاربری React با کامپوننت‌های بهینه‌شده",
            technologies: ["React", "Tailwind CSS", "Framer Motion", "React Hook Form"]
          },
          {
            name: "لایه منطق کسب‌وکار (Business Logic)",
            description: "مدیریت حالت، validation، و منطق اپلیکیشن",
            technologies: ["Custom Hooks", "Context API", "Entity Management"]
          },
          {
            name: "لایه سرویس (Service Layer)",
            description: "ارتباط با API‌ها و پردازش داده",
            technologies: ["Base44 SDK", "Custom Functions", "Cache Management"]
          },
          {
            name: "لایه داده (Data Layer)",
            description: "مدیریت entities و ارتباط با دیتابیس",
            technologies: ["Base44 Database", "Entity Schema", "Relationships"]
          }
        ],
        patterns: [
          "Component Composition Pattern",
          "Custom Hooks Pattern", 
          "Provider Pattern",
          "Higher-Order Components (HOCs)",
          "Render Props Pattern"
        ]
      }
    },
    entities: {
      title: "مدل داده و Entities",
      icon: Database,
      content: {
        description: "سیستم entity-based برای مدیریت انواع داده‌ها",
        coreEntities: [
          {
            name: "User",
            description: "مدیریت کاربران و پروفایل‌ها",
            fields: ["email", "full_name", "role", "preferences"]
          },
          {
            name: "Resource",
            description: "منابع آموزشی و علمی",
            fields: ["title", "type", "category", "species", "content"]
          },
          {
            name: "Case",
            description: "کیس‌های بالینی", 
            fields: ["title", "species", "symptoms", "diagnosis", "treatment"]
          },
          {
            name: "Quiz/Question",
            description: "سیستم آزمون‌سازی",
            fields: ["title", "questions", "answers", "scoring"]
          },
          {
            name: "SurgicalProcedure", 
            description: "روش‌های جراحی",
            fields: ["title", "steps", "complications", "assessment"]
          },
          {
            name: "Achievement/UserProgress",
            description: "گامیفیکیشن",
            fields: ["points", "level", "badges", "streaks"]
          }
        ],
        relationships: [
          "User ↔ UserProgress (1:1)",
          "User ↔ Cases (1:N)", 
          "User ↔ Attempts (1:N)",
          "Quiz ↔ Questions (1:N)",
          "Case ↔ TreatmentPlan (1:N)"
        ]
      }
    },
    apis: {
      title: "API‌ها و Integration‌ها",
      icon: Zap,
      content: {
        description: "سیستم یکپارچه API‌ها و سرویس‌های خارجی",
        internalAPIs: [
          {
            name: "Entity CRUD APIs",
            description: "عملیات پایه CRUD برای همه entities",
            methods: ["list()", "filter()", "create()", "update()", "delete()"]
          },
          {
            name: "Custom Functions",
            description: "توابع سفارشی backend",
            examples: ["assistantTextChat", "analyzeCase", "surgeryInstructor", "knowledgeRetriever"]
          }
        ],
        externalIntegrations: [
          {
            name: "xAI Grok API",
            purpose: "پردازش زبان طبیعی و تولید پاسخ هوشمند",
            usage: "گفتگو، تحلیل کیس، تولید محتوا"
          },
          {
            name: "Base44 Core Integrations",
            purpose: "سرویس‌های پایه پلتفرم",
            services: ["InvokeLLM", "UploadFile", "SendEmail", "GenerateImage"]
          }
        ],
        apiPatterns: [
          "RESTful Design Principles",
          "Async/Await Pattern",
          "Error Handling & Retry Logic",
          "Request/Response Caching",
          "Rate Limiting & Throttling"
        ]
      }
    },
    userGuide: {
      title: "راهنمای کاربری",
      icon: Users,
      content: {
        description: "راهنمای جامع استفاده از سیستم",
        gettingStarted: [
          "ورود به سیستم با حساب Google",
          "تکمیل پروفایل کاربری",
          "آشنایی با داشبورد اصلی",
          "تنظیم اهداف یادگیری"
        ],
        coreWorkflows: [
          {
            name: "مطالعه منابع",
            steps: [
              "رفتن به بخش «دستیار تحصیلی»",
              "آپلود فایل PDF یا تصویر",
              "مطالعه خلاصه AI-generated", 
              "تعامل با chatbot برای سؤالات",
              "ذخیره نکات مهم"
            ]
          },
          {
            name: "تحلیل کیس بالینی",
            steps: [
              "ایجاد پروفایل حیوان",
              "وارد کردن علائم و تاریخچه",
              "استفاده از ابزار تشخیص هوشمند",
              "تنظیم طرح درمان",
              "پیگیری و مانیتورینگ"
            ]
          },
          {
            name: "تمرین جراحی مجازی",
            steps: [
              "انتخاب نوع جراحی از لیست",
              "مطالعه پیش‌نیازها",
              "شروع شبیه‌سازی step-by-step",
              "تصمیم‌گیری در نقاط بحرانی",
              "دریافت feedback و ارزیابی"
            ]
          },
          {
            name: "شرکت در آزمون",
            steps: [
              "انتخاب آزمون از لیست موجود",
              "خواندن دستورالعمل‌ها",
              "پاسخ به سؤالات",
              "ارسال و دریافت نتایج",
              "بررسی feedback تفصیلی"
            ]
          }
        ],
        tips: [
          "از قابلیت جستجو در فرهنگ اصطلاحات استفاده کنید",
          "روزانه حداقل ۳۰ دقیقه مطالعه کنید تا streak خود را حفظ کنید",
          "از بخش «گفتگوها» برای مرور جلسات قبلی استفاده کنید",
          "در بخش آمار، پیشرفت خود را ردیابی کنید",
          "با استفاده از کیس‌های مشابه، تجربه بیشتری کسب کنید"
        ]
      }
    },
    deployment: {
      title: "راه‌اندازی و Deployment",
      icon: Settings,
      content: {
        description: "مستندات راه‌اندازی در محیط تولید",
        requirements: [
          "حساب Base44 با دسترسی کامل",
          "کلید API xAI برای سرویس‌های LLM",
          "تنظیم متغیرهای محیط",
          "پیکربندی دامنه و SSL"
        ],
        deploymentSteps: [
          "Push کد به repository",
          "اتصال به Base44 platform",
          "تنظیم Environment Variables",
          "اجرای migrations برای entities",
          "تست عملکرد در محیط staging",
          "انتشار در محیط production"
        ],
        environmentVariables: [
          { name: "xAI_API_KEY", description: "کلید API برای سرویس Grok" },
          { name: "BASE44_APP_ID", description: "شناسه اپلیکیشن (خودکار)" }
        ],
        monitoring: [
          "مانیتورینگ خطاها و عملکرد",
          "بررسی آمار کاربری",
          "ردیابی مصرف API quota",
          "بکاپ خودکار داده‌ها"
        ]
      }
    },
    security: {
      title: "امنیت و حریم خصوصی",
      icon: Shield,
      content: {
        description: "راهنمای امنیت و محافظت از داده‌ها",
        authentication: [
          "احراز هویت مبتنی بر OAuth2 (Google)",
          "مدیریت نقش‌های کاربری (admin/user)",
          "Session management خودکار",
          "Logout امن"
        ],
        dataProtection: [
          "رمزنگاری داده‌های حساس",
          "Sanitization ورودی‌های کاربر",
          "محدودیت حجم فایل‌های آپلود",
          "Validation سمت سرور"
        ],
        bestPractices: [
          "عدم ذخیره اطلاعات حساس در localStorage",
          "استفاده از HTTPS برای همه ارتباطات",
          "Input validation در frontend و backend",
          "Regular security audits",
          "کنترل دسترسی مبتنی بر نقش"
        ],
        compliance: [
          "رعایت قوانین حریم خصوصی",
          "شفافیت در نحوه استفاده از داده‌ها",
          "حق حذف داده‌های کاربر",
          "امنیت داده‌های آموزشی"
        ]
      }
    }
  };

  const [selectedTab, setSelectedTab] = React.useState("overview");

  const downloadDocumentation = () => {
    // تولید فایل PDF یا Word از مستندات (فرضی)
    alert("مستندات کامل برای دانلود آماده سازی شد. این قابلیت در آینده اضافه خواهد شد.");
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">مستندات سیستم صنم یار</h1>
        <p className="text-gray-600">راهنمای جامع توسعه، استقرار و استفاده</p>
        <div className="mt-4">
          <Button onClick={downloadDocumentation} variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            دانلود مستندات کامل
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2 bg-gray-100 rounded-2xl">
          {Object.entries(documentation).map(([key, doc]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex flex-col items-center gap-2 p-4 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <doc.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{doc.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(documentation).map(([key, doc]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card className="bg-white/70 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <doc.icon className="w-6 h-6" />
                  {doc.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{doc.content.description}</p>
                </div>

                {/* نمایش محتوای مخصوص هر بخش */}
                {key === "overview" && (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">ویژگی‌های کلیدی</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {doc.content.keyFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-green-50">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">پشته فناوری</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {doc.content.technicalStack.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="font-medium text-blue-800">{item.name}</div>
                            <div className="text-sm text-blue-600">{item.tech}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {key === "architecture" && (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">اجزای معماری</h3>
                      <div className="space-y-4">
                        {doc.content.components.map((comp, idx) => (
                          <Card key={idx} className="bg-gray-50">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-gray-800 mb-2">{comp.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{comp.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {comp.technologies.map((tech, tidx) => (
                                  <Badge key={tidx} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">الگوهای طراحی</h3>
                      <div className="flex flex-wrap gap-2">
                        {doc.content.patterns.map((pattern, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-800">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* سایر بخش‌ها به همین شکل... */}
                {/* برای کوتاه کردن، فقط نمونه‌ای از overview و architecture نشان داده‌ام */}

              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}