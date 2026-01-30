#!/usr/bin/env python3
"""
🎯 CONVERSOR CSV → SQL - DOCTOR AUTO PRIME
==========================================

Este script converte os CSVs preenchidos em scripts SQL prontos para executar no Supabase.

COMO USAR:
1. Preencha os arquivos CSV
2. Execute: python csv_to_sql.py
3. Scripts SQL serão gerados na pasta 'sql_gerado/'
4. Execute os SQLs no Supabase na ordem numérica

"""

import csv
import os
from datetime import datetime
from pathlib import Path

# Diretório base
BASE_DIR = Path(__file__).parent
SQL_OUTPUT_DIR = BASE_DIR / "sql_gerado"

# Criar diretório de saída
SQL_OUTPUT_DIR.mkdir(exist_ok=True)

def escape_sql_string(value):
    """Escapa strings para SQL"""
    if value is None or value == '':
        return 'NULL'
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"

def process_clientes(csv_file):
    """Processa 01_clientes.csv"""
    output_file = SQL_OUTPUT_DIR / "01_insert_clientes.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  01_clientes.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE CLIENTES",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        # Limpar CPF (remover pontos e traços)
        cpf_limpo = row['cpf'].replace('.', '').replace('-', '')
        
        sql = f"""
INSERT INTO public.profiles (
    full_name, cpf, email, phone, birth_date,
    address, zip_code, city, state,
    loyalty_tier, loyalty_points, company_id,
    notes
) VALUES (
    {escape_sql_string(row['nome_completo'])},
    {escape_sql_string(cpf_limpo)},
    {escape_sql_string(row['email'])},
    {escape_sql_string(row['telefone'])},
    {escape_sql_string(row['data_nascimento']) if row['data_nascimento'] else 'NULL'},
    {escape_sql_string(row['endereco_completo'])},
    {escape_sql_string(row['cep'].replace('-', ''))},
    {escape_sql_string(row['cidade'])},
    {escape_sql_string(row['estado'])},
    {escape_sql_string(row['tier_fidelidade'])},
    {row['pontos_fidelidade'] if row['pontos_fidelidade'] else '0'},
    {row['empresa_id']},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} clientes)")

def process_veiculos(csv_file):
    """Processa 02_veiculos.csv"""
    output_file = SQL_OUTPUT_DIR / "02_insert_veiculos.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  02_veiculos.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE VEÍCULOS",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        cpf_limpo = row['cpf_cliente'].replace('.', '').replace('-', '')
        
        sql = f"""
INSERT INTO public.vehicles (
    plate, brand, model, year, color,
    user_id, mileage, chassis, renavam,
    notes
) VALUES (
    {escape_sql_string(row['placa'])},
    {escape_sql_string(row['marca'])},
    {escape_sql_string(row['modelo'])},
    {row['ano']},
    {escape_sql_string(row['cor'])},
    (SELECT id FROM public.profiles WHERE cpf = {escape_sql_string(cpf_limpo)} LIMIT 1),
    {row['quilometragem'] if row['quilometragem'] else 'NULL'},
    {escape_sql_string(row.get('chassi', ''))},
    {escape_sql_string(row.get('renavam', ''))},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} veículos)")

def process_ordens_servico(csv_file):
    """Processa 03_ordens_servico.csv"""
    output_file = SQL_OUTPUT_DIR / "03_insert_ordens_servico.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  03_ordens_servico.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE ORDENS DE SERVIÇO",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        cpf_limpo = row['cpf_cliente'].replace('.', '').replace('-', '')
        
        sql = f"""
INSERT INTO public.ordens_servico (
    numero_os, plate, vehicle, client_name, client_phone,
    status, descricao_problema, diagnostico,
    mechanic_id, data_entrada, data_orcamento,
    valor_orcado, valor_aprovado,
    empresa_id, prioridade, observacoes
) VALUES (
    {escape_sql_string(row['numero_os'])},
    {escape_sql_string(row['placa_veiculo'])},
    (SELECT CONCAT(brand, ' ', model) FROM public.vehicles WHERE plate = {escape_sql_string(row['placa_veiculo'])} LIMIT 1),
    (SELECT full_name FROM public.profiles WHERE cpf = {escape_sql_string(cpf_limpo)} LIMIT 1),
    (SELECT phone FROM public.profiles WHERE cpf = {escape_sql_string(cpf_limpo)} LIMIT 1),
    {escape_sql_string(row['status'])},
    {escape_sql_string(row['descricao_problema'])},
    {escape_sql_string(row.get('diagnostico', ''))},
    {escape_sql_string(row.get('mecanico_responsavel', ''))},
    {escape_sql_string(row['data_entrada']) if row['data_entrada'] else 'NOW()'},
    {escape_sql_string(row.get('data_prevista_conclusao', '')) if row.get('data_prevista_conclusao') else 'NULL'},
    {row['valor_orcado'] if row['valor_orcado'] else '0'},
    {row['valor_aprovado'] if row['valor_aprovado'] else 'NULL'},
    {row['empresa_id']},
    {escape_sql_string(row.get('prioridade', 'verde'))},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} ordens de serviço)")

def process_itens_os(csv_file):
    """Processa 04_itens_os.csv"""
    output_file = SQL_OUTPUT_DIR / "04_insert_itens_os.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  04_itens_os.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE ITENS DE OS",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        valor_unit = float(row['valor_unitario']) if row['valor_unitario'] else 0
        qtd = float(row['quantidade']) if row['quantidade'] else 1
        valor_total = valor_unit * qtd
        
        sql = f"""
INSERT INTO public.ordem_servico_items (
    ordem_servico_id, tipo, descricao,
    quantidade, valor_unitario, valor_total,
    status, observacoes
) VALUES (
    (SELECT id FROM public.ordens_servico WHERE numero_os = {escape_sql_string(row['numero_os'])} LIMIT 1),
    {escape_sql_string(row['tipo'])},
    {escape_sql_string(row['descricao'])},
    {qtd},
    {valor_unit},
    {valor_total},
    {escape_sql_string(row.get('status', 'pendente'))},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} itens)")

def process_agendamentos(csv_file):
    """Processa 05_agendamentos.csv"""
    output_file = SQL_OUTPUT_DIR / "05_insert_agendamentos.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  05_agendamentos.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE AGENDAMENTOS",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        cpf_limpo = row['cpf_cliente'].replace('.', '').replace('-', '')
        datetime_agendamento = f"{row['data_agendamento']} {row['hora_agendamento']}:00"
        
        sql = f"""
INSERT INTO public.appointments (
    vehicle_id, user_id, company_id,
    scheduled_date, service_type,
    status, notes
) VALUES (
    (SELECT id FROM public.vehicles WHERE plate = {escape_sql_string(row['placa_veiculo'])} LIMIT 1),
    (SELECT id FROM public.profiles WHERE cpf = {escape_sql_string(cpf_limpo)} LIMIT 1),
    {row['empresa_id']},
    {escape_sql_string(datetime_agendamento)},
    {escape_sql_string(row['servico_solicitado'])},
    {escape_sql_string(row.get('status', 'pendente'))},
    {escape_sql_string(row.get('observacoes_cliente', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} agendamentos)")

def process_pecas_estoque(csv_file):
    """Processa 06_pecas_estoque.csv"""
    output_file = SQL_OUTPUT_DIR / "06_insert_pecas_estoque.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  06_pecas_estoque.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE PEÇAS (ESTOQUE)",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        sql = f"""
INSERT INTO public.parts (
    code, name, category_id,
    manufacturer, cost_price, sale_price,
    current_stock, minimum_stock,
    location, company_id, notes
) VALUES (
    {escape_sql_string(row['codigo_peca'])},
    {escape_sql_string(row['nome'])},
    (SELECT id FROM public.parts_categories WHERE name = {escape_sql_string(row['categoria'])} LIMIT 1),
    {escape_sql_string(row['fabricante'])},
    {row['preco_custo'] if row['preco_custo'] else '0'},
    {row['preco_venda'] if row['preco_venda'] else '0'},
    {row['estoque_atual'] if row['estoque_atual'] else '0'},
    {row['estoque_minimo'] if row['estoque_minimo'] else '0'},
    {escape_sql_string(row.get('localizacao', ''))},
    {row['empresa_id']},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} peças)")

def process_patio_kanban(csv_file):
    """Processa 07_patio_kanban.csv"""
    output_file = SQL_OUTPUT_DIR / "07_insert_patio_kanban.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  07_patio_kanban.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE MOVIMENTOS DO PÁTIO",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        sql = f"""
INSERT INTO public.patio_movements (
    ordem_servico_id, vehicle_plate,
    stage_id, moved_at,
    responsible, notes
) VALUES (
    (SELECT id FROM public.ordens_servico WHERE numero_os = {escape_sql_string(row['numero_os'])} LIMIT 1),
    {escape_sql_string(row['placa_veiculo'])},
    (SELECT id FROM public.patio_stages WHERE name = {escape_sql_string(row['estagio_atual'])} LIMIT 1),
    {escape_sql_string(row['data_entrada_patio']) if row['data_entrada_patio'] else 'NOW()'},
    {escape_sql_string(row.get('mecanico_responsavel', ''))},
    {escape_sql_string(row.get('observacoes_patio', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} movimentos)")

def process_pagamentos(csv_file):
    """Processa 08_pagamentos.csv"""
    output_file = SQL_OUTPUT_DIR / "08_insert_pagamentos.sql"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print("⚠️  08_pagamentos.csv está vazio!")
        return
    
    sql_lines = [
        "-- =============================================",
        "-- INSERÇÃO DE PAGAMENTOS",
        f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total de registros: {len(rows)}",
        "-- =============================================\n"
    ]
    
    for row in rows:
        cpf_limpo = row['cpf_cliente'].replace('.', '').replace('-', '')
        
        sql = f"""
INSERT INTO public.payments (
    ordem_servico_id, client_id,
    payment_method_id, payment_date,
    amount, amount_paid,
    status, installments, notes
) VALUES (
    (SELECT id FROM public.ordens_servico WHERE numero_os = {escape_sql_string(row['numero_os'])} LIMIT 1),
    (SELECT id FROM public.profiles WHERE cpf = {escape_sql_string(cpf_limpo)} LIMIT 1),
    (SELECT id FROM public.payment_methods WHERE name = {escape_sql_string(row['forma_pagamento'])} LIMIT 1),
    {escape_sql_string(row['data_pagamento']) if row['data_pagamento'] else 'NOW()'},
    {row['valor_total'] if row['valor_total'] else '0'},
    {row['valor_pago'] if row['valor_pago'] else '0'},
    {escape_sql_string(row.get('status_pagamento', 'pendente'))},
    {row['numero_parcelas'] if row['numero_parcelas'] else '1'},
    {escape_sql_string(row.get('observacoes', ''))}
);
"""
        sql_lines.append(sql)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Gerado: {output_file} ({len(rows)} pagamentos)")

def main():
    """Função principal"""
    print("\n🎯 CONVERSOR CSV → SQL - DOCTOR AUTO PRIME")
    print("=" * 60)
    print()
    
    csv_files = {
        '01_clientes.csv': process_clientes,
        '02_veiculos.csv': process_veiculos,
        '03_ordens_servico.csv': process_ordens_servico,
        '04_itens_os.csv': process_itens_os,
        '05_agendamentos.csv': process_agendamentos,
        '06_pecas_estoque.csv': process_pecas_estoque,
        '07_patio_kanban.csv': process_patio_kanban,
        '08_pagamentos.csv': process_pagamentos,
    }
    
    for csv_file, processor in csv_files.items():
        csv_path = BASE_DIR / csv_file
        if csv_path.exists():
            try:
                processor(csv_path)
            except Exception as e:
                print(f"❌ Erro ao processar {csv_file}: {str(e)}")
        else:
            print(f"⚠️  Arquivo não encontrado: {csv_file}")
    
    print()
    print("=" * 60)
    print("✅ CONVERSÃO CONCLUÍDA!")
    print()
    print(f"📁 Scripts SQL gerados em: {SQL_OUTPUT_DIR}")
    print()
    print("🚀 PRÓXIMOS PASSOS:")
    print("1. Abra o Supabase Dashboard")
    print("2. Vá em SQL Editor → New Query")
    print("3. Execute os scripts na ordem numérica (01, 02, 03...)")
    print("4. Verifique os dados inseridos")
    print()

if __name__ == '__main__':
    main()
