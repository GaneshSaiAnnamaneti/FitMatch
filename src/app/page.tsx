
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { analyzeDocuments } from "@/app/actions";
import { type GenerateFitReportOutput } from "@/ai/flows/generate-fit-report";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Loader2, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ReportDisplay } from "@/components/report-display";
import { Label } from "@/components/ui/label";

const FormSchema = z.object({
  resumeText: z.string().min(50, "Resume text must be at least 50 characters."),
  jobDescriptionText: z.string().min(50, "Job description must be at least 50 characters."),
});


type FormValues = z.infer<typeof FormSchema>;

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<GenerateFitReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      resumeText: "",
      jobDescriptionText: "",
    },
  });
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const { data: result, error } = await analyzeDocuments({
        resumeText: data.resumeText,
        jobDescriptionText: data.jobDescriptionText,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error,
        });
      } else if (result) {
        setAnalysisResult(result);
      }
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "An unexpected error occurred", description: err.message || "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    form.reset();
    setAnalysisResult(null);
  }

  const { errors } = form.formState;

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="container mx-auto px-4 py-6 flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">FitMatch.AI</h1>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-foreground">
            Unlock Your Career Potential
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Paste your resume and a job description to get an AI-powered analysis of your fit, instantly.
          </p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="resumeText" className="text-lg font-semibold">Your Resume</Label>
              <Textarea
                  id="resumeText"
                  placeholder="Paste your resume..."
                  className="min-h-[300px] text-sm shadow-sm"
                  {...form.register("resumeText")}
                  />
              {errors.resumeText && (
                <p className="text-sm text-destructive mt-2">{errors.resumeText.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescriptionText" className="text-lg font-semibold">Job Description</Label>
              <Textarea
                  id="jobDescriptionText"
                  placeholder="Paste the job description..."
                  className="min-h-[300px] text-sm shadow-sm"
                  {...form.register("jobDescriptionText")}
                  />
              {errors.jobDescriptionText && (
                <p className="text-sm text-destructive mt-2">{errors.jobDescriptionText.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            <Button type="submit" size="lg" disabled={isLoading} className="w-full max-w-xs text-base">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Analyzing..." : "Analyze Fit"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleClearAll} disabled={isLoading} className="text-base">
              <Trash2 className="mr-2 h-5 w-5" />
              Clear All
            </Button>
          </div>
        </form>

        {(isLoading || analysisResult) && <Separator className="my-12" />}

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="animate-in fade-in-50 duration-500">
            <ReportDisplay report={analysisResult} />
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} FitMatch.AI. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
