using System.Collections.Concurrent;

namespace TypeRacer.Services;

public class RoomPlayer
{
    public string ConnectionId { get; set; } = "";
    public string Name { get; set; } = "";
    public int Progress { get; set; }
    public int Wpm { get; set; }
    public bool Finished { get; set; }
    public int? Place { get; set; }
}

public class GameRoom
{
    public string Code { get; set; } = "";
    public string HostConnectionId { get; set; } = "";
    public string Status { get; set; } = "waiting"; // waiting, countdown, playing, finished
    public string? SentenceText { get; set; }
    public List<RoomPlayer> Players { get; set; } = [];
}

public class GameRoomService
{
    private readonly ConcurrentDictionary<string, GameRoom> _rooms = new();
    private readonly ConcurrentDictionary<string, string> _playerRooms = new(); // connectionId → roomCode

    public GameRoom CreateRoom(string connectionId, string playerName)
    {
        var code = GenerateCode();
        var room = new GameRoom
        {
            Code = code,
            HostConnectionId = connectionId,
            Players = [new RoomPlayer { ConnectionId = connectionId, Name = playerName }]
        };
        _rooms[code] = room;
        _playerRooms[connectionId] = code;
        return room;
    }

    public GameRoom? JoinRoom(string code, string connectionId, string playerName)
    {
        if (!_rooms.TryGetValue(code, out var room)) return null;
        if (room.Status != "waiting") return null;
        if (room.Players.Any(p => p.ConnectionId == connectionId)) return room;

        room.Players.Add(new RoomPlayer { ConnectionId = connectionId, Name = playerName });
        _playerRooms[connectionId] = code;
        return room;
    }

    public GameRoom? GetRoom(string code) =>
        _rooms.TryGetValue(code, out var room) ? room : null;

    public string? GetPlayerRoom(string connectionId) =>
        _playerRooms.TryGetValue(connectionId, out var code) ? code : null;

    public string? RemovePlayer(string code, string connectionId)
    {
        if (!_rooms.TryGetValue(code, out var room)) return null;
        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        if (player == null) return null;

        room.Players.Remove(player);
        _playerRooms.TryRemove(connectionId, out _);

        if (room.Players.Count == 0)
            _rooms.TryRemove(code, out _);
        else if (room.HostConnectionId == connectionId)
            room.HostConnectionId = room.Players[0].ConnectionId;

        return player.Name;
    }

    private static string GenerateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return new string(Enumerable.Range(0, 6).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
    }
}
