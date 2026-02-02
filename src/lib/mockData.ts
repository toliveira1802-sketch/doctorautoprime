// Mock data for Dashboard

export const dashboardStatsMock = {
  faturamentoMes: 125000,
  osEmExecucao: 8,
  osAguardandoPeca: 3,
  osAguardandoAprovacao: 5,
  agendamentosSemana: 12,
};

export const ordensServicoMock = [
  { id: 1, numero: "OS-2026-001", placa: "ABC-1234", veiculo: "BMW 320i", cliente: "João Silva", status: "Em Execução", valorTotalOs: 4500 },
  { id: 2, numero: "OS-2026-002", placa: "DEF-5678", veiculo: "Audi A4", cliente: "Maria Santos", status: "Pronto", valorTotalOs: 3200 },
  { id: 3, numero: "OS-2026-003", placa: "GHI-9012", veiculo: "Mercedes C200", cliente: "Pedro Costa", status: "Aguardando Peça", valorTotalOs: 8900 },
  { id: 4, numero: "OS-2026-004", placa: "JKL-3456", veiculo: "BMW X3", cliente: "Ana Oliveira", status: "Aguardando Aprovação", valorTotalOs: 5600 },
  { id: 5, numero: "OS-2026-005", placa: "MNO-7890", veiculo: "Porsche Cayenne", cliente: "Carlos Lima", status: "Entregue", valorTotalOs: 12000 },
  { id: 6, numero: "OS-2026-006", placa: "PQR-1234", veiculo: "Audi Q5", cliente: "Fernanda Reis", status: "Aguardando Retirada", valorTotalOs: 7800 },
];

export const agendamentosMock = [
  { id: 1, cliente: "Roberto Alves", placa: "STU-5678", dataAgendamento: "2026-02-03", horaAgendamento: "08:00", motivoVisita: "Revisão 60.000km" },
  { id: 2, cliente: "Lucia Ferreira", placa: "VWX-9012", dataAgendamento: "2026-02-03", horaAgendamento: "09:30", motivoVisita: "Troca de óleo" },
  { id: 3, cliente: "Marcos Souza", placa: "YZA-3456", dataAgendamento: "2026-02-03", horaAgendamento: "11:00", motivoVisita: "Diagnóstico motor" },
  { id: 4, cliente: "Paula Martins", placa: "BCD-7890", dataAgendamento: "2026-02-04", horaAgendamento: "08:30", motivoVisita: "Freios" },
  { id: 5, cliente: "Ricardo Santos", placa: "EFG-1234", dataAgendamento: "2026-02-04", horaAgendamento: "14:00", motivoVisita: "Suspensão" },
];

export const clientesMock = [
  { id: 1, nome: "João Silva", telefone: "(11) 99999-1111", email: "joao@email.com" },
  { id: 2, nome: "Maria Santos", telefone: "(11) 99999-2222", email: "maria@email.com" },
  { id: 3, nome: "Pedro Costa", telefone: "(11) 99999-3333", email: "pedro@email.com" },
  { id: 4, nome: "Ana Oliveira", telefone: "(11) 99999-4444", email: "ana@email.com" },
  { id: 5, nome: "Carlos Lima", telefone: "(11) 99999-5555", email: "carlos@email.com" },
];

export const empresasMock = [
  { id: 1, nomeEmpresa: "Doctor Auto Prime - Matriz" },
  { id: 2, nomeEmpresa: "Doctor Auto Prime - Filial SP" },
];

export const colaboradoresMock = [
  { id: 1, nome: "André Técnico", cargo: "Consultor Técnico", empresaId: 1 },
  { id: 2, nome: "Bruno Diretor", cargo: "Direção", empresaId: 1 },
  { id: 3, nome: "Carla Gestão", cargo: "Gestão", empresaId: 1 },
  { id: 4, nome: "Daniel Consultor", cargo: "Consultor Técnico", empresaId: 1 },
];
