# Stage 1 — build React frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY TypeRacer/ClientApp/package*.json ./
RUN npm ci
COPY TypeRacer/ClientApp/ ./
RUN npm run build

# Stage 2 — build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend
WORKDIR /src
COPY TypeRacer.sln ./
COPY TypeRacer/TypeRacer.csproj TypeRacer/
RUN dotnet restore TypeRacer/TypeRacer.csproj
COPY TypeRacer/ TypeRacer/
COPY --from=frontend /app/dist TypeRacer/wwwroot/
RUN dotnet publish TypeRacer/TypeRacer.csproj -c Release -o /publish

# Stage 3 — runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend /publish ./
RUN mkdir -p /data
EXPOSE 8080
CMD ["dotnet", "TypeRacer.dll"]
