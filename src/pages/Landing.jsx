import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      background:"#0A0B0E",
      color:"#fff",
      textAlign:"center",
      padding:"2rem"
    }}>
      
      <h1 style={{ fontSize:"3rem", fontWeight:"700" }}>
        STRATEGY ANALYZER
      </h1>

      <p style={{ 
        fontSize:"1.2rem", 
        opacity:.7, 
        maxWidth:"600px",
        marginTop:"1rem"
      }}>
        Build confidence through proof, not hope.
        Backtest your strategy and validate your trading edge with real data.
      </p>

      <Link to="/app/test">
        <button style={{
          marginTop:"2rem",
          padding:"1rem 2rem",
          background:"#0FA57A",
          border:"none",
          borderRadius:"8px",
          fontSize:"1.1rem",
          fontWeight:"600",
          cursor:"pointer"
        }}>
          🚀 Test Your Strategy
        </button>
      </Link>

    </div>
  );
}
