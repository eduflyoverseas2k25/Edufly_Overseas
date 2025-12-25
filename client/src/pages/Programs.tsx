import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usePrograms } from "@/hooks/use-resources";
import { Loader2, BookOpen } from "lucide-react";

export default function Programs() {
  const { data: programs, isLoading } = usePrograms();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Tour Programs</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Educational tour packages designed for schools, colleges, and universities.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="section-padding">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs?.map((program) => (
                <div key={program.id} className="bg-white p-8 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all group">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2 text-primary">{program.category}</h3>
                  <h4 className="text-lg font-semibold mb-4 text-slate-900">{program.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description || "Carefully curated tour experiences with cultural immersion and educational activities."}
                  </p>
                </div>
              ))}
              
              {programs?.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-lg text-muted-foreground">No programs found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
