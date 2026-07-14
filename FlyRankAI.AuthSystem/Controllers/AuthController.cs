using FlyRankAI.AuthSystem.DTOs;
using FlyRankAI.AuthSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlyRankAI.AuthSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (!result)
            {
                return BadRequest(new { message = "Username or Email already exists." });
            }

            return Ok(new { message = "User registered successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var response = await _authService.LoginAsync(dto);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            return Ok(response);
        }
    }
}
