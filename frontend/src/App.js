import Share from "./components/share/share";
import Navbar from "./components/navbar/Navbar";
import StoreData from './components/StoreData';
import Permission from './components/Permission';

import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Share />
      <StoreData />
      <Permission />
    </div>
  );
}

export default App;