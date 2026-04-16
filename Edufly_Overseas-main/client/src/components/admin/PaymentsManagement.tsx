import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, DollarSign, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: number;
  name: string;
  phone: string;
  program: string;
  total_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
  payment_type?: string;
  amount: number; // legacy field
  payment_id?: string;
  order_id: string;
  status: string;
  refund_id?: string;
  created_at: string;
}

interface PaymentsResponse {
  payments: Payment[];
  duplicatePhones: string[];
}

export function PaymentsManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [refundId, setRefundId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<PaymentsResponse>({
    queryKey: ["/api/admin/payments", { status: statusFilter !== 'all' ? statusFilter : undefined, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `/api/admin/payments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest("GET", url);
      return response;
    }
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await apiRequest("POST", `/api/payment/refund/${paymentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({ title: "Refund processed successfully" });
      setRefundId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Refund failed", 
        description: error.message || "Unable to process refund",
        variant: "destructive"
      });
      setRefundId(null);
    }
  });

  const payments = data?.payments || [];
  const duplicatePhones = data?.duplicatePhones || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toLocaleString('en-IN')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDuplicatePayment = (phone: string) => {
    return duplicatePhones.includes(phone);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-slate-900">Payment Reconciliation</h2>
            <p className="text-sm text-slate-600 mt-1">Track and manage all payments</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
            <div className="text-sm text-slate-600">Total Payments</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{payments.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
            <div className="text-sm text-green-700">Successful</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {payments.filter(p => p.status === 'success').length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-sm text-blue-700">Total Revenue</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{formatAmount(totalRevenue)}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
            <div className="text-sm text-red-700">Refunded</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{formatAmount(totalRefunded)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-border shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Paid</th>
                <th className="px-6 py-4">Remaining</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={11} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className={`hover:bg-slate-50 ${isDuplicatePayment(payment.phone) ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-6 py-4 font-medium">
                      {payment.name}
                      {isDuplicatePayment(payment.phone) && (
                        <span className="ml-2 text-xs text-yellow-700 font-normal">⚠️ Duplicate</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{payment.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{payment.program}</td>
                    <td className="px-6 py-4 font-semibold">{formatAmount(payment.total_amount || payment.amount)}</td>
                    <td className="px-6 py-4 font-semibold text-green-700">{formatAmount(payment.paid_amount || payment.amount)}</td>
                    <td className="px-6 py-4 font-semibold text-orange-700">{formatAmount(payment.remaining_amount || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.payment_type === 'full' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {payment.payment_type === 'full' ? 'FULL' : 'PART'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {payment.payment_id ? payment.payment_id.substring(0, 20) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(payment.created_at)}</td>
                    <td className="px-6 py-4">
                      {payment.status === 'success' && !payment.refund_id && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => setRefundId(payment.payment_id || null)}
                        >
                          <DollarSign size={12} className="mr-1" />
                          Refund
                        </Button>
                      )}
                      {payment.status === 'refunded' && (
                        <span className="text-xs text-gray-500">Refunded</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={11} className="p-8 text-center text-slate-600">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={!!refundId} onOpenChange={() => setRefundId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-600" />
              Process Refund?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will initiate a refund for this payment. The amount will be credited back to the customer's account.
              <br /><br />
              <strong>Payment ID:</strong> {refundId}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => refundId && refundMutation.mutate(refundId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Process Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
