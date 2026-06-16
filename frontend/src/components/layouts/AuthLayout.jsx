import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/commonUI/BottomNav';
import Header from '@/components/commonUI/Header';

export function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="sticky top-0 z-40 isolate w-full">
                <Header />
            </div>
            
            <main className="flex-1 px-4 pt-4 pb-24">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}

export default AuthLayout;