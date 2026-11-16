import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ScoutPage.css";

const KEY = "jmm-scout-review-v1";
const regions = {provence:"Provence & French Riviera",dolomites:"Dolomites",alps:"Alps"};
const empty = () => ({schema_version:1,videos:{}});
const labels = {guided_candidate:"Guided ride",self_guided_candidate:"Self-guided ride",hotel_tip_candidate:"Hotel tip",ride_inspiration:"Ride inspiration"};
export function validateCatalogue(data) {
  if(data?.schema_version!==1 || !data.videos || typeof data.videos!=="object" || Array.isArray(data.videos)) throw Error("Choose a Scout schema version 1 catalogue.");
  for(const [id,v] of Object.entries(data.videos)){
    if(v.video_id!==id || !/^[\w-]{11}$/.test(id) || !v.regions || typeof v.regions!=="object" || Array.isArray(v.regions)) throw Error("Invalid video record: "+id);
    if(typeof v.title!=="string" || (v.description!=null && typeof v.description!=="string")) throw Error("Invalid video text.");
    for(const [r,m] of Object.entries(v.regions)){
      if(!regions[r] || !m || !["pending_review","approved","rejected"].includes(m.editorial_status) || !Array.isArray(m.catalogue_tags) || m.catalogue_tags.some(t=>!labels[t])) throw Error("Invalid region review record.");
      if(!Array.isArray(m.region_evidence) || m.region_evidence.some(e=>typeof e?.matched_text!=="string" || typeof e?.field!=="string")) throw Error("Invalid location evidence.");
    }
  }
  return data;
}
function initial(){
  try {const stored=localStorage.getItem(KEY); return stored?validateCatalogue(JSON.parse(stored)):empty();} catch{return empty();}
}
export default function ScoutPage(){
  const catalogueView=useLocation().pathname.startsWith("/rides/");
  const [data,setData]=useState(initial);
  const [region,setRegion]=useState("provence");
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [notice,setNotice]=useState("");
  const [interest,setInterest]=useState("");
  const [notes,setNotes]=useState("");
  const [demo,setDemo]=useState(false);
  const [drafts,setDrafts]=useState([]);
  const records=Object.values(data.videos);
  const regional=records.filter(v=>v.regions[region]);
  const approved=regional.filter(v=>v.regions[region].editorial_status==="approved");
  const visible=(catalogueView?approved:regional).filter(v=>(filter==="all" || v.regions[region].editorial_status===filter) && (v.title+" "+(v.channel||"")).toLowerCase().includes(search.toLowerCase()));
  function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));setData(next);setNotice("Saved in this browser. Export a backup before leaving.");}catch{setNotice("Browser storage is unavailable or full. Export your catalogue.");}}
  function update(id,fn){const next=structuredClone(data);fn(next.videos[id]);save(next);}
  async function upload(event){try{const file=event.target.files[0];if(!file)return;if(file.size>5000000)throw Error("Please use a JSON file smaller than 5 MB.");
    const incoming=validateCatalogue(JSON.parse(await file.text()));
    const next=structuredClone(data);
    for(const [id,v] of Object.entries(incoming.videos)){
      const old=next.videos[id]; next.videos[id]={...v,regions:{...v.regions,...old?.regions}};
    } save(next);setDemo(false);
  }catch(e){setNotice(e.message);}finally{event.target.value="";}}
  function download(payload,name){const a=document.createElement("a");const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function demoRecord(){
    const id="SCOUTDEMO01";
    save({...data,videos:{...data.videos,[id]:{video_id:id,title:"Demo only · Verdon motorcycle ride",description:"Illustrative review record. No footage or real operator is attached.",channel:"Scout demonstration",is_demo:true,embeddable_at_check:false,format:"video",regions:{provence:{editorial_status:"pending_review",catalogue_tags:["ride_inspiration","self_guided_candidate"],region_evidence:[{field:"title",matched_text:"Verdon"}],region_match:"metadata_candidate"}}}}});
    setDemo(true);
  }
  return <main className="scout">
    <div className="scout-top"><Link to="/jetmymoto">JETMYMOTO <span>/ SCOUT</span></Link><nav><Link to="/scout">Review desk</Link><Link to="/rides/provence">Regional catalogue</Link></nav></div>
    <header className="scout-hero"><p className="eyebrow">{catalogueView?"THE RIDING COLLECTION":"EDITORIAL WORKSPACE · PILOT 01"}</p>
      <h1>{catalogueView?"Find a road worth riding.":"Great rides. Hidden in plain sight."}</h1>
      <p>{catalogueView?"Watch the region. Explore the possibilities. Choose how you want to ride.":"Turn scattered motorcycle videos into a regional collection, one considered decision at a time."}</p>
      <div className="scout-pills"><span>01 Discover</span><span>02 Review</span><span>03 Curate</span></div>
    </header>
    <aside className="scout-banner">Private pilot · Decisions and the catalogue preview are stored in this browser only. Nothing is published. {catalogueView?"Ride enquiries below are test drafts, not sent to an operator.":"Import Scout JSON to start. No API key belongs in this page."}</aside>
    <section className="scout-stats"><div><strong>{regional.length}</strong><span>Regional candidates</span></div><div><strong>{regional.filter(v=>v.regions[region].editorial_status==="pending_review").length}</strong><span>Awaiting review</span></div><div><strong>{approved.length}</strong><span>Curated selections</span></div></section>
    <div className="scout-tools"><label>Region<select value={region} onChange={e=>{setRegion(e.target.value);setFilter("all");}}>{Object.entries(regions).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
      <label>Find a video<input placeholder="Search title or creator" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      {!catalogueView&&<><label>Status<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All candidates</option><option value="pending_review">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label><label className="scout-button">Import Scout JSON<input className="scout-file" type="file" accept=".json,application/json" onChange={upload}/></label><button onClick={()=>download(data,"scout-catalogue.json")}>Export catalogue</button></>}
    </div>
    <p role="status" className="scout-notice">{notice}</p>
    <section className="scout-grid">{visible.map(v=><article className="scout-card" key={v.video_id}>
      <div className="scout-video">{v.is_demo?<div className="scout-demo">DEMO RECORD<br/>No video attached</div>:<iframe loading="lazy" title={v.title} src={"https://www.youtube-nocookie.com/embed/"+v.video_id} allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}</div>
      <div className="scout-card-body"><p className="eyebrow">{v.channel||"Creator unavailable"} · {v.format==="short_duration_candidate"?"Short-duration candidate":"Video"}</p><h2>{v.title}</h2>
        <div className="scout-tags">{v.regions[region].catalogue_tags.map(t=><span key={t}>{labels[t]}</span>)}</div>
        <p className="scout-description">{v.description||"No description supplied."}</p>
        {!v.is_demo&&<a target="_blank" rel="noreferrer" href={"https://www.youtube.com/watch?v="+v.video_id}>Watch original on YouTube ↗</a>}
        {!catalogueView&&<><details><summary>Location evidence & review notes</summary><p>{v.regions[region].region_evidence.map(e=>e.field+": "+e.matched_text).join(" · ")||"No location evidence. Review the original video."}</p><p>Route, hotel, operator and availability remain unverified. Short duration does not confirm Shorts format.</p></details>
        <label>Move to region<select aria-label={"Region for "+v.title} value={region} onChange={e=>{const target=e.target.value;update(v.video_id,item=>{const moved={...item.regions[region],editorial_status:"pending_review",region_match:"editor_reassigned",region_evidence:[]};delete item.regions[region];item.regions[target]=moved;});}}>{Object.entries(regions).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <div className="scout-actions"><button className="primary" onClick={()=>update(v.video_id,item=>{item.regions[region].editorial_status="approved";})}>Approve</button><button onClick={()=>update(v.video_id,item=>{item.regions[region].editorial_status="rejected";})}>Reject</button><button onClick={()=>update(v.video_id,item=>{item.regions[region].editorial_status="pending_review";})}>Reset</button><span>{v.regions[region].editorial_status.replaceAll("_"," ")}</span></div></>}
      </div></article>)}</section>
    {!visible.length&&<section className="scout-empty"><p className="eyebrow">A COLLECTION STARTS WITH A FIND</p><h2>{catalogueView?"Your curated rides will appear here.":"Scout is ready for its first discoveries."}</h2><p>{catalogueView?"Approve videos at the review desk to preview them here.":"Run Scout with a server-side YouTube API key, then import the resulting JSON. You can try the controls with a clearly labelled demo record."}</p>{!catalogueView&&<button className="primary" onClick={demoRecord}>Try a demo record</button>}</section>}
    {catalogueView&&<section className="scout-offers"><p className="eyebrow">TWO WAYS TO RIDE · INTEREST TEST</p><h2>Your road. Your kind of adventure.</h2><div className="scout-offer-grid">{["Guided ride","Self-guided ride"].map(type=><article key={type}><h3>{type}</h3><p>{type==="Guided ride"?"Explore with a local guide and a group. Partner tours will be verified before being offered.":"Ride independently with a curated route, practical tips and hotel suggestions."}</p><button onClick={()=>{setInterest(type);setNotice("");}}>Explore {type.toLowerCase()}</button></article>)}</div>
      {interest&&<form onSubmit={e=>{e.preventDefault();setDrafts([...drafts,{type:interest,region,notes,created_at:new Date().toISOString()}]);setInterest("");setNotes("");setNotice("Test interest recorded for this session only. No enquiry was sent. Export interest drafts to keep it.");}}><h3>{interest} · {regions[region]}</h3><label>What would you want from this ride?<textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={1000}/></label><button className="primary">Record test interest</button><button type="button" onClick={()=>setInterest("")}>Cancel</button></form>}
      <button onClick={()=>download(drafts,"scout-interest-drafts.json")}>Export interest drafts ({drafts.length})</button></section>}
    <footer className="scout-foot">JETMYMOTO SCOUT / Regional discovery pilot · {demo?"Demo data loaded. ":""}Creator videos remain on YouTube. Review approval is editorial selection, not route or supplier verification.</footer>
  </main>;
}
