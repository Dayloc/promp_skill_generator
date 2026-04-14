import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { api } from "../services/api";

export const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) {
            setError("Las contraseñas no coinciden");
            return;
        }
        setLoading(true);
        try {
            const resp = await api.post("/api/auth/register", { email, password });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || "Error al registrarse");
            dispatch({ type: "login", payload: data });
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page d-flex align-items-center justify-content-center">
            <div className="auth-card card shadow-sm">
                <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <i className="fa-solid fa-wand-magic-sparkles fa-2x text-primary mb-2"></i>
                        <h2 className="fw-bold">Crear cuenta</h2>
                        <p className="text-muted">PromptSkill Generator</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Confirmar contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2"
                            disabled={loading}
                        >
                            {loading
                                ? <><span className="spinner-border spinner-border-sm me-2" />Creando cuenta...</>
                                : "Crear cuenta"
                            }
                        </button>
                    </form>

                    <hr className="my-4" />
                    <p className="text-center text-muted mb-0">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="text-primary fw-semibold">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
