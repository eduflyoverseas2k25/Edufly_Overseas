import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

// Token management
export function getAuthToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('admin_token');
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function useAdminLogin() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch(api.admin.login.path, {
        method: api.admin.login.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      toast({
        title: "Welcome back",
        description: "Logged in successfully",
      });
      window.location.href = '/admin';
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: [api.admin.leadsList.path],
    queryFn: async () => {
      const res = await fetch(api.admin.leadsList.path, { 
        headers: getAuthHeaders()
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    retry: false,
  });
}

export function useAdminLogout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to logout');
      return res.json();
    },
    onSuccess: () => {
      clearAuthToken();
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation('/admin/login');
    }
  });
}

export function useCheckAuth() {
  return useQuery({
    queryKey: ['admin-auth-check'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return { authenticated: false };
      
      const res = await fetch('/api/admin/check-auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) return { authenticated: false };
      return res.json();
    },
    retry: false,
    staleTime: 30000,
  });
}
