import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "logout" });
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark px-3 shadow-sm">
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-primary"></i>
                    PromptSkill
                </Link>

                {store.token && (
                    <div className="d-flex align-items-center gap-2 ms-auto">
                        <Link to="/history" className="btn btn-sm btn-outline-light">
                            <i className="fa-solid fa-clock-rotate-left me-1"></i>
                            Historial
                        </Link>
                        <span className="text-muted small d-none d-md-inline">
                            {store.user?.email}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleLogout}
                            title="Cerrar sesión"
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>
                )}

                {!store.token && (
                    <div className="d-flex gap-2 ms-auto">
                        <Link to="/login" className="btn btn-sm btn-outline-light">Entrar</Link>
                        <Link to="/register" className="btn btn-sm btn-primary">Registrarse</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};
