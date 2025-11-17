export default function Results() {
  return (
    <div className="page" style={{ display:"flex", justifyContent:"center" }}>
      <div className="form-card" style={{ width:"100%", maxWidth:"650px" }}>
        <h1>Results</h1>
        <p style={{ opacity:.6 }}>
          Your backtest reports will be shown here. After running a test, 
          you'll see win-rate, expectancy, average RR, equity curve and more.
        </p>

        <div style={{ 
          height:"220px", 
          background:"#1b1c20", 
          borderRadius:"10px",
          marginTop:"2rem"
        }}></div>
      </div>
    </div>
  );
}
