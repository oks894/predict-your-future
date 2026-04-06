import React, { useState } from "react";
import { ShieldAlert, Trash2, Edit2, Download, Search, ImageIcon } from "lucide-react";
import type { ScanEntry } from "@/lib/storage";
import { updateEntry, deleteEntry, exportToCSV } from "@/lib/storage";

interface Props {
  entries: ScanEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AdminEntries = ({ entries, isLoading, onRefresh }: Props) => {
  const [search, setSearch] = useState("");
  const [editingEntry, setEditingEntry] = useState<ScanEntry | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.crushName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this prophecy? Cannot be undone.")) {
      await deleteEntry(id);
      onRefresh();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    setSavingId(editingEntry.id);
    await updateEntry(editingEntry.id, {
      name: editingEntry.name,
      crushName: editingEntry.crushName,
      roastText: editingEntry.roastText,
      aura: editingEntry.aura,
      dareStatus: editingEntry.dareStatus
    });
    setSavingId(null);
    setEditingEntry(null);
    onRefresh();
  };

  return (
    <div>
      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or target..."
            className="w-full pl-11 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-all font-mono text-sm shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isLoading && (
             <div className="text-primary text-sm flex items-center gap-2 mr-2">
               <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
               Syncing...
             </div>
          )}
          <button
            onClick={() => exportToCSV(entries)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Edit Modal (Deep Edit) */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
          <div className="bg-black/60 border border-white/10 rounded-3xl w-full max-w-2xl p-6 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🧬</span>
              <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase glow-gold">Deep Edit Prophecy</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-2">Subject Name</label>
                <input 
                  value={editingEntry.name} 
                  onChange={e => setEditingEntry({...editingEntry, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-2">Target Crush</label>
                <input 
                  value={editingEntry.crushName} 
                  onChange={e => setEditingEntry({...editingEntry, crushName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-2">Aura Override</label>
                <input 
                  type="number"
                  value={editingEntry.aura || 0} 
                  onChange={e => setEditingEntry({...editingEntry, aura: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-2">Dare Status Override</label>
                <select 
                  value={editingEntry.dareStatus || 'pending'} 
                  onChange={e => setEditingEntry({...editingEntry, dareStatus: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 [&>option]:bg-black"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed (+Aura)</option>
                  <option value="failed">Failed (-Aura)</option>
                  <option value="chickened">Chickened (-Aura)</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="pending_removal">Pending Removal</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-2">AI Roast Text</label>
              <textarea 
                value={editingEntry.roastText} 
                onChange={e => setEditingEntry({...editingEntry, roastText: e.target.value})}
                rows={6}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-[1] px-4 py-4 bg-white/5 border border-white/10 text-muted-foreground rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingId === editingEntry.id}
                className="flex-[2] px-4 py-4 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest glow-box-gold transition-all hover:-translate-y-1 text-sm disabled:opacity-50"
              >
                {savingId === editingEntry.id ? "Saving System Override..." : "Execute Override"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white/5 backdrop-blur-xl border-[0.5px] border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-primary/70 border-b border-white/10 uppercase tracking-widest text-[10px] font-black">
              <tr>
                <th className="py-5 px-6">Type Data</th>
                <th className="py-5 px-6">Subject</th>
                <th className="py-5 px-6">Target Crush</th>
                <th className="py-5 px-6 max-w-xs">AI Prophecy Overview</th>
                <th className="py-5 px-6">Aura & Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-6">
                    {e.scanType === 'love' ? (
                      <span className="px-3 py-1.5 bg-[#F43F5E]/20 text-[#F43F5E] rounded-full text-[10px] font-black uppercase tracking-wider">LOVE</span>
                    ) : (
                      <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">FUTURE</span>
                    )}
                    <div className="text-xs font-mono mt-3 text-primary/80 glow-gold">{e.roastPercentage || 0}% FAIL</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img src={e.facePhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shadow-[0_0_15px_rgba(230,194,122,0.3)]" loading="lazy" />
                      <div>
                        <p className="font-bold text-foreground font-heading tracking-wide">{e.name}</p>
                        <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase mt-1">Age {e.age}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {e.crushPhoto ? (
                      <div className="flex items-center gap-4">
                        <img src={e.crushPhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#F43F5E]/40" loading="lazy" />
                        <div>
                          <p className="font-bold text-foreground font-heading tracking-wide">{e.crushName}</p>
                          <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase mt-1">Age {e.crushAge}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-foreground font-heading tracking-wide">{e.crushName}</p>
                        <p className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase mt-1">Age {e.crushAge}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 max-w-xs xl:max-w-md">
                    <p className="truncate text-foreground/60 font-medium group-hover:text-foreground/90 transition-colors leading-relaxed" title={e.roastText}>
                      {e.roastText}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    {e.aura !== undefined ? (
                      <div className="flex flex-col gap-2">
                        <span className="font-black font-mono text-sm tracking-widest drop-shadow-md" style={{ color: e.aura >= 100 ? '#C084FC' : e.aura >= 0 ? '#FB923C' : '#F87171' }}>
                          {e.aura} AURA
                        </span>
                        {e.dareStatus && (
                          <span className={`text-[9px] px-2.5 py-1 rounded-full inline-block w-fit uppercase font-black tracking-widest ${
                            e.dareStatus === 'completed' ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30' :
                            e.dareStatus === 'failed' || e.dareStatus === 'chickened' ? 'bg-[#f87171]/20 text-[#f87171] border border-[#f87171]/30' :
                            'bg-primary/20 text-primary border border-primary/30'
                          }`}>
                            {e.dareStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Legacy</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-2"> 
                    <button
                      onClick={() => setEditingEntry(e)}
                      className="p-3 bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 rounded-xl transition-all"
                      title="Deep Edit Prophecy"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(e.id)}
                      disabled={isLoading}
                      className="p-3 bg-white/5 border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Purge Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-muted-foreground">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" />
                        <span className="uppercase tracking-widest font-bold text-xs">Syncing Multiverse...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Search className="w-16 h-16 text-muted-foreground/20" />
                        <p className="uppercase tracking-widest font-bold text-xs opacity-50">No prophecies discovered.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEntries;
