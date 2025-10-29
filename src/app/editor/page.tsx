"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ItemControls } from "@/components/editor/ItemControls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { MapPin, Mail, Phone, Globe, Linkedin } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type BaseSection = {
  id: string;
  title: string;
  placement: "left" | "right"; // used for split layout
};

type TextSection = BaseSection & {
  type: "text";
  content: string;
};

type ListSection = BaseSection & {
  type: "list";
  content: string; // newline-separated
};

type ExperienceItem = {
  company: string;
  role: string;
  from: string;
  to: string;
  bullets: string; // newline-separated
};

type ExperienceSection = BaseSection & {
  type: "experience";
  items: ExperienceItem[];
};

type EducationItem = {
  school: string;
  degree: string;
  from: string;
  to: string;
};

type EducationSection = BaseSection & {
  type: "education";
  items: EducationItem[];
};

type SkillsSection = BaseSection & {
  type: "skills";
  skills: string[]; // simple chips
};

type ResumeSection = TextSection | ListSection | ExperienceSection | EducationSection | SkillsSection;

export default function EditorPage() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<{ kind: "exp" | "edu" | "list" | "skill" | null; sectionId?: string; from: number } | null>(null);
  const [layout, setLayout] = useState<"split" | "classic" | "hybrid">("split");
  const [font, setFont] = useState("Nunito");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [showPhoto, setShowPhoto] = useState(true);
  const [theme, setTheme] = useState<{ name: string; color: string }>(
    { name: "pink", color: "#c026d3" }
  );
  const [name, setName] = useState("Your Name");
  const [role, setRole] = useState("Your Role");
  const [location, setLocation] = useState("City");
  const [email, setEmail] = useState("you@email.com");
  const [phone, setPhone] = useState("+123456789");

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: "about", title: "About Me", type: "text", content: "", placement: "right" },
    { id: "work", title: "Experience", type: "experience", items: [{ company: "Company", role: "Role", from: "From", to: "Until", bullets: "Add bullet points here..." }], placement: "right" },
    { id: "education", title: "Education", type: "education", items: [{ school: "School", degree: "Degree", from: "From", to: "Until" }], placement: "right" },
    { id: "skills", title: "Skills", type: "skills", skills: ["Skill"], placement: "left" },
  ]);

  const [visible, setVisible] = useState<Record<string, boolean>>({
    picture: true,
    about: true,
    work: true,
    education: true,
    skills: true,
    location: true,
    email: true,
    phone: true,
  });

  const [newSectionType, setNewSectionType] = useState<"text" | "list">("text");
  const [newSectionPlacement, setNewSectionPlacement] = useState<"left" | "right">("right");

  const updateTextLikeSection = (id: string, content: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.type === "text" || s.type === "list") return { ...s, content } as typeof s;
      return s;
    }));
  };

  const addExperienceItem = () => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: [...s.items, { company: "Company", role: "Role", from: "From", to: "Until", bullets: "" }],
    } : s));
  };

  const updateExperienceItem = (index: number, patch: Partial<ExperienceItem>) => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: s.items.map((it, i) => i === index ? { ...it, ...patch } : it),
    } : s));
  };

  const insertExperienceAfter = (index: number) => {
    setSections(prev => prev.map(s => s.type === "experience" ? {
      ...s,
      items: s.items.toSpliced(index + 1, 0, { company: "Company", role: "Role", from: "From", to: "Until", bullets: "" }),
    } : s));
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      const next = [...s.items];
      const j = index + direction;
      if (j < 0 || j >= next.length) return s;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...s, items: next };
    }));
  };

  const removeExperience = (index: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      if (s.items.length <= 1) return s; // keep at least one
      return { ...s, items: s.items.filter((_, i)=> i !== index) };
    }));
  };

  const addEducationItem = () => {
    setSections(prev => prev.map(s => s.type === "education" ? {
      ...s,
      items: [...s.items, { school: "School", degree: "Degree", from: "From", to: "Until" }],
    } : s));
  };

  const updateEducationItem = (index: number, patch: Partial<EducationItem>) => {
    setSections(prev => prev.map(s => s.type === "education" ? {
      ...s,
      items: s.items.map((it, i) => i === index ? { ...it, ...patch } : it),
    } : s));
  };

  const insertEducationAfter = (index: number) => {
    setSections(prev => prev.map(s => s.type === "education" ? ({
      ...s,
      items: s.items.toSpliced(index + 1, 0, { school: "School", degree: "Degree", from: "From", to: "Until" })
    }) : s));
  };

  const moveEducation = (index: number, direction: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      const next = [...s.items];
      const j = index + direction;
      if (j < 0 || j >= next.length) return s;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...s, items: next };
    }));
  };

  const removeEducation = (index: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      if (s.items.length <= 1) return s; // keep at least one
      return { ...s, items: s.items.filter((_, i)=> i !== index) };
    }));
  };

  const addSkill = (value: string) => {
    if (!value.trim()) return;
    setSections(prev => prev.map(s => s.type === "skills" ? { ...s, skills: [...s.skills, value.trim()] } : s));
  };
  const removeSkill = (idx: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "skills") return s;
      if (s.skills.length <= 1) return s; // keep at least one
      return { ...s, skills: s.skills.filter((_, i) => i !== idx) };
    }));
  };

  const reorderExperience = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "experience") return s;
      const next = [...s.items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, items: next };
    }));
  };

  const reorderEducation = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "education") return s;
      const next = [...s.items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, items: next };
    }));
  };

  const reorderListLine = (sectionId: string, from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      const [moved] = lines.splice(from, 1);
      lines.splice(to, 0, moved);
      return { ...s, content: lines.join("\n") };
    }));
  };

  const reorderSkill = (from: number, to: number) => {
    setSections(prev => prev.map(s => {
      if (s.type !== "skills") return s;
      const next = [...s.skills];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...s, skills: next };
    }));
  };

  const exportPdf = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 64;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 32, 32, imgWidth, imgHeight);
    pdf.save("resume.pdf");
  };

  // Reusable helpers for list-type subsection lines (for list sections)
  const updateListLine = (sectionId: string, index: number, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      lines[index] = value;
      return { ...s, content: lines.join("\n") };
    }));
  };
  const moveListLine = (sectionId: string, index: number, dir: -1 | 1) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      const j = index + dir;
      if (j < 0 || j >= lines.length) return s;
      [lines[index], lines[j]] = [lines[j], lines[index]];
      return { ...s, content: lines.join("\n") };
    }));
  };
  const insertListLineAfter = (sectionId: string, index: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = s.content ? s.content.split(/\n+/) : [];
      lines.splice(index + 1, 0, "New item");
      return { ...s, content: lines.join("\n") };
    }));
  };
  const removeListLine = (sectionId: string, index: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId || s.type !== "list") return s;
      const lines = (s.content ? s.content.split(/\n+/) : []);
      if (lines.length <= 1) return { ...s, content: lines[0] ?? "Item" };
      const next = lines.filter((_, i) => i !== index);
      return { ...s, content: next.join("\n") };
    }));
  };

  const aiBulletsForExperience = async (i: number) => {
    const item = (sections.find(s=> s.type==='experience') as ExperienceSection)?.items[i];
    const prompt = `${item?.company ?? ''} ${item?.role ?? ''}. Write resume bullets.`;
    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "bullets", input: prompt }) });
    const data = await res.json();
    updateExperienceItem(i, { bullets: String(data.text ?? "") });
  };

  return (
    <div className="h-[100dvh] grid grid-rows-[auto,1fr]">
      {/* Top toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-background">
        <div className="font-semibold">ResumeMaker.Online</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Color</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 p-2">
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: "blue", color: "#2563eb" },
                { name: "pink", color: "#c026d3" },
                { name: "green", color: "#16a34a" },
                { name: "orange", color: "#ea580c" },
                { name: "black", color: "#111827" },
              ].map(c => (
                <button
                  key={c.name}
                  onClick={()=> setTheme(c)}
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: c.color, outline: theme.name===c.name?`2px solid ${c.color}`:undefined }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Layout</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Choose layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-3 gap-2 p-2">
              {(["split","classic","hybrid"] as const).map(l => (
                <Button key={l} variant={layout===l?"default":"secondary"} onClick={()=>setLayout(l)}>
                  {l.charAt(0).toUpperCase()+l.slice(1)}
                </Button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Typography</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 space-y-3 p-3">
            <div className="space-y-2">
              <Label>Font</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {["Nunito","Poppins","Rubik","Fira Sans","Josefin Sans","Inter"].map(f=>(
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-3 gap-2">
                {([ {k:"sm",label:"Small"}, {k:"md",label:"Medium"}, {k:"lg",label:"Big"}] as const).map(opt=> (
                  <Button key={opt.k} variant={size===opt.k?"default":"secondary"} onClick={()=>setSize(opt.k)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Sections</Button>
          </DropdownMenuTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">Language</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'en'}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'es'}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={()=> document.documentElement.lang = 'de'}>Deutsch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          <DropdownMenuContent align="start" className="w-[520px] p-3">
            <DropdownMenuLabel>Personal Details</DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-3 py-2">
              {[{k:"picture",label:"Picture"},{k:"about",label:"About Me"},{k:"work",label:"Work Experience"},{k:"education",label:"Education"},{k:"skills",label:"Skills"},{k:"location",label:"Location"},{k:"email",label:"Email"},{k:"phone",label:"Phone Number"}].map(item=> (
                <div key={item.k} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{item.label}</span>
                  <Switch checked={!!visible[item.k]} onCheckedChange={(v)=>setVisible(s=>({...s,[item.k]:!!v}))} />
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2 mt-2">
              <Select value={newSectionType} onValueChange={(v)=> setNewSectionType(v as "text"|"list") }>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Section</SelectItem>
                  <SelectItem value="list">List Section</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newSectionPlacement} onValueChange={(v)=> setNewSectionPlacement(v as "left"|"right") }>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Column</SelectItem>
                  <SelectItem value="right">Right Column</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                onClick={()=>
                  setSections(prev=>[
                    ...prev,
                    {
                      id:`custom-${prev.length+1}`,
                      title: newSectionType === "list" ? "List" : "Text",
                      content: "",
                      type: newSectionType,
                      placement: newSectionPlacement,
                    },
                  ])
                }
              >
                +
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto space-x-2 flex items-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">AI Tools</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>AI Tools</DialogTitle>
              </DialogHeader>
              <UITabs defaultValue="summary" className="w-full">
                <UITabsList>
                  <UITabsTrigger value="summary">Summary</UITabsTrigger>
                  <UITabsTrigger value="bullets">Bullets</UITabsTrigger>
                  <UITabsTrigger value="skills">Skills</UITabsTrigger>
                </UITabsList>
                <UITabsContent value="summary" className="space-y-2">
                  <Textarea id="ai-summary" placeholder="Describe your role, highlights..." />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-summary") as HTMLTextAreaElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "summary", input }) });
                    const data = await res.json();
                    setSections(prev=> prev.map(s=> s.id==="about" && s.type==="text" ? { ...s, content: String(data.text ?? "") } : s));
                  }}>Generate Summary</Button>
                </UITabsContent>
                <UITabsContent value="bullets" className="space-y-2">
                  <Textarea id="ai-bullets" placeholder="Paste job description or responsibilities..." />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-bullets") as HTMLTextAreaElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "bullets", input }) });
                    const data = await res.json();
                    setSections(prev=> prev.map(s=> s.id==="work" && s.type==="experience" ? { ...s, items: [{ company: "Company", role: "Role", from: "From", to: "Until", bullets: String(data.text ?? "") }] } : s));
                  }}>Generate Bullets</Button>
                </UITabsContent>
                <UITabsContent value="skills" className="space-y-2">
                  <Input id="ai-skills" placeholder="Target role e.g. Senior Full Stack" />
                  <Button onClick={async()=>{
                    const input = (document.getElementById("ai-skills") as HTMLInputElement)?.value;
                    const res = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "skills", input }) });
                    const data = await res.json();
                    const list = String(data.text ?? "").split(/,|\n/).map(s=> s.trim()).filter(Boolean);
                    setSections(prev=> prev.map(s=> s.id==="skills" && s.type==="skills" ? { ...s, skills: list } : s));
                  }}>Generate Skills</Button>
                </UITabsContent>
              </UITabs>
            </DialogContent>
          </Dialog>
          <Button onClick={exportPdf}>Download PDF</Button>
        </div>
      </div>

      <main className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Layout: {layout} · Font: {font} · Size: {size}
          </div>
          <div className="space-x-2">
            <Button variant="secondary">Preview</Button>
            <Button>Download PDF</Button>
          </div>
        </div>

        <div className="border rounded-xl p-10 bg-background shadow-sm" ref={previewRef}>
          <div className="grid gap-6" style={{ fontFamily: font, fontSize: size==="sm"?"0.9rem":size==="lg"?"1.1rem":"1rem" }}>
            {visible.picture && showPhoto ? (
              <div className="w-24 h-24 rounded-full bg-muted" />
            ) : null}
            <header className="space-y-1">
              <h1
                contentEditable
                suppressContentEditableWarning
                className="text-3xl font-bold outline-none"
                onInput={e=> setName((e.target as HTMLElement).innerText)}
                style={{ color: theme.color }}
              >
                {name}
              </h1>
              <p
                contentEditable
                suppressContentEditableWarning
                className="text-muted-foreground outline-none"
                onInput={e=> setRole((e.target as HTMLElement).innerText)}
              >
                {role}
              </p>
              <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                {visible.location && (
                  <span className="inline-flex items-center gap-1 outline-none" contentEditable suppressContentEditableWarning onInput={e=> setLocation((e.target as HTMLElement).innerText)}>
                    <MapPin size={14} color={theme.color} />{location}
                  </span>
                )}
                {visible.email && (
                  <span className="inline-flex items-center gap-1 outline-none" contentEditable suppressContentEditableWarning onInput={e=> setEmail((e.target as HTMLElement).innerText)}>
                    <Mail size={14} color={theme.color} />{email}
                  </span>
                )}
                {visible.phone && (
                  <span className="inline-flex items-center gap-1 outline-none" contentEditable suppressContentEditableWarning onInput={e=> setPhone((e.target as HTMLElement).innerText)}>
                    <Phone size={14} color={theme.color} />{phone}
                  </span>
                )}
              </div>
            </header>
            {/* Body sections with layout-aware columns */}
            {layout === "split" ? (
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-6">
                  {sections.filter(s=> visible[s.id] !== false && s.placement === "left").map(s => (
                    <section key={s.id} className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold" style={{ color: theme.color }}>{s.title}</h2>
                        {s.type === "list" && (
                          <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                        )}
                        {s.type === "experience" && (
                          <ItemControls onInsertAfter={()=> addExperienceItem()} />
                        )}
                        {s.type === "education" && (
                          <ItemControls onInsertAfter={()=> addEducationItem()} />
                        )}
                        {s.type === "skills" && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                          </div>
                        )}
                      </div>
                      <Separator />
                      {s.type === "list" ? (
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      ) : s.type === "skills" ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {s.skills.map((sk, i)=> (
                            <div key={i} className="rounded border px-2 py-1 relative group">
                              <span
                                className="outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.map((v,idx)=> idx===i ? (e.target as HTMLElement).innerText : v) } : sec))}
                              >{sk}</span>
                              <ItemControls className="-right-6" onRemove={()=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.filter((_,idx)=> idx!==i) } : sec))} />
                            </div>
                          ))}
                          <button className="rounded border px-2 py-1 text-sm" onClick={()=> addSkill("New skill")}>＋</button>
                        </div>
                      ) : s.type === "text" ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{s.content}</p>
                      ) : null}
                    </section>
                  ))}
                </div>
                <div className="col-span-2 space-y-6">
                  {sections.filter(s=> visible[s.id] !== false && s.placement === "right").map(s => (
                    <section key={s.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold" style={{ color: theme.color }}>{s.title}</h2>
                      {s.type === "list" && (
                        <ItemControls onInsertAfter={()=> insertListLineAfter(s.id, -1)} />
                      )}
                      {s.type === "experience" && (
                        <ItemControls onInsertAfter={()=> addExperienceItem()} />
                      )}
                      {s.type === "education" && (
                        <ItemControls onInsertAfter={()=> addEducationItem()} />
                      )}
                      {s.type === "skills" && (
                        <Button size="sm" variant="secondary" onClick={()=> addSkill("New skill")}>＋ Add skill</Button>
                      )}
                    </div>
                      <Separator />
                      {s.type === "list" ? (
                        <ul className="pl-5 space-y-1 text-sm">
                          {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                            <li
                              key={i}
                              className="relative group cursor-move"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "list", sectionId: s.id, from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "list" && dragState.sectionId === s.id) { reorderListLine(s.id, from, i); } setDragState(null); }}
                            >
                              <span
                                className="outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                              >{line}</span>
                              <ItemControls
                                className="-right-6"
                                onMoveUp={()=> moveListLine(s.id, i, -1)}
                                onMoveDown={()=> moveListLine(s.id, i, 1)}
                                onInsertAfter={()=> insertListLineAfter(s.id, i)}
                                onRemove={()=> removeListLine(s.id, i)}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : s.type === "experience" ? (
                        <div className="space-y-6">
                          {s.items.map((it, i)=> (
                            <div
                              key={i}
                              className="space-y-1 group relative cursor-move"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "exp", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "exp") { reorderExperience(from, i); } setDragState(null); }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-semibold">
                                  <span
                                    className="text-blue-700 outline-none"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{company: (e.target as HTMLElement).innerText})}
                                  >{it.company}</span>
                                  <span className="mx-2">—</span>
                                  <span
                                    className="outline-none"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{role: (e.target as HTMLElement).innerText})}
                                  >{it.role}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span
                                    className="outline-none"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{from: (e.target as HTMLElement).innerText})}
                                  >{it.from}</span>
                                  {" "}-{" "}
                                  <span
                                    className="outline-none"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e)=> updateExperienceItem(i,{to: (e.target as HTMLElement).innerText})}
                                  >{it.to}</span>
                                </div>
                              </div>
                              <div
                                className="text-sm leading-relaxed whitespace-pre-wrap outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e)=> updateExperienceItem(i,{bullets: (e.target as HTMLElement).innerText})}
                              >{it.bullets}</div>

                              <ItemControls
                                className="right-0 -top-6"
                                onAi={() => aiBulletsForExperience(i)}
                                onMoveUp={() => moveExperience(i,-1)}
                                onMoveDown={() => moveExperience(i,1)}
                                onInsertAfter={() => insertExperienceAfter(i)}
                                onRemove={() => removeExperience(i)}
                              />
                            </div>
                          ))}
                        </div>
                      ) : s.type === "education" ? (
                        <div className="space-y-2 text-sm">
                          {s.items.map((ed, i)=>(
                            <div
                              key={i}
                              className="flex items-center justify-between group relative cursor-move"
                              draggable
                              onDragStart={(e)=>{ setDragState({ kind: "edu", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                              onDragOver={(e)=> e.preventDefault()}
                              onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "edu") { reorderEducation(from, i); } setDragState(null); }}
                            >
                              <div>
                                <span
                                  className="font-medium outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{school: (e.target as HTMLElement).innerText})}
                                >{ed.school}</span>
                                <span className="mx-2">—</span>
                                <span
                                  className="outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{degree: (e.target as HTMLElement).innerText})}
                                >{ed.degree}</span>
                              </div>
                              <div className="text-muted-foreground">
                                <span
                                  className="outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{from: (e.target as HTMLElement).innerText})}
                                >{ed.from}</span>{" "}-{" "}
                                <span
                                  className="outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e)=> updateEducationItem(i,{to: (e.target as HTMLElement).innerText})}
                                >{ed.to}</span>
                              </div>
                              <ItemControls
                                className="right-0 -top-6"
                                onMoveUp={() => moveEducation(i,-1)}
                                onMoveDown={() => moveEducation(i,1)}
                                onInsertAfter={() => insertEducationAfter(i)}
                                onRemove={() => removeEducation(i)}
                              />
                            </div>
                          ))}
                        </div>
                      ) : s.type === "text" ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{s.content}</p>
                      ) : null}
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.filter(s=> visible[s.id] !== false).map(s => (
                  <section key={s.id} className="space-y-2">
                    <h2 className="text-xl font-semibold">{s.title}</h2>
                    <Separator />
                    {s.type === "list" ? (
                      <ul className="pl-5 space-y-1 text-sm">
                        {s.content.split(/\n+/).filter(Boolean).map((line, i)=> (
                          <li key={i} className="relative group">
                            <span
                              className="outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> updateListLine(s.id, i, (e.target as HTMLElement).innerText)}
                            >{line}</span>
                            <ItemControls
                              className="-right-6"
                              onMoveUp={()=> moveListLine(s.id, i, -1)}
                              onMoveDown={()=> moveListLine(s.id, i, 1)}
                              onInsertAfter={()=> insertListLineAfter(s.id, i)}
                              onRemove={()=> removeListLine(s.id, i)}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : s.type === "experience" ? (
                      <div className="space-y-6">
                        {s.items.map((it, i)=> (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">
                                <span className="text-blue-700">{it.company}</span>
                                <span className="mx-2">—</span>
                                <span>{it.role}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">{it.from} - {it.to}</div>
                            </div>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                              {it.bullets.split(/\n+/).filter(Boolean).map((b, j)=>(
                                <li key={j}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : s.type === "education" ? (
                      <div className="space-y-2 text-sm">
                        {s.items.map((ed, i)=>(
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{ed.school}</span>
                              <span className="mx-2">—</span>
                              <span>{ed.degree}</span>
                            </div>
                            <div className="text-muted-foreground">{ed.from} - {ed.to}</div>
                          </div>
                        ))}
                      </div>
                    ) : s.type === "skills" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {s.skills.map((sk, i)=> (
                          <div
                            key={i}
                            className="rounded border px-2 py-1 relative group cursor-move"
                            draggable
                            onDragStart={(e)=>{ setDragState({ kind: "skill", from: i }); e.dataTransfer.setData("text/plain", `${i}`); }}
                            onDragOver={(e)=> e.preventDefault()}
                            onDrop={(e)=>{ e.preventDefault(); const from = dragState?.from ?? i; if (dragState?.kind === "skill") { reorderSkill(from, i); } setDragState(null); }}
                          >
                            <span
                              className="outline-none"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e)=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.map((v,idx)=> idx===i ? (e.target as HTMLElement).innerText : v) } : sec))}
                            >{sk}</span>
                            <ItemControls className="-right-6" onRemove={()=> setSections(prev=> prev.map(sec=> sec.type==='skills' && sec.id===s.id ? { ...sec, skills: sec.skills.filter((_,idx)=> idx!==i) } : sec))} />
                          </div>
                        ))}
                        <button className="rounded border px-2 py-1 text-sm" onClick={()=> addSkill("New skill")}>＋</button>
                      </div>
                    ) : s.type === "text" ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{s.content}</p>
                    ) : null}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


