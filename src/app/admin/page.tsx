"use client";

import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "experience" | "projects" | "contact" | "metadata" | "navigation">("hero");
  const [editLang, setEditLang] = useState<"tr" | "en">("tr");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // GitHub integration states
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [selectedProjectsToDelete, setSelectedProjectsToDelete] = useState<number[]>([]);

  // Reset selected projects to delete when active tab or language changes
  useEffect(() => {
    setSelectedProjectsToDelete([]);
  }, [activeTab, editLang]);

  // Check if password exists in localStorage on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem("portfolio_admin_password");
    if (savedPassword) {
      verifyPassword(savedPassword);
    }
  }, []);

  // Extract GitHub username when data is loaded
  useEffect(() => {
    if (data) {
      const githubUrl = data.en?.contact?.githubUrl || data.tr?.contact?.githubUrl || "";
      if (githubUrl.includes("github.com/")) {
        const username = githubUrl.split("github.com/").pop()?.split("/")[0] || "";
        setGithubUsername(username);
      }
    }
  }, [data]);

  const verifyPassword = async (pass: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${pass}`,
        },
      });

      if (response.ok) {
        localStorage.setItem("portfolio_admin_password", pass);
        setPassword(pass);
        setIsAuthenticated(true);
        loadPortfolioData();
      } else {
        localStorage.removeItem("portfolio_admin_password");
        setLoginError("Invalid password");
      }
    } catch (err) {
      setLoginError("Error connecting to server");
    }
  };

  const loadPortfolioData = async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        alert("Failed to load portfolio data");
      }
    } catch (err) {
      alert("Failed to load portfolio data");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    verifyPassword(password);
  };

  const handleLogout = () => {
    localStorage.removeItem("portfolio_admin_password");
    setPassword("");
    setIsAuthenticated(false);
    setData(null);
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveMessage("");

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSaveStatus("success");
        setSaveMessage("Portfolio changes saved successfully!");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        const errJson = await response.json();
        setSaveStatus("error");
        setSaveMessage(errJson.error || "Failed to save portfolio changes.");
      }
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage("Network error: Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, onUploaded: (url: string) => void) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${password}`,
        },
        body: formData,
      });

      if (response.ok) {
        const res = await response.json();
        onUploaded(res.url);
      } else {
        const err = await response.json();
        alert(err.error || "File upload failed");
      }
    } catch (err) {
      alert("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // State modification helpers
  const updateField = (section: string, key: string, value: any) => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang][section] = { ...next[editLang][section] };
      next[editLang][section][key] = value;
      return next;
    });
  };

  const updateExperienceItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].experience = { ...next[editLang].experience };
      const items = [...next[editLang].experience.items];
      items[index] = { ...items[index], [key]: value };
      next[editLang].experience.items = items;
      return next;
    });
  };

  const addExperienceItem = () => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].experience = { ...next[editLang].experience };
      const items = [...next[editLang].experience.items];
      items.unshift({
        company: "New Company",
        role: "New Role",
        duration: "Duration",
        description: "Job description (supports HTML tags like <b> or <strong>)"
      });
      next[editLang].experience.items = items;
      return next;
    });
  };

  const deleteExperienceItem = (index: number) => {
    if (!confirm("Are you sure you want to delete this experience item?")) return;
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].experience = { ...next[editLang].experience };
      const items = [...next[editLang].experience.items];
      items.splice(index, 1);
      next[editLang].experience.items = items;
      return next;
    });
  };

  const moveExperienceItem = (index: number, direction: "up" | "down") => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].experience = { ...next[editLang].experience };
      const items = [...next[editLang].experience.items];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      next[editLang].experience.items = items;
      return next;
    });
  };

  // Projects helpers
  const updateProjectItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].projects = { ...next[editLang].projects };
      const items = [...next[editLang].projects.items];
      items[index] = { ...items[index], [key]: value };
      next[editLang].projects.items = items;
      return next;
    });
  };

  const addProjectItem = () => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].projects = { ...next[editLang].projects };
      const items = [...next[editLang].projects.items];
      items.unshift({
        title: "New Project",
        description: "Project description",
        technologies: ["React", "TypeScript"],
        imageUrl: "/img/react-ecommerce.webp",
        link: "https://example.com",
        github: "https://github.com",
        featured: false,
        hasDemo: true,
        isPublic: true
      });
      next[editLang].projects.items = items;
      return next;
    });
  };

  const deleteProjectItem = (index: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].projects = { ...next[editLang].projects };
      const items = [...next[editLang].projects.items];
      items.splice(index, 1);
      next[editLang].projects.items = items;
      return next;
    });
  };

  const moveProjectItem = (index: number, direction: "up" | "down") => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].projects = { ...next[editLang].projects };
      const items = [...next[editLang].projects.items];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      next[editLang].projects.items = items;
      return next;
    });
  };

  // GitHub integration helpers
  const fetchGithubRepos = async (username: string) => {
    if (!username.trim()) {
      setRepoError("Please enter a username");
      return;
    }
    setIsLoadingRepos(true);
    setRepoError("");
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "User not found" : "Failed to fetch repositories");
      }
      const data = await res.json();
      setGithubRepos(data);
    } catch (err: any) {
      setRepoError(err.message || "An error occurred");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRepos.length === githubRepos.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos(githubRepos.map((repo: any) => repo.id));
    }
  };

  const toggleSelectRepo = (repoId: number) => {
    setSelectedRepos(prev => 
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    );
  };

  const importSelectedRepos = () => {
    if (selectedRepos.length === 0) return;
    
    setData((prev: any) => {
      const next = { ...prev };
      
      // Import into both Turkish and English project lists
      ["tr", "en"].forEach((lang) => {
        if (!next[lang]) return;
        next[lang] = { ...next[lang] };
        next[lang].projects = { ...next[lang].projects };
        const items = [...next[lang].projects.items];
        
        const newItems = githubRepos
          .filter((repo: any) => selectedRepos.includes(repo.id))
          .map((repo: any) => {
            // Format repo name: "my-repo-name" -> "My Repo Name"
            const title = repo.name
              .split(/[-_]+/)
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            const technologies = [repo.language, ...(repo.topics || [])]
              .filter(Boolean)
              .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1));
            
            const uniqueTechnologies = Array.from(new Set(technologies));

            // Parse description: split by | or / if present
            let desc = repo.description || "";
            if (repo.description) {
              if (repo.description.includes("|")) {
                const parts = repo.description.split("|");
                desc = lang === "tr" ? parts[0].trim() : (parts[1] || parts[0]).trim();
              } else if (repo.description.includes("/")) {
                const parts = repo.description.split("/");
                desc = lang === "tr" ? parts[0].trim() : (parts[1] || parts[0]).trim();
              }
            }

            return {
              title,
              description: desc,
              technologies: uniqueTechnologies.length > 0 ? uniqueTechnologies : ["React"],
              imageUrl: `https://raw.githubusercontent.com/${githubUsername || "kaeruishere"}/${repo.name}/main/cover.png`,
              link: repo.homepage || "",
              github: repo.html_url,
              featured: false,
              hasDemo: !!repo.homepage,
              isPublic: true
            };
          });
          
        next[lang].projects.items = [...newItems, ...items];
      });
      
      return next;
    });
    
    setIsGithubModalOpen(false);
    setSelectedRepos([]);
  };

  const toggleSelectProjectToDelete = (idx: number) => {
    setSelectedProjectsToDelete(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const deleteSelectedProjects = () => {
    if (selectedProjectsToDelete.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedProjectsToDelete.length} selected projects?`)) return;
    
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].projects = { ...next[editLang].projects };
      const items = [...next[editLang].projects.items];
      
      const sortedIndexes = [...selectedProjectsToDelete].sort((a, b) => b - a);
      sortedIndexes.forEach(idx => {
        items.splice(idx, 1);
      });
      
      next[editLang].projects.items = items;
      return next;
    });
    
    setSelectedProjectsToDelete([]);
  };

  // Certifications & Techs helpers
  const updateCertItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const certs = [...(next[editLang].about.certifications || [])];
      certs[index] = { ...certs[index], [key]: value };
      next[editLang].about.certifications = certs;
      return next;
    });
  };

  const addCertItem = () => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const certs = [...(next[editLang].about.certifications || [])];
      certs.push({
        title: "New Certificate",
        issuer: "Issuer",
        icon: "/img/logos/hackerrank_logo.jpeg",
        link: "https://example.com"
      });
      next[editLang].about.certifications = certs;
      return next;
    });
  };

  const deleteCertItem = (index: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const certs = [...(next[editLang].about.certifications || [])];
      certs.splice(index, 1);
      next[editLang].about.certifications = certs;
      return next;
    });
  };

  const moveCertItem = (index: number, direction: "up" | "down") => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const certs = [...(next[editLang].about.certifications || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= certs.length) return prev;
      const temp = certs[index];
      certs[index] = certs[targetIndex];
      certs[targetIndex] = temp;
      next[editLang].about.certifications = certs;
      return next;
    });
  };

  const updateTechItem = (index: number, key: string, value: any) => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const techs = [...(next[editLang].about.technologies || [])];
      techs[index] = { ...techs[index], [key]: value };
      next[editLang].about.technologies = techs;
      return next;
    });
  };

  const addTechItem = () => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const techs = [...(next[editLang].about.technologies || [])];
      techs.push({
        name: "New Tech",
        icon: "/img/logos/react_icon.svg"
      });
      next[editLang].about.technologies = techs;
      return next;
    });
  };

  const deleteTechItem = (index: number) => {
    if (!confirm("Are you sure you want to delete this technology?")) return;
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const techs = [...(next[editLang].about.technologies || [])];
      techs.splice(index, 1);
      next[editLang].about.technologies = techs;
      return next;
    });
  };

  const moveTechItem = (index: number, direction: "up" | "down") => {
    setData((prev: any) => {
      const next = { ...prev };
      next[editLang] = { ...next[editLang] };
      next[editLang].about = { ...next[editLang].about };
      const techs = [...(next[editLang].about.technologies || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= techs.length) return prev;
      const temp = techs[index];
      techs[index] = techs[targetIndex];
      techs[targetIndex] = temp;
      next[editLang].about.technologies = techs;
      return next;
    });
  };

  // Render Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1e2330] flex items-center justify-center p-4">
        {/* Glow backdrop decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c7ff24]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <form 
          onSubmit={handleLogin} 
          className="relative w-full max-w-md bg-[#161a25]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-2xl bg-[#c7ff24]/10 text-[#c7ff24] mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-primary">
              Admin Console
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Please enter password to edit portfolio
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#1e2330] border border-slate-800 focus:border-[#c7ff24] text-white rounded-xl py-3 px-4 outline-none transition-all duration-300"
            />
            {loginError && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                ⚠️ {loginError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#c7ff24] hover:bg-[#b0e21a] text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#c7ff24]/20 cursor-pointer text-center"
          >
            Enter Console
          </button>
        </form>
      </div>
    );
  }

  // Render Loading state while fetching data
  if (!data) {
    return (
      <div className="min-h-screen bg-[#161a25] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c7ff24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const currentData = data[editLang];

  return (
    <div className="min-h-screen bg-[#11141c] text-slate-300 flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {saveStatus !== "idle" && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 py-3 px-5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-500 transform translate-y-0 ${
          saveStatus === "success" 
            ? "bg-green-950/80 border-green-800 text-green-300" 
            : "bg-red-950/80 border-red-800 text-red-300"
        }`}>
          <span>
            {saveStatus === "success" ? "✓" : "✗"}
          </span>
          <p className="text-sm font-medium">{saveMessage}</p>
        </div>
      )}

      {/* Floating Save Bar on Mobile */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#161a25]/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <span className="font-bold text-white text-sm">Portfolio Console</span>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#c7ff24] hover:bg-[#b0e21a] text-slate-900 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleLogout}
            className="border border-slate-700 hover:border-red-500 hover:text-red-500 text-xs py-1.5 px-3 rounded-lg transition-all cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#161a25] border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[#c7ff24] font-bold text-lg tracking-wider font-primary">
                ERRENN.COM
              </span>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                Admin Panel
              </p>
            </div>
            {/* Save Status Badge */}
            {isSaving && (
              <span className="text-[10px] bg-slate-800 text-slate-400 py-0.5 px-2 rounded-full animate-pulse">
                Saving...
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("hero")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "hero" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              🚀 Hero Section
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "about" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              👤 About & Skills
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "experience" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              💼 Experience
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "projects" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              💻 Projects
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "contact" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              ✉️ Contact & Socials
            </button>
            <button
              onClick={() => setActiveTab("navigation")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "navigation" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              🔗 Navigation & Footer
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                activeTab === "metadata" 
                  ? "bg-[#c7ff24]/10 text-[#c7ff24] font-bold" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              🌐 SEO & Metadata
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 hidden lg:block">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#c7ff24] hover:bg-[#b0e21a] text-slate-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-2 transition-all cursor-pointer shadow-md hover:shadow-[#c7ff24]/10"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-[#1e2330] hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900 font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 lg:p-10 max-w-5xl overflow-y-auto">
        
        {/* Editor Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
              {activeTab === "hero" && "🚀 Hero Section Settings"}
              {activeTab === "about" && "👤 About Me & Skills Settings"}
              {activeTab === "experience" && "💼 Professional Experience"}
              {activeTab === "projects" && "💻 Projects Showcase"}
              {activeTab === "contact" && "✉️ Contact Information"}
              {activeTab === "navigation" && "🔗 Navigation & Footer"}
              {activeTab === "metadata" && "🌐 SEO Metadata & Page Settings"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Currently editing values. Changes must be saved using the Save Changes button.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex bg-[#161a25] p-1 rounded-xl border border-slate-800 self-start sm:self-center">
            <button
              onClick={() => setEditLang("tr")}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                editLang === "tr" 
                  ? "bg-[#c7ff24] text-slate-900" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇹🇷</span> Turkish
            </button>
            <button
              onClick={() => setEditLang("en")}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                editLang === "en" 
                  ? "bg-[#c7ff24] text-slate-900" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇬🇧</span> English
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          
          {/* TAB: HERO */}
          {activeTab === "hero" && (
            <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Greeting Badge</label>
                  <input
                    type="text"
                    value={currentData.hero.greeting || ""}
                    onChange={(e) => updateField("hero", "greeting", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={currentData.hero.name || ""}
                    onChange={(e) => updateField("hero", "name", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Role Title(s) (Separate multiple roles with commas to rotate them)</label>
                <input
                  type="text"
                  value={currentData.hero.role || ""}
                  placeholder="e.g. Bilgisayar Mühendisi, Oyun Geliştirici, Mobil Geliştirici"
                  onChange={(e) => updateField("hero", "role", e.target.value)}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Short Description</label>
                <textarea
                  value={currentData.hero.description || ""}
                  onChange={(e) => updateField("hero", "description", e.target.value)}
                  rows={3}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Call to Action (CTA) Text</label>
                  <input
                    type="text"
                    value={currentData.hero.cta || ""}
                    onChange={(e) => updateField("hero", "cta", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Scroll Down Accessibility Label</label>
                  <input
                    type="text"
                    value={currentData.hero.ariaDown || ""}
                    onChange={(e) => updateField("hero", "ariaDown", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Profile & About description */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">Bio Narratives</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Index</label>
                    <input
                      type="text"
                      value={currentData.about.badge || ""}
                      onChange={(e) => updateField("about", "badge", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Title</label>
                    <input
                      type="text"
                      value={currentData.about.title || ""}
                      onChange={(e) => updateField("about", "title", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Bio Title</label>
                    <input
                      type="text"
                      value={currentData.about.whoTitle || ""}
                      onChange={(e) => updateField("about", "whoTitle", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Bio Paragraph 1 (Supports HTML)</label>
                  <textarea
                    value={currentData.about.bio1 || ""}
                    onChange={(e) => updateField("about", "bio1", e.target.value)}
                    rows={4}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Bio Paragraph 2 (Supports HTML)</label>
                  <textarea
                    value={currentData.about.bio2 || ""}
                    onChange={(e) => updateField("about", "bio2", e.target.value)}
                    rows={4}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"Working at" Label</label>
                    <input
                      type="text"
                      value={currentData.about.workingAt || ""}
                      onChange={(e) => updateField("about", "workingAt", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"Studying at" Label</label>
                    <input
                      type="text"
                      value={currentData.about.studyingAt || ""}
                      onChange={(e) => updateField("about", "studyingAt", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Certifications Section Title</label>
                    <input
                      type="text"
                      value={currentData.about.certTitle || ""}
                      onChange={(e) => updateField("about", "certTitle", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Technologies Section Title</label>
                    <input
                      type="text"
                      value={currentData.about.techTitle || ""}
                      onChange={(e) => updateField("about", "techTitle", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Certifications Management */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <h3 className="text-white font-bold text-sm">Certifications</h3>
                  <button
                    onClick={addCertItem}
                    className="bg-[#c7ff24]/10 hover:bg-[#c7ff24]/20 border border-[#c7ff24]/30 text-[#c7ff24] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    + Add Certification
                  </button>
                </div>

                <div className="space-y-4">
                  {(currentData.about.certifications || []).map((cert: any, idx: number) => (
                    <div key={idx} className="bg-[#11141c] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-stretch justify-between md:justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Cert #{idx + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveCertItem(idx, "up")}
                            disabled={idx === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-xs cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveCertItem(idx, "down")}
                            disabled={idx === (currentData.about.certifications || []).length - 1}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-xs cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Title</label>
                          <input
                            type="text"
                            value={cert.title || ""}
                            onChange={(e) => updateCertItem(idx, "title", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-2.5 outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Issuer</label>
                          <input
                            type="text"
                            value={cert.issuer || ""}
                            onChange={(e) => updateCertItem(idx, "issuer", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-2.5 outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Credential URL</label>
                          <input
                            type="text"
                            value={cert.link || ""}
                            onChange={(e) => updateCertItem(idx, "link", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-2.5 outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Icon Image Path</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={cert.icon || ""}
                              onChange={(e) => updateCertItem(idx, "icon", e.target.value)}
                              className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-2.5 outline-none text-xs"
                            />
                            <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1 px-3 rounded-lg text-xs cursor-pointer flex items-center justify-center whitespace-nowrap">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, (url) => updateCertItem(idx, "icon", url));
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteCertItem(idx)}
                        className="bg-red-950/20 hover:bg-red-900 border border-red-950 hover:border-red-700 text-red-400 hover:text-white rounded-lg p-2 text-xs self-end md:self-center cursor-pointer"
                        title="Delete certification"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies Management */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <h3 className="text-white font-bold text-sm">Technologies & Tool Bag</h3>
                  <button
                    onClick={addTechItem}
                    className="bg-[#c7ff24]/10 hover:bg-[#c7ff24]/20 border border-[#c7ff24]/30 text-[#c7ff24] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    + Add Technology
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(currentData.about.technologies || []).map((tech: any, idx: number) => (
                    <div key={idx} className="bg-[#11141c] border border-slate-800/80 rounded-xl p-3 flex items-center gap-3 relative">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 p-1 shrink-0 flex items-center justify-center">
                        {tech.icon ? (
                          <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-500">Tech</span>
                        )}
                      </div>
                      
                      <div className="flex-grow space-y-1">
                        <input
                          type="text"
                          value={tech.name || ""}
                          placeholder="Name"
                          onChange={(e) => updateTechItem(idx, "name", e.target.value)}
                          className="w-full bg-[#161a25] border border-slate-800 text-white rounded-md py-1 px-2 outline-none text-xs font-medium"
                        />
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            value={tech.icon || ""}
                            placeholder="Icon path"
                            onChange={(e) => updateTechItem(idx, "icon", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-slate-400 rounded-md py-0.5 px-2 outline-none text-[10px]"
                          />
                          <label className="text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer uppercase">
                            Up
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, (url) => updateTechItem(idx, "icon", url));
                                  }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => deleteTechItem(idx)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-950/20 p-1 rounded text-xs cursor-pointer"
                          title="Delete tech"
                        >
                          ✕
                        </button>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => moveTechItem(idx, "up")}
                            disabled={idx === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-0.5 text-[8px] cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveTechItem(idx, "down")}
                            disabled={idx === (currentData.about.technologies || []).length - 1}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-0.5 text-[8px] cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Index</label>
                    <input
                      type="text"
                      value={currentData.experience.badge || ""}
                      onChange={(e) => updateField("experience", "badge", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Title</label>
                    <input
                      type="text"
                      value={currentData.experience.title || ""}
                      onChange={(e) => updateField("experience", "title", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Items Management */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <h3 className="text-white font-bold text-sm">Experience Timeline</h3>
                  <button
                    onClick={addExperienceItem}
                    className="bg-[#c7ff24]/10 hover:bg-[#c7ff24]/20 border border-[#c7ff24]/30 text-[#c7ff24] text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    + Add Experience
                  </button>
                </div>

                <div className="space-y-6">
                  {currentData.experience.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-[#11141c] border border-slate-800 rounded-2xl p-6 relative group">
                      
                      {/* Drag / Position controls */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={() => moveExperienceItem(idx, "up")}
                          disabled={idx === 0}
                          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-xs cursor-pointer"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveExperienceItem(idx, "down")}
                          disabled={idx === currentData.experience.items.length - 1}
                          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-xs cursor-pointer"
                          title="Move down"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => deleteExperienceItem(idx)}
                          className="bg-red-950/30 hover:bg-red-900 border border-red-900 text-red-400 hover:text-white rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ml-3"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Position #{idx + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Company / Institution</label>
                          <input
                            type="text"
                            value={item.company || ""}
                            onChange={(e) => updateExperienceItem(idx, "company", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Role / Title</label>
                          <input
                            type="text"
                            value={item.role || ""}
                            onChange={(e) => updateExperienceItem(idx, "role", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Duration (e.g. June 2025 — Present)</label>
                          <input
                            type="text"
                            value={item.duration || ""}
                            onChange={(e) => updateExperienceItem(idx, "duration", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Job / Program Description (Supports HTML)</label>
                        <textarea
                          value={item.description || ""}
                          onChange={(e) => updateExperienceItem(idx, "description", e.target.value)}
                          rows={3}
                          className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              {/* Header details */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Index</label>
                    <input
                      type="text"
                      value={currentData.projects.badge || ""}
                      onChange={(e) => updateField("projects", "badge", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Title</label>
                    <input
                      type="text"
                      value={currentData.projects.title || ""}
                      onChange={(e) => updateField("projects", "title", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Introduction Text (Supports HTML)</label>
                  <textarea
                    value={currentData.projects.intro || ""}
                    onChange={(e) => updateField("projects", "intro", e.target.value)}
                    rows={3}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">"View Project" Button Label</label>
                    <input
                      type="text"
                      value={currentData.projects.viewSite || ""}
                      onChange={(e) => updateField("projects", "viewSite", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2 px-3 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">"View Repository" Button Label</label>
                    <input
                      type="text"
                      value={currentData.projects.viewRepo || ""}
                      onChange={(e) => updateField("projects", "viewRepo", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2 px-3 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">"View All Projects" Link Label</label>
                    <input
                      type="text"
                      value={currentData.projects.viewAll || ""}
                      onChange={(e) => updateField("projects", "viewAll", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2 px-3 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Items Management */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-white font-bold text-sm">Projects Showcase</h3>
                    {currentData.projects.items.length > 0 && (
                      <label className="flex items-center cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300 font-semibold gap-1.5 bg-slate-800/40 py-1 px-2.5 rounded-lg border border-slate-800">
                        <input
                          type="checkbox"
                          checked={selectedProjectsToDelete.length === currentData.projects.items.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjectsToDelete(currentData.projects.items.map((_: any, i: number) => i));
                            } else {
                              setSelectedProjectsToDelete([]);
                            }
                          }}
                          className="w-3.5 h-3.5 bg-[#161a25] border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                        />
                        Select All
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProjectsToDelete.length > 0 && (
                      <button
                        onClick={deleteSelectedProjects}
                        className="bg-red-950/40 hover:bg-red-900 border border-red-900/50 text-red-400 text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        🗑️ Delete Selected ({selectedProjectsToDelete.length})
                      </button>
                    )}
                    <button
                      onClick={() => setIsGithubModalOpen(true)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      Fetch from GitHub
                    </button>
                    <button
                      onClick={addProjectItem}
                      className="bg-[#c7ff24]/10 hover:bg-[#c7ff24]/20 border border-[#c7ff24]/30 text-[#c7ff24] text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      + Add Project
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentData.projects.items.map((project: any, idx: number) => (
                    <div key={idx} className="bg-[#11141c] border border-slate-800 rounded-2xl p-6 relative flex flex-col md:flex-row gap-6">
                      
                      {/* Project Image Preview / Upload */}
                      <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
                        <div className="w-full aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative flex items-center justify-center">
                          {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">No Image</span>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-bold animate-pulse">Uploading...</span>
                            </div>
                          )}
                        </div>
                        <label className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-xl text-center cursor-pointer transition-colors block border border-slate-700">
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => updateProjectItem(idx, "imageUrl", url));
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Project details */}
                      <div className="flex-grow space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedProjectsToDelete.includes(idx)}
                              onChange={() => toggleSelectProjectToDelete(idx)}
                              className="w-3.5 h-3.5 bg-[#161a25] border border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                            />
                            Project #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => moveProjectItem(idx, "up")}
                              disabled={idx === 0}
                              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-[10px] cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveProjectItem(idx, "down")}
                              disabled={idx === currentData.projects.items.length - 1}
                              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white rounded p-1 text-[10px] cursor-pointer"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => deleteProjectItem(idx)}
                              className="bg-red-950/20 hover:bg-red-900 border border-red-950 hover:border-red-700 text-red-400 hover:text-white rounded-lg py-1 px-2.5 text-[10px] cursor-pointer ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Project Title</label>
                            <input
                              type="text"
                              value={project.title || ""}
                              onChange={(e) => updateProjectItem(idx, "title", e.target.value)}
                              className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Technologies (Comma separated)</label>
                            <input
                              type="text"
                              value={(project.technologies || []).join(", ") || ""}
                              onChange={(e) => {
                                const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                updateProjectItem(idx, "technologies", tags);
                              }}
                              className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Live Demo URL</label>
                            <input
                              type="text"
                              value={project.link || ""}
                              onChange={(e) => updateProjectItem(idx, "link", e.target.value)}
                              className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-3 outline-none text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">GitHub URL</label>
                            <input
                              type="text"
                              value={project.github || ""}
                              onChange={(e) => updateProjectItem(idx, "github", e.target.value)}
                              className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-1.5 px-3 outline-none text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 pt-1">
                          <label className="flex items-center cursor-pointer select-none text-xs text-white font-semibold gap-2">
                            <input
                              type="checkbox"
                              checked={project.hasDemo !== false}
                              onChange={(e) => updateProjectItem(idx, "hasDemo", e.target.checked)}
                              className="w-4 h-4 bg-[#161a25] border border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                            />
                            Live Demo Available
                          </label>
                          <label className="flex items-center cursor-pointer select-none text-xs text-white font-semibold gap-2">
                            <input
                              type="checkbox"
                              checked={project.isPublic !== false}
                              onChange={(e) => updateProjectItem(idx, "isPublic", e.target.checked)}
                              className="w-4 h-4 bg-[#161a25] border border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                            />
                            Repository is Public
                          </label>
                          <label className="flex items-center cursor-pointer select-none text-xs text-white font-semibold gap-2">
                            <input
                              type="checkbox"
                              checked={!!project.featured}
                              onChange={(e) => updateProjectItem(idx, "featured", e.target.checked)}
                              className="w-4 h-4 bg-[#161a25] border border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                            />
                            Show on Home Page
                          </label>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Project Description</label>
                          <textarea
                            value={project.description || ""}
                            onChange={(e) => updateProjectItem(idx, "description", e.target.value)}
                            rows={3}
                            className="w-full bg-[#161a25] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Image Filepath / URL</label>
                          <input
                            type="text"
                            value={project.imageUrl || ""}
                            onChange={(e) => updateProjectItem(idx, "imageUrl", e.target.value)}
                            className="w-full bg-[#161a25] border border-slate-800 text-slate-400 rounded-lg py-1.5 px-3 outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTACT & SOCIALS */}
          {activeTab === "contact" && (
            <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">Contact Header & Layout</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Index</label>
                  <input
                    type="text"
                    value={currentData.contact.badge || ""}
                    onChange={(e) => updateField("contact", "badge", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Section Title</label>
                  <input
                    type="text"
                    value={currentData.contact.title || ""}
                    onChange={(e) => updateField("contact", "title", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Headline</label>
                  <input
                    type="text"
                    value={currentData.contact.headline || ""}
                    onChange={(e) => updateField("contact", "headline", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Subheadline</label>
                  <input
                    type="text"
                    value={currentData.contact.subheadline || ""}
                    onChange={(e) => updateField("contact", "subheadline", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
              </div>

              <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 pt-4 mb-4">Values & URLs (Applies to all locales)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={currentData.contact.emailValue || ""}
                    onChange={(e) => updateField("contact", "emailValue", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={currentData.contact.linkedinUrl || ""}
                    onChange={(e) => updateField("contact", "linkedinUrl", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={currentData.contact.githubUrl || ""}
                    onChange={(e) => updateField("contact", "githubUrl", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">CV File Link / Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentData.contact.cvUrl || ""}
                      onChange={(e) => updateField("contact", "cvUrl", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                    <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer flex items-center justify-center whitespace-nowrap">
                      Upload PDF
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => updateField("contact", "cvUrl", url));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 pt-4 mb-4">Button Labels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Email Badge Label</label>
                  <input
                    type="text"
                    value={currentData.contact.emailLabel || ""}
                    onChange={(e) => updateField("contact", "emailLabel", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Email CTA Action Label</label>
                  <input
                    type="text"
                    value={currentData.contact.emailAction || ""}
                    onChange={(e) => updateField("contact", "emailAction", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Download CV Button Label</label>
                  <input
                    type="text"
                    value={currentData.contact.cv || ""}
                    onChange={(e) => updateField("contact", "cv", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: NAVIGATION & FOOTER */}
          {activeTab === "navigation" && (
            <div className="space-y-6">
              {/* Header Navigation */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">Header Navigation Labels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">About Link</label>
                    <input
                      type="text"
                      value={currentData.nav.about || ""}
                      onChange={(e) => updateField("nav", "about", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Experience Link</label>
                    <input
                      type="text"
                      value={currentData.nav.experience || ""}
                      onChange={(e) => updateField("nav", "experience", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Projects Link</label>
                    <input
                      type="text"
                      value={currentData.nav.projects || ""}
                      onChange={(e) => updateField("nav", "projects", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Contact Link</label>
                    <input
                      type="text"
                      value={currentData.nav.contact || ""}
                      onChange={(e) => updateField("nav", "contact", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Footer configuration */}
              <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">Footer Text Labels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"Designed in"</label>
                    <input
                      type="text"
                      value={currentData.footer.designedIn || ""}
                      onChange={(e) => updateField("footer", "designedIn", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"Developed/Coded in"</label>
                    <input
                      type="text"
                      value={currentData.footer.developedIn || ""}
                      onChange={(e) => updateField("footer", "developedIn", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"Built with"</label>
                    <input
                      type="text"
                      value={currentData.footer.builtWith || ""}
                      onChange={(e) => updateField("footer", "builtWith", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">"and/&"</label>
                    <input
                      type="text"
                      value={currentData.footer.and || ""}
                      onChange={(e) => updateField("footer", "and", e.target.value)}
                      className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SEO & METADATA */}
          {activeTab === "metadata" && (
            <div className="bg-[#161a25] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">HTML Lang tag (e.g. es / en)</label>
                  <input
                    type="text"
                    value={currentData.layout.htmlLang || ""}
                    onChange={(e) => updateField("layout", "htmlLang", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">OpenGraph Locale (e.g. es_ES / en_US)</label>
                  <input
                    type="text"
                    value={currentData.layout.ogLocale || ""}
                    onChange={(e) => updateField("layout", "ogLocale", e.target.value)}
                    className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Page Browser Title (SEO)</label>
                <input
                  type="text"
                  value={currentData.layout.title || ""}
                  onChange={(e) => updateField("layout", "title", e.target.value)}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Page Meta Description (SEO)</label>
                <textarea
                  value={currentData.layout.description || ""}
                  onChange={(e) => updateField("layout", "description", e.target.value)}
                  rows={3}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Page Meta Keywords (SEO, comma separated)</label>
                <input
                  type="text"
                  value={currentData.layout.keywords || ""}
                  onChange={(e) => updateField("layout", "keywords", e.target.value)}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-lg py-2.5 px-3.5 outline-none text-sm"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer save/logout for tablet/desktop */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between lg:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#c7ff24] hover:bg-[#b0e21a] text-slate-900 font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 font-semibold text-sm cursor-pointer"
          >
            Log Out
          </button>
        </div>

      </main>

      {/* GitHub Integration Modal */}
      {isGithubModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <h3 className="text-white font-bold text-lg">Fetch Projects from GitHub</h3>
              </div>
              <button
                onClick={() => {
                  setIsGithubModalOpen(false);
                  setGithubRepos([]);
                  setRepoError("");
                  setSelectedRepos([]);
                }}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Search/Username input */}
            <div className="p-6 bg-[#161a25]/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">GitHub Username</label>
                <input
                  type="text"
                  placeholder="e.g. kaeruishere"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full bg-[#11141c] border border-slate-800 focus:border-[#c7ff24] text-white rounded-xl py-2 px-4 outline-none text-sm font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchGithubRepos(githubUsername);
                  }}
                />
              </div>
              <button
                onClick={() => fetchGithubRepos(githubUsername)}
                disabled={isLoadingRepos}
                className="sm:mt-6 bg-[#c7ff24] hover:bg-[#b0e21a] disabled:bg-[#c7ff24]/50 text-slate-900 font-bold px-6 py-2 rounded-xl transition-all cursor-pointer text-sm"
              >
                {isLoadingRepos ? "Fetching..." : "Fetch Repositories"}
              </button>
            </div>

            {/* Repos list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {isLoadingRepos && (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#c7ff24] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-xs font-medium">Fetching public repositories...</p>
                </div>
              )}

              {repoError && (
                <div className="py-8 text-center text-red-400 text-xs font-semibold bg-red-950/20 border border-red-900 rounded-xl p-4">
                  ⚠️ {repoError}
                </div>
              )}

              {!isLoadingRepos && !repoError && githubRepos.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs font-medium">
                  Enter a GitHub username and click "Fetch Repositories" to load projects.
                </div>
              )}

              {!isLoadingRepos && !repoError && githubRepos.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/50">
                    <span>Found {githubRepos.length} public repositories</span>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#c7ff24] hover:underline font-semibold cursor-pointer"
                    >
                      {selectedRepos.length === githubRepos.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {githubRepos.map((repo: any) => {
                      const isSelected = selectedRepos.includes(repo.id);
                      return (
                        <div
                          key={repo.id}
                          onClick={() => toggleSelectRepo(repo.id)}
                          className={`p-4 border rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#c7ff24]/5 border-[#c7ff24]/30"
                              : "bg-[#161a25]/40 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // click handled by parent
                            className="w-4 h-4 mt-0.5 bg-[#161a25] border border-slate-800 text-[var(--color-primary)] rounded cursor-pointer accent-[#c7ff24]"
                          />
                          <div className="flex-grow space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white text-sm font-bold">{repo.name}</h4>
                              {repo.language && (
                                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {repo.language}
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-slate-400 text-xs line-clamp-2">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                              <span className="flex items-center gap-1">
                                🌟 {repo.stargazers_count}
                              </span>
                              {repo.homepage && (
                                <span className="text-[#c7ff24]">🔗 Demo available</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-[#161a25]/30 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedRepos.length} project{selectedRepos.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsGithubModalOpen(false);
                    setGithubRepos([]);
                    setRepoError("");
                    setSelectedRepos([]);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={importSelectedRepos}
                  disabled={selectedRepos.length === 0}
                  className="bg-[#c7ff24] hover:bg-[#b0e21a] disabled:opacity-50 text-slate-900 font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer"
                >
                  Import Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
