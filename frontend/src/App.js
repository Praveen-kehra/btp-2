import Share from "./components/share/share";
import Navbar from "./components/navbar/Navbar";
import StoreData from './components/StoreData';
import Permission from './components/Permission';

import './App.css';
import UploadData from "./components/UploadData/UploadData";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Share />
      <UploadData />
      <StoreData />
      {/* <Permission /> */}
    </div>
  );
}

export default App;