import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { api } from "../services/api";

export const History = () => {
    const { store, dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await api.get("/api/history");
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.message || "Error al cargar el historial");
                dispatch({ type: "set_history", payload: data });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleDelete = async (id) => {
        try {
            const resp = await api.del(`/api/history/${id}`);
            if (!resp.ok) throw new Error("Error al eliminar");
            dispatch({ type: "delete_generation", payload: id });
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <span className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: 760 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">
                    <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>
                    Historial
                </h2>
                <Link to="/" className="btn btn-outline-primary btn-sm">
                    <i className="fa-solid fa-plus me-1"></i>Nueva generación
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {store.history.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="fa-solid fa-inbox fa-3x mb-3 d-block"></i>
                    <p className="mb-3">No hay generaciones todavía</p>
                    <Link to="/" className="btn btn-primary">
                        <i className="fa-solid fa-bolt me-2"></i>Generar mi primer prompt
                    </Link>
                </div>
            ) : (
                store.history.map(gen => (
                    <HistoryCard key={gen.id} gen={gen} onDelete={handleDelete} />
                ))
            )}
        </div>
    );
};

const HistoryCard = ({ gen, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const isSkill = gen.mode === "skill";
    const preview = gen.result.length > 250
        ? gen.result.slice(0, 250) + "..."
        : gen.result;

    const handleCopy = () => {
        navigator.clipboard.writeText(gen.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([gen.result], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skill-${gen.id}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
        if (confirming) {
            onDelete(gen.id);
        } else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
        }
    };

    return (
        <div className="card shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center py-2">
                <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${isSkill ? "bg-success" : "bg-primary"}`}>
                        {gen.mode}
                    </span>
                    <span className="text-muted small">
                        {new Date(gen.created_at).toLocaleString("es-ES", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="d-flex gap-1">
                    {isSkill && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleDownload} title="Descargar .md">
                            <i className="fa-solid fa-download"></i>
                        </button>
                    )}
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleCopy} title="Copiar">
                        <i className={`fa-solid ${copied ? "fa-check text-success" : "fa-copy"}`}></i>
                    </button>
                    <button
                        className={`btn btn-sm ${confirming ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={handleDelete}
                        title={confirming ? "Confirmar eliminación" : "Eliminar"}
                    >
                        <i className={`fa-solid ${confirming ? "fa-circle-check" : "fa-trash"}`}></i>
                    </button>
                </div>
            </div>
            <div className="card-body pb-2">
                <pre className="result-box small p-3 m-0">{expanded ? gen.result : preview}</pre>
                {gen.result.length > 250 && (
                    <button
                        className="btn btn-link btn-sm mt-1 p-0 text-decoration-none"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Ver menos ▲" : "Ver más ▼"}
                    </button>
                )}
            </div>
        </div>
    );
};
