export default function RoomMembers({ users = [] }) {
  const list = users || [];
  return (
    <div className="p-4 border-b border-zinc-800">
      <h3 className="font-bold mb-3 text-white">Members ({list.length})</h3>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-zinc-500">No members yet</p>}
        {list.map((u, i) => {
          const name = typeof u === 'string'? u : (u.username || u.name || JSON.stringify(u));
          return (
            <div key={i} className="flex items-center gap-2 text-sm bg-black p-2 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">{name[0]?.toUpperCase()}</div>
              <span className="text-zinc-300">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}