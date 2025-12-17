import { useMemo } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, 
  Chip, Tooltip 
} from "@nextui-org/react";
import { Trash2, Edit, Coins } from "lucide-react";

const columns = [
  {name: "ASIGNATURA", uid: "nombre"},
  {name: "NIVEL", uid: "nivel"},
  {name: "MODALIDAD", uid: "modalidad"},
  {name: "CRÉDITOS", uid: "creditos"}, 
  {name: "C. REG", uid: "correlativasRegular"},
  {name: "C. APR", uid: "correlativasAprobada"},
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

const ElectivasTable = ({ electivas, onEdit, onDelete }) => {
  
  const sortedElectivas = useMemo(() => {
    return [...electivas].sort((a,b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre));
  }, [electivas]);

  const renderCell = (materia, columnKey) => {
    const cellValue = materia[columnKey];

    switch (columnKey) {
      case "nivel":
        return <span className="text-default-500 font-bold">{cellValue}° Año</span>;
      case "creditos":
        return (
            <div className="flex items-center gap-1 font-bold text-blue-400">
                <Coins size={14}/> {cellValue}
            </div>
        );
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
    <div className="animate-appearance-in">
        <Table 
            aria-label="Tabla de Electivas" 
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
            <TableBody items={sortedElectivas} emptyContent={`No hay electivas cargadas.`}>
            {(item) => (
                <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  );
};

export default ElectivasTable;