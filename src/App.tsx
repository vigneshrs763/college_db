import { FormEvent, useEffect, useMemo, useState } from "react";

type Role = "student" | "admin";
type Status = "Submitted" | "Assigned" | "In progress" | "Resolved";
type Priority = "Low" | "Medium" | "High" | "Urgent";
type RequestItem = {
  id: number;
  title: string;
  category: string;
  building: string;
  room: string;
  priority: Priority;
  status: Status;
  student: string;
  created: string;
  description: string;
  assignee?: string;
  comments: { author: string; text: string; time: string }[];
};

const starterRequests: RequestItem[] = [
  { id: 1048, title: "Air conditioner leaking", category: "HVAC", building: "Maple Hall", room: "204", priority: "High", status: "In progress", student: "Alex Morgan", created: "Today, 9:14 AM", description: "Water is dripping from the AC unit near the window.", assignee: "Marcus Lee", comments: [{ author: "Marcus Lee", text: "Replacement valve ordered. I’ll return this afternoon.", time: "10:32 AM" }] },
  { id: 1047, title: "Hallway light flickering", category: "Electrical", building: "Science Center", room: "2nd floor", priority: "Medium", status: "Assigned", student: "Taylor Reed", created: "Yesterday", description: "The light outside lab 212 flickers continuously.", assignee: "Jordan Kim", comments: [] },
  { id: 1046, title: "Sink drain blocked", category: "Plumbing", building: "Maple Hall", room: "118", priority: "Urgent", status: "Submitted", student: "Jamie Chen", created: "Mar 18", description: "The shared bathroom sink is completely blocked.", comments: [] },
  { id: 1045, title: "Desk leg is loose", category: "Furniture", building: "Oak Library", room: "Study 3", priority: "Low", status: "Resolved", student: "Alex Morgan", created: "Mar 16", description: "The front right desk leg is unstable.", assignee: "Marcus Lee", comments: [] },
];

const defaultData = {
  buildings: ["Maple Hall", "Science Center", "Oak Library", "Student Union"],
  rooms: ["118", "204", "2nd floor", "Study 3"],
  categories: ["HVAC", "Electrical", "Plumbing", "Furniture", "Cleaning"],
  users: ["Alex Morgan · Student", "Jamie Chen · Student", "Marcus Lee · Technician", "Jordan Kim · Technician"],
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    building: <><path d="M3 21h18M6 21V4h12v17M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    wrench: <><path d="M14.7 6.3a4 4 0 0 0-5-5L7 4 4 1a4 4 0 0 0 5 5l10 10a2 2 0 1 1-3 3L6 9"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M15 3h5v18h-5"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    x: <path d="M6 6l12 12M18 6 6 18"/>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const statusClass: Record<Status, string> = {
  Submitted: "bg-sky-50 text-sky-700",
  Assigned: "bg-violet-50 text-violet-700",
  "In progress": "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};
const priorityClass: Record<Priority, string> = {
  Low: "text-slate-500", Medium: "text-amber-600", High: "text-orange-600", Urgent: "text-rose-600",
};

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("student@campus.edu");
  const [password, setPassword] = useState("student123");
  const [error, setError] = useState("");
  const switchRole = (next: Role) => {
    setRole(next);
    setEmail(next === "student" ? "student@campus.edu" : "admin@campus.edu");
    setPassword(next === "student" ? "student123" : "admin123");
    setError("");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const valid = role === "student"
      ? email === "student@campus.edu" && password === "student123"
      : email === "admin@campus.edu" && password === "admin123";
    if (!valid) return setError("Email or password is incorrect. Use the demo credentials below.");
    onLogin(role);
  };
  return <main className="min-h-screen bg-[#071d2b] grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="hidden lg:flex relative overflow-hidden p-14 flex-col justify-between text-white">
      <div className="absolute inset-0 login-glow" />
      <div className="relative flex items-center gap-3 font-semibold text-lg"><span className="logo-mark"><Icon name="wrench" /></span> CampusCare</div>
      <div className="relative max-w-xl">
        <p className="eyebrow text-teal-300">Campus operations, simplified</p>
        <h1 className="text-5xl xl:text-6xl font-semibold leading-[1.06] tracking-[-0.04em] mt-5">A better campus starts with a faster fix.</h1>
        <p className="text-slate-300 text-lg leading-8 mt-6 max-w-lg">Report issues in moments, follow every update, and help your facilities team keep campus at its best.</p>
        <div className="flex gap-9 mt-12 text-sm text-slate-300">
          <span><b className="block text-white text-2xl">2.4×</b> faster resolution</span>
          <span><b className="block text-white text-2xl">94%</b> student satisfaction</span>
        </div>
      </div>
      <p className="relative text-xs text-slate-500">Campus Facilities Management · Secure access</p>
    </section>
    <section className="bg-[#f6f8f8] flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex items-center gap-3 font-semibold text-lg text-[#0a2738] mb-10"><span className="logo-mark"><Icon name="wrench" /></span> CampusCare</div>
        <p className="eyebrow text-teal-700">Welcome back</p>
        <h2 className="text-3xl font-semibold text-[#0a2738] mt-2 tracking-tight">Sign in to your account</h2>
        <p className="text-slate-500 mt-2">Choose your portal and enter your credentials.</p>
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl mt-8">
          {(["student", "admin"] as Role[]).map(item => <button key={item} onClick={() => switchRole(item)} className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition ${role === item ? "bg-white text-[#0a2738] shadow-sm" : "text-slate-500"}`}>{item} portal</button>)}
        </div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="field">College email<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
          <label className="field">Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
          {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{error}</p>}
          <button className="primary w-full justify-center" type="submit">Sign in securely <Icon name="arrow" size={17} /></button>
        </form>
        <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 leading-5">
          <b className="text-slate-700">Demo access</b><br />{role === "student" ? "student@campus.edu / student123" : "admin@campus.edu / admin123"}
        </div>
      </div>
    </section>
  </main>;
}

function AppShell({ role, onLogout }: { role: Role; onLogout: () => void }) {
  const [page, setPage] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>(() => {
    const saved = localStorage.getItem("campuscare_requests");
    return saved ? JSON.parse(saved) : starterRequests;
  });
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("campuscare_data");
    return saved ? JSON.parse(saved) : defaultData;
  });
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const [toast, setToast] = useState("");
  useEffect(() => localStorage.setItem("campuscare_requests", JSON.stringify(requests)), [requests]);
  useEffect(() => localStorage.setItem("campuscare_data", JSON.stringify(data)), [data]);
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2400); };
  const studentName = "Alex Morgan";
  const studentRequests = requests.filter(r => r.student === studentName);
  const visibleRequests = role === "student" ? studentRequests : requests;
  const nav = role === "student"
    ? [["Dashboard", "grid"], ["My requests", "file"], ["New request", "plus"], ["Notifications", "bell"]]
    : [["Dashboard", "grid"], ["Requests", "file"], ["Users", "users"], ["Buildings", "building"], ["Categories", "wrench"], ["Reports", "chart"]];
  const navigate = (target: string) => { setPage(target); setMobileNav(false); };
  const updateRequest = (id: number, patch: Partial<RequestItem>) => setRequests(old => old.map(r => r.id === id ? { ...r, ...patch } : r));

  return <div className="min-h-screen bg-[#f4f7f6] text-slate-800">
    <aside className={`sidebar ${mobileNav ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-semibold text-lg"><span className="logo-mark"><Icon name="wrench" /></span> CampusCare</div>
        <button onClick={() => setMobileNav(false)} className="lg:hidden text-slate-400"><Icon name="x" /></button>
      </div>
      <p className="mt-10 px-3 text-[10px] tracking-[.18em] font-bold text-slate-500 uppercase">{role} workspace</p>
      <nav className="mt-3 space-y-1">
        {nav.map(([label, icon]) => <button key={label} onClick={() => navigate(label)} className={`nav-item ${page === label ? "active" : ""}`}><Icon name={icon} size={18} />{label}</button>)}
      </nav>
      <div className="mt-auto">
        <div className="profile-card"><span className="avatar">{role === "student" ? "AM" : "SD"}</span><span className="min-w-0"><b className="block text-sm text-white truncate">{role === "student" ? "Alex Morgan" : "Sam Davis"}</b><small className="text-slate-500 capitalize">{role}</small></span></div>
        <button onClick={onLogout} className="nav-item mt-2"><Icon name="logout" size={18} /> Sign out</button>
      </div>
    </aside>
    <div className="lg:pl-64 min-h-screen">
      <header className="h-18 border-b border-slate-200 bg-white/90 backdrop-blur flex items-center px-5 sm:px-8 sticky top-0 z-20">
        <button onClick={() => setMobileNav(true)} className="lg:hidden mr-4 text-slate-600"><Icon name="menu" /></button>
        <div><p className="text-xs font-semibold text-teal-700 capitalize">{role} portal</p><h1 className="text-lg font-semibold text-[#0a2738]">{page}</h1></div>
        <button onClick={() => navigate("Notifications")} className="ml-auto relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600" aria-label="Notifications"><Icon name="bell" /><span className="absolute right-2 top-2 size-2 rounded-full bg-teal-500 ring-2 ring-white" /></button>
      </header>
      <main className="p-5 sm:p-8 max-w-[1500px] mx-auto">
        {page === "Dashboard" && <Dashboard role={role} requests={visibleRequests} navigate={navigate} select={setSelected} />}
        {(page === "My requests" || page === "Requests") && <RequestsPage requests={visibleRequests} role={role} updateRequest={updateRequest} select={setSelected} />}
        {page === "New request" && <NewRequest data={data} onSubmit={r => { setRequests(x => [r, ...x]); notify("Request submitted successfully"); navigate("My requests"); }} />}
        {page === "Notifications" && <Notifications requests={studentRequests} />}
        {["Users", "Buildings", "Categories"].includes(page) && <ManagePage page={page} data={data} setData={setData} notify={notify} />}
        {page === "Reports" && <Reports requests={requests} />}
      </main>
    </div>
    {selected && <RequestDrawer request={requests.find(r => r.id === selected.id) || selected} role={role} close={() => setSelected(null)} update={updateRequest} notify={notify} />}
    {toast && <div className="toast"><span className="size-6 rounded-full bg-teal-500 text-white grid place-items-center"><Icon name="check" size={14} /></span>{toast}</div>}
  </div>;
}

function Dashboard({ role, requests, navigate, select }: { role: Role; requests: RequestItem[]; navigate: (p: string) => void; select: (r: RequestItem) => void }) {
  const open = requests.filter(r => r.status !== "Resolved").length;
  const resolved = requests.filter(r => r.status === "Resolved").length;
  const urgent = requests.filter(r => r.priority === "Urgent").length;
  return <>
    <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
      <div><p className="eyebrow text-teal-700">{role === "student" ? "Tuesday, March 24" : "Facilities overview"}</p><h2 className="page-title">{role === "student" ? "Good morning, Alex." : "Operations at a glance."}</h2><p className="text-slate-500 mt-2">{role === "student" ? "Here’s what’s happening with your maintenance requests." : "Monitor workload, priorities, and team progress across campus."}</p></div>
      <button className="primary" onClick={() => navigate(role === "student" ? "New request" : "Requests")}><Icon name={role === "student" ? "plus" : "file"} size={17} />{role === "student" ? "New request" : "Manage requests"}</button>
    </section>
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Stat label={role === "student" ? "Open requests" : "Total requests"} value={role === "student" ? open : requests.length} note={role === "student" ? "Across campus" : "+12% this month"} icon="file" />
      <Stat label="In progress" value={requests.filter(r => r.status === "In progress").length} note="Actively being worked" icon="wrench" />
      <Stat label="Resolved" value={resolved} note={role === "student" ? "All time" : "82% completion rate"} icon="check" />
      <Stat label={role === "student" ? "Updates" : "Urgent"} value={role === "student" ? 3 : urgent} note={role === "student" ? "2 new today" : "Requires attention"} icon="bell" />
    </section>
    <section className="panel mt-6">
      <div className="panel-head"><div><h3>Recent requests</h3><p>Latest maintenance activity</p></div><button className="text-link" onClick={() => navigate(role === "student" ? "My requests" : "Requests")}>View all <Icon name="arrow" size={15} /></button></div>
      <RequestList requests={requests.slice(0, 5)} select={select} showStudent={role === "admin"} />
    </section>
  </>;
}

function Stat({ label, value, note, icon }: { label: string; value: number; note: string; icon: string }) {
  return <div className="stat-card"><div className="stat-icon"><Icon name={icon} /></div><p>{label}</p><strong>{value}</strong><small>{note}</small></div>;
}

function RequestList({ requests, select, showStudent = false }: { requests: RequestItem[]; select: (r: RequestItem) => void; showStudent?: boolean }) {
  return <div className="divide-y divide-slate-100">
    {requests.map(r => <button key={r.id} onClick={() => select(r)} className="request-row">
      <span className="min-w-0 text-left"><b className="block truncate text-sm text-[#102d3d]">{r.title}</b><small className="text-slate-500">#{r.id} · {r.building}, {r.room}{showStudent ? ` · Raised by ${r.student}` : ""}</small></span>
      <span className={`hidden sm:inline text-xs font-semibold ${priorityClass[r.priority]}`}>{r.priority}</span>
      <span className={`status ${statusClass[r.status]}`}>{r.status}</span>
      <Icon name="arrow" size={16} />
    </button>)}
    {!requests.length && <p className="p-10 text-center text-slate-400">No requests match your filters.</p>}
  </div>;
}

function RequestsPage({ requests, role, updateRequest, select }: { requests: RequestItem[]; role: Role; updateRequest: (id: number, p: Partial<RequestItem>) => void; select: (r: RequestItem) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = requests.filter(r => (status === "All" || r.status === status) && `${r.title} ${r.building} ${r.category} ${r.student} ${r.id}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <div className="mb-7"><p className="eyebrow text-teal-700">Request center</p><h2 className="page-title">{role === "admin" ? "Manage maintenance" : "Your maintenance history"}</h2></div>
    <div className="panel">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <label className="search-box"><Icon name="search" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." /></label>
        <select className="select-control" value={status} onChange={e => setStatus(e.target.value)}><option>All</option><option>Submitted</option><option>Assigned</option><option>In progress</option><option>Resolved</option></select>
      </div>
      <RequestList requests={filtered} select={select} showStudent={role === "admin"} />
      {role === "admin" && filtered.length > 0 && <div className="p-4 bg-slate-50 text-xs text-slate-500">Open a request to update status, assignment, and comments.</div>}
    </div>
  </>;
}

function NewRequest({ data, onSubmit }: { data: typeof defaultData; onSubmit: (r: RequestItem) => void }) {
  const [form, setForm] = useState({ title: "", category: data.categories[0], building: data.buildings[0], room: "", priority: "Medium" as Priority, description: "", photo: "" });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ id: Date.now() % 100000, title: form.title, category: form.category, building: form.building, room: form.room, priority: form.priority, status: "Submitted", student: "Alex Morgan", created: "Just now", description: form.description, comments: [] });
  };
  return <div className="max-w-3xl">
    <p className="eyebrow text-teal-700">Tell us what needs attention</p><h2 className="page-title">Submit a maintenance request</h2><p className="text-slate-500 mt-2 mb-7">Detailed information helps the facilities team resolve your issue faster.</p>
    <form onSubmit={submit} className="panel p-5 sm:p-7 grid sm:grid-cols-2 gap-5">
      <label className="field sm:col-span-2">Request title<input required placeholder="e.g. Air conditioner is leaking" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></label>
      <label className="field">Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{data.categories.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="field">Priority<select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Priority})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label>
      <label className="field">Building<select value={form.building} onChange={e => setForm({...form, building: e.target.value})}>{data.buildings.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="field">Room / location<input required placeholder="Room 204" value={form.room} onChange={e => setForm({...form, room: e.target.value})} /></label>
      <label className="field sm:col-span-2">Description<textarea required rows={5} placeholder="Describe the issue and when you first noticed it..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></label>
      <label className="field sm:col-span-2">Photo (optional)<input type="file" accept="image/*" onChange={e => setForm({...form, photo: e.target.files?.[0]?.name || ""})} /><small>JPG or PNG. The demo stores the filename only.</small></label>
      <div className="sm:col-span-2 flex justify-end"><button className="primary" type="submit">Submit request <Icon name="arrow" size={17} /></button></div>
    </form>
  </div>;
}

function RequestDrawer({ request, role, close, update, notify }: { request: RequestItem; role: Role; close: () => void; update: (id: number, p: Partial<RequestItem>) => void; notify: (m: string) => void }) {
  const [comment, setComment] = useState("");
  const addComment = (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    update(request.id, { comments: [...request.comments, { author: role === "admin" ? "Sam Davis" : "Alex Morgan", text: comment, time: "Just now" }] });
    setComment(""); notify("Comment added");
  };
  return <div className="fixed inset-0 z-50 bg-[#071d2b]/35 flex justify-end" onMouseDown={e => e.target === e.currentTarget && close()}>
    <aside className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl p-6 sm:p-8">
      <div className="flex justify-between items-start"><div><p className="eyebrow text-teal-700">Request #{request.id}</p><h2 className="text-2xl font-semibold text-[#0a2738] mt-1">{request.title}</h2></div><button onClick={close} className="p-2 rounded-full hover:bg-slate-100"><Icon name="x" /></button></div>
      <div className="flex gap-2 mt-5"><span className={`status ${statusClass[request.status]}`}>{request.status}</span><span className={`text-xs font-semibold px-3 py-1 ${priorityClass[request.priority]}`}>{request.priority} priority</span></div>
      <div className="grid grid-cols-2 gap-5 mt-7 p-5 bg-slate-50 rounded-2xl text-sm"><Info label="Category" value={request.category} /><Info label="Location" value={`${request.building}, ${request.room}`} /><Info label="Submitted by" value={request.student} /><Info label="Assigned to" value={request.assignee || "Unassigned"} /></div>
      <div className="mt-7"><h3 className="font-semibold text-[#0a2738]">Description</h3><p className="text-sm text-slate-600 mt-2 leading-6">{request.description}</p></div>
      {role === "admin" && <div className="mt-7 border-y border-slate-100 py-6 grid grid-cols-2 gap-4">
        <label className="field">Status<select value={request.status} onChange={e => { update(request.id, { status: e.target.value as Status }); notify("Status updated"); }}><option>Submitted</option><option>Assigned</option><option>In progress</option><option>Resolved</option></select></label>
        <label className="field">Assign technician<select value={request.assignee || ""} onChange={e => { update(request.id, { assignee: e.target.value, status: request.status === "Submitted" ? "Assigned" : request.status }); notify("Technician assigned"); }}><option value="">Unassigned</option><option>Marcus Lee</option><option>Jordan Kim</option></select></label>
      </div>}
      <div className="mt-7"><h3 className="font-semibold text-[#0a2738]">Activity & comments</h3><div className="mt-4 space-y-3">{request.comments.map((c, i) => <div className="bg-slate-50 rounded-xl p-4 text-sm" key={i}><b>{c.author}</b><span className="text-xs text-slate-400 ml-2">{c.time}</span><p className="mt-1 text-slate-600">{c.text}</p></div>)}{!request.comments.length && <p className="text-sm text-slate-400">No comments yet.</p>}</div>
        <form onSubmit={addComment} className="mt-4 flex gap-2"><input className="comment-input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." /><button className="primary px-4" aria-label="Add comment"><Icon name="message" size={17} /></button></form>
      </div>
    </aside>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><small className="text-slate-400 block">{label}</small><b className="text-slate-700">{value}</b></div>; }

function Notifications({ requests }: { requests: RequestItem[] }) {
  return <div className="max-w-3xl"><p className="eyebrow text-teal-700">Stay informed</p><h2 className="page-title">Notifications</h2><div className="panel mt-7 divide-y divide-slate-100">
    {requests.slice(0, 4).map((r, i) => <div key={r.id} className="p-5 flex gap-4"><span className="stat-icon shrink-0"><Icon name={i === 0 ? "wrench" : "bell"} /></span><div><b className="text-sm text-[#102d3d]">{r.title}</b><p className="text-sm text-slate-500 mt-1">Request #{r.id} is now <span className="lowercase">{r.status}</span>.</p><small className="text-slate-400">{r.created}</small></div></div>)}
  </div></div>;
}

function ManagePage({ page, data, setData, notify }: { page: string; data: typeof defaultData; setData: (d: typeof defaultData) => void; notify: (m: string) => void }) {
  const key = page === "Users" ? "users" : page === "Buildings" ? "buildings" : "categories";
  const [value, setValue] = useState("");
  const items: string[] = data[key];
  const add = (e: FormEvent) => { e.preventDefault(); if (!value.trim()) return; setData({ ...data, [key]: [...items, value.trim()] }); setValue(""); notify(`${page.slice(0, -1)} added`); };
  const remove = (item: string) => { setData({ ...data, [key]: items.filter(x => x !== item) }); notify(`${page.slice(0, -1)} removed`); };
  return <div className="max-w-4xl"><p className="eyebrow text-teal-700">Campus configuration</p><h2 className="page-title">Manage {page.toLowerCase()}</h2><form onSubmit={add} className="panel p-4 mt-7 flex gap-3"><input className="comment-input" value={value} onChange={e => setValue(e.target.value)} placeholder={`Add ${page.slice(0, -1).toLowerCase()}...`} /><button className="primary"><Icon name="plus" size={17} /> Add</button></form><div className="panel mt-4 divide-y divide-slate-100">{items.map(item => <div key={item} className="p-4 flex items-center justify-between text-sm"><span className="font-medium">{item}</span><button onClick={() => remove(item)} className="text-rose-600 text-xs font-semibold hover:underline">Remove</button></div>)}</div></div>;
}

function Reports({ requests }: { requests: RequestItem[] }) {
  const counts = ["HVAC", "Electrical", "Plumbing", "Furniture", "Cleaning"].map(name => ({ name, count: requests.filter(r => r.category === name).length }));
  const max = Math.max(...counts.map(x => x.count), 1);
  return <><p className="eyebrow text-teal-700">Performance insights</p><h2 className="page-title">Maintenance reports</h2><section className="grid lg:grid-cols-3 gap-4 mt-7"><Stat label="Resolution rate" value={Math.round(requests.filter(r => r.status === "Resolved").length / requests.length * 100)} note="Percent of all requests" icon="check" /><Stat label="Open workload" value={requests.filter(r => r.status !== "Resolved").length} note="Active requests" icon="file" /><Stat label="Urgent requests" value={requests.filter(r => r.priority === "Urgent").length} note="Current priority" icon="bell" /></section><section className="panel p-6 mt-5"><h3 className="font-semibold text-[#0a2738]">Requests by category</h3><p className="text-sm text-slate-500 mt-1">Current distribution of submitted work</p><div className="space-y-5 mt-7">{counts.map(x => <div key={x.name} className="grid grid-cols-[90px_1fr_28px] items-center gap-3 text-sm"><span>{x.name}</span><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${(x.count / max) * 100}%` }} /></div><b>{x.count}</b></div>)}</div></section></>;
}

export default function App() {
  const [role, setRole] = useState<Role | null>(() => sessionStorage.getItem("campuscare_role") as Role | null);
  const login = (next: Role) => { sessionStorage.setItem("campuscare_role", next); setRole(next); };
  const logout = () => { sessionStorage.removeItem("campuscare_role"); setRole(null); };
  return role ? <AppShell role={role} onLogout={logout} /> : <Login onLogin={login} />;
}
