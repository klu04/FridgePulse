import { createBrowserRouter } from "react-router-dom";
import { AppRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
import RootLayout from "@/components/layouts/RootLayout";
import LandingPage from "@/pages/LandingPage";

export const router = createBrowserRouter([
    {
        Component: RootLayout,
        children: [
            {
                Component: PublicRoute,
                children: [
                    { index: true, Component: LandingPage },
                    { path: "login", lazy: () => import("@/pages/Login") },
                    { path: "signup", lazy: () => import("@/pages/Signup") },
                ],
            },
            {
                Component: AppRoute,
                children: [
                    {
                        lazy: async () => ({
                            Component: (await import("@/components/layouts/AuthLayout")).default,
                        }),
                        children: [
                            { path: "dashboard", lazy: () => import("@/pages/Dashboard") },
                            { path: "add-item", lazy: () => import("@/pages/AddItem") },
                            { path: "scan-barcode", lazy: () => import("@/pages/BarcodeScanner") },
                            { path: "scan-object", lazy: () => import("@/pages/ImageClassification") },
                            { path: "kitchen", lazy: () => import("@/pages/Kitchen") },
                            { path: "recipes", lazy: () => import("@/pages/Recipes") },
                            { path: "saved-recipes", lazy: () => import("@/pages/SavedRecipes") },
                            { path: "reports", lazy: () => import("@/pages/Reports") },
                        ],
                    },
                ],
            },
        ],
    },
]);
