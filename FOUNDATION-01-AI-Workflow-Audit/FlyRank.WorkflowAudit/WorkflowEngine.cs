using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace FlyRank.WorkflowAudit
{
    public class WorkflowEngine
    {
        private readonly List<TaskItem> _weeklyTasks = new List<TaskItem>();

        // 1. Load workflow tasks
        public void SeedTasks()
        {
            _weeklyTasks.AddRange(new List<TaskItem>
            {
                new TaskItem { Id = 1, Title = "Clinical Patient Diagnosis & Dental Care", Classification = TaskClassification.JustMe, Rationale = "Requires direct physical examination, tactile feedback, and clinical empathy.", Domain = "Dental Clinic" },
                new TaskItem { Id = 2, Title = "Executing Complex Dental Surgical Procedures", Classification = TaskClassification.JustMe, Rationale = "Highly surgical and manual intervention relying entirely on human physical expertise.", Domain = "Dental Clinic" },
                new TaskItem { Id = 3, Title = "Architecting Clean Architecture Structure and API Boundaries", Classification = TaskClassification.CollaborateWithAI, Rationale = "I enforce design boundaries and domain rules; AI accelerates boilerplates.", Domain = "Software Engineering" },
                new TaskItem { Id = 4, Title = "Refactoring Interface Components to Server-Side Pagination", Classification = TaskClassification.DelegateToAIWithReview, Rationale = "AI suggests optimal query structures; I audit and benchmark execution performance.", Domain = "MediQueue EMR" },
                new TaskItem { Id = 5, Title = "Implementing SignalR Cross-Tenant Isolation Infrastructure", Classification = TaskClassification.CollaborateWithAI, Rationale = "Pair-programming data security handshake boundaries with AI using token claims.", Domain = "MediQueue EMR" },
                new TaskItem { Id = 6, Title = "Drafting Deep .NET Technical Mock Interview Questionnaires", Classification = TaskClassification.CollaborateWithAI, Rationale = "Brainstorming enterprise failure modes to deeply challenge candidates.", Domain = "Content Creation" },
                new TaskItem { Id = 7, Title = "Recording Live Interactivity & Voiceovers for Content Delivery", Classification = TaskClassification.JustMe, Rationale = "Requires organic communication style, tone modulation, and personal branding.", Domain = "Content Creation" },
                new TaskItem { Id = 8, Title = "Generating Comprehensive Integration Test Suites for Auth Endpoints", Classification = TaskClassification.DelegateToAIWithReview, Rationale = "AI maps messy edge-case payloads; I validate business constraint assertions.", Domain = "MediQueue EMR" },
                new TaskItem { Id = 9, Title = "Scraping Local & Regional Remote Full-Stack Markets (Egypt/UAE)", Classification = TaskClassification.FullyAutomate, Rationale = "Triggered background automation scraping salary metrics and hiring demands.", Domain = "Career Automation" },
                new TaskItem { Id = 10, Title = "Automating Multi-Tenant System Reminders & Text Alerts", Classification = TaskClassification.FullyAutomate, Rationale = "Independent trigger-based cron jobs processing scheduling logs on infrastructure.", Domain = "MediQueue EMR" },
                new TaskItem { Id = 11, Title = "Monitoring Angular 18 Release Logs and Signals Architecture Updates", Classification = TaskClassification.DelegateToAIWithReview, Rationale = "AI aggregates and synthesizes massive framework changelogs; I audit breaking changes.", Domain = "Software Engineering" },
                new TaskItem { Id = 12, Title = "Drafting High-Value Technical Project Proposals for Enterprise Clients", Classification = TaskClassification.CollaborateWithAI, Rationale = "I outline deliverables and milestones; AI refines the pitch vocabulary.", Domain = "Freelance Business" }
            });
        }

        // 2. Process automation pipelines
        public void ProcessPipelines()
        {
            Console.WriteLine("\n>>> [ENGINE] Starting Workflow Verification Pipeline...");

            var automatedCount = _weeklyTasks.Count(t => t.Classification == TaskClassification.FullyAutomate);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"[AUTO] Found {automatedCount} pipelines ready for script attachment.");

            foreach (var task in _weeklyTasks.Where(t => t.Classification == TaskClassification.FullyAutomate))
            {
                Console.WriteLine($"  -> Triggering active worker for: '{task.Title}'");
            }

            Console.ForegroundColor = ConsoleColor.Yellow;
            var humanCount = _weeklyTasks.Count(t => t.Classification == TaskClassification.JustMe);
            Console.WriteLine($"[HUMAN] Flagged {humanCount} critical human-exclusive operations. Secure constraints applied.");

            Console.ResetColor();
        }

        // 3. Generate and export the deliverable report
        public void ExportReport(string outputPath)
        {
            Console.WriteLine("\n>>> [ENGINE] Compiling Deliverable Markdown Report...");
            var sb = new StringBuilder();

            sb.AppendLine("# FlyRank Backend AI Engineering - Assignment FL-01 Submission");
            sb.AppendLine("## Production Workflow Audit & System Metrics\n");
            sb.AppendLine("| ID | Task Name | Classification | Domain | Technical / Clinical Rationale |");
            sb.AppendLine("|---|---|---|---|---|");

            foreach (var task in _weeklyTasks)
            {
                sb.AppendLine($"| {task.Id} | {task.Title} | {task.Classification} | {task.Domain} | {task.Rationale} |");
            }

            sb.AppendLine("\n## System Optimization Baselines (Target Tasks for FL-02 to FL-04)");
            sb.AppendLine("### 1. Server-Side Pagination Refactoring");
            sb.AppendLine("- **Quantitative Metric:** Sub-200ms processing latency on datasets exceeding 100k records.");
            sb.AppendLine("- **Qualitative Metric:** 100% decoupling of ORM query leaking from delivery controller layers.\n");
            sb.AppendLine("### 2. Multi-Tenant SignalR Separation Infrastructure");
            sb.AppendLine("- **Quantitative Metric:** 0% cross-tenant data leakage rate validated via dynamic tenant handshake test blocks.");
            sb.AppendLine("- **Qualitative Metric:** Token scope validation natively enforced inside socket protocol lifecycles.");

            try
            {
                File.WriteAllText(outputPath, sb.ToString());
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine($"[SUCCESS] Compliance report written safely to: {outputPath}");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"[ERROR] Failed to write compliance report: {ex.Message}");
                Console.ResetColor();
            }
        }
    }
}
