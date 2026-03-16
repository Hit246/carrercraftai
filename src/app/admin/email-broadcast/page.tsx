'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reusable function to build email HTML from a body string
function buildEmailHTML(bodyContent: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;width:600px;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #f1f5f9;text-align:center;">
              <img src="https://careercraftai.tech/logo.jpg"
                width="48" height="48" style="border-radius:10px;" alt="Logo" />
              <h1 style="color:#0f172a;font-size:22px;margin:16px 0 0;font-weight:700;">CareerCraft AI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#334155;font-size:16px;line-height:1.6;">
              <div style="margin-bottom:20px;">
                ${bodyContent || "<p style='color:#94a3b8;font-style:italic;'>Email content will appear here...</p>"}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://careercraftai.tech/dashboard"
                style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Go to Dashboard →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="color:#64748b;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} CareerCraft AI ·
                <a href="https://careercraftai.tech/privacy" style="color:#3b82f6;text-decoration:none;">Privacy Policy</a> ·
                <a href="https://careercraftai.tech/contact" style="color:#3b82f6;text-decoration:none;">Contact Support</a>
              </p>
              <p style="color:#94a3b8;font-size:11px;margin-top:8px;">
                You received this email because you are a registered user of CareerCraft AI.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default function EmailBroadcastPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-destructive font-bold">Access Denied</p>
        </div>
      </div>
    );
  }

  // For live preview — uses raw body (fine for iframe)
  const previewHTML = buildEmailHTML(body);

  const handleSend = async () => {
    if (!subject || !body) {
      toast({ title: "Validation Error", description: "Subject and body are required", variant: "destructive" });
      return;
    }
    setSending(true);
    setResult(null);

    // Sanitize body FIRST then build final HTML
    const sanitizedBody = body
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .trim();

    const finalHTML = buildEmailHTML(sanitizedBody);

    try {
      const res = await fetch("/api/admin/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          html: finalHTML,
          audience,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setResult({ success: true, message: `Successfully sent to ${data.count} users!` });
          toast({ title: "Broadcast Sent", description: `Sent to ${data.count} users.` });
          setSubject("");
          setBody("");
        } else {
          setResult({ success: false, message: data.error || "Failed to send broadcast" });
          toast({ title: "Error", description: data.error || "Failed to send", variant: "destructive" });
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setResult({ success: false, message: `Server error (${res.status}). Check logs.` });
        toast({ title: "Critical Server Error", description: `Status ${res.status}`, variant: "destructive" });
      }
    } catch (e) {
      console.error("Broadcast failed:", e);
      setResult({ success: false, message: "Network error. Check your connection." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" /> Email Broadcast
          </h1>
          <p className="text-muted-foreground mt-1">Communicate directly with your user base.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left — Compose */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Select your audience and write your message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="free">Free Plan Only</SelectItem>
                  <SelectItem value="essentials">Essentials Plan Only</SelectItem>
                  <SelectItem value="pro">Pro Plan Only</SelectItem>
                  <SelectItem value="recruiter">Recruiter Plan Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 🚀 Big update for your Career!"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body (HTML Supported)</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={15}
                placeholder={`<h2>Hello there,</h2>\n<p>We have exciting news...</p>`}
                className="font-mono text-xs resize-none"
              />
            </div>

            {result && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}>
                {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="text-sm font-medium">{result.message}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide Preview" : "Preview"}
              </Button>
              <Button onClick={handleSend} disabled={sending} className="flex-1 shadow-lg shadow-primary/20">
                {sending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Send Broadcast</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right — Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Live Preview
            </Label>
            <Badge variant="outline" className="bg-muted/50">
              Subject: {subject || "(Empty)"}
            </Badge>
          </div>
          <Card className="overflow-hidden border-2 border-muted h-[700px] shadow-2xl relative">
            <div className="absolute inset-0 bg-muted/5 flex items-center justify-center -z-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/20" />
            </div>
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full"
              title="Email Preview"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}