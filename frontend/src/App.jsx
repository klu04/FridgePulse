import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import AllItems from './pages/AllItems';
import Recipes from './pages/Recipes';
import SavedRecipes from './pages/SavedRecipes';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SignUp from './pages/Signup';
import BarcodeScanner from './pages/BarcodeScanner';
import ObjectScanner from './pages/ObjectScanner';
import LandingPage from './pages/LandingPage';
import { AuthGate } from './components/auth/AuthGate';

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Routes>
          <Route index element={<LandingPage />} />
          <Route element={<AuthGate />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/additem" element={<AddItem />} />
            <Route path="/scan-barcode" element={<BarcodeScanner />} />
            <Route path="/scan-object" element={<ObjectScanner />} />
            <Route path="/all_items" element={<AllItems />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/savedrecipes" element={<SavedRecipes />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
