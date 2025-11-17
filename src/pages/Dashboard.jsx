export default function Dashboard() {
  return (
    <div className="page" style={{ display:"flex", justifyContent:"center" }}>
      <div className="form-card" style={{ width:"100%", maxWidth:"900px" }}>
        <h1>Dashboard</h1>
        <p style={{ opacity:.6 }}>
          Performance analytics will appear here after running strategy tests.
        </p>

        <div style={{ 
          display:"grid", 
          gridTemplateColumns:"1fr 1fr", 
          gap:"1.2rem",
          marginTop:"2rem"
        }}>
          <div style={{ height:"180px", background:"#1b1c20", borderRadius:"10px" }}></div>
          <div style={{ height:"180px", background:"#1b1c20", borderRadius:"10px" }}></div>
          <div style={{ height:"180px", background:"#1b1c20", borderRadius:"10px" }}></div>
          <div style={{ height:"180px", background:"#1b1c20", borderRadius:"10px" }}></div>
        </div>
      </div>
    </div>
  );
}
