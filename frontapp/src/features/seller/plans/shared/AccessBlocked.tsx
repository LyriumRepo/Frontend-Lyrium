'use client';

interface Props {
  msg: string; sub: string; btnHref: string; btnLabel: string;
}

export default function AccessBlocked({ msg, sub, btnHref, btnLabel }: Props) {
  return (
    <div style={{inset:0, background:'#f9fafb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:999999, padding:'32px', textAlign:'center', height: '37rem' }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom:'20px' }}>
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#111827', margin:'0 0 10px' }}>{msg}</h2>
      <p style={{ fontSize:'14px', color:'#6b7280', maxWidth:'300px', lineHeight:1.6, margin:'0 0 24px' }}>{sub}</p>
      <a href={btnHref} style={{ padding:'11px 28px', background:'#1f2937', color:'#fff', borderRadius:'12px', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'inline-block' }}>{btnLabel}</a>
    </div>
  );
}
