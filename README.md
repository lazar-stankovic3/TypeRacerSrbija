# TypeRacerSrbija

TypeRacerSrbija is a real-time typing race web application for Serbian text. Users can register, log in, join a race room, type the given sentence and compete with other players through live updates.

The main goal of this project was to practice building a full-stack real-time application with authentication, database persistence and SignalR communication.

## Features

* User registration and login
* JWT authentication
* Optional Google authentication
* Real-time game rooms with SignalR
* Live player progress updates
* Serbian typing sentences
* Result tracking
* Leaderboard
* PostgreSQL database with Entity Framework Core migrations
* Database seeding
* Swagger API documentation in development
* Docker support
* React frontend built with Vite

## Tech Stack

### Backend

* ASP.NET Core / .NET 8
* C#
* Entity Framework Core
* PostgreSQL / Npgsql
* SignalR
* JWT Bearer Authentication
* Google Authentication
* Swagger

### Frontend

* React
* JavaScript
* React Router
* Vite
* CSS
* Microsoft SignalR client

### Tools

* Docker
* Git / GitHub
* Visual Studio / VS Code

## Project Structure

```txt
TypeRacerSrbija/
├── TypeRacer/
│   ├── ClientApp/          # React frontend
│   ├── Controllers/        # API controllers
│   ├── Data/               # DbContext and database seed
│   ├── Hubs/               # SignalR GameHub
│   ├── Migrations/         # EF Core migrations
│   ├── Models/             # Domain models
│   ├── Services/           # Application services
│   ├── Program.cs          # App configuration
│   └── appsettings.json
├── Dockerfile
└── TypeRacer.sln
```

## Main Backend Parts

### AuthController

Handles user authentication and login/register flow.

### SentencesController

Provides typing sentences used during races.

### ResultsController

Stores and retrieves race results.

### LeaderboardController

Returns leaderboard data.

### GameHub

SignalR hub responsible for real-time race communication between players.

## How It Works

1. A user registers or logs in.
2. The user joins a typing race room.
3. The server sends the race sentence.
4. Players type the sentence in real time.
5. SignalR broadcasts player progress.
6. Results are saved after the race.
7. Leaderboard data can be viewed through the API/UI.

## Getting Started

### Prerequisites

Make sure you have installed:

* .NET 8 SDK
* Node.js
* PostgreSQL
* Docker, optional

## Backend Setup

Clone the repository:

```bash
git clone https://github.com/lazar-stankovic3/TypeRacerSrbija.git
cd TypeRacerSrbija/TypeRacer
```

Configure the database connection in `appsettings.json` or through environment variables.

Example `appsettings.json` structure:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=typeracer;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "your-long-secret-key",
    "Issuer": "TypeRacer",
    "Audience": "TypeRacerUsers"
  },
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    }
  }
}
```

Run the backend:

```bash
dotnet restore
dotnet ef database update
dotnet run
```

The API will start locally, and Swagger will be available in development mode.

## Frontend Setup

Go to the React app:

```bash
cd ClientApp
npm install
npm run dev
```

## Environment Variables

The project supports PostgreSQL configuration through environment variables:

```txt
DATABASE_URL
PGHOST
PGPORT
PGDATABASE
PGUSER
PGPASSWORD
```

## Screenshots

Add screenshots here after taking them from the running application.

```md
![Home page](screenshots/home.png)
![Race room](screenshots/race-room.png)
![Leaderboard](screenshots/leaderboard.png)
```

## What I Learned

While building this project, I practiced:

* Real-time communication with SignalR
* Full-stack development with ASP.NET Core and React
* JWT authentication
* Google OAuth integration
* PostgreSQL database setup
* Entity Framework Core migrations
* API design with controllers
* Deployment-oriented configuration with environment variables
* Docker basics

## Future Improvements

* Add better UI/UX polish
* Add private rooms
* Add more typing modes
* Add user profile statistics
* Add unit/integration tests
* Improve error handling
* Add production deployment documentation

## Author

Lazar Stanković
GitHub: github.com/lazar-stankovic3
