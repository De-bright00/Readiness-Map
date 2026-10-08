'use client'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { LatLngTuple } from 'leaflet'

type Facility = { id:string; name:string; state:string; lga:string; lat:number; lon:number; pop:number; score:number; status:string; shortItems:{item:string;daysOut:number}[] }
const colors:Record<string,string> = { Ready:'#3f9a68','At risk':'#e7a23b','Not ready':'#d96857','Unknown (silent)':'#9aa7a2' }
function Recenter({ points }:{points:Facility[]}) { const map=useMap(); useEffect(()=>{ if(points.length) map.fitBounds(points.map(p=>[p.lat,p.lon] as LatLngTuple),{padding:[24,24]}) },[points,map]); return null }
export default function ReadinessMap({ facilities, selected, onSelect }:{facilities:Facility[];selected:Facility|null;onSelect:(f:Facility)=>void}) {
 return <MapContainer center={[9.2,7.5]} zoom={6} scrollWheelZoom={false} zoomControl={true} preferCanvas={true}>
   <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/><Recenter points={facilities}/>
   {facilities.map(f=><CircleMarker key={f.id} center={[f.lat,f.lon]} radius={selected?.id===f.id?10:7} pathOptions={{color:colors[f.status],fillColor:colors[f.status],fillOpacity:.84,weight:2}} eventHandlers={{click:()=>onSelect(f)}}><Popup><strong>{f.name}</strong><br/>{f.lga}, {f.state}<br/>Readiness score: {Math.round(f.score*100)}%{f.state==='Lagos'&&<><br/>Simulated location.</>}</Popup></CircleMarker>)}
 </MapContainer>
}
