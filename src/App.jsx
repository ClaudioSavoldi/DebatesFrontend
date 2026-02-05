import "./App.css";
import Navbar from "./Component/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <h1 className="h3">Frontend Capstone</h1>
        <p className="text-muted">Bootstrap ok. Prossimo step: routing.</p>
      </main>
    </>
  );
}

export default App;
