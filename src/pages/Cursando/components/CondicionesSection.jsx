import { useState } from "react";
import { Button, Input, Switch, Divider } from "@nextui-org/react";
import { Save, Plus, X, CheckCircle2, FileText, Users, FlaskConical, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const defaultCondiciones = {
    numParciales: "",
    notaRegular: "4",
    notaAprobar: "7",
    tps: { activo: false, cantidad: "", notaMinima: "4", descripcion: "" },
    asistencia: { activo: false, porcentaje: "75" },
    laboratorio: { activo: false, descripcion: "" },
    otrosList: [],   // [{ id, texto }]
    notasLibres: "",
};

const toForm = (raw) => {
    if (!raw) return { ...defaultCondiciones };
    // backward compat: if it was a plain string, put it in notasLibres
    if (typeof raw === "string") return { ...defaultCondiciones, notasLibres: raw };
    return { ...defaultCondiciones, ...raw };
};

// --- Sección visual -----------
const SectionToggle = ({ label, icon: Icon, active, onChange, children }) => (
    <div className="rounded-xl border border-default-100 overflow-hidden">
        <div
            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${active ? 'bg-primary/5' : 'hover:bg-default-50'}`}
            onClick={() => onChange(!active)}
        >
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${active ? 'bg-primary/15' : 'bg-default-100'}`}>
                    <Icon size={15} className={active ? 'text-primary' : 'text-default-400'} />
                </div>
                <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-default-600'}`}>{label}</span>
            </div>
            <Switch size="sm" isSelected={active} onValueChange={onChange} />
        </div>
        {active && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 border-t border-default-100 flex flex-col gap-3"
            >
                {children}
            </motion.div>
        )}
    </div>
);

const CondicionesSection = ({ condiciones, onGuardar }) => {
    const [form, setForm] = useState(() => toForm(condiciones));
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nuevoOtro, setNuevoOtro] = useState("");

    const set = (path, value) => {
        setForm(prev => {
            const next = { ...prev };
            const parts = path.split(".");
            if (parts.length === 1) {
                next[path] = value;
            } else {
                next[parts[0]] = { ...prev[parts[0]], [parts[1]]: value };
            }
            return next;
        });
    };

    const agregarOtro = () => {
        if (!nuevoOtro.trim()) return;
        set("otrosList", [...form.otrosList, { id: Date.now().toString(), texto: nuevoOtro.trim() }]);
        setNuevoOtro("");
    };

    const borrarOtro = (id) => set("otrosList", form.otrosList.filter(o => o.id !== id));

    const handleGuardar = async () => {
        setSaving(true);
        try {
            await onGuardar(form);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelar = () => {
        setForm(toForm(condiciones));
        setEditing(false);
    };

    // --- VISTA (no editing) ---
    if (!editing) {
        const f = toForm(condiciones);
        const hayDatos = f.numParciales || f.notaRegular || f.notaAprobar || f.tps?.activo || f.asistencia?.activo || f.laboratorio?.activo || f.otrosList?.length || f.notasLibres;
        return (
            <div className="flex flex-col gap-3 h-full">
                {!hayDatos ? (
                    <p className="text-sm text-default-400 italic text-center py-4">
                        Agregá las condiciones de aprobación de la materia
                    </p>
                ) : (
                    <div className="flex flex-col gap-2 text-sm">
                        {f.numParciales && (
                            <div className="flex items-center gap-2">
                                <ClipboardList size={14} className="text-primary flex-shrink-0" />
                                <span><b>{f.numParciales}</b> parciales</span>
                                {f.notaRegular && <span className="text-default-400">· Regular: ≥{f.notaRegular}</span>}
                                {f.notaAprobar && <span className="text-default-400">· Directo: ≥{f.notaAprobar}</span>}
                            </div>
                        )}
                        {f.tps?.activo && (
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-secondary flex-shrink-0" />
                                <span>TPs: {f.tps.cantidad ? `${f.tps.cantidad} trabajos` : "activos"}
                                    {f.tps.notaMinima ? `, nota mín. ${f.tps.notaMinima}` : ""}
                                    {f.tps.descripcion ? ` — ${f.tps.descripcion}` : ""}</span>
                            </div>
                        )}
                        {f.asistencia?.activo && (
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-warning flex-shrink-0" />
                                <span>Asistencia mínima: <b>{f.asistencia.porcentaje}%</b></span>
                            </div>
                        )}
                        {f.laboratorio?.activo && (
                            <div className="flex items-center gap-2">
                                <FlaskConical size={14} className="text-success flex-shrink-0" />
                                <span>Laboratorio{f.laboratorio.descripcion ? `: ${f.laboratorio.descripcion}` : ""}</span>
                            </div>
                        )}
                        {f.otrosList?.map(o => (
                            <div key={o.id} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-default-400 flex-shrink-0" />
                                <span>{o.texto}</span>
                            </div>
                        ))}
                        {f.notasLibres && (
                            <p className="text-xs text-default-500 mt-1 whitespace-pre-wrap">{f.notasLibres}</p>
                        )}
                    </div>
                )}
                <Button size="sm" variant="flat" color="primary" className="self-start mt-auto" onPress={() => setEditing(true)}>
                    {hayDatos ? "Editar" : "Agregar condiciones"}
                </Button>
            </div>
        );
    }

    // --- FORMULARIO ---
    return (
        <div className="flex flex-col gap-4">
            {/* Parciales */}
            <div>
                <p className="text-xs font-bold uppercase text-default-500 tracking-wider mb-2">Parciales</p>
                <div className="grid grid-cols-3 gap-2">
                    <Input
                        size="sm" type="number" label="Cantidad"
                        placeholder="Ej: 2"
                        value={form.numParciales}
                        onValueChange={v => set("numParciales", v)}
                    />
                    <Input
                        size="sm" type="number" label="Nota p/ Regular"
                        placeholder="Ej: 4"
                        value={form.notaRegular}
                        onValueChange={v => set("notaRegular", v)}
                    />
                    <Input
                        size="sm" type="number" label="Nota p/ Aprobar"
                        placeholder="Ej: 7"
                        value={form.notaAprobar}
                        onValueChange={v => set("notaAprobar", v)}
                    />
                </div>
            </div>

            <Divider className="bg-default-100" />

            {/* TPs */}
            <SectionToggle label="Trabajos Prácticos" icon={FileText} active={form.tps.activo} onChange={v => set("tps.activo", v)}>
                <div className="grid grid-cols-2 gap-2">
                    <Input size="sm" type="number" label="Cantidad de TPs" value={form.tps.cantidad} onValueChange={v => set("tps.cantidad", v)} />
                    <Input size="sm" type="number" label="Nota mínima" value={form.tps.notaMinima} onValueChange={v => set("tps.notaMinima", v)} />
                </div>
                <Input size="sm" label="Descripción (opcional)" placeholder="Ej: Informes de laboratorio" value={form.tps.descripcion} onValueChange={v => set("tps.descripcion", v)} />
            </SectionToggle>

            {/* Asistencia */}
            <SectionToggle label="Asistencia mínima" icon={Users} active={form.asistencia.activo} onChange={v => set("asistencia.activo", v)}>
                <Input
                    size="sm" type="number" label="% mínimo requerido"
                    placeholder="Ej: 75"
                    endContent={<span className="text-default-400 text-sm">%</span>}
                    value={form.asistencia.porcentaje}
                    onValueChange={v => set("asistencia.porcentaje", v)}
                />
            </SectionToggle>

            {/* Laboratorio */}
            <SectionToggle label="Laboratorio / Clases prácticas" icon={FlaskConical} active={form.laboratorio.activo} onChange={v => set("laboratorio.activo", v)}>
                <Input size="sm" label="Descripción" placeholder="Ej: Aprobación de 4 trabajos" value={form.laboratorio.descripcion} onValueChange={v => set("laboratorio.descripcion", v)} />
            </SectionToggle>

            {/* Otros */}
            <div>
                <p className="text-xs font-bold uppercase text-default-500 tracking-wider mb-2">Otros requisitos</p>
                <div className="flex gap-2 mb-2">
                    <Input
                        size="sm" placeholder="Ej: Coloquio obligatorio"
                        value={nuevoOtro}
                        onValueChange={setNuevoOtro}
                        onKeyDown={e => e.key === "Enter" && agregarOtro()}
                        className="flex-1"
                    />
                    <Button size="sm" isIconOnly variant="flat" color="primary" onPress={agregarOtro}><Plus size={16} /></Button>
                </div>
                <div className="flex flex-col gap-1">
                    {form.otrosList.map(o => (
                        <div key={o.id} className="flex items-center gap-2 bg-default-50 rounded-lg px-3 py-1.5">
                            <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                            <span className="text-sm flex-1">{o.texto}</span>
                            <button onClick={() => borrarOtro(o.id)} className="text-default-300 hover:text-danger transition-colors"><X size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notas libres */}
            <div>
                <p className="text-xs font-bold uppercase text-default-500 tracking-wider mb-2">Notas adicionales</p>
                <textarea
                    className="w-full text-sm bg-default-50 border border-default-200 rounded-xl p-3 resize-none focus:outline-none focus:border-primary min-h-[70px] transition-colors"
                    placeholder="Cualquier otra info relevante..."
                    value={form.notasLibres}
                    onChange={e => set("notasLibres", e.target.value)}
                />
            </div>

            {/* Acciones */}
            <div className="flex gap-2 justify-end">
                <Button size="sm" variant="light" onPress={handleCancelar}>Cancelar</Button>
                <Button size="sm" color="primary" isLoading={saving} startContent={<Save size={14} />} onPress={handleGuardar}>
                    Guardar
                </Button>
            </div>
        </div>
    );
};

export default CondicionesSection;
