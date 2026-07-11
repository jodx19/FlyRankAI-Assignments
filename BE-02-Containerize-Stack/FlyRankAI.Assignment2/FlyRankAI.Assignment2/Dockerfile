
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY ["FlyRankAI.Assignment2.csproj", "./"]
RUN dotnet restore "FlyRankAI.Assignment2.csproj"


COPY . .
RUN dotnet build "FlyRankAI.Assignment2.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FlyRankAI.Assignment2.csproj" -c Release -o /app/publish /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FlyRankAI.Assignment2.dll"]