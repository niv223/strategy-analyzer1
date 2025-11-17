import { useState } from 'react'

export default function TestStrategy(){
const [form,setForm]=useState({instrument:'',session:'',entryType:'',risk:'',rr:'',range:'',conditions:[],indicators:[],notes:''})
const update=(k,v)=>setForm(p=>({...p,[k]:v}))
const [c,setC]=useState({type:'',tf:'',note:''})
const addC=()=>{if(!c.type||!c.tf)return;setForm(p=>({...p,conditions:[...p.conditions,c]}));setC({type:'',tf:'',note:''})}
const [i,setI]=useState({type:'',settings:'',tf:''})
const addI=()=>{if(!i.type)return;setForm(p=>({...p,indicators:[...p.indicators,i]}));setI({type:'',settings:'',tf:''})}
const submit=e=>{e.preventDefault();console.log('FORM DATA',form)}

return <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}>
<div className='form-card'>
<h1>Test Strategy</h1>
<form onSubmit={submit} style={{display:'grid',gap:'1rem'}}>
<input placeholder='Instrument' onChange={e=>update('instrument',e.target.value)}/>
<select onChange={e=>update('session',e.target.value)}><option value=''>Session</option><option>London</option><option>NY</option><option>Asia</option></select>
<select onChange={e=>update('entryType',e.target.value)}><option value=''>Entry Type</option><option>Long</option><option>Short</option><option>Both</option></select>
<input type='number' placeholder='Risk % per trade' onChange={e=>update('risk',e.target.value)}/>
<input type='number' placeholder='RR Target' onChange={e=>update('rr',e.target.value)}/>
<select onChange={e=>update('range',e.target.value)}><option value=''>Data Range</option><option>3M</option><option>6M</option><option>1Y</option></select>

<h3>Conditions</h3>
<input placeholder='Type' value={c.type} onChange={e=>setC(p=>({...p,type:e.target.value}))}/>
<input placeholder='TF (ex 15m)' value={c.tf} onChange={e=>setC(p=>({...p,tf:e.target.value}))}/>
<input placeholder='Note' value={c.note} onChange={e=>setC(p=>({...p,note:e.target.value}))}/>
<button type='button' onClick={addC}>+ Add</button>
{form.conditions.map((x,n)=><div key={n}>• {x.type} @ {x.tf} {x.note}</div>)}

<h3>Indicators</h3>
<input placeholder='Indicator' value={i.type} onChange={e=>setI(p=>({...p,type:e.target.value}))}/>
<input placeholder='Settings' value={i.settings} onChange={e=>setI(p=>({...p,settings:e.target.value}))}/>
<input placeholder='TF' value={i.tf} onChange={e=>setI(p=>({...p,tf:e.target.value}))}/>
<button type='button' onClick={addI}>+ Add</button>
{form.indicators.map((x,n)=><div key={n}>• {x.type} {x.settings} {x.tf}</div>)}

<textarea placeholder='Notes' rows={4} onChange={e=>update('notes',e.target.value)}/>
<button type='submit' style={{padding:'.8rem',background:'#0FA57A',border:'none',borderRadius:'6px'}}>Start Test</button>
</form>
</div>
</div>
}