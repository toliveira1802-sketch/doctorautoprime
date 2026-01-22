# 🏗️ Sistema de Monitoramento de Pátio

Sistema completo de monitoramento visual e interativo do pátio da oficina, baseado no layout real.

---

## 📦 **Conteúdo do Pacote**

```
monitoramento-patio/
├── components/
│   └── LayoutPatio.tsx       ← Componente de layout interativo
├── index.tsx                 ← Página principal
└── README.md                 ← Este arquivo
```

---

## 🚀 **Instalação**

### **1️⃣ Copiar arquivos**

Copia todos os arquivos para:

```
src/pages/gestao/patio/
```

### **2️⃣ Adicionar rota**

No `App.tsx`:

```tsx
import MonitoramentoPatio from "@/pages/gestao/patio";

// Dentro do <Router>
<Route path="/gestao/patio" component={MonitoramentoPatio} />
```

### **3️⃣ Adicionar no menu**

```tsx
<Link href="/gestao/patio">
  <Button>
    🏗️ Monitoramento de Pátio
  </Button>
</Link>
```

---

## ✨ **Features**

### **📊 Dashboard com Estatísticas**

- **Total de áreas:** Elevadores, boxes, áreas especiais
- **Status em tempo real:**
  - 🟢 Livres
  - 🔴 Ocupados
  - 🔵 Em manutenção
  - 🟡 Reservados
- **Taxa de ocupação:** Percentual de uso do pátio
- **Auto-refresh:** Atualização automática a cada 30s

### **🗺️ Layout Interativo**

- **Visualização em escala:** Layout proporcional ao real
- **Grid de referência:** Medidas em metros
- **Áreas clicáveis:** Clica em qualquer área para ver detalhes
- **Cores por status:** Identificação visual imediata
- **Informações inline:** Placa e modelo do veículo

### **📋 Detalhes da Área**

Ao clicar em uma área, mostra:

- Nome e tipo (elevador/box/área)
- Status atual
- **Se ocupada:**
  - Placa do veículo
  - Modelo
  - Cliente
  - Serviço sendo realizado
  - Horário de entrada
  - Previsão de saída
  - Ações: Ver OS, Finalizar, Mover

- **Se livre:**
  - Opção de alocar veículo

### **🚗 Lista de Veículos em Atendimento**

- Todos os veículos no pátio
- Localização (qual elevador/box)
- Cliente e serviço
- Horários (entrada e previsão)
- Ação rápida: Ver detalhes

### **⚙️ Controles**

- **Atualizar:** Refresh manual
- **Exportar:** Relatório CSV/PDF
- **Auto-refresh:** Liga/desliga atualização automática

---

## 🏗️ **Layout da Oficina**

### **Áreas Mapeadas** (baseado em oficina_sketch_final_v10.png)

#### **Elevadores (8 unidades)**

| ID | Nome | Posição | Dimensões |
|----|------|---------|-----------|
| elev-1 | Elevador 1 | Esquerda | 3m × 2m |
| elev-2 | Elevador 2 | Esquerda | 3m × 2m |
| elev-3 | Elevador 3 | Esquerda | 3m × 2m |
| elev-4 | Elevador 4 | Esquerda | 3m × 2m |
| elev-5 | Elevador 5 | Esquerda | 3m × 2m |
| elev-6 | Elevador 6 | Esquerda | 3m × 2m |
| elev-7 | Elevador 7 | Esquerda | 3m × 2m |
| elev-8 | Elevador 8 | Direita | 5m × 3m |

#### **Boxes (3 unidades)**

| ID | Nome | Posição | Dimensões |
|----|------|---------|-----------|
| box-ar | Box Ar-cond. | Esquerda | 3m × 4m |
| box-d | Box D | Centro | 4m × 3m |
| box-e | Box E | Centro | 4m × 3m |

#### **Áreas Especiais (5 unidades)**

| ID | Nome | Posição | Dimensões |
|----|------|---------|-----------|
| elev-diag | Elevador Diagnóstico | Direita | 5m × 4m |
| remap | REMAP e VCDS | Centro-direita | 4m × 7m |
| dinamometro | Dinamômetro | Direita | 5m × 7m |
| rampa | Rampa de Alinhamento | Direita | 5m × 9m |
| loja | Loja / Sala | Esquerda | 10m × 9m |

**Total:** 16 áreas  
**Dimensões do pátio:** 22m × 40m

---

## 🎨 **Status das Áreas**

### **🟢 Livre**
- Área disponível para uso
- Cor: Verde
- Ação: Alocar veículo

### **🔴 Ocupado**
- Veículo em atendimento
- Cor: Vermelho
- Mostra: Placa, modelo, cliente, serviço

### **🔵 Manutenção**
- Área em manutenção/reparo
- Cor: Azul
- Não disponível temporariamente

### **🟡 Reservado**
- Área reservada para veículo específico
- Cor: Amarelo
- Aguardando chegada do veículo

---

## 📊 **Estrutura de Dados**

### **Interface Area**

```typescript
interface Area {
  id: string;
  nome: string;
  tipo: "elevador" | "box" | "area";
  status: "livre" | "ocupado" | "manutencao" | "reservado";
  veiculo?: Veiculo;
  x: number;        // Posição X em metros
  y: number;        // Posição Y em metros
  width: number;    // Largura em metros
  height: number;   // Altura em metros
}
```

### **Interface Veiculo**

```typescript
interface Veiculo {
  placa: string;
  modelo: string;
  cliente: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
}
```

---

## 🔗 **Integração com IA "Organizador de Pátio"**

O sistema está pronto para integrar com a IA:

### **Funções da IA:**

1. **Sugerir melhor posição**
   ```typescript
   // IA analisa:
   // - Tipo de serviço
   // - Tempo estimado
   // - Disponibilidade de áreas
   // - Fluxo de trabalho
   
   const melhorPosicao = await ia.sugerirPosicao({
     servico: "Alinhamento",
     tempoEstimado: "1h",
     prioridade: "alta"
   });
   // Retorna: "elev-4" (mais próximo da rampa)
   ```

2. **Alertar lotação**
   ```typescript
   if (taxaOcupacao > 80) {
     ia.alertar("Pátio com alta ocupação!");
   }
   ```

3. **Otimizar fluxo**
   ```typescript
   // IA sugere movimentações para otimizar
   const sugestoes = await ia.otimizarFluxo();
   // Retorna: [
   //   { veiculo: "ABC-1234", de: "elev-2", para: "elev-7" },
   //   { veiculo: "XYZ-5678", de: "elev-5", para: "box-d" }
   // ]
   ```

4. **Prever tempo de espera**
   ```typescript
   const tempoEspera = await ia.preverEspera({
     servico: "Revisão",
     horario: "14:00"
   });
   // Retorna: "45 minutos"
   ```

---

## 🎯 **Casos de Uso**

### **1. Alocar Veículo**

```typescript
const area = areas.find(a => a.id === "elev-3");
area.status = "ocupado";
area.veiculo = {
  placa: "ABC-1234",
  modelo: "Gol 2020",
  cliente: "João Silva",
  servico: "Troca de óleo",
  entrada: "08:30",
  previsaoSaida: "10:00"
};
```

### **2. Liberar Área**

```typescript
const area = areas.find(a => a.id === "elev-3");
area.status = "livre";
area.veiculo = undefined;
```

### **3. Marcar Manutenção**

```typescript
const area = areas.find(a => a.id === "elev-5");
area.status = "manutencao";
area.veiculo = undefined;
```

### **4. Reservar Área**

```typescript
const area = areas.find(a => a.id === "box-d");
area.status = "reservado";
```

---

## 📱 **Responsividade**

### **Desktop (> 1024px)**
- Layout completo visível
- Detalhes inline
- Grid de 5 colunas (stats)

### **Tablet (768px - 1024px)**
- Layout com scroll horizontal
- Grid de 3 colunas (stats)

### **Mobile (< 768px)**
- Layout com zoom e pan
- Grid de 2 colunas (stats)
- Detalhes em modal

---

## 🔧 **Personalização**

### **Ajustar Escala**

No `LayoutPatio.tsx`:

```typescript
// Aumenta o tamanho do layout
const SCALE = 20; // Era 15

// Ou ajusta dimensões mínimas
style={{
  minWidth: 800,  // Era 600
  minHeight: 1000 // Era 800
}}
```

### **Adicionar Nova Área**

```typescript
const novaArea: Area = {
  id: "nova-area",
  nome: "Nova Área",
  tipo: "box",
  status: "livre",
  x: 5,      // Posição X em metros
  y: 20,     // Posição Y em metros
  width: 4,  // Largura em metros
  height: 3  // Altura em metros
};

setAreas([...areas, novaArea]);
```

### **Mudar Cores**

```typescript
const getStatusColor = (status: StatusArea) => {
  switch (status) {
    case "livre": return "bg-green-500/20 border-green-500";
    case "ocupado": return "bg-red-500/20 border-red-500";
    case "manutencao": return "bg-blue-500/20 border-blue-500";
    case "reservado": return "bg-yellow-500/20 border-yellow-500";
  }
};
```

---

## 🔗 **Integração com Backend**

### **Buscar Status**

```typescript
// GET /api/patio/status
const response = await fetch('https://api.example.com/patio/status');
const areas = await response.json();
setAreas(areas);
```

### **Atualizar Área**

```typescript
// PATCH /api/patio/areas/:id
await fetch(`https://api.example.com/patio/areas/${areaId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    status: "ocupado",
    veiculo: {
      placa: "ABC-1234",
      // ...
    }
  })
});
```

### **WebSocket (Tempo Real)**

```typescript
const ws = new WebSocket('wss://api.example.com/patio/live');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  setAreas(prev => prev.map(area =>
    area.id === update.areaId
      ? { ...area, ...update }
      : area
  ));
};
```

---

## 📈 **Métricas e Analytics**

### **KPIs Importantes**

1. **Taxa de Ocupação**
   - Ideal: 60-80%
   - Alta: > 80% (risco de fila)
   - Baixa: < 40% (capacidade ociosa)

2. **Tempo Médio de Atendimento**
   - Por tipo de serviço
   - Por elevador/box
   - Por mecânico

3. **Giro do Pátio**
   - Veículos atendidos por dia
   - Tempo médio de permanência

4. **Áreas Mais Utilizadas**
   - Ranking de uso
   - Identificar gargalos

---

## 🐛 **Troubleshooting**

### **Problema: Layout não aparece**

**Solução:**
1. Verifica se as dimensões estão corretas
2. Ajusta `SCALE` para aumentar tamanho
3. Checa se `areas` tem dados

### **Problema: Áreas não clicáveis**

**Solução:**
1. Verifica se `onAreaClick` está definido
2. Remove `pointer-events: none` do CSS
3. Ajusta z-index das áreas

### **Problema: Cores não aparecem**

**Solução:**
1. Verifica se Tailwind está configurado
2. Adiciona cores customizadas no `tailwind.config.js`
3. Usa classes inline como fallback

---

## 🚀 **Próximos Passos**

1. **[ ] Integrar com backend real**
2. **[ ] Adicionar WebSocket para tempo real**
3. **[ ] Implementar drag-and-drop de veículos**
4. **[ ] Criar sistema de fila de espera**
5. **[ ] Adicionar notificações push**
6. **[ ] Gerar relatórios de uso**
7. **[ ] Integrar com IA Organizador de Pátio**
8. **[ ] Adicionar histórico de movimentações**

---

## 🎉 **Pronto!**

Agora você tem um sistema completo de monitoramento de pátio com layout interativo!

**Boa sorte! 🚀**
