export default function RoomMembers({ users = [], currentUserId, isHost, socket, roomId }) {
  const makeModerator = (u) => socket.emit('assign_role', { roomId, userId: u.userId, role: u.role === 'Moderator'? 'Participant' : 'Moderator' });
  const removeUser = (u) => { if(confirm(`Remove ${u.username}?`)) socket.emit('remove_participant', { roomId, userId: u.userId }); };

  return (
    <div className="p-4 border-b border-zinc-800">
      <h3 className="font-bold mb-3 text-white">Members ({users.length})</h3>
      <div className="space-y-2">
        {users.map((u,i)=>(
          <div key={i} className="flex items-center justify-between bg-black p-2 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">{u.username?.[0]}</div>
              <span className="text-zinc-300">{u.username}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role==='Host'?'bg-yellow-600':'bg-zinc-700'}`}>{u.role}</span>
            </div>
            {isHost && u.userId!== currentUserId && (
              <div className="flex gap-1">
                <button onClick={()=>makeModerator(u)} className="text-[10px] bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700">{u.role==='Moderator'?'Demote':'Make Mod'}</button>
                <button onClick={()=>removeUser(u)} className="text-[10px] bg-red-900 px-2 py-1 rounded hover:bg-red-800">Kick</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}