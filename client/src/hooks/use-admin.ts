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

export function useAdminLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch(api.admin.login.path, {
        method: api.admin.login.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      
      return res.json();
    },
    onSuccess: () => {
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
      const res = await fetch(api.admin.leadsList.path, { credentials: 'include' });
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
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to logout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation('/admin/login');
    }
  });
}
