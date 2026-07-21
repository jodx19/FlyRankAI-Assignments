using System;

namespace FlyRank.WorkflowAudit
{
    // الـ Enums الأساسية المطلوبة لتصنيف المهام حسب شروط المنحة
    public enum TaskClassification
    {
        JustMe,
        DelegateToAIWithReview,
        CollaborateWithAI,
        FullyAutomate
    }

    // الموديل المسؤول عن حمل بيانات كل مهمة في سير عملك اليومي
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public TaskClassification Classification { get; set; }
        public string Rationale { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
    }
}
