import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, MapPin, GraduationCap, Image, MessageSquare, 
  LogOut, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2, Settings, Palette 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead, Destination, Program, DestinationPlace, GalleryItem, Testimonial, SiteSettings } from "@shared/schema";

type Tab = "dashboard" | "leads" | "destinations" | "programs" | "places" | "gallery" | "testimonials" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user has a token, redirect to login if not
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  const { data: leads, isLoading: leadsLoading, error } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"]
  });

  const { data: destinations, isLoading: destsLoading } = useQuery<Destination[]>({
    queryKey: ["/api/admin/destinations"]
  });

  const { data: programs, isLoading: progsLoading } = useQuery<Program[]>({
    queryKey: ["/api/admin/programs"]
  });

  const { data: galleryItems, isLoading: galleryLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/admin/gallery"]
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"]
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      localStorage.removeItem('admin_token');
      setLocation('/admin/login');
    } catch (err) {
      localStorage.removeItem('admin_token');
      setLocation('/admin/login');
    }
  };

  // Redirect to login on auth error
  useEffect(() => {
    if (error) {
      localStorage.removeItem('admin_token');
      setLocation('/admin/login');
    }
  }, [error, setLocation]);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "destinations", label: "Destinations", icon: MapPin },
    { id: "programs", label: "Programs", icon: GraduationCap },
    { id: "places", label: "Places", icon: Image },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "settings", label: "Brand & Theme", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex justify-center">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logo.png" 
              alt="Edufly Admin" 
              className="w-10 h-10 object-cover rounded-full shadow-lg ring-2 ring-primary/20"
            />
            <span className="text-xl font-bold text-primary font-heading">Edufly Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`button-tab-${tab.id}`}
            >
              <tab.icon size={18} /> {tab.label}
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {activeTab === "dashboard" && (
          <DashboardOverview 
            leadsCount={leads?.length || 0} 
            pendingCount={leads?.filter((l: Lead) => l.status === 'pending').length || 0}
            destinationsCount={destinations?.length || 0}
            programsCount={programs?.length || 0}
          />
        )}
        {activeTab === "leads" && <LeadsPanel leads={leads || []} isLoading={leadsLoading} />}
        {activeTab === "destinations" && <DestinationsPanel destinations={destinations || []} isLoading={destsLoading} />}
        {activeTab === "programs" && <ProgramsPanel programs={programs || []} isLoading={progsLoading} />}
        {activeTab === "places" && <PlacesPanel destinations={destinations || []} />}
        {activeTab === "gallery" && <GalleryPanel items={galleryItems || []} isLoading={galleryLoading} />}
        {activeTab === "testimonials" && <TestimonialsPanel testimonials={testimonials || []} isLoading={testimonialsLoading} />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

function DashboardOverview({ leadsCount, pendingCount, destinationsCount, programsCount }: { 
  leadsCount: number; pendingCount: number; destinationsCount: number; programsCount: number 
}) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Dashboard Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium uppercase">Total Leads</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2" data-testid="text-total-leads">{leadsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium uppercase">Pending Inquiries</h3>
          <p className="text-3xl font-bold text-primary mt-2" data-testid="text-pending-leads">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium uppercase">Destinations</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2" data-testid="text-destinations">{destinationsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium uppercase">Programs</h3>
          <p className="text-3xl font-bold text-green-600 mt-2" data-testid="text-programs">{programsCount}</p>
        </div>
      </div>
    </>
  );
}

function LeadsPanel({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/leads/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Status updated" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Lead deleted" });
      setDeleteId(null);
    }
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Leads</h2>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.email}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.purpose}</td>
                    <td className="px-6 py-4">
                      <Select 
                        value={lead.status || "pending"} 
                        onValueChange={(val) => updateStatusMutation.mutate({ id: lead.id, status: val })}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${lead.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(lead.id)} data-testid={`button-delete-lead-${lead.id}`}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DestinationsPanel({ destinations, isLoading }: { destinations: Destination[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [editDest, setEditDest] = useState<Destination | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", slug: "", overview: "", duration: "", language: "",
    studentExposure: "", academicVisits: "", industryExposure: "", sightseeing: "", imageUrl: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Only PNG, JPEG, and JPG files are allowed", variant: "destructive" });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File size must be less than 10MB", variant: "destructive" });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload/destination', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.imageUrl;

      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const finalData = { ...formData, imageUrl };

      if (editDest) {
        await updateMutation.mutateAsync({ id: editDest.id, data: finalData });
      } else {
        await createMutation.mutateAsync(finalData);
      }
      
      setSelectedFile(null);
    } catch (error) {
      toast({ title: "Failed to save destination", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/admin/destinations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations"] });
      toast({ title: "Destination created" });
      setIsAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      await apiRequest("PUT", `/api/admin/destinations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations"] });
      toast({ title: "Destination updated" });
      setEditDest(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/destinations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations"] });
      toast({ title: "Destination deleted" });
      setDeleteId(null);
    }
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", overview: "", duration: "", language: "", studentExposure: "", academicVisits: "", industryExposure: "", sightseeing: "", imageUrl: "" });
    setSelectedFile(null);
  };

  const openEdit = (dest: Destination) => {
    setEditDest(dest);
    setFormData({
      name: dest.name, slug: dest.slug, overview: dest.overview || "",
      duration: dest.duration || "", language: dest.language || "",
      studentExposure: dest.studentExposure || "", academicVisits: dest.academicVisits || "",
      industryExposure: dest.industryExposure || "", sightseeing: dest.sightseeing || "",
      imageUrl: dest.imageUrl || ""
    });
    setSelectedFile(null);
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Destinations</h2>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} data-testid="button-add-destination">
          <Plus size={18} className="mr-2" /> Add Destination
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : destinations.length > 0 ? (
                destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{dest.name}</td>
                    <td className="px-6 py-4 text-slate-600">{dest.slug}</td>
                    <td className="px-6 py-4 text-slate-600">{dest.duration}</td>
                    <td className="px-6 py-4 text-slate-600">{dest.language}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(dest)} data-testid={`button-edit-dest-${dest.id}`}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(dest.id)} data-testid={`button-delete-dest-${dest.id}`}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No destinations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAdding || !!editDest} onOpenChange={() => { setIsAdding(false); setEditDest(null); resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDest ? "Edit Destination" : "Add Destination"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-dest-name" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} data-testid="input-dest-slug" />
            </div>
            <div>
              <Label>Duration</Label>
              <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} data-testid="input-dest-duration" />
            </div>
            <div>
              <Label>Language</Label>
              <Input value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} data-testid="input-dest-language" />
            </div>
            <div className="col-span-2">
              <Label>Upload Image (PNG, JPEG, JPG - Max 10MB)</Label>
              <Input 
                type="file" 
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
                data-testid="input-dest-file"
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">✓ Selected: {selectedFile.name}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label>Or Image URL</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                data-testid="input-dest-image"
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>
            <div className="col-span-2">
              <Label>Overview</Label>
              <Textarea value={formData.overview} onChange={(e) => setFormData({ ...formData, overview: e.target.value })} rows={4} data-testid="input-dest-overview" />
            </div>
            <div className="col-span-2">
              <Label>Life & Culture (Sightseeing)</Label>
              <Textarea value={formData.sightseeing} onChange={(e) => setFormData({ ...formData, sightseeing: e.target.value })} rows={3} data-testid="input-dest-sightseeing" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditDest(null); resetForm(); }}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-destination"
            >
              {(uploading || createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploading ? 'Uploading...' : (editDest ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Destination?</AlertDialogTitle>
            <AlertDialogDescription>This will also delete all places associated with this destination.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProgramsPanel({ programs, isLoading }: { programs: Program[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [editProg, setEditProg] = useState<Program | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", category: "", description: "", imageUrl: "" });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/admin/programs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      toast({ title: "Program created" });
      setIsAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      await apiRequest("PUT", `/api/admin/programs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      toast({ title: "Program updated" });
      setEditProg(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/programs"] });
      toast({ title: "Program deleted" });
      setDeleteId(null);
    }
  });

  const resetForm = () => setFormData({ title: "", category: "", description: "", imageUrl: "" });

  const openEdit = (prog: Program) => {
    setEditProg(prog);
    setFormData({
      title: prog.title, category: prog.category || "",
      description: prog.description || "", imageUrl: prog.imageUrl || ""
    });
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Programs</h2>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} data-testid="button-add-program">
          <Plus size={18} className="mr-2" /> Add Program
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : programs.length > 0 ? (
                programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{prog.title}</td>
                    <td className="px-6 py-4 text-slate-600">{prog.category}</td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{prog.description}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(prog)} data-testid={`button-edit-prog-${prog.id}`}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(prog.id)} data-testid={`button-delete-prog-${prog.id}`}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No programs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAdding || !!editProg} onOpenChange={() => { setIsAdding(false); setEditProg(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProg ? "Edit Program" : "Add Program"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-prog-title" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} data-testid="input-prog-category" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} data-testid="input-prog-description" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} data-testid="input-prog-image" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditProg(null); }}>Cancel</Button>
            <Button 
              onClick={() => editProg ? updateMutation.mutate({ id: editProg.id, data: formData }) : createMutation.mutate(formData)}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-program"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editProg ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PlacesPanel({ destinations }: { destinations: Destination[] }) {
  const { toast } = useToast();
  const [selectedDest, setSelectedDest] = useState<number | null>(null);
  const [editPlace, setEditPlace] = useState<DestinationPlace | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    slug: "",
    shortDescription: "",
    description: "", 
    culture: "",
    history: "",
    imageUrl: "", 
    galleryImages: "" 
  });

  const { data: places, isLoading } = useQuery<DestinationPlace[]>({
    queryKey: ["/api/admin/destinations", selectedDest, "places"],
    queryFn: async () => {
      if (!selectedDest) return [];
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/destinations/${selectedDest}/places`, { 
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to fetch places");
      return res.json();
    },
    enabled: !!selectedDest
  });

  const createMutation = useMutation({
    mutationFn: async (data: { destinationId: number; name: string; slug: string; shortDescription: string; description: string; culture: string; history: string; imageUrl: string; galleryImages: string[] }) => {
      await apiRequest("POST", "/api/admin/places", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations", selectedDest, "places"] });
      toast({ title: "Place created" });
      setIsAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; slug: string; shortDescription: string; description: string; culture: string; history: string; imageUrl: string; galleryImages: string[] } }) => {
      await apiRequest("PUT", `/api/admin/places/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations", selectedDest, "places"] });
      toast({ title: "Place updated" });
      setEditPlace(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/places/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/destinations", selectedDest, "places"] });
      toast({ title: "Place deleted" });
      setDeleteId(null);
    }
  });

  const resetForm = () => setFormData({ 
    name: "", 
    slug: "",
    shortDescription: "",
    description: "", 
    culture: "",
    history: "",
    imageUrl: "", 
    galleryImages: "" 
  });

  const openEdit = (place: DestinationPlace) => {
    setEditPlace(place);
    setFormData({
      name: place.name,
      slug: place.slug || "",
      shortDescription: place.shortDescription || "",
      description: place.description || "",
      culture: place.culture || "",
      history: place.history || "",
      imageUrl: place.imageUrl || "",
      galleryImages: (place.galleryImages || []).join("\n")
    });
  };

  const handleSave = () => {
    const galleryImages = formData.galleryImages.split("\n").map(s => s.trim()).filter(Boolean);
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (editPlace) {
      updateMutation.mutate({ id: editPlace.id, data: { ...formData, slug, galleryImages } });
    } else if (selectedDest) {
      createMutation.mutate({ destinationId: selectedDest, ...formData, slug, galleryImages });
    }
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Places to Explore</h2>
        {selectedDest && (
          <Button onClick={() => { resetForm(); setIsAdding(true); }} data-testid="button-add-place">
            <Plus size={18} className="mr-2" /> Add Place
          </Button>
        )}
      </div>
      
      <div className="mb-6">
        <Label>Select Destination</Label>
        <Select value={selectedDest?.toString() || ""} onValueChange={(v) => setSelectedDest(Number(v))}>
          <SelectTrigger className="w-64" data-testid="select-destination">
            <SelectValue placeholder="Choose a destination..." />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDest && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                ) : places && places.length > 0 ? (
                  places.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <img src={place.imageUrl || ""} alt={place.name} className="w-16 h-12 object-cover rounded" />
                      </td>
                      <td className="px-6 py-4 font-medium">{place.name}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{place.description}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(place)} data-testid={`button-edit-place-${place.id}`}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(place.id)} data-testid={`button-delete-place-${place.id}`}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No places found for this destination</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isAdding || !!editPlace} onOpenChange={() => { setIsAdding(false); setEditPlace(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlace ? "Edit Place" : "Add Place"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-place-name" placeholder="e.g. Marina Bay Sands" />
              </div>
              <div>
                <Label>Slug (URL-friendly name)</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} data-testid="input-place-slug" placeholder="e.g. marina-bay-sands (auto-generated if empty)" />
              </div>
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} data-testid="input-place-short-desc" placeholder="Brief one-line description for cards" />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} data-testid="input-place-description" placeholder="Detailed overview of the place" />
            </div>
            <div>
              <Label>Culture</Label>
              <Textarea value={formData.culture} onChange={(e) => setFormData({ ...formData, culture: e.target.value })} rows={4} data-testid="input-place-culture" placeholder="Cultural significance, traditions, local customs..." />
            </div>
            <div>
              <Label>History</Label>
              <Textarea value={formData.history} onChange={(e) => setFormData({ ...formData, history: e.target.value })} rows={4} data-testid="input-place-history" placeholder="Historical background, founding story, key events..." />
            </div>
            <div>
              <Label>Main Image URL *</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} data-testid="input-place-image" placeholder="https://images.unsplash.com/..." />
            </div>
            <div>
              <Label>Gallery Images (one URL per line)</Label>
              <Textarea value={formData.galleryImages} onChange={(e) => setFormData({ ...formData, galleryImages: e.target.value })} rows={3} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" data-testid="input-place-gallery" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setEditPlace(null); }}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-place"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editPlace ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Place?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function GalleryPanel({ items, isLoading }: { items: GalleryItem[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", category: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Only PNG, JPEG, JPG, and PDF files are allowed", variant: "destructive" });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({ title: "File size must be less than 10MB", variant: "destructive" });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload/gallery', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/admin/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Gallery item created" });
      setIsAdding(false);
      setFormData({ title: "", imageUrl: "", category: "" });
      setSelectedFile(null);
    }
  });

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.imageUrl;

      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      if (!imageUrl) {
        toast({ title: "Please upload a file or enter an image URL", variant: "destructive" });
        return;
      }

      createMutation.mutate({ ...formData, imageUrl });
    } catch (error) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Gallery item deleted" });
      setDeleteId(null);
    }
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Gallery</h2>
        <Button onClick={() => setIsAdding(true)} data-testid="button-add-gallery">
          <Plus size={18} className="mr-2" /> Add Image
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-4 flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border">
              <img src={item.imageUrl || ""} alt={item.title || ""} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setDeleteId(item.id)} data-testid={`button-delete-gallery-${item.id}`}>
                  <Trash2 size={20} />
                </Button>
              </div>
              <div className="p-2 text-sm truncate">{item.title}</div>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center text-muted-foreground p-8">No gallery items found</div>
        )}
      </div>

      <Dialog open={isAdding} onOpenChange={() => { setIsAdding(false); setSelectedFile(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} data-testid="input-gallery-title" />
            </div>
            <div>
              <Label>Upload File (PNG, JPEG, JPG, PDF - Max 10MB)</Label>
              <Input 
                type="file" 
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                data-testid="input-gallery-file"
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">✓ Selected: {selectedFile.name}</p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <Label>Image URL (Optional)</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                data-testid="input-gallery-url"
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>
            <div>
              <Label>Category (Optional)</Label>
              <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} data-testid="input-gallery-category" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setSelectedFile(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={uploading || createMutation.isPending} data-testid="button-save-gallery">
              {(uploading || createMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploading ? 'Uploading...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TestimonialsPanel({ testimonials, isLoading }: { testimonials: Testimonial[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", content: "", imageUrl: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/jpg'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Only JPEG/JPG files are allowed", variant: "destructive" });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB for testimonials
        toast({ title: "File size must be less than 5MB", variant: "destructive" });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload/gallery', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      let imageUrl = formData.imageUrl;

      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      if (!imageUrl) {
        toast({ title: "Please upload an image or enter an image URL", variant: "destructive" });
        return;
      }

      createMutation.mutate({ ...formData, imageUrl });
    } catch (error) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/admin/testimonials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Testimonial created" });
      setIsAdding(false);
      setFormData({ name: "", role: "", content: "", imageUrl: "" });
      setSelectedFile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Testimonial deleted" });
      setDeleteId(null);
    }
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold font-heading text-slate-900">Manage Testimonials</h2>
        <Button onClick={() => setIsAdding(true)} data-testid="button-add-testimonial">
          <Plus size={18} className="mr-2" /> Add Testimonial
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : testimonials.length > 0 ? (
          testimonials.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-xl border border-border shadow-sm relative">
              <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => setDeleteId(t.id)} data-testid={`button-delete-testimonial-${t.id}`}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
              <div className="flex items-center gap-4 mb-4">
                <img src={t.imageUrl || ""} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <p className="text-slate-600">{t.content}</p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted-foreground p-8">No testimonials found</div>
        )}
      </div>

      <Dialog open={isAdding} onOpenChange={() => { setIsAdding(false); setSelectedFile(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-testimonial-name" />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} data-testid="input-testimonial-role" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={3} data-testid="input-testimonial-content" />
            </div>
            <div>
              <Label>Upload Photo (JPEG/JPG only - Max 5MB)</Label>
              <Input 
                type="file" 
                accept=".jpg,.jpeg"
                onChange={handleFileChange}
                data-testid="input-testimonial-file"
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">✓ Selected: {selectedFile.name}</p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <Label>Image URL (Optional)</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                data-testid="input-testimonial-image"
                placeholder="https://example.com/photo.jpg"
                disabled={!!selectedFile}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAdding(false); setSelectedFile(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={uploading || createMutation.isPending} data-testid="button-save-testimonial">
              {(uploading || createMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploading ? 'Uploading...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { themePresets, type ThemePreset } from "@shared/themes";

function SettingsPanel() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/settings"]
  });

  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      await apiRequest("PUT", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  });

  const applyThemeMutation = useMutation({
    mutationFn: async (themeKey: string) => {
      const res = await apiRequest("POST", "/api/admin/settings/apply-theme", { themeKey });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setFormData({});
      toast({ title: "Theme applied successfully!" });
    },
    onError: (error: Error) => {
      console.error("Apply theme error:", error);
      toast({ title: error.message || "Failed to apply theme", variant: "destructive" });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const currentSettings = { ...settings, ...formData };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Brand & Theme Settings</h2>
          <p className="text-muted-foreground">Switch between Dark and Light mode for the hero section</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending || Object.keys(formData).length === 0} data-testid="button-save-settings">
          {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Theme Mode</h3>
        <div className="flex gap-4">
          {themePresets.map((theme) => (
            <button
              key={theme.key}
              onClick={() => applyThemeMutation.mutate(theme.key)}
              disabled={applyThemeMutation.isPending}
              className={`px-8 py-4 rounded-xl border-2 transition-all text-center ${
                settings?.themeKey === theme.key 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              data-testid={`button-theme-${theme.key}`}
            >
              <div className={`w-12 h-12 mx-auto rounded-full mb-3 ${theme.key === 'dark' ? 'bg-slate-800' : 'bg-amber-100'}`} />
              <div className="font-bold text-lg">{theme.label}</div>
              {settings?.themeKey === theme.key && (
                <div className="text-xs text-primary font-medium mt-1">Active</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Manual Color Customization</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={currentSettings.primaryColor || "#ef6e2d"}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-9 rounded border border-border cursor-pointer"
                  data-testid="input-primary-color"
                />
                <Input 
                  value={currentSettings.primaryColor || "#ef6e2d"} 
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={currentSettings.secondaryColor || "#fdc22c"}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-9 rounded border border-border cursor-pointer"
                  data-testid="input-secondary-color"
                />
                <Input 
                  value={currentSettings.secondaryColor || "#fdc22c"} 
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Accent Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={currentSettings.accentColor || "#178ab6"}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-9 rounded border border-border cursor-pointer"
                  data-testid="input-accent-color"
                />
                <Input 
                  value={currentSettings.accentColor || "#178ab6"} 
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={currentSettings.textColor || "#1e293b"}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-12 h-9 rounded border border-border cursor-pointer"
                  data-testid="input-text-color"
                />
                <Input 
                  value={currentSettings.textColor || "#1e293b"} 
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Hero Section Content</h3>
          
          <div>
            <Label>Badge Text</Label>
            <Input 
              value={currentSettings.heroBadgeText || ""} 
              onChange={(e) => setFormData({ ...formData, heroBadgeText: e.target.value })}
              placeholder="Travel is a University in Itself"
              data-testid="input-hero-badge"
            />
          </div>
          
          <div>
            <Label>Headline</Label>
            <Input 
              value={currentSettings.heroHeadline || ""} 
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              placeholder="Start Here. Go Anywhere."
              data-testid="input-hero-headline"
            />
          </div>
          
          <div>
            <Label>Subtext</Label>
            <Textarea 
              value={currentSettings.heroSubtext || ""} 
              onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })}
              placeholder="We organize well-planned educational tours worldwide..."
              rows={3}
              data-testid="input-hero-subtext"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Button Text</Label>
              <Input 
                value={currentSettings.heroButtonPrimary || ""} 
                onChange={(e) => setFormData({ ...formData, heroButtonPrimary: e.target.value })}
                placeholder="Explore Destinations"
                data-testid="input-hero-button-primary"
              />
            </div>
            <div>
              <Label>Secondary Button Text</Label>
              <Input 
                value={currentSettings.heroButtonSecondary || ""} 
                onChange={(e) => setFormData({ ...formData, heroButtonSecondary: e.target.value })}
                placeholder="Learn More"
                data-testid="input-hero-button-secondary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Contact Information</h3>
          
          <div>
            <Label>Phone Number</Label>
            <Input 
              value={currentSettings.contactPhone || ""} 
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+91 98765 43210"
              data-testid="input-contact-phone"
            />
          </div>
          
          <div>
            <Label>Email Address</Label>
            <Input 
              value={currentSettings.contactEmail || ""} 
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="info@eduflyoverseas.com"
              data-testid="input-contact-email"
            />
          </div>
          
          <div>
            <Label>Address</Label>
            <Textarea 
              value={currentSettings.contactAddress || ""} 
              onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
              placeholder="Chennai, Tamil Nadu, India"
              rows={2}
              data-testid="input-contact-address"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Footer & About</h3>
          
          <div>
            <Label>Footer Tagline</Label>
            <Input 
              value={currentSettings.footerTagline || ""} 
              onChange={(e) => setFormData({ ...formData, footerTagline: e.target.value })}
              placeholder="Your trusted partner for educational travel worldwide."
              data-testid="input-footer-tagline"
            />
          </div>
          
          <div>
            <Label>About Introduction</Label>
            <Textarea 
              value={currentSettings.aboutIntro || ""} 
              onChange={(e) => setFormData({ ...formData, aboutIntro: e.target.value })}
              placeholder="Edufly Overseas is a premier educational travel and tour company..."
              rows={4}
              data-testid="input-about-intro"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg border-b pb-4 mb-6">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Facebook URL</Label>
            <Input 
              value={currentSettings.socialFacebook || ""} 
              onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
              data-testid="input-social-facebook"
            />
          </div>
          <div>
            <Label>Instagram URL</Label>
            <Input 
              value={currentSettings.socialInstagram || ""} 
              onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
              placeholder="https://instagram.com/yourprofile"
              data-testid="input-social-instagram"
            />
          </div>
          <div>
            <Label>LinkedIn URL</Label>
            <Input 
              value={currentSettings.socialLinkedin || ""} 
              onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
              placeholder="https://linkedin.com/company/yourcompany"
              data-testid="input-social-linkedin"
            />
          </div>
          <div>
            <Label>Twitter URL</Label>
            <Input 
              value={currentSettings.socialTwitter || ""} 
              onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
              placeholder="https://twitter.com/yourhandle"
              data-testid="input-social-twitter"
            />
          </div>
          <div>
            <Label>YouTube URL</Label>
            <Input 
              value={currentSettings.socialYoutube || ""} 
              onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
              placeholder="https://youtube.com/yourchannel"
              data-testid="input-social-youtube"
            />
          </div>
        </div>
      </div>

      {/* About Page Content */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg border-b pb-4 mb-6">About Page Content</h3>
        <div className="space-y-4">
          <div>
            <Label>Mission Statement</Label>
            <Textarea 
              value={currentSettings.aboutMission || ""} 
              onChange={(e) => setFormData({ ...formData, aboutMission: e.target.value })}
              placeholder="Our mission is to..."
              rows={3}
              data-testid="input-about-mission"
            />
          </div>
          <div>
            <Label>Vision Statement</Label>
            <Textarea 
              value={currentSettings.aboutVision || ""} 
              onChange={(e) => setFormData({ ...formData, aboutVision: e.target.value })}
              placeholder="Our vision is to..."
              rows={3}
              data-testid="input-about-vision"
            />
          </div>
          <div>
            <Label>Core Values</Label>
            <Textarea 
              value={currentSettings.aboutValues || ""} 
              onChange={(e) => setFormData({ ...formData, aboutValues: e.target.value })}
              placeholder="Our core values include..."
              rows={4}
              data-testid="input-about-values"
            />
          </div>
        </div>
      </div>

      {/* Home Page Content */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg border-b pb-4 mb-6">Home Page Content</h3>
        <div className="space-y-4">
          <div>
            <Label>Features Section Title</Label>
            <Input 
              value={currentSettings.homeFeaturesTitle || ""} 
              onChange={(e) => setFormData({ ...formData, homeFeaturesTitle: e.target.value })}
              placeholder="Why Choose Edufly Overseas"
              data-testid="input-home-features-title"
            />
          </div>
          <div>
            <Label>Features Section Subtitle</Label>
            <Textarea 
              value={currentSettings.homeFeaturesSubtitle || ""} 
              onChange={(e) => setFormData({ ...formData, homeFeaturesSubtitle: e.target.value })}
              placeholder="Experience the difference with our comprehensive educational travel services"
              rows={2}
              data-testid="input-home-features-subtitle"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After saving changes, the website will automatically update with the new theme colors and content. 
          You may need to refresh the page to see the changes.
        </p>
      </div>
    </>
  );
}
