"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Play, Plus, Loader2 } from "lucide-react";

interface Template {
  id: number;
  name: string;
  description: string;
  html_content: string;
}

export default function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Assuming backend runs on localhost:8000
      const response = await fetch("http://localhost:8000/templates/");
      const data = await response.json();
      setTemplates(data.items || []);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setLoading(false);
    }
  };

  const getRequiredVariables = (html: string): string[] => {
    if (!html) return [];
    // Match anything between {{ and }}
    const matches = html.match(/\{\{\s*[\w_]+\s*\}\}/g);
    if (!matches) return [];
    const vars = matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
    return [...new Set(vars)];
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    try {
      const response = await fetch(`http://localhost:8000/templates/${selectedTemplate.id}/generate?format=html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: variables }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_Report.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setGenerating(false);
      setSelectedTemplate(null);
      setVariables({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">EvoRise Solutions</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Corporate Reports</h2>
          <p className="text-gray-500 mt-2">Select a template to generate a new report.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const reqVars = getRequiredVariables(template.html_content);
              return (
                <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Variables:</span> {reqVars.length > 0 ? reqVars.join(", ") : "None"}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <Dialog open={selectedTemplate?.id === template.id} onOpenChange={(open) => {
                      if (open) {
                        setSelectedTemplate(template);
                        setVariables({});
                      } else {
                        setSelectedTemplate(null);
                      }
                    }}>
                      <DialogTrigger render={<Button className="w-full gap-2"><Play className="w-4 h-4" />Use Template</Button>} />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate {template.name}</DialogTitle>
                          <DialogDescription>
                            Fill in the required variables to generate this report.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                          {reqVars.map((v) => (
                            <div key={v} className="flex flex-col gap-2">
                              <Label htmlFor={v} className="capitalize">
                                {v.replace(/_/g, " ")}
                              </Label>
                              <Input
                                id={v}
                                value={variables[v] || ""}
                                onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                                placeholder={`Enter ${v.replace(/_/g, " ")}...`}
                              />
                            </div>
                          ))}
                          {reqVars.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              This template doesn't require any variables.
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleGenerate} disabled={generating}>
                            {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Download className="w-4 h-4 mr-2" />
                            Generate Report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              );
            })}
            
            {templates.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                <p className="text-gray-500 mt-1">Get started by creating your first report template in the backend.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
