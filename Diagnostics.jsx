import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { runDiagnostics } from "@/api/functions";

export default function Diagnostics() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTests = async () => {
    setIsLoading(true);
    setTestResults(null);
    try {
      const results = await runDiagnostics(); 
      console.log("Diagnostics results received:", results);
      setTestResults(results);
    } catch (error) {
      console.error("Diagnostics error:", error);
      setTestResults({
        error: {
          status: "fail",
          details: `Failed to run diagnostics: ${error?.message || "Unknown error"}`,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TestResult = ({ title, result }) => {
    console.log("TestResult rendering:", { title, result });
    
    // Fixed: Check for result existence and status property
    if (!result || !result.status) {
      console.log("TestResult: no result or status, returning null");
      return null;
    }
    
    const isPass = result.status === 'pass';
    
    return (
      <div className={`p-4 rounded-lg flex items-start gap-4 ${isPass ? 'bg-green-50' : 'bg-red-50'}`}>
        <div>
            {isPass ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
        </div>
        <div>
            <h4 className={`font-bold ${isPass ? 'text-green-800' : 'text-red-800'}`}>{title}</h4>
            <p className={`text-sm ${isPass ? 'text-green-700' : 'text-red-700'}`}>{result.details || 'جزئیات در دسترس نیست'}</p>
        </div>
      </div>
    );
  };

  console.log("Diagnostics component rendering, testResults:", testResults);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">تشخیص سلامت اینتگریشن</h1>
          <p className="text-gray-600 mt-1">بررسی وضعیت اتصال به xAI Grok و پایگاه داده.</p>
        </div>
        <Button onClick={handleRunTests} disabled={isLoading} className="rounded-xl w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              در حال اجرای تست...
            </>
          ) : (
            "شروع تست سلامت"
          )}
        </Button>
      </div>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>نتایج تست</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TestResult title="بررسی کلید xAI API" result={testResults.apiKey} />
            <TestResult title="اتصال به xAI Grok" result={testResults.xaiApi} />
            <TestResult title="اتصال به پایگاه داده" result={testResults.database} />
            {/* Only show error result if it exists */}
            {testResults.error && <TestResult title="خطای کلی" result={testResults.error} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}