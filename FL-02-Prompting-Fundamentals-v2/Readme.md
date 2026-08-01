# Assignment: Prompting Fundamentals on Real Tasks v2

**Track:** General AI Fluency
**Target Task:** Designing an API Data Auditing & Rate-Limiting System for a Backend Service

---

## 🎯 Task Context

This iteration log documents the progression of a prompt designed to generate a robust **C# ASP.NET Core Rate-Limiting Middleware** with audit logging capabilities.

---

## 🪜 Prompt Iteration Log

### 1️⃣ Version 0: Naive Prompt (Baseline)

#### Prompt

```text
Write a rate limiting middleware in C# for ASP.NET Core.
```

#### Output Excerpt

```csharp
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    public RateLimitingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Simple mock counter
        await _next(context);
    }
}
```

#### Iteration Note

- **What Changed:** Baseline naive attempt (one-line request).
- **Observed Output Difference:** Produced a skeleton structure with hardcoded logic and zero actual rate-limiting or storage handling.

---

### 2️⃣ Version 1: Technique — Role Assignment

#### Prompt

```text
Act as a Principal .NET Backend Architect with deep expertise in API security and high-throughput systems. Write a rate limiting middleware in C# for ASP.NET Core.
```

#### Output Excerpt

```csharp
public class TokenBucketRateLimiter
{
    private readonly ConcurrentDictionary<string, int> _clientRequests = new();
    // Includes concurrency considerations and thread-safe dictionary structures
}
```

#### Iteration Note

- **Named Technique Applied:** `Role Assignment`
- **What Changed:** Assigned the persona of a _Principal .NET Backend Architect_.
- **Observed Output Difference:** The LLM changed its coding style from beginner-level code to thread-safe structures (`ConcurrentDictionary`) and referenced proper software design patterns.

---

### 3️⃣ Version 2: Technique — Context and Motivation

#### Prompt

```text
Act as a Principal .NET Backend Architect with deep expertise in API security and high-throughput systems. Write a rate limiting middleware in C# for ASP.NET Core.

Context & Motivation: Our API is experiencing DDoS attempts and heavy scraping on sensitive authentication routes. We need to throttle requests per Client IP to prevent server degradation and return standard HTTP 429 status codes.
```

#### Output Excerpt

```csharp
if (requestCount > MaxAllowedRequests)
{
    context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
    context.Response.Headers["Retry-After"] = "60";
    await context.Response.WriteAsync("Rate limit exceeded. Try again in 60 seconds.");
    return;
}
```

#### Iteration Note

- **Named Technique Applied:** `Context and Motivation`
- **What Changed:** Explained _why_ we need this (DDoS/Scraping) and the real-world operational problem.
- **Observed Output Difference:** Output immediately shifted to handling HTTP spec specifics (returning `429 Too Many Requests` status and setting the `Retry-After` header).

---

### 4️⃣ Version 3: Technique — Few-Shot Examples

#### Prompt

````text
Act as a Principal .NET Backend Architect with deep expertise in API security and high-throughput systems. Write a rate limiting middleware in C# for ASP.NET Core.

Context & Motivation: Our API is experiencing DDoS attempts on sensitive routes. We need throttling per IP returning HTTP 429.

Example Expected Response Format for standard errors:
```json
{
  "status": 429,
  "title": "Too Many Requests",
  "detail": "Quota exceeded. Maximum 100 requests per minute allowed.",
  "type": "https://tools.ietf.org/html/rfc6585#section-4"
}
````

````

#### Output Excerpt
```csharp
var problemDetails = new ProblemDetails
{
    Status = StatusCodes.Status429TooManyRequests,
    Title = "Too Many Requests",
    Detail = $"Quota exceeded. Maximum {MaxRequests} requests per minute allowed.",
    Type = "[https://tools.ietf.org/html/rfc6585#section-4](https://tools.ietf.org/html/rfc6585#section-4)"
};
await context.Response.WriteAsJsonAsync(problemDetails);
````

#### Iteration Note

- **Named Technique Applied:** `Few-Shot Examples`
- **What Changed:** Provided an explicit JSON sample matching RFC 6585 error formats.
- **Observed Output Difference:** The generated C# code replaced plain-text error responses with structured `ProblemDetails` output matching the exact JSON format provided in the prompt example.

---

### 5️⃣ Version 4: Technique — Output Structure

#### Prompt

```text
Act as a Principal .NET Backend Architect with deep expertise in API security and high-throughput systems. Write a rate limiting middleware in C# for ASP.NET Core.

Context & Motivation: Prevent API abuse returning HTTP 429.

Example: Return standard RFC ProblemDetails JSON.

Output Structure:
Provide the solution in three distinct sections:
1. `[CONFIGURATION]` - `appsettings.json` binding record.
2. `[MIDDLEWARE]` - C# Middleware implementation class.
3. `[REGISTRATION]` - Program.cs Extension method for `IServiceCollection`.
```

#### Output Excerpt

```csharp
// Section 1: [CONFIGURATION]
public record RateLimitOptions(int PermitLimit, int WindowInSeconds);

// Section 2: [MIDDLEWARE]
public class RateLimitingMiddleware { ... }

// Section 3: [REGISTRATION]
public static class RateLimitingExtensions { ... }
```

#### Iteration Note

- **Named Technique Applied:** `Output Structure`
- **What Changed:** Strictly enforced three modular sections (`[CONFIGURATION]`, `[MIDDLEWARE]`, `[REGISTRATION]`).
- **Observed Output Difference:** Code was structured cleanly into distinct files/blocks rather than one monolithic block, making it directly copy-pasteable into an enterprise solution.

---

### 6️⃣ Version 5: Technique — Step Decomposition

#### Prompt

```text
Act as a Principal .NET Backend Architect with deep expertise in API security and high-throughput systems. Write a rate limiting middleware in C# for ASP.NET Core.

Context & Motivation: Prevent API abuse returning HTTP 429.
Example: Return standard RFC ProblemDetails JSON.
Output Structure: 3 distinct sections (`[CONFIGURATION]`, `[MIDDLEWARE]`, `[REGISTRATION]`).

Step Decomposition:
Step 1: Define the `RateLimitOptions` model and parse it from configuration.
Step 2: Check incoming requests against memory cache using sliding window counter logic.
Step 3: If limit is exceeded, write HTTP 429 ProblemDetails and abort pipeline.
Step 4: If limit is respected, increment counter and invoke `_next(context)`.
Step 5: Provide an extension method to register DI services cleanly.
```

#### Output Excerpt

```csharp
// Implements sliding window counter using MemoryCache with expiration token callbacks
public async Task InvokeAsync(HttpContext context, IMemoryCache cache, IOptions<RateLimitOptions> options)
{
    // Step 1 & 2: Parse options and validate window counter
    // Step 3: Handle 429 Abort
    // Step 4: Increment & Next
}
```

#### Iteration Note

- **Named Technique Applied:** `Step Decomposition`
- **What Changed:** Decomposed the execution logic into 5 explicit algorithmic steps.
- **Observed Output Difference:** The LLM replaced naive dictionary counters with sliding-window thread-safe memory caching with auto-expiration, following the exact step order specified.

---

## 🔬 Cross-Model Comparison

| Dimension               | Claude (Claude 3.5 Sonnet / Gemini)                                                                 | ChatGPT (GPT-4o)                                                                   |
| :---------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Code Precision**      | Higher architectural compliance. Strictly respected C# 12 features (records, primary constructors). | Excellent, but tended to add extra commentary outside the requested section tags.  |
| **Structure Adherence** | Adhered 100% to section tags (`[MIDDLEWARE]`, etc.) without dropping context.                       | Included extra unprompted markdown headers.                                        |
| **Failure Points**      | Required explicit instructions to include XML documentation comments.                               | Forgot `builder.Services` extension registration step until reminded in follow-up. |

---

## 🏆 Final Reusable Prompt Template

```text
Act as a [ROLE, e.g., Senior Backend Engineer].

Task: Implement [FEATURE_NAME] in [TECHNOLOGY/FRAMEWORK].

Context & Motivation:
We need to solve [PROBLEM] because [BUSINESS/SECURITY_REASON].

Output Structure Requirements:
1. [SECTION_1_NAME]: [DETAILS]
2. [SECTION_2_NAME]: [DETAILS]
3. [SECTION_3_NAME]: [DETAILS]

Execution Steps:
- Step 1: [FIRST_LOGICAL_STEP]
- Step 2: [SECOND_LOGICAL_STEP]
- Step 3: [THIRD_LOGICAL_STEP]

Example Expected Output Pattern:
[PASTE_SHORT_SAMPLE_INPUT_OR_OUTPUT_HERE]
```
