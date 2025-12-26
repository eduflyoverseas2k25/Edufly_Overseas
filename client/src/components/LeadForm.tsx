import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, InsertLead } from "@shared/schema";
import { useCreateLead } from "@/hooks/use-resources";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type LeadFormProps = {
  className?: string;
  defaultPurpose?: string;
};

export function LeadForm({ className, defaultPurpose = "Educational Tour" }: LeadFormProps) {
  const { mutate: createLead, isPending } = useCreateLead();

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      purpose: defaultPurpose,
    },
  });

  function onSubmit(data: InsertLead) {
    createLead(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border/50 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold font-heading text-foreground">Plan Your Educational Tour</h3>
        <p className="text-muted-foreground mt-2">Fill out the form below and our travel experts will help you plan the perfect tour.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className="h-12 rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" className="h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" className="h-12 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interested In</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Educational Tour">Educational Tour</SelectItem>
                    <SelectItem value="School Trip">School Trip</SelectItem>
                    <SelectItem value="College Tour">College / University Tour</SelectItem>
                    <SelectItem value="Custom Group Tour">Custom Group Tour</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              "Request Tour Quote"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
