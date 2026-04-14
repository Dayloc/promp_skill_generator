import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Generator } from "./pages/Generator";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { History } from "./pages/History";
import { PrivateRoute } from "./components/PrivateRoute";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<div className="text-center py-5"><h1>404 - Página no encontrada</h1></div>}>
            <Route index element={<PrivateRoute><Generator /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Route>
    )
);
