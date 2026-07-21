using System;
using System.IO;

namespace FlyRank.WorkflowAudit
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "FlyRank Backend AI Engineering - Foundation FL-01";

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================================");
            Console.WriteLine("   FlyRank Backend AI Engineering - Task FL-01 Execution Engine   ");
            Console.WriteLine("   Developer: Mahmoud Mostafa El Safi                            ");
            Console.WriteLine("==================================================================");
            Console.ResetColor();

            // 1. إنشاء كائن من محرك العمليات
            var engine = new WorkflowEngine();

            // 2. تحميل وشحن البيانات
            engine.SeedTasks();

            // 3. معالجة وتتبع الـ Pipelines
            engine.ProcessPipelines();

            // 4. تحديد المسار وتوليد تقرير الـ Markdown النهائي
            // بيصعد خطوة لورا عشان يكتب الملف جوه فولدر FOUNDATION-01-AI-Workflow-Audit مباشرة
            string targetReportPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "Workflow_Audit_Report.md");
            engine.ExportReport(targetReportPath);

            Console.WriteLine("\n[SUCCESS] Task FL-01 execution complete. Ready for GitHub push.");
        }
    }
}
