import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  name: string;
  phone: string;
  grade?: string;
  program?: string;
  status: string;
  created_at: string;
}

interface LeadsManagementProps {
  leads: Lead[];
  isLoading: boolean;
}

export function LeadsManagement({ leads, isLoading }: LeadsManagementProps) {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/leads/${id}`, { status });
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

  const getWhatsAppUrl = (lead: Lead, messageType: 'reminder' | 'part_payment' | 'final_payment') => {
    const messages = {
      reminder: `Hi ${lead.name},\nThis is a reminder regarding the NASA Educational Tour.\nPlease let us know if you'd like to proceed with registration/payment.`,
      part_payment: `Hi ${lead.name},\nYour seat for the NASA program can be secured with an initial payment.\nPlease complete the payment to confirm your slot.`,
      final_payment: `Hi ${lead.name},\nKindly complete your remaining payment for the NASA Educational Tour.\nLet us know if you need assistance.`
    };
    
    return `https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(messages[messageType])}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'partially_paid': return 'bg-orange-100 text-orange-800';
      case 'fully_paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Lead Management</h2>
          <p className="text-sm text-slate-600 mt-1">Manage student inquiries and follow-ups</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">WhatsApp Actions</th>
                <th className="px-6 py-4">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{lead.name}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.grade || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{lead.program || 'NASA'}</td>
                    <td className="px-6 py-4">
                      <Select 
                        value={lead.status || "new"} 
                        onValueChange={(val) => updateStatusMutation.mutate({ id: lead.id, status: val })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              New
                            </span>
                          </SelectItem>
                          <SelectItem value="contacted">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              Contacted
                            </span>
                          </SelectItem>
                          <SelectItem value="partially_paid">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                              Partially Paid
                            </span>
                          </SelectItem>
                          <SelectItem value="fully_paid">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Fully Paid
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => window.open(getWhatsAppUrl(lead, 'reminder'), '_blank')}
                        >
                          <MessageCircle size={12} className="mr-1" />
                          Reminder
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => window.open(getWhatsAppUrl(lead, 'part_payment'), '_blank')}
                        >
                          <MessageCircle size={12} className="mr-1" />
                          Part Payment
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => window.open(getWhatsAppUrl(lead, 'final_payment'), '_blank')}
                        >
                          <MessageCircle size={12} className="mr-1" />
                          Final Payment
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(lead.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This lead will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
