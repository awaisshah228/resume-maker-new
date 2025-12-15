import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TextSection = {
  id: string;
  title: string;
  type: "text";
  content: string;
  placement: "left" | "right";
};

type ListSection = {
  id: string;
  title: string;
  type: "list";
  content: string;
  placement: "left" | "right";
};

type ExperienceItem = {
  company: string;
  role: string;
  from: string;
  to: string;
  bullets: string;
  description?: string;
  isPlaceholder?: boolean;
};

type ExperienceSection = {
  id: string;
  title: string;
  type: "experience";
  items: ExperienceItem[];
  placement: "left" | "right";
};

type EducationItem = {
  school: string;
  degree: string;
  from: string;
  to: string;
  isPlaceholder?: boolean;
};

type EducationSection = {
  id: string;
  title: string;
  type: "education";
  items: EducationItem[];
  placement: "left" | "right";
};

type SkillsSection = {
  id: string;
  title: string;
  type: "skills";
  skills: string[];
  placement: "left" | "right";
};

type ResumeSection = TextSection | ListSection | ExperienceSection | EducationSection | SkillsSection;

interface ResumeState {
  // Personal Info
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  customLinks: { id: string; label: string; url: string; icon: string }[];
  
  // Sections
  sections: ResumeSection[];
  
  // Visibility
  visible: Record<string, boolean>;
  
  // Settings
  layout: "split" | "classic" | "hybrid";
  font: string;
  size: "sm" | "md" | "lg";
  theme: { name: string; color: string };
  showPhoto: boolean;
  nameNextToPhoto: boolean;
  atsMode: boolean;
  
  // Actions
  setName: (name: string) => void;
  setRole: (role: string) => void;
  setLocation: (location: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setPhotoUrl: (url: string | null) => void;
  setCustomLinks: (links: { id: string; label: string; url: string; icon: string }[] | ((prev: { id: string; label: string; url: string; icon: string }[]) => { id: string; label: string; url: string; icon: string }[])) => void;
  setSections: (sections: ResumeSection[] | ((prev: ResumeSection[]) => ResumeSection[])) => void;
  setVisible: (visible: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setLayout: (layout: "split" | "classic" | "hybrid") => void;
  setFont: (font: string) => void;
  setSize: (size: "sm" | "md" | "lg") => void;
  setTheme: (theme: { name: string; color: string }) => void;
  setShowPhoto: (show: boolean) => void;
  setNameNextToPhoto: (next: boolean) => void;
  setAtsMode: (mode: boolean) => void;
  resetResume: () => void;
}

const defaultSections: ResumeSection[] = [
  { id: "about", title: "ABOUT ME", type: "text", content: "Experienced full-stack blockchain developer with a focus on microservices architecture and DeFi in Blockchain, currently exploring Web3 and Defi in various chains and tools. Skilled in MERN, Aws, GCP and Web3, with a passion for innovation and learning.", placement: "left" },
  { id: "work", title: "EXPERIENCE", type: "experience", items: [
    { company: "Company Name", role: "FULL STACK DEVELOPER", from: "June 2023", to: "Present (11 months)", bullets: ""},
    { company: "Previous Company", role: "SOFTWARE ENGINEER", from: "Jan 2021", to: "May 2023", bullets: ""}
  ], placement: "right" },
  { id: "education", title: "EDUCATION", type: "education", items: [
    { school: "University Name", degree: "BSCS, COMPUTER SCIENCE", from: "2019", to: "2023" },
    { school: "Previous School", degree: "DEGREE NAME", from: "2015", to: "2019" }
  ], placement: "right" },
  { id: "skills", title: "SKILLS", type: "skills", skills: ["React.Next", "Node.js", "TypeScript", "AWS", "Docker"], placement: "right" },
];

const defaultVisible = {
  picture: true,
  about: true,
  work: true,
  education: true,
  skills: true,
  location: true,
  email: true,
  phone: true,
  jobDescription: true,
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      // Initial state
      name: "Your Name",
      role: "Your Role",
      location: "City",
      email: "you@email.com",
      phone: "+123456789",
      photoUrl: null,
      customLinks: [],
      sections: defaultSections,
      visible: defaultVisible,
      layout: "split",
      font: "Nunito",
      size: "md",
      theme: { name: "blue", color: "#234795" },
      showPhoto: true,
      nameNextToPhoto: true,
      atsMode: false,
      
      // Actions
      setName: (name) => set({ name }),
      setRole: (role) => set({ role }),
      setLocation: (location) => set({ location }),
      setEmail: (email) => set({ email }),
      setPhone: (phone) => set({ phone }),
      setPhotoUrl: (photoUrl) => set({ photoUrl }),
      setCustomLinks: (customLinks) => set((state) => ({ 
        customLinks: typeof customLinks === 'function' ? customLinks(state.customLinks) : customLinks 
      })),
      setSections: (sections) => set((state) => ({ 
        sections: typeof sections === 'function' ? sections(state.sections) : sections 
      })),
      setVisible: (visible) => set((state) => ({ 
        visible: typeof visible === 'function' ? visible(state.visible) : visible 
      })),
      setLayout: (layout) => set({ layout }),
      setFont: (font) => set({ font }),
      setSize: (size) => set({ size }),
      setTheme: (theme) => set({ theme }),
      setShowPhoto: (showPhoto) => set({ showPhoto }),
      setNameNextToPhoto: (nameNextToPhoto) => set({ nameNextToPhoto }),
      setAtsMode: (atsMode) => set({ atsMode }),
      resetResume: () => set({
        name: "Your Name",
        role: "Your Role",
        location: "City",
        email: "you@email.com",
        phone: "+123456789",
        photoUrl: null,
        customLinks: [],
        sections: defaultSections,
        visible: defaultVisible,
        layout: "split",
        font: "Nunito",
        size: "md",
        theme: { name: "blue", color: "#234795" },
        showPhoto: true,
        nameNextToPhoto: true,
        atsMode: false,
      }),
    }),
    {
      name: 'resume-maker-storage',
      version: 1,
      partialize: (state) => ({
        // Only persist data, not actions
        name: state.name,
        role: state.role,
        location: state.location,
        email: state.email,
        phone: state.phone,
        photoUrl: state.photoUrl,
        customLinks: state.customLinks,
        sections: state.sections,
        visible: state.visible,
        layout: state.layout,
        font: state.font,
        size: state.size,
        theme: state.theme,
        showPhoto: state.showPhoto,
        nameNextToPhoto: state.nameNextToPhoto,
        atsMode: state.atsMode,
      }),
    }
  )
);

