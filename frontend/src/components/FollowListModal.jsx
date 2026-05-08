import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const FollowListModal = ({ open, onClose, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}/${type}`)
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open, userId, type]);

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-1 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              {type === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <Avatar className="w-9 h-9 rounded-full border border-border">
                  {u.avatar_url ? (
                    <AvatarImage src={u.avatar_url} alt={u.full_name || u.username} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-base bg-secondary">🧑‍💻</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {u.full_name || u.username || "User"}
                  </p>
                  {u.username && u.full_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">@{u.username}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListModal;
