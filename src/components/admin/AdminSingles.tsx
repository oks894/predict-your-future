import React, { useState } from "react";
import { Trash2, Edit2, Download, Search } from "lucide-react";
import type { SingleEntry } from "@/lib/storage";
import { deleteSingle, updateSingleDare } from "@/lib/storage";

interface Props {
  singles: SingleEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AdminSingles = ({ singles, isLoading, onRefresh }: Props) => {
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState<SingleEntry | null>(null);

  const filtered = singles.filter(s =>
    s.friendName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this single expose?")) {
      await deleteSingle(id);
      onRefresh();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    await updateSingleDare(editingEntry.id, {
      dareStatus: editingEntry.dareStatus,
      shameReason: editingEntry.shameReason
    });
    setEditingEntry(null);
    onRefresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exposed singles..."
            className="w-full pl-11 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-all font-mono text-sm"
          />
        </div>
      </div>

      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
          <div className="bg-black/60 border border-white/10 rounded-3xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl">
            <h2 className="font-heading text-2xl font-black text-foreground mb-4">Edit Single Status</h2>
            
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase mb-2">Takedown Status</label>
              <select 
                value={editingEntry.dareStatus || 'pending'} 
                onChange={e => setEditingEntry({...editingEntry, dareStatus: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm focus:outline-none [&>option]:bg-black"
              >
                <option value="pending">Public</option>
                <option value="pending_removal">Pending Removal (Under Review)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase mb-2">Coward Proof / Reason</label>
              <textarea 
                value={editingEntry.shameReason || ''} 
                onChange={e => setEditingEntry({...editingEntry, shameReason: e.target.value})}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-muted-foreground rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-xl font-bold"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-accent/70 border-b border-white/10 uppercase tracking-widest text-[10px] font-black">
            <tr>
              <th className="py-5 px-6">Singles Data</th>
              <th className="py-5 px-6">Photos</th>
              <th className="py-5 px-6">Bio / Talent</th>
              <th className="py-5 px-6">Review Status</th>
              <th className="py-5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                <td className="py-4 px-6">
                  <p className="font-bold text-foreground font-heading tracking-wide mb-1">{s.friendName}</p>
                  <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Age {s.age}</p>
                  <p className="text-muted-foreground text-[10px] font-mono tracking-widest mt-1 text-primary">{s.phoneNo}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex -space-x-4">
                    {s.photos?.map((p, i) => (
                      <img key={i} src={p} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-accent/40" loading="lazy" />
                    ))}
                  </div>
                </td>
                <td className="py-4 px-6 max-w-xs">
                  <p className="truncate text-foreground/80 italic text-xs">{s.talent}</p>
                </td>
                <td className="py-4 px-6">
                   {s.dareStatus === 'pending_removal' ? (
                      <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 rounded-lg text-xs font-bold inline-block">
                        UNDER REVIEW
                        <p className="text-[10px] font-mono mt-1 opacity-80 break-all">{s.shameReason}</p>
                      </div>
                   ) : (
                      <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest text-green-500">Live</span>
                   )}
                </td>
                <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                  <button 
                    onClick={() => setEditingEntry(s)}
                    className="p-3 bg-white/5 border border-white/10 text-muted-foreground hover:text-accent hover:border-accent/30 hover:bg-accent/10 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="p-3 bg-white/5 border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                 <td colSpan={5} className="py-20 text-center text-muted-foreground">No singles exposed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSingles;
