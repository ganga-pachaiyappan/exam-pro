import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Save } from "lucide-react";
const Settings = () => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        address: user?.address || "",
        phone: user?.phone || "",
    });
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {};
            if (form.name !== user?.name)
                payload.name = form.name;
            if (form.email !== user?.email)
                payload.email = form.email;
            if (form.password)
                payload.password = form.password;
            if (form.address !== user?.address)
                payload.address = form.address;
            if (form.phone !== user?.phone)
                payload.phone = form.phone;
            if (Object.keys(payload).length === 0) {
                toast({ title: "No changes", description: "Nothing to update" });
                setLoading(false);
                return;
            }
            const res = await usersAPI.updateProfile(payload);
            updateUser(res.data);
            setForm((f) => ({ ...f, password: "" }));
            toast({ title: "Updated!", description: "Profile saved successfully" });
        }
        catch (err) {
            toast({ title: "Error", description: err.response?.data?.detail || "Update failed", variant: "destructive" });
        }
        finally {
            setLoading(false);
        }
    };
    const handlePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setPhotoLoading(true);
        try {
            const res = await usersAPI.uploadPhoto(file);
            updateUser(res.data);
            toast({ title: "Photo updated!" });
        }
        catch {
            toast({ title: "Error", description: "Upload failed", variant: "destructive" });
        }
        finally {
            setPhotoLoading(false);
        }
    };
    return (<DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Account Settings</h1>

        {/* Photo */}
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Profile Photo</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.photo_url ? (<img src={`${API_BASE}${user.photo_url}`} alt="" className="h-20 w-20 rounded-full object-cover"/>) : (<div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>)}
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {photoLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Camera className="h-4 w-4"/>}
              </button>
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-heading font-semibold text-foreground">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890"/>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave empty to keep current"/>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address"/>
          </div>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>);
};
export default Settings;
