export default function RoomMembers({ users = [] }) {
  return (
    <div className="p-4 border-b border-zinc-800">
      <h3 className="font-bold mb-2">Members ({users.length})</h3>
      <div className="space-y-1">
        {users.map((u, i) => (
          <div key={i} className="text-sm text-zinc-400">
            {u.username || u}
          </div>
        ))}
      </div>
    </div>
  );
}