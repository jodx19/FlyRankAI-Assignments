var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();


app.MapGet("/", () => new { Message = "welcome to FlyRankAI backend internship ",
    status = "active"
});


app.MapGet ("/intern" , () => new {
    track = "backend internship ",
    CurrentAssignment = "BE-01" , 
    status = "complete"
});


app.Run();