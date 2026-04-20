using Microsoft.AspNetCore.SignalR;
using TypeRacer.Data;
using TypeRacer.Services;

namespace TypeRacer.Hubs;

public class GameHub(GameRoomService rooms, AppDbContext db) : Hub
{
    public async Task CreateRoom(string playerName)
    {
        var room = rooms.CreateRoom(Context.ConnectionId, playerName);
        await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);
        await Clients.Caller.SendAsync("RoomCreated", room.Code, room.Players[0]);
    }

    public async Task JoinRoom(string roomCode, string playerName)
    {
        var room = rooms.JoinRoom(roomCode.ToUpper(), Context.ConnectionId, playerName);
        if (room == null)
        {
            await Clients.Caller.SendAsync("Error", "Soba ne postoji ili je igra već počela.");
            return;
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);
        await Clients.Caller.SendAsync("RoomJoined", room.Code, room.Players);
        await Clients.OthersInGroup(room.Code).SendAsync("PlayerJoined", room.Players.Last());
    }

    public async Task StartGame(string roomCode)
    {
        var room = rooms.GetRoom(roomCode);
        if (room == null || room.HostConnectionId != Context.ConnectionId) return;
        if (room.Status != "waiting") return;

        var count = db.Sentences.Count();
        var sentence = db.Sentences.Skip(Random.Shared.Next(count)).First();
        room.SentenceText = sentence.Text;
        room.Status = "countdown";

        foreach (var p in room.Players) { p.Progress = 0; p.Wpm = 0; p.Finished = false; p.Place = null; }

        for (int i = 3; i >= 1; i--)
        {
            await Clients.Group(roomCode).SendAsync("Countdown", i);
            await Task.Delay(1000);
        }

        room.Status = "playing";
        await Clients.Group(roomCode).SendAsync("GameStarted", sentence.Text);
    }

    public async Task UpdateProgress(string roomCode, int progress, int wpm)
    {
        var room = rooms.GetRoom(roomCode);
        if (room == null || room.Status != "playing") return;

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
        if (player == null) return;

        player.Progress = Math.Clamp(progress, 0, 100);
        player.Wpm = wpm;

        if (progress >= 100 && !player.Finished)
        {
            player.Finished = true;
            player.Place = room.Players.Count(p => p.Finished);
            await Clients.Group(roomCode).SendAsync("PlayerFinished", player.Name, player.Place, wpm);
        }

        await Clients.Group(roomCode).SendAsync("ProgressUpdated", room.Players);

        if (room.Players.All(p => p.Finished))
        {
            room.Status = "finished";
            await Clients.Group(roomCode).SendAsync("GameEnded", room.Players);
        }
    }

    public async Task LeaveRoom(string roomCode)
    {
        await HandleLeave(roomCode);
    }

    public async Task RestartRoom(string roomCode)
    {
        var room = rooms.GetRoom(roomCode);
        if (room == null || room.HostConnectionId != Context.ConnectionId) return;
        room.Status = "waiting";
        room.SentenceText = null;
        foreach (var p in room.Players) { p.Progress = 0; p.Wpm = 0; p.Finished = false; p.Place = null; }
        await Clients.Group(roomCode).SendAsync("RoomReset", room.Players);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomCode = rooms.GetPlayerRoom(Context.ConnectionId);
        if (roomCode != null) await HandleLeave(roomCode);
        await base.OnDisconnectedAsync(exception);
    }

    private async Task HandleLeave(string roomCode)
    {
        var playerName = rooms.RemovePlayer(roomCode, Context.ConnectionId);
        if (playerName != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);
            var room = rooms.GetRoom(roomCode);
            await Clients.Group(roomCode).SendAsync("PlayerLeft", playerName, room?.Players ?? []);
        }
    }
}
