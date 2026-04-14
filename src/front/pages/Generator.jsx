import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { api } from "../services/api";

// ─── Task type definitions ────────────────────────────────────────────────────

const PROMPT_TASKS = [
    { id: "codigo",       label: "Análisis de código",   icon: "fa-code" },
    { id: "contenido",    label: "Contenido",             icon: "fa-pen-nib" },
    { id: "marketing",    label: "Marketing",             icon: "fa-bullhorn" },
    { id: "educacion",    label: "Educación",             icon: "fa-graduation-cap" },
    { id: "soporte",      label: "Soporte / Atención",    icon: "fa-headset" },
    { id: "investigacion",label: "Investigación",         icon: "fa-magnifying-glass" },
    { id: "custom",       label: "Personalizado",         icon: "fa-sliders" },
];

const SKILL_TASKS = [
    { id: "revision",     label: "Revisión de código",   icon: "fa-magnifying-glass-code" },
    { id: "generar",      label: "Generar código",        icon: "fa-code" },
    { id: "tests",        label: "Tests",                 icon: "fa-flask-vial" },
    { id: "docs",         label: "Documentación",         icon: "fa-file-lines" },
    { id: "refactor",     label: "Refactoring",           icon: "fa-arrows-rotate" },
    { id: "debug",        label: "Debugging",             icon: "fa-bug" },
    { id: "custom",       label: "Personalizado",         icon: "fa-sliders" },
];

// ─── Predefined options per task type ────────────────────────────────────────

const PROMPT_OPTIONS = {
    codigo: {
        role: ["Senior developer y code reviewer", "Arquitecto de software", "Experto en seguridad web", "Especialista en rendimiento y optimización"],
        context: ["Aplicación web en producción", "Proyecto personal en desarrollo", "Código heredado sin documentación", "API REST / microservicio", "Script o herramienta CLI"],
        task: ["Revisar calidad y buenas prácticas", "Detectar vulnerabilidades de seguridad", "Optimizar rendimiento y eficiencia", "Refactorizar para mayor legibilidad", "Explicar qué hace este código"],
        format: ["Lista de problemas por severidad (🔴 alto / 🟡 medio / 🟢 bajo)", "Tabla: problema | causa | solución", "Comentarios inline para cada issue", "Informe ejecutivo con resumen y detalles"],
        constraints: ["Conservar la funcionalidad exactamente igual", "No proponer cambios de arquitectura", "Solo identificar, no reescribir", "Máximo 10 observaciones"],
        examples: [],
    },
    contenido: {
        role: ["Copywriter profesional con 10 años de experiencia", "Escritor creativo especializado en ficción", "Redactor técnico y documentalista", "Ghostwriter para redes sociales y blogs"],
        context: ["Blog personal sobre tecnología", "Empresa B2B en sector financiero", "Tienda online de productos físicos", "Startup de SaaS / tech", "ONG o proyecto social"],
        task: ["Escribir un artículo de blog completo", "Crear copy para landing page", "Redactar publicaciones para redes sociales (semana)", "Generar correo de ventas / outreach", "Crear guión para vídeo de YouTube"],
        format: ["Artículo con H1, H2, intro y conclusión", "Texto fluido sin estructura formal", "3-5 variaciones del mismo mensaje", "Con emojis y tono informal para redes"],
        constraints: ["Tono profesional sin ser frío", "Evitar clichés y frases hechas", "SEO-friendly con keyword principal", "Máximo 500 palabras", "Sin tecnicismos, lenguaje accesible"],
        examples: [],
    },
    marketing: {
        role: ["CMO / Estratega de marketing digital", "Especialista en paid media y performance", "Growth hacker con enfoque en conversión", "Experto en email marketing y automatización"],
        context: ["Lanzamiento de nuevo producto/servicio", "Campaña de retención de clientes", "Generación de leads B2B", "E-commerce con bajo CVR", "App móvil con usuarios inactivos"],
        task: ["Diseñar estrategia de contenido para 30 días", "Crear secuencia de 5 emails de nurturing", "Analizar y mejorar el funnel de conversión", "Generar ideas de campaña para redes sociales", "Redactar propuesta de valor diferencial"],
        format: ["Plan con semanas y acciones específicas", "Tabla con canales, métricas y KPIs", "Bullets ejecutivos para presentación", "Con ejemplos concretos y benchmarks"],
        constraints: ["Presupuesto limitado (menos de 1.000€/mes)", "Solo canales orgánicos, sin paid", "Equipo pequeño (1-3 personas)", "Resultados a corto plazo (30 días)"],
        examples: [],
    },
    educacion: {
        role: ["Profesor universitario experto en pedagogía", "Instructor de formación corporativa", "Tutor personalizado con enfoque Montessori", "Diseñador instruccional de cursos online"],
        context: ["Estudiantes universitarios de primer año", "Profesionales en reciclaje laboral", "Niños de 8-12 años", "Equipo de empresa en onboarding", "Autodidactas adultos con poco tiempo"],
        task: ["Crear un plan de estudios de 4 semanas", "Diseñar una clase con actividades prácticas", "Generar ejercicios y evaluaciones", "Simplificar un concepto complejo", "Crear cheatsheet de referencia rápida"],
        format: ["Plan con objetivos, contenido y evaluación", "Clase con introducción, desarrollo y cierre", "Serie de preguntas tipo test con respuestas", "Explicación con analogías y ejemplos reales"],
        constraints: ["Sesiones de máximo 45 minutos", "Sin prerequisitos técnicos avanzados", "Incluir referencias y recursos adicionales", "Estilo socrático: guiar con preguntas"],
        examples: [],
    },
    soporte: {
        role: ["Agente de soporte con alta empatía", "Customer success manager proactivo", "Experto técnico con habilidades comunicativas", "Supervisor de atención al cliente"],
        context: ["SaaS con usuarios técnicos y no técnicos", "E-commerce con incidencias de envío/devolución", "App móvil con bugs reportados", "Servicio financiero con usuarios sensibles"],
        task: ["Responder una queja de cliente insatisfecho", "Redactar FAQ para los 10 problemas más comunes", "Crear plantillas de respuesta para soporte", "Gestionar una crisis de reputación online"],
        format: ["Respuesta: reconocimiento + solución + seguimiento", "Lista de FAQs con respuestas concisas", "Plantillas con variables [NOMBRE], [PRODUCTO]", "Protocolo de escalada paso a paso"],
        constraints: ["Tono empático y humano, nunca robótico", "Sin prometer lo que no se puede cumplir", "Incluir disculpa sincera cuando sea apropiado", "Máximo 150 palabras por respuesta"],
        examples: [],
    },
    investigacion: {
        role: ["Analista de inteligencia de mercado", "Investigador académico con método científico", "Periodista de investigación", "Consultor estratégico senior"],
        context: ["Nuevo mercado o sector a explorar", "Competidores directos e indirectos", "Tendencias tecnológicas emergentes", "Impacto regulatorio en el sector", "Comportamiento del consumidor objetivo"],
        task: ["Hacer un análisis DAFO completo", "Resumir el estado del arte de un tema", "Comparar 3-5 alternativas/competidores", "Identificar oportunidades de negocio", "Generar hipótesis para validar con datos"],
        format: ["Informe con executive summary", "Tabla comparativa con criterios ponderados", "Bullets ejecutivos para decisiones rápidas", "Mapa mental de factores clave"],
        constraints: ["Basado en información verificable", "Señalar claramente las suposiciones", "Evitar sesgos de confirmación", "Citar fuentes cuando sea posible"],
        examples: [],
    },
    custom: { role: [], context: [], task: [], format: [], constraints: [], examples: [] },
};

const SKILL_OPTIONS = {
    revision: {
        skill_name: ["revisar-codigo", "code-review", "auditar-codigo", "revisar-pr"],
        trigger: ["Cuando el usuario pida revisar, auditar o mejorar calidad del código", "Cuando el usuario quiera hacer code review de un archivo o función", "Al recibir /revisar-codigo o variantes similares"],
        action: ["Analizar el archivo activo en busca de bugs, malas prácticas y vulnerabilidades. Generar informe con severidad y sugerencias concretas.", "Revisar el código seleccionado evaluando legibilidad, mantenibilidad, rendimiento y seguridad. Proponer mejoras con ejemplos.", "Hacer code review del repositorio priorizando archivos críticos."],
        tools: ["Read, Grep, Glob", "Read, Grep, Glob, Bash", "Read, Edit, Grep"],
        example: ["El usuario escribe /revisar-codigo y Claude lee el archivo activo y genera informe", "El usuario selecciona una función; Claude analiza y ofrece reescritura mejorada"],
    },
    generar: {
        skill_name: ["generar-componente", "crear-endpoint", "generar-modelo", "scaffolding"],
        trigger: ["Cuando el usuario pida crear, generar o scaffoldear nuevo código", "Al recibir /generar-codigo con descripción de lo que necesita", "Cuando el usuario describa una funcionalidad y pida implementarla"],
        action: ["Generar el código solicitado siguiendo las convenciones del proyecto. Leer archivos existentes para mantener consistencia de estilo.", "Crear la estructura de archivos necesaria, implementar la lógica y añadir los imports.", "Scaffoldear el componente/módulo completo con tests básicos incluidos."],
        tools: ["Read, Write, Glob, Grep", "Read, Write, Edit, Bash", "Read, Write, Glob"],
        example: ["El usuario escribe /generar-componente Header y Claude genera el archivo siguiendo el estilo del proyecto"],
    },
    tests: {
        skill_name: ["generar-tests", "crear-tests", "añadir-tests", "test-coverage"],
        trigger: ["Cuando el usuario pida generar, crear o añadir tests", "Al solicitar aumentar la cobertura de un archivo o función", "Cuando el usuario quiera asegurarse de que el código funciona correctamente"],
        action: ["Analizar el código del archivo activo e implementar tests unitarios cubriendo casos normales, edge cases y errores.", "Generar tests de integración para los endpoints de la API del proyecto.", "Crear suite de tests con mocks adecuados, siguiendo el framework ya usado en el proyecto."],
        tools: ["Read, Write, Grep, Glob, Bash", "Read, Write, Bash"],
        example: ["El usuario escribe /generar-tests y Claude analiza el archivo activo y genera el archivo de tests"],
    },
    docs: {
        skill_name: ["documentar", "generar-docs", "añadir-docstrings", "crear-readme"],
        trigger: ["Cuando el usuario pida documentar código, funciones o un módulo", "Al solicitar generar o actualizar el README del proyecto", "Cuando el usuario quiera añadir docstrings o comentarios"],
        action: ["Analizar el código y añadir docstrings/JSDoc completos a todas las funciones y clases sin documentar.", "Generar README completo con: descripción, instalación, uso, API reference y contribución.", "Crear documentación técnica de la API escaneando todos los endpoints del proyecto."],
        tools: ["Read, Edit, Grep, Glob", "Read, Write, Glob"],
        example: ["El usuario escribe /documentar y Claude añade docstrings a todas las funciones del archivo activo"],
    },
    refactor: {
        skill_name: ["refactorizar", "refactor", "limpiar-codigo", "mejorar-estructura"],
        trigger: ["Cuando el usuario pida refactorizar, limpiar o mejorar la estructura del código", "Al detectar código duplicado, funciones largas o mala organización", "Cuando el usuario quiera mejorar mantenibilidad sin cambiar funcionalidad"],
        action: ["Refactorizar el archivo activo: eliminar duplicados, extraer funciones, mejorar nombres y simplificar lógica. Mantener la funcionalidad exacta.", "Reorganizar la estructura del módulo aplicando principios SOLID y clean code.", "Identificar code smells y aplicar los refactoring patterns apropiados."],
        tools: ["Read, Edit, Grep, Glob", "Read, Edit, Bash"],
        example: ["El usuario escribe /refactorizar y Claude propone y aplica cambios tras confirmación"],
    },
    debug: {
        skill_name: ["debug", "encontrar-bug", "diagnosticar-error", "investigar-error"],
        trigger: ["Cuando el usuario reporte un bug, error o comportamiento inesperado", "Al pegar un stack trace o mensaje de error", "Cuando el código no funciona como se espera"],
        action: ["Analizar el error reportado, rastrear su origen en el código y proponer la solución más probable. Verificar antes de aplicar.", "Investigar el stack trace, leer los archivos relevantes y diagnosticar la causa raíz.", "Reproducir el bug mentalmente, identificar la línea exacta y aplicar el fix con explicación."],
        tools: ["Read, Grep, Bash, Glob", "Read, Edit, Bash, Grep"],
        example: ["El usuario pega un error y escribe /debug; Claude investiga, encuentra el problema y lo soluciona"],
    },
    custom: { skill_name: [], trigger: [], action: [], tools: [], example: [] },
};

// ─── Field definitions per mode ───────────────────────────────────────────────

const PROMPT_FIELDS = [
    { key: "role",        label: "Rol / Persona de la IA" },
    { key: "context",     label: "Contexto / Situación" },
    { key: "task",        label: "Tarea principal" },
    { key: "format",      label: "Formato de respuesta" },
    { key: "constraints", label: "Restricciones / Estilo" },
    { key: "examples",    label: "Ejemplos (opcional)" },
];

const SKILL_FIELDS = [
    { key: "skill_name", label: "Nombre del skill" },
    { key: "trigger",    label: "¿Cuándo debe activarse?" },
    { key: "action",     label: "¿Qué debe hacer?" },
    { key: "tools",      label: "Herramientas disponibles" },
    { key: "example",    label: "Ejemplo de uso" },
];

const CUSTOM_PLACEHOLDER = {
    role:        "Eres un experto en...",
    context:     "El contexto es...",
    task:        "La tarea principal es...",
    format:      "El formato de respuesta debe ser...",
    constraints: "Las restricciones son...",
    examples:    "Ejemplo de input / output esperado...",
    skill_name:  "nombre-del-skill",
    trigger:     "Cuando el usuario pida...",
    action:      "Analiza, genera o modifica...",
    tools:       "Read, Edit, Grep, Bash...",
    example:     "El usuario escribe /mi-skill y Claude...",
};

// ─── SelectField component ────────────────────────────────────────────────────

const SelectField = ({ fieldKey, label, options, value, onChange }) => {
    const isCustom = value === "__custom__";

    const handleSelect = (e) => {
        onChange(fieldKey, e.target.value === "__custom__" ? "__custom__" : e.target.value);
    };

    const handleText = (e) => {
        onChange(fieldKey, "__custom__:" + e.target.value);
    };

    const customText = value?.startsWith("__custom__:") ? value.slice(11) : "";

    return (
        <div className="mb-3">
            <label className="form-label fw-semibold">{label}</label>
            {options.length > 0 ? (
                <>
                    <select
                        className="form-select mb-2"
                        value={value?.startsWith("__custom__") ? "__custom__" : (value || "")}
                        onChange={handleSelect}
                    >
                        <option value="">— Selecciona una opción —</option>
                        {options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">✏️ Escribir personalizado...</option>
                    </select>
                    {value?.startsWith("__custom__") && (
                        <textarea
                            className="form-control"
                            rows={2}
                            placeholder={CUSTOM_PLACEHOLDER[fieldKey] || "Escribe aquí..."}
                            value={customText}
                            onChange={handleText}
                            autoFocus
                        />
                    )}
                </>
            ) : (
                <textarea
                    className="form-control"
                    rows={fieldKey === "action" ? 3 : 2}
                    placeholder={CUSTOM_PLACEHOLDER[fieldKey] || "Escribe aquí..."}
                    value={value || ""}
                    onChange={e => onChange(fieldKey, e.target.value)}
                />
            )}
        </div>
    );
};

// ─── Main Generator component ─────────────────────────────────────────────────

export const Generator = () => {
    const [mode, setMode] = useState("prompt");
    const [taskType, setTaskType] = useState(null);
    const [inputs, setInputs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { store, dispatch } = useGlobalReducer();

    const tasks = mode === "prompt" ? PROMPT_TASKS : SKILL_TASKS;
    const fields = mode === "prompt" ? PROMPT_FIELDS : SKILL_FIELDS;
    const optionsMap = mode === "prompt" ? PROMPT_OPTIONS : SKILL_OPTIONS;
    const currentOptions = taskType ? (optionsMap[taskType] || {}) : {};

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setTaskType(null);
        setInputs({});
        dispatch({ type: "set_result", payload: null });
        setError(null);
    };

    const handleTaskType = (id) => {
        setTaskType(id);
        setInputs({});
        setError(null);
    };

    const handleChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));

    // Resolve final value: strip __custom__: prefix
    const resolveValue = (raw) => {
        if (!raw) return "";
        if (raw.startsWith("__custom__:")) return raw.slice(11);
        if (raw === "__custom__") return "";
        return raw;
    };

    const handleGenerate = async () => {
        setError(null);
        setLoading(true);
        try {
            const resolvedInputs = Object.fromEntries(
                Object.entries(inputs).map(([k, v]) => [k, resolveValue(v)])
            );
            if (taskType) resolvedInputs.task_type = tasks.find(t => t.id === taskType)?.label || taskType;

            const resp = await api.post("/api/generate", { mode, inputs: resolvedInputs }, true);
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || "Error al generar");
            dispatch({ type: "set_result", payload: data });
            dispatch({ type: "add_generation", payload: data });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isPrompt = mode === "prompt";
    const accentClass = isPrompt ? "primary" : "success";

    return (
        <div className="container py-4" style={{ maxWidth: 780 }}>
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="fw-bold">
                    <i className={`fa-solid fa-wand-magic-sparkles me-2 text-${accentClass}`}></i>
                    PromptSkill Generator
                </h1>
                <p className="text-muted">Genera prompts profesionales o skills para Claude Code con IA</p>
            </div>

            {/* Mode toggle */}
            <div className="d-flex justify-content-center gap-2 mb-4">
                <button className={`btn btn-lg px-5 ${isPrompt ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleModeChange("prompt")}>
                    <i className="fa-solid fa-comment-dots me-2"></i>Prompt
                </button>
                <button className={`btn btn-lg px-5 ${!isPrompt ? "btn-success" : "btn-outline-success"}`} onClick={() => handleModeChange("skill")}>
                    <i className="fa-solid fa-gear me-2"></i>Skill
                </button>
            </div>

            {/* Task type selector */}
            <div className="card shadow-sm mb-3">
                <div className="card-body py-3">
                    <p className="text-muted small mb-2 fw-semibold">TIPO DE TAREA</p>
                    <div className="d-flex flex-wrap gap-2">
                        {tasks.map(t => (
                            <button
                                key={t.id}
                                className={`btn btn-sm ${taskType === t.id ? `btn-${accentClass}` : `btn-outline-${accentClass}`}`}
                                onClick={() => handleTaskType(t.id)}
                            >
                                <i className={`fa-solid ${t.icon} me-1`}></i>{t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form (only when task type selected) */}
            {taskType && (
                <div className={`card shadow-sm mb-4 border-top border-3 border-${accentClass}`}>
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-1">
                            {isPrompt ? "Configura tu Prompt" : "Configura tu Skill"}
                            <span className="ms-2 badge bg-secondary fw-normal fs-6">
                                {tasks.find(t => t.id === taskType)?.label}
                            </span>
                        </h5>
                        <p className="text-muted small mb-4">
                            {isPrompt
                                ? "Selecciona opciones predefinidas o escribe las tuyas."
                                : "Elige configuraciones sugeridas o personaliza cada campo."}
                        </p>

                        {fields.map(field => (
                            <SelectField
                                key={field.key}
                                fieldKey={field.key}
                                label={field.label}
                                options={currentOptions[field.key] || []}
                                value={inputs[field.key]}
                                onChange={handleChange}
                            />
                        ))}

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center gap-2">
                                <i className="fa-solid fa-circle-exclamation"></i>{error}
                            </div>
                        )}

                        <button
                            className={`btn btn-lg w-100 mt-2 btn-${accentClass}`}
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading
                                ? <><span className="spinner-border spinner-border-sm me-2" />Generando con IA...</>
                                : <><i className="fa-solid fa-bolt me-2"></i>Generar {isPrompt ? "Prompt" : "Skill"}</>
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* Placeholder when no task selected */}
            {!taskType && (
                <div className="text-center text-muted py-4">
                    <i className={`fa-solid fa-arrow-up fa-lg text-${accentClass} mb-2 d-block`}></i>
                    Selecciona un tipo de tarea para comenzar
                </div>
            )}

            {/* Result */}
            {store.currentResult && <ResultDisplay result={store.currentResult} />}
        </div>
    );
};

// ─── ResultDisplay ────────────────────────────────────────────────────────────

const ResultDisplay = ({ result }) => {
    const [copied, setCopied] = useState(false);
    const isSkill = result.mode === "skill";

    const handleCopy = () => {
        navigator.clipboard.writeText(result.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([result.result], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skill-${result.id}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card shadow-sm result-card">
            <div className="card-header d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${isSkill ? "bg-success" : "bg-primary"}`}>{result.mode}</span>
                    <span className="text-muted small">Resultado generado</span>
                </div>
                <div className="d-flex gap-2">
                    {isSkill && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleDownload} title="Descargar .md">
                            <i className="fa-solid fa-download me-1"></i>.md
                        </button>
                    )}
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleCopy}>
                        <i className={`fa-solid ${copied ? "fa-check text-success" : "fa-copy"} me-1`}></i>
                        {copied ? "¡Copiado!" : "Copiar"}
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                <pre className="result-box m-0 p-4">{result.result}</pre>
            </div>
        </div>
    );
};
