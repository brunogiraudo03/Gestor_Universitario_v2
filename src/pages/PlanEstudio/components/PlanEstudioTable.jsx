import { useMemo } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Chip, Tooltip, Progress 
} from "@nextui-org/react";
import { Trash2, Edit, AlertTriangle, CheckCircle2 } from "lucide-react";

// Columnas más compactas
const columns = [
  {name: "N°", uid: "numero"},
  {name: "ASIGNATURA", uid: "nombre"},
  {name: "MODALIDAD", uid: "modalidad"},
  {name: "C. REG", uid: "correlativasRegular"}, // Nombre corto para achicar
  {name: "C. APR", uid: "correlativasAprobada"}, // Nombre corto para achicar
  {name: "ESTADO", uid: "estado"},
  {name: "NOTA", uid: "nota"},
  {name: "", uid: "actions"},
];

const ESTADOS_COLORS = {
  "Aprobada": "success",
  "Regular": "warning",
  "Pendiente": "default",
  "Desaprobada": "danger"
};

const PlanEstudioTable = ({ materias, onEdit, onDelete }) => {
  
  const nivelesPresentes = useMemo(() => {
    const niveles = materias.map(m => m.nivel);
    const validos = [...new Set(niveles)].filter(n => !isNaN(n) && n > 0).sort((a,b) => a - b);
    const hayErrores = materias.some(m => isNaN(m.nivel) || m.nivel < 1);
    return hayErrores ? [...validos, "error"] : validos;
  }, [materias]);

  const renderCell = (materia, columnKey) => {
    const cellValue = materia[columnKey];

    switch (columnKey) {
      case "estado":
        return (
          <Chip className="capitalize border-none gap-1 text-default-600" color={ESTADOS_COLORS[cellValue] || "default"} size="sm" variant="dot">
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Editar">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => onEdit(materia)}>
                <Edit size={18} />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Borrar">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => onDelete(materia.id)}>
                <Trash2 size={18} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  };

  return (
    <div className="space-y-10">
      {nivelesPresentes.map((nivel) => {
        let materiasDelNivel, titulo, esError = false;
        let porcentaje = 0, aprobadas = 0, total = 0;

        if (nivel === "error") {
            materiasDelNivel = materias.filter(m => isNaN(m.nivel) || m.nivel < 1);
            titulo = "SIN CLASIFICAR / ERRORES";
            esError = true;
        } else {
            materiasDelNivel = materias
                .filter(m => m.nivel === nivel)
                .sort((a, b) => a.numero - b.numero);
            titulo = `AÑO ${nivel}`;
            
            total = materiasDelNivel.length;
            aprobadas = materiasDelNivel.filter(m => m.estado === "Aprobada").length;
            porcentaje = total > 0 ? (aprobadas / total) * 100 : 0;
        }

        if (materiasDelNivel.length === 0) return null;

        return (
          <div key={nivel} className="animate-appearance-in">
            {/* Header del Año con Barra de Progreso */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Chip 
                            color={esError ? "danger" : "primary"} 
                            variant="flat" 
                            size="lg" 
                            className="font-bold px-4"
                            startContent={esError ? <AlertTriangle size={18}/> : null}
                        >
                            {titulo}
                        </Chip>
                        {!esError && porcentaje === 100 && (
                            <Chip color="success" variant="flat" size="sm" startContent={<CheckCircle2 size={14}/>}>Completo</Chip>
                        )}
                    </div>
                    {!esError && (
                        <span className="text-small text-default-500 font-medium">
                            {aprobadas} / {total} Materias ({Math.round(porcentaje)}%)
                        </span>
                    )}
                </div>
                
                {!esError && (
                    <Progress 
                        size="sm" 
                        value={porcentaje} 
                        color={porcentaje === 100 ? "success" : "primary"} 
                        className="max-w-full"
                        aria-label={`Progreso año ${nivel}`}
                    />
                )}
            </div>

            <Table 
                aria-label={`Tabla Nivel ${titulo}`} 
                classNames={{
                    wrapper: "bg-content1 shadow-sm border border-default-100",
                    th: "bg-default-100 text-default-600",
                }}
            >
                <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                    {column.name}
                    </TableColumn>
                )}
                </TableHeader>
                <TableBody items={materiasDelNivel} emptyContent={`No hay materias.`}>
                {(item) => (
                    <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        )
      })}
    </div>
  );
};

export default PlanEstudioTable;