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
import ImageScanner from './pages/ImageClassification';
import LandingPage from './pages/LandingPage';
import AuthLayout from './components/layouts/AuthLayout';
import { AppRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';


function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen w-full">
          <Routes>
            <Route element={<PublicRoute />}>
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Route>
            <Route element={<AppRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-item" element={<AddItem />} />
                <Route path="/scan-barcode" element={<BarcodeScanner />} />
                <Route path="/scan-object" element={<ImageScanner />} />
                <Route path="/all-items" element={<AllItems />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/saved-recipes" element={<SavedRecipes />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App;
