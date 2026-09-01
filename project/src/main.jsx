import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity, AlertCircle, ArrowRight, BarChart3, Bell, CheckCircle2, ChevronDown,
  ClipboardList, Clock3, FileCheck2, FileText, Filter, Flag, Home, LogIn,
  LogOut, MapPin, Menu, MessageSquare, Plus, RefreshCw, Search, Send, ShieldCheck, ImagePlus, Camera, Upload, Trash2,
  Sparkles, ThumbsUp, User, Users, X, CircleDot, Loader2
} from "lucide-react";
import "./styles.css";

const api = async (path, options={}) => {
  const token = localStorage.getItem("cr_token");
  const headers = {"Content-Type":"application/json", ...(options.headers||{})};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, {...options, headers});
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("cr_user") || "null"); } catch { return null; }
};

function App(){
  const [user,setUser]=useState(getUser());
  const [view,setView]=useState(user ? (user.role==="officer"?"dashboard":"home") : "home");
  const [menu,setMenu]=useState(false);
  const [toast,setToast]=useState(null);

  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(null),3500);return()=>clearTimeout(t)}},[toast]);

  const logout=()=>{localStorage.removeItem("cr_token");localStorage.removeItem("cr_user");setUser(null);setView("home");};

  const notify=(message,type="success")=>setToast({message,type});

  return <div className="app">
    <Header user={user} onMenu={()=>setMenu(!menu)} onLogout={logout} onNavigate={setView}/>
    <div className="shell">
      {user && <Sidebar user={user} view={view} setView={setView} mobileOpen={menu} close={()=>setMenu(false)} />}
      <main className={user ? "main with-sidebar" : "main"}>
        {!user ? (
          view==="login" ? <Auth mode="login" onSuccess={(u)=>{setUser(u);setView(u.role==="officer"?"dashboard":"home")}} onSwitch={()=>setView("signup")} />
          : view==="signup" ? <Auth mode="signup" onSuccess={(u)=>{setUser(u);setView(u.role==="officer"?"dashboard":"home")}} onSwitch={()=>setView("login")} />
          : <Landing onLogin={()=>setView("login")} onSignup={()=>setView("signup")} />
        ) : (
          <Dashboard user={user} setUser={setUser} view={view} setView={setView} notify={notify}/>
        )}
      </main>
    </div>
    {toast && <div className={"toast "+toast.type}><CheckCircle2 size={18}/>{toast.message}</div>}
  </div>
}

function Header({user,onMenu,onLogout,onNavigate}){
  const profileImage=localStorage.getItem(`cr_profile_image_${user?.email}`);
  return <header className="topbar">
    <div className="brand" onClick={()=>onNavigate(user ? (user.role==="officer"?"dashboard":"home"):"home")}>
      <div className="brand-mark"><ShieldCheck size={22}/></div>
      <div><strong>CivicResolve</strong><span>Community service portal</span></div>
    </div>
    <div className="header-right">
      {user && <><button className="icon-btn" title="Notifications"><Bell size={19}/></button><div className="profile"><div className="avatar">{profileImage?<img src={profileImage} alt="Profile"/>:<User size={17}/>}</div><div className="profile-text"><b>{user.name}</b><span>{user.role==="officer"?"Officer":"Citizen"}</span></div></div><button className="outline-btn logout-btn" onClick={onLogout}><LogOut size={16}/> <span>Logout</span></button></>}
      {user && <button className="icon-btn mobile-menu" onClick={onMenu}><Menu size={21}/></button>}
    </div>
  </header>
}

function Sidebar({user,view,setView,mobileOpen,close}){
  const items=user.role==="officer"
    ? [["dashboard","Overview",BarChart3],["complaints","All complaints",ClipboardList],["create","New complaint",Plus],["profile","My profile",User]]
    : [["home","Overview",Home],["mine","My complaints",ClipboardList],["create","Submit complaint",Plus],["profile","My profile",User]];
  return <aside className={"sidebar "+(mobileOpen?"open":"")}>
    <div className="side-label">Workspace</div>
    {items.map(([id,label,Icon])=><button key={id} className={view===id?"nav-item active":"nav-item"} onClick={()=>{setView(id);close()}}><Icon size={18}/><span>{label}</span></button>)}
    <div className="side-divider"/>
    <button className="nav-item" onClick={()=>window.open("/api/health","_blank")}><Activity size={18}/><span>System status</span></button>
    <div className="side-footer"><ShieldCheck size={17}/><span>Secure civic reporting</span></div>
    <button className="sidebar-logout" onClick={()=>{localStorage.removeItem("cr_token");localStorage.removeItem("cr_user");window.location.reload()}}><LogOut size={17}/><span>Logout</span></button>
  </aside>
}

function Landing({onLogin,onSignup}){
  return <div className="landing">
    <section className="hero">
      <div className="eyebrow"><span className="status-dot"/> Public service reporting</div>
      <h1>Turn local concerns into <span>visible progress.</span></h1>
      <p>Report civic issues, follow every update, and help your community prioritize what needs attention.</p>
      <div className="hero-actions"><button className="primary-btn" onClick={onSignup}>Create an account <ArrowRight size={18}/></button><button className="secondary-btn" onClick={onLogin}>Sign in</button></div>
      <div className="trust-row"><div><ShieldCheck size={16}/> Secure accounts</div><div><Clock3 size={16}/> Status tracking</div><div><MessageSquare size={16}/> Clear updates</div></div>
    </section>
    <section className="landing-card">
      <div className="mini-header"><div><span className="muted">Community queue</span><h3>Service requests</h3></div><CircleDot size={19}/></div>
      <div className="mock-list">
        <MockRow icon={MapPin} title="Street lighting" area="Central district" status="In Progress"/>
        <MockRow icon={Flag} title="Road maintenance" area="North avenue" status="Pending"/>
        <MockRow icon={FileCheck2} title="Waste collection" area="Market road" status="Resolved"/>
      </div>
      <div className="mock-footer"><span>Live status updates</span><ArrowRight size={15}/></div>
    </section>
  </div>
}
function MockRow({icon:Icon,title,area,status}){return <div className="mock-row"><div className="row-icon"><Icon size={17}/></div><div className="grow"><b>{title}</b><span>{area}</span></div><StatusBadge status={status}/></div>}

function Auth({mode,onSuccess,onSwitch}){
  const [form,setForm]=useState({name:"",email:"",password:"",role:"citizen"});
  const [loading,setLoading]=useState(false),[error,setError]=useState("");
  const submit=async e=>{e.preventDefault();setError("");setLoading(true);try{
    const data=await api("/api/auth/"+mode,{method:"POST",body:JSON.stringify(form)});
    localStorage.setItem("cr_token",data.token);localStorage.setItem("cr_user",JSON.stringify(data.user));onSuccess(data.user);
  }catch(err){setError(err.message)}finally{setLoading(false)}};
  return <div className="auth-wrap"><div className="auth-card">
    <div className="auth-icon"><ShieldCheck size={24}/></div>
    <h1>{mode==="login"?"Welcome back":"Create your account"}</h1>
    <p>{mode==="login"?"Sign in to continue to CivicResolve.":"Join CivicResolve and make local issues easier to resolve."}</p>
    {error&&<div className="error-box"><AlertCircle size={17}/>{error}</div>}
    <form onSubmit={submit}>
      {mode==="signup"&&<label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/></label>}
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/></label>
      <label>Password<input type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" required/></label>
      {mode==="signup"&&<label>Account type<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="citizen">Citizen</option><option value="officer">Officer</option></select></label>}
      <button className="primary-btn full" disabled={loading}>{loading?<><Loader2 className="spin" size={17}/> Please wait...</>:mode==="login"?<><LogIn size={17}/> Sign in</>:<><Users size={17}/> Create account</>}</button>
    </form>
    <div className="auth-switch">{mode==="login"?"New to CivicResolve?":"Already have an account?"}<button onClick={onSwitch}>{mode==="login"?"Create account":"Sign in"}</button></div>
  </div></div>
}

function Dashboard({user,setUser,view,setView,notify}){
  if(view==="create") return <CreateComplaint notify={notify} setView={setView}/>;
  if(view==="mine") return <ComplaintList mode="mine" user={user} notify={notify} setView={setView}/>;
  if(view==="complaints") return <ComplaintList mode="all" user={user} notify={notify} setView={setView}/>;
  if(view==="profile") return <Profile user={user} setUser={setUser} notify={notify}/>;
  return <Overview user={user} notify={notify} setView={setView}/>;
}

function Overview({user,notify,setView}){
  const [data,setData]=useState(null),[loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);try{
    const path=user.role==="officer"?"/api/complaints":"/api/complaints/mine";
    const d=await api(path);setData(d);
  }catch(e){notify(e.message,"error")}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const complaints=data?.complaints||[];
  const stats=useMemo(()=>({
    total:complaints.length,
    pending:complaints.filter(x=>x.status==="Pending").length,
    progress:complaints.filter(x=>x.status==="In Progress").length,
    resolved:complaints.filter(x=>x.status==="Resolved").length
  }),[complaints]);

  return <div>
    <PageTitle
      title={user.role==="officer"?"Officer command center":"Citizen dashboard"}
      subtitle={user.role==="officer"
        ?"Review incoming reports, update statuses, and keep residents informed."
        :"Submit civic reports, monitor progress, and see your requests in one place."}
      action={<button className="primary-btn" onClick={()=>setView("create")}><Plus size={17}/> Submit complaint</button>}
    />
    <div className="welcome-strip">
      <div className="welcome-icon"><ShieldCheck size={21}/></div>
      <div className="grow"><b>Welcome, {user.name}</b><span>{user.role==="officer"?"You are signed in as an officer.":"You are signed in as a citizen."}</span></div>
      <span className="role-pill">{user.role==="officer"?"Officer account":"Citizen account"}</span>
    </div>
    <div className="stat-grid">
      <Stat icon={ClipboardList} label={user.role==="officer"?"Reports in queue":"My reports"} value={stats.total} loading={loading}/>
      <Stat icon={Clock3} label="Pending" value={stats.pending} loading={loading}/>
      <Stat icon={Activity} label="In progress" value={stats.progress} loading={loading}/>
      <Stat icon={CheckCircle2} label="Resolved" value={stats.resolved} loading={loading}/>
    </div>
    <section className="panel">
      <div className="panel-head"><div><h3>{user.role==="officer"?"Latest community reports":"Your latest reports"}</h3><p>{user.role==="officer"?"Use the status controls to move reports through the workflow.":"Every report stays visible until it is resolved."}</p></div><button className="text-btn" onClick={()=>setView(user.role==="officer"?"complaints":"mine")}>View all <ArrowRight size={15}/></button></div>
      {loading?<Loading/>:complaints.length===0?<Empty title="No complaints yet" text="Submit a civic report to get started."/>:<div className="complaint-list">{complaints.slice(0,6).map(c=><ComplaintCard key={c._id} c={c} user={user} notify={notify} />)}</div>}
    </section>
  </div>
}

function Stat({icon:Icon,label,value,loading}){return <div className="stat-card"><div className="stat-icon"><Icon size={19}/></div><div><span>{label}</span><strong>{loading?"—":value}</strong></div></div>}

function ComplaintList({mode,user,notify,setView}){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(""),[status,setStatus]=useState("");
  const load=async()=>{setLoading(true);try{const path=mode==="mine"?"/api/complaints/mine":"/api/complaints";const d=await api(path+(mode==="all"&&status?`?status=${encodeURIComponent(status)}`:""));setItems(d.complaints||[])}catch(e){notify(e.message,"error")}finally{setLoading(false)}};
  useEffect(()=>{load()},[mode,status]);
  const filtered=items.filter(c=>(c.title+" "+c.description+" "+c.area).toLowerCase().includes(search.toLowerCase()));
  return <div><PageTitle title={mode==="mine"?"My complaints":"All complaints"} subtitle={mode==="mine"?"Your submitted reports and their latest status.":"Review and manage community reports."} action={<button className="primary-btn" onClick={()=>setView("create")}><Plus size={17}/> New complaint</button>}/>
    <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Search complaints..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="select-wrap"><Filter size={16}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select></div><button className="icon-btn" title="Refresh" onClick={load}><RefreshCw size={17}/></button></div>
    <section className="panel">{loading?<Loading/>:filtered.length===0?<Empty title="Nothing found" text="Try another search or filter."/>:<div className="complaint-list">{filtered.map(c=><ComplaintCard key={c._id} c={c} user={user} notify={notify}/>)}</div>}</section>
  </div>
}

function ComplaintCard({c,user,notify}){
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState(c.status);
  const [remark,setRemark]=useState(c.officerRemark||"");
  const save=async()=>{setBusy(true);try{await api(`/api/complaints/${c._id}/status`,{method:"PATCH",body:JSON.stringify({status,officerRemark:remark})});notify("Complaint status updated successfully.");}catch(e){notify(e.message,"error")}finally{setBusy(false)}};
  const upvote=async()=>{try{await api(`/api/complaints/${c._id}/upvote`,{method:"PATCH"});notify("Thanks — your support was recorded.");}catch(e){notify(e.message,"error")}};
  return <article className="complaint-card">
    <div className="complaint-main"><div className="category-icon"><FileText size={18}/></div><div className="grow"><div className="title-row"><h4>{c.title}</h4><StatusBadge status={c.status}/></div><p>{c.description}</p>{c.imageUrl&&<div className="complaint-image-wrap"><img className="complaint-image" src={c.imageUrl} alt="Complaint evidence" onError={e=>e.currentTarget.parentElement.style.display="none"}/><span className="evidence-label"><Camera size={13}/> Photo evidence</span></div>}<div className="meta"><span><MapPin size={14}/>{c.area}</span><span><Flag size={14}/>{c.category}</span><span><Clock3 size={14}/>{new Date(c.createdAt).toLocaleDateString()}</span></div></div></div>
    <div className="card-footer"><button className="vote-btn" onClick={upvote}><ThumbsUp size={15}/> {c.upvotes||0} support</button>{user.role==="officer"&&<div className="officer-controls"><select value={status} onChange={e=>setStatus(e.target.value)}><option>Pending</option><option>In Progress</option><option>Resolved</option></select><input value={remark} onChange={e=>setRemark(e.target.value)} placeholder="Officer remark (optional)"/><button className="small-primary" onClick={save} disabled={busy}>{busy?<Loader2 className="spin" size={15}/>:<CheckCircle2 size={15}/>} Save</button></div>}</div>
  </article>
}

function StatusBadge({status}){return <span className={"status "+status.toLowerCase().replace(" ","-")}><span/> {status}</span>}

function CreateComplaint({notify,setView}){
  const [form,setForm]=useState({title:"",description:"",category:"Road",area:"",imageUrl:""}),[loading,setLoading]=useState(false),[error,setError]=useState("");
  const [preview,setPreview]=useState("");
  const handleImage=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/")){setError("Please choose an image file.");return;}if(file.size>4*1024*1024){setError("Please choose an image smaller than 4 MB.");return;}const reader=new FileReader();reader.onload=()=>{setPreview(reader.result);setForm(f=>({...f,imageUrl:reader.result}));};reader.readAsDataURL(file);};
  const submit=async e=>{e.preventDefault();setLoading(true);setError("");try{await api("/api/complaints",{method:"POST",body:JSON.stringify(form)});notify("Complaint submitted successfully with your evidence.");setView("mine")}catch(e){setError(e.message)}finally{setLoading(false)}};
  return <div><PageTitle title="Submit a complaint" subtitle="Add clear details and a photo so the officer can understand the issue faster."/>
    <div className="form-panel"><form onSubmit={submit} className="complaint-form">
      {error&&<div className="error-box"><AlertCircle size={17}/>{error}</div>}
      <div className="form-grid"><label>Complaint title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Damaged street light near the market" required/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Road</option><option>Garbage</option><option>Water</option><option>Electricity</option><option>Other</option></select></label></div>
      <label>Location / area<input value={form.area} onChange={e=>setForm({...form,area:e.target.value})} placeholder="Street, neighborhood or landmark" required/></label>
      <label>Description<textarea rows="7" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe what is happening, where it is, and any useful context." required/></label>
      <div className="upload-section"><div className="upload-heading"><div><b>Add a photo</b><span>Optional — upload visual evidence for the officer</span></div><Camera size={20}/></div><label className="dropzone"><input type="file" accept="image/*" onChange={handleImage}/><ImagePlus size={28}/><b>Choose complaint image</b><span>JPG, PNG or WEBP • Maximum 4 MB</span></label>{preview&&<div className="image-preview"><img src={preview} alt="Complaint preview"/><div><b>Photo attached successfully</b><span>This image will be sent with the complaint and shown to the officer.</span></div><button type="button" className="remove-image" onClick={()=>{setPreview("");setForm(f=>({...f,imageUrl:""}))}}><Trash2 size={16}/> Remove</button></div>}</div>
      <div className="form-actions"><button type="button" className="secondary-btn" onClick={()=>setView("home")}>Cancel</button><button className="primary-btn" disabled={loading}>{loading?<><Loader2 className="spin" size={17}/> Sending...</>:<><Send size={17}/> Submit report</>}</button></div>
    </form></div>
  </div>
}

function Profile({user,setUser,notify}){
  const initials=(user.name||"User").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
  const key=`cr_profile_image_${user.email}`;
  const [image,setImage]=useState(()=>localStorage.getItem(key)||"");
  const upload=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/")){notify("Please select an image file.","error");return;}if(file.size>3*1024*1024){notify("Profile image must be smaller than 3 MB.","error");return;}const r=new FileReader();r.onload=()=>{localStorage.setItem(key,r.result);setImage(r.result);setUser({...user});notify("Profile photo updated successfully.");};r.readAsDataURL(file)};
  const remove=()=>{localStorage.removeItem(key);setImage("");setUser({...user});notify("Profile photo removed.");};
  return <div><PageTitle title="My profile" subtitle="Manage your CivicResolve identity and profile photo."/>
    <section className="profile-panel profile-modern"><div className="profile-photo-area"><div className="large-avatar">{image?<img src={image} alt="Profile"/>:initials}</div><label className="photo-edit"><Camera size={15}/><input type="file" accept="image/*" onChange={upload}/>Change photo</label></div><div className="profile-info"><span className="muted">ACCOUNT HOLDER</span><h2>{user.name}</h2><p>{user.email}</p><div className="profile-badges"><span className="role-pill">{user.role==="officer"?"Officer":"Citizen"}</span><span className="secure-pill"><ShieldCheck size={13}/> Secure session</span>{image&&<button className="mini-remove" onClick={remove}><Trash2 size={13}/> Remove photo</button>}</div></div></section>
    <div className="profile-grid"><div className="info-card"><User size={18}/><div><span>Full name</span><b>{user.name}</b></div></div><div className="info-card"><MessageSquare size={18}/><div><span>Email</span><b>{user.email}</b></div></div><div className="info-card"><ShieldCheck size={18}/><div><span>Account type</span><b>{user.role==="officer"?"Officer":"Citizen"}</b></div></div><div className="info-card"><Activity size={18}/><div><span>Portal access</span><b>{user.role==="officer"?"Case management":"Complaint reporting"}</b></div></div></div>
  </div>
}

function PageTitle({title,subtitle,action}){return <div className="page-title"><div><div className="eyebrow compact"><span className="status-dot"/> CivicResolve</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
function Loading(){return <div className="loading"><Loader2 className="spin" size={22}/> Loading complaints...</div>}
function Empty({title,text}){return <div className="empty"><div className="empty-icon"><ClipboardList size={22}/></div><h3>{title}</h3><p>{text}</p></div>}

createRoot(document.getElementById("root")).render(<App/>);
