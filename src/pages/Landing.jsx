import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      color:"#fff",
      textAlign:"center",
      padding:"2rem",
      background: "radial-gradient(circle at 50% 20%, rgba(20, 80, 60, 0.45), rgba(0,0,0,0.9))",
      animation: "fadeIn 1.2s ease"
    }}>

      <h1 style={{
        fontSize:"3.4rem",
        fontWeight:"700",
        letterSpacing:"1px"
      }}>
        STRATEGY ANALYZER
      </h1>

      <p style={{
        fontSize:"1.25rem",
        opacity:.72,
        maxWidth:"620px",
        marginTop:"1rem",
        lineHeight:"1.6"
      }}>
        Backtest smarter. Trade with certainty.
        Stop gambling your capital and start validating your trading edge with real market data.
      </p>

      <Link to="/app/test">
        <button style={{
          marginTop:"2.5rem",
          padding:"1rem 2.5rem",
          background:"#0FA57A",
          border:"none",
          borderRadius:"10px",
          fontSize:"1.15rem",
          fontWeight:"600",
          cursor:"pointer",
          transition:"0.25s"
        }}
        onMouseEnter={e=>e.target.style.transform="scale(1.04)"}
        onMouseLeave={e=>e.target.style.transform="scale(1)"}
        >
          Start Testing Your Strategy
        </button>
      </Link>

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>

    </div>
  );
}
