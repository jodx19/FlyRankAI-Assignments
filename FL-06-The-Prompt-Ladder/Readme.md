# Assignment: The Prompt Ladder

**Track:** General AI Fluency
**Focus:** Backend Engineering & System Architecture

---

## 📌 Task Overview & Strategy
This document tracks the iterative engineering of a weak prompt into a production-grade prompt. Every step adds **exactly one layer** to address the previous output's biggest weakness.

- **Baseline (v0):** Weak prompt
- **v1:** Layer 1 — Clear Goal & Tech Stack
- **v2:** Layer 2 — Security & Domain Constraints
- **v3:** Layer 3 — Architecture Pattern & Output Format
- **v4:** Layer 4 — Over-bundling Infrastructure Requirements (*This Made It Worse*)
- **v5:** Layer 5 — Verification Rules & Edge Cases (*Final Prompt*)

---

## 🚀 Step 0: Weak Baseline

### 🔴 Baseline Prompt (v0)
```text
Write backend code for user authentication.
```

### 📄 Representative Excerpt Output
```csharp
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login(string username, string password)
    {
        if (username == "admin" && password == "password")
        {
            return Ok("Logged in");
        }
        return Unauthorized();
    }
}
```

### 📝 Notes (v0)
1. **What changed in the prompt:** None (This is the un-engineered baseline).
2. **What actually improved in the output:** N/A (Yielded hardcoded credentials and naive string comparisons).
3. **What still failed:** Highly insecure code, no password hashing, no tokens, no architecture, and no HTTP standard responses.
4. **What I would try next:** Define a explicit technical stack and precise core goal.

---

## 🪜 Step 1: Layer 1 — Clear Goal & Tech Stack

### 🟡 Prompt (v1)
```text
Write backend code for user authentication using ASP.NET Core 8 Minimal APIs and C#.
```

### 📄 Representative Excerpt Output
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/login", (LoginRequest request) =>
{
    if (request.Username == "admin" && request.Password == "123456")
    {
        return Results.Ok(new { Message = "Success" });
    }
    return Results.Unauthorized();
});

record LoginRequest(string Username, string Password);
```

### 📝 Notes (v1)
1. **What changed in the prompt:** Added tech stack layer (`ASP.NET Core 8 Minimal APIs and C#`).
2. **What actually improved in the output:** Shifted from legacy Controllers to modern Minimal API endpoints and strongly typed request records.
3. **What still failed:** Logic remains a mock implementation with hardcoded plain-text credentials and no production security mechanism.
4. **What I would try next:** Add explicit security constraints (JWT generation, password hashing algorithms).

---

## 🪜 Step 2: Layer 2 — Security & Domain Constraints

### 🟡 Prompt (v2)
```text
Write backend code for user authentication using ASP.NET Core 8 Minimal APIs and C#.

Constraints: Implement secure authentication using BCrypt for password hashing and issue JWT Bearer tokens upon successful login.
```

### 📄 Representative Excerpt Output
```csharp
app.MapPost("/login", async (LoginDto dto, AppDbContext db, IConfiguration config) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
    {
        return Results.Unauthorized();
    }

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(config["Jwt:Secret"]);
    var tokenDescriptor = new SecurityTokenDescriptor { /* Claims & Expiry */ };
    var token = tokenHandler.CreateToken(tokenDescriptor);

    return Results.Ok(new { Token = tokenHandler.WriteToken(token) });
});
```

### 📝 Notes (v2)
1. **What changed in the prompt:** Added real-world domain constraints (`BCrypt password hashing` and `JWT Bearer tokens`).
2. **What actually improved in the output:** Eliminated dummy code; introduced real password verification and token generation using `BCrypt.Net` and `System.IdentityModel.Tokens.Jwt`.
3. **What still failed:** Endpoint handler mixes database access, security logic, and HTTP handling into a single inline delegate.
4. **What I would try next:** Specify clean architecture, DTO separation, and standard error handling formats.

---

## 🪜 Step 3: Layer 3 — Architecture & Output Format

### 🟡 Prompt (v3)
```text
Write backend code for user authentication using ASP.NET Core 8 Minimal APIs and C#.

Constraints: Implement secure authentication using BCrypt for password hashing and issue JWT Bearer tokens upon successful login.

Output Format: Follow Clean Architecture by separating endpoints, application services (`IAuthService`), and DTOs. Return standard `ProblemDetails` for validation and authentication failures.
```

### 📄 Representative Excerpt Output
```csharp
// Endpoints/AuthEndpoints.cs
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapPost("/api/v1/auth/login", async (LoginRequest request, IAuthService authService) =>
        {
            var result = await authService.LoginAsync(request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Problem(statusCode: 401, detail: result.Error);
        });
    }
}
```

### 📝 Notes (v3)
1. **What changed in the prompt:** Specified structural design (`Clean Architecture`, `IAuthService` abstraction) and standardized output format (`ProblemDetails`).
2. **What actually improved in the output:** Code became modular, maintainable, decoupled from HTTP context, and followed standard RFC 7807 error responses.
3. **What still failed:** Missed runtime validation, rate limiting, and explicit verification criteria (e.g., unit tests).
4. **What I would try next:** Request Docker, database migrations, CI/CD pipelines, and infrastructure setup in the prompt.

---

## 🪜 Step 4: Layer 4 — Infrastructure Over-bundling (*This Made It Worse*)

### 🔴 Prompt (v4)
```text
Write backend code for user authentication using ASP.NET Core 8 Minimal APIs and C#.

Constraints: Implement secure authentication using BCrypt for password hashing and issue JWT Bearer tokens upon successful login.

Output Format: Follow Clean Architecture by separating endpoints, application services (`IAuthService`), and DTOs. Return standard `ProblemDetails` for validation and authentication failures.

Infrastructure Request: Also provide full Dockerfile, docker-compose with PostgreSQL, EF Core migration commands, Helm charts, and a GitHub Actions CI/CD deployment pipeline.
```

### 📄 Representative Excerpt Output
```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
# ... truncated Docker & GitHub Actions scripts ...
// NOTE: C# AuthService logic was generated incomplete with // TODO comments due to token length limit!
```

### 📝 Notes (v4)
1. **What changed in the prompt:** Attempted to force complete DevOps/Infrastructure specs into a single prompt.
2. **What actually improved in the output:** Nothing in the code core; generated generic YAML files.
3. **What actually got worse (THIS MADE IT WORSE):** The LLM hit its output context window limit! It truncated the main C# application code, leaving methods half-written with `// TODO: implement rest of auth logic` placeholders.
4. **What I would try next:** Strip out DevOps bundling and focus strictly on C# backend verification, input validation, and code edge cases.

---

## 🪜 Step 5: Layer 5 — Verification Rules & Edge Cases (*Final Prompt*)

### 🟢 Final Production-Ready Prompt (v5)
```text
Act as a Senior .NET Backend Architect.

Goal: Implement a complete User Authentication slice for an ASP.NET Core 8 Minimal API using C#.

Technical Constraints:
1. Security: Use BCrypt for password hashing. Generate signed JWT tokens with claims (UserId, Email, Roles) and 15-minute expiration. Include Refresh Token generation stored securely.
2. Architecture: Apply Clean Architecture. Separate routes into extension methods (`AuthEndpoints`), logic into `IAuthService`, models into records (`LoginRequest`, `AuthResponse`), and persistence interfaces.
3. Validation & Errors: Validate inputs using FluentValidation. Return standard `ProblemDetails` (RFC 7807) for failures (400 Bad Request, 401 Unauthorized).

Verification & Quality Standards:
- Include xUnit unit tests verifying successful token generation and failed password validation scenarios.
- Do not output generic placeholders or incomplete methods.
```

### 📄 Representative Excerpt Output
```csharp
// Verification Unit Test Excerpt
[Fact]
public async Task LoginAsync_WithInvalidPassword_ReturnsFailureResult()
{
    // Arrange
    _userRepoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>()))
                 .ReturnsAsync(new User { PasswordHash = BCrypt.Net.BCrypt.HashPassword("RealPass") });

    // Act
    var result = await _authService.LoginAsync(new LoginRequest("test@domain.com", "WrongPass"));

    // Assert
    Assert.False(result.IsSuccess);
    Assert.Equal("Invalid credentials", result.Error);
}
```

### 📝 Notes (v5)
1. **What changed in the prompt:** Removed DevOps noise and added verification rules (`xUnit tests`, FluentValidation, Refresh Tokens, strict quality instructions).
2. **What actually improved in the output:** Produced robust, enterprise-grade backend code complete with validation logic, explicit error handling, and matching unit test suites.
3. **What still failed:** Nothing within scope. The prompt successfully guides any LLM to produce production-level code.
4. **What I would try next:** Deploy prompt to team repository as a reusable template.

---

## 🏆 Final Reusable Prompt
```text
Act as a Senior .NET Backend Architect.

Goal: Implement a complete [FEATURE_NAME] slice for an ASP.NET Core 8 Minimal API using C#.

Technical Constraints:
1. Security & Logic: Implement [SPECIFIC_SECURITY_LOGIC, e.g., BCrypt hashing, JWT with Refresh Tokens].
2. Architecture: Apply Clean Architecture. Separate routes into extension methods (`[FEATURE]Endpoints`), business logic into `I[FEATURE]Service`, models into C# records, and persistence interfaces.
3. Validation & Errors: Validate inputs using FluentValidation. Return standard `ProblemDetails` (RFC 7807) for failures.

Verification & Quality Standards:
- Include xUnit unit tests for both success paths and edge-case failure scenarios.
- Code must be complete, runnable, and free of placeholders or un-implemented methods.
```
