/**
 * Busca un objeto en una lista de opciones basándose en su ID.
 * @param options Lista de opciones (dueños, pacientes, etc.)
 * @param id El ID que queremos buscar
 * @returns El objeto encontrado o null
 */
const findEnrichedData = <T,>(options: { id: string; label: string; subLabel?: string; data?: T }[], id: string) => {
  return options.find(opt => opt.id === id) || null;
};

export default findEnrichedData;