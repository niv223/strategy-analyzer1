import {Link,Routes,Route} from 'react-router-dom'
import Landing from '../pages/Landing'
import Dashboard from '../pages/Dashboard'
import TestStrategy from '../pages/TestStrategy'
import Results from '../pages/Results'
export default function AppLayout(){
return <div style={{display:'flex',height:'100vh'}}>
<aside className="sidebar">
  <h2>STRATEGY ANALYZER</h2>
  <nav>
    <Link to="/">Landing</Link>
    <Link to="/dashboard">Dashboard</Link>
    <Link to="/test">Test Strategy</Link>
    <Link to="/results">Results</Link>
  </nav>
</aside>

<main style={{flex:1,padding:'2rem',overflowY:'auto'}}>
<Routes>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="test" element={<TestStrategy />} />
  <Route path="results" element={<Results />} />
</Routes>

</main>
</div>}
