#!/bin/bash

echo "# 📊 MAPEAMENTO COMPLETO DE TABELAS E USOS"
echo ""
echo "Gerado em: $(date)"
echo ""
echo "---"
echo ""

# Lista de tabelas conhecidas
tables=(
  "companies"
  "roles" 
  "services"
  "payment_methods"
  "parts_categories"
  "profiles"
  "user_roles"
  "user_companies"
  "vehicles"
  "vehicle_history"
  "appointments"
  "appointment_services"
  "appointment_funnel"
  "ordens_servico"
  "ordem_servico_items"
  "ordem_servico_history"
  "payments"
  "invoices"
  "parts"
  "stock_movements"
  "patio_stages"
  "patio_movements"
  "promotions"
  "events"
  "event_participants"
)

for table in "${tables[@]}"; do
  echo "## 📋 Tabela: \`$table\`"
  echo ""
  
  # Buscar arquivos que usam esta tabela
  files=$(grep -r "from('$table')\|from(\"$table\")\|$table" src --include="*.tsx" --include="*.ts" -l 2>/dev/null | head -10)
  
  if [ -n "$files" ]; then
    echo "**Usado em:**"
    echo '```'
    echo "$files"
    echo '```'
  else
    echo "**Uso:** ⚠️ Não encontrado no código fonte"
  fi
  
  echo ""
  echo "---"
  echo ""
done

echo ""
echo "## 📈 ESTATÍSTICAS"
echo ""
echo "- Total de tabelas mapeadas: ${#tables[@]}"
echo "- Arquivos TypeScript no projeto: $(find src -name '*.tsx' -o -name '*.ts' | wc -l)"
echo ""
