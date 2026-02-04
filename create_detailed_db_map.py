#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Definição completa de todas as tabelas e seus campos
TABLES_SCHEMA = {
    "companies": {
        "desc": "Empresas do grupo Doctor Auto Prime",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT - Nome da empresa",
            "slug TEXT UNIQUE - Identificador para URLs",
            "logo_url TEXT - URL do logo",
            "primary_color TEXT - Cor primária (hex)",
            "is_active BOOLEAN - Status ativo/inativo",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "roles": {
        "desc": "Papéis/Roles do sistema (RBAC)",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT UNIQUE - Nome do papel (dev, gestao, admin, cliente)",
            "level INTEGER - Nível de acesso (10-100)",
            "description TEXT - Descrição do papel",
            "is_active BOOLEAN - Status ativo/inativo",
            "created_at TIMESTAMPTZ"
        ]
    },
    "profiles": {
        "desc": "Perfis de usuários (extensão do auth.users)",
        "fields": [
            "id UUID PRIMARY KEY REFERENCES auth.users",
            "user_id UUID REFERENCES auth.users",
            "full_name TEXT - Nome completo",
            "cpf TEXT UNIQUE - CPF do usuário",
            "phone TEXT - Telefone",
            "company_id UUID REFERENCES companies - Empresa principal",
            "avatar_url TEXT - URL do avatar",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "user_roles": {
        "desc": "Atribuição de papéis aos usuários",
        "fields": [
            "id UUID PRIMARY KEY",
            "user_id UUID REFERENCES auth.users",
            "role TEXT - Nome do papel atribuído",
            "company_id UUID REFERENCES companies - Empresa específica",
            "created_at TIMESTAMPTZ"
        ]
    },
    "user_companies": {
        "desc": "Empresas às quais o usuário pertence",
        "fields": [
            "id UUID PRIMARY KEY",
            "user_id UUID REFERENCES auth.users",
            "company_id UUID REFERENCES companies",
            "is_primary BOOLEAN - Empresa principal",
            "created_at TIMESTAMPTZ"
        ]
    },
    "user_company_access": {
        "desc": "Controle de acesso multi-company",
        "fields": [
            "id UUID PRIMARY KEY",
            "user_id UUID REFERENCES auth.users",
            "company_id UUID REFERENCES companies",
            "can_view BOOLEAN - Pode visualizar",
            "can_edit BOOLEAN - Pode editar",
            "can_manage BOOLEAN - Pode gerenciar",
            "created_at TIMESTAMPTZ"
        ]
    },
    "invite_codes": {
        "desc": "Códigos de convite para registro com roles",
        "fields": [
            "id UUID PRIMARY KEY",
            "code TEXT UNIQUE - Código do convite",
            "role TEXT - Papel a ser atribuído",
            "max_uses INTEGER - Máximo de usos",
            "current_uses INTEGER - Usos atuais",
            "expires_at TIMESTAMPTZ - Data de expiração",
            "created_at TIMESTAMPTZ"
        ]
    },
    "services": {
        "desc": "Catálogo de serviços oferecidos",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT - Nome do serviço",
            "description TEXT - Descrição detalhada",
            "category TEXT - Categoria (revisao, diagnostico, etc)",
            "base_price DECIMAL - Preço base",
            "estimated_time INTEGER - Tempo estimado (minutos)",
            "company_id UUID REFERENCES companies",
            "is_active BOOLEAN",
            "created_at TIMESTAMPTZ"
        ]
    },
    "vehicles": {
        "desc": "Veículos dos clientes",
        "fields": [
            "id UUID PRIMARY KEY",
            "owner_id UUID REFERENCES auth.users - Dono do veículo",
            "company_id UUID REFERENCES companies",
            "brand TEXT - Marca",
            "model TEXT - Modelo",
            "year INTEGER - Ano",
            "plate TEXT - Placa",
            "chassis TEXT - Chassi",
            "color TEXT - Cor",
            "mileage INTEGER - Quilometragem",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "vehicle_history": {
        "desc": "Histórico de serviços dos veículos",
        "fields": [
            "id UUID PRIMARY KEY",
            "vehicle_id UUID REFERENCES vehicles",
            "service_id UUID REFERENCES services",
            "mileage INTEGER - Km no momento do serviço",
            "notes TEXT - Observações",
            "performed_at TIMESTAMPTZ",
            "created_at TIMESTAMPTZ"
        ]
    },
    "appointments": {
        "desc": "Agendamentos de serviços",
        "fields": [
            "id UUID PRIMARY KEY",
            "client_id UUID REFERENCES auth.users",
            "vehicle_id UUID REFERENCES vehicles",
            "company_id UUID REFERENCES companies",
            "scheduled_date TIMESTAMPTZ - Data agendada",
            "status TEXT - Status (pending, confirmed, cancelled)",
            "notes TEXT - Observações",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "appointment_services": {
        "desc": "Serviços incluídos nos agendamentos",
        "fields": [
            "id UUID PRIMARY KEY",
            "appointment_id UUID REFERENCES appointments",
            "service_id UUID REFERENCES services",
            "quantity INTEGER",
            "created_at TIMESTAMPTZ"
        ]
    },
    "appointment_funnel": {
        "desc": "Funil de vendas dos agendamentos",
        "fields": [
            "id UUID PRIMARY KEY",
            "appointment_id UUID REFERENCES appointments",
            "stage TEXT - Estágio (lead, qualified, converted)",
            "notes TEXT",
            "moved_at TIMESTAMPTZ",
            "created_at TIMESTAMPTZ"
        ]
    },
    "ordens_servico": {
        "desc": "Ordens de Serviço (OS)",
        "fields": [
            "id UUID PRIMARY KEY",
            "numero_os TEXT UNIQUE - Número da OS",
            "client_id UUID REFERENCES auth.users",
            "vehicle_id UUID REFERENCES vehicles",
            "company_id UUID REFERENCES companies",
            "status TEXT - Status da OS",
            "valor_total DECIMAL - Valor total",
            "desconto DECIMAL - Desconto aplicado",
            "observacoes TEXT",
            "data_entrada TIMESTAMPTZ",
            "data_prevista TIMESTAMPTZ",
            "data_conclusao TIMESTAMPTZ",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "ordem_servico_items": {
        "desc": "Itens das Ordens de Serviço",
        "fields": [
            "id UUID PRIMARY KEY",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "tipo TEXT - Tipo (servico, peca)",
            "descricao TEXT - Descrição do item",
            "quantidade DECIMAL",
            "valor_unitario DECIMAL",
            "valor_total DECIMAL",
            "created_at TIMESTAMPTZ"
        ]
    },
    "ordem_servico_history": {
        "desc": "Histórico de mudanças nas OS",
        "fields": [
            "id UUID PRIMARY KEY",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "changed_by UUID REFERENCES auth.users",
            "old_status TEXT",
            "new_status TEXT",
            "notes TEXT",
            "created_at TIMESTAMPTZ"
        ]
    },
    "payments": {
        "desc": "Pagamentos recebidos",
        "fields": [
            "id UUID PRIMARY KEY",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "payment_method_id UUID REFERENCES payment_methods",
            "amount DECIMAL - Valor pago",
            "paid_at TIMESTAMPTZ - Data do pagamento",
            "notes TEXT",
            "created_at TIMESTAMPTZ"
        ]
    },
    "payment_methods": {
        "desc": "Métodos de pagamento aceitos",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT - Nome do método",
            "description TEXT",
            "is_active BOOLEAN",
            "created_at TIMESTAMPTZ"
        ]
    },
    "invoices": {
        "desc": "Notas fiscais geradas",
        "fields": [
            "id UUID PRIMARY KEY",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "invoice_number TEXT UNIQUE - Número NF",
            "issued_at TIMESTAMPTZ - Data emissão",
            "pdf_url TEXT - URL do PDF",
            "created_at TIMESTAMPTZ"
        ]
    },
    "parts": {
        "desc": "Peças em estoque",
        "fields": [
            "id UUID PRIMARY KEY",
            "category_id UUID REFERENCES parts_categories",
            "name TEXT - Nome da peça",
            "code TEXT - Código/SKU",
            "brand TEXT - Marca",
            "quantity INTEGER - Quantidade em estoque",
            "unit_price DECIMAL - Preço unitário",
            "min_stock INTEGER - Estoque mínimo",
            "location TEXT - Localização no estoque",
            "created_at TIMESTAMPTZ",
            "updated_at TIMESTAMPTZ"
        ]
    },
    "parts_categories": {
        "desc": "Categorias de peças",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT - Nome da categoria",
            "description TEXT",
            "created_at TIMESTAMPTZ"
        ]
    },
    "stock_movements": {
        "desc": "Movimentações de estoque",
        "fields": [
            "id UUID PRIMARY KEY",
            "part_id UUID REFERENCES parts",
            "type TEXT - Tipo (entrada, saida, ajuste)",
            "quantity INTEGER - Quantidade movimentada",
            "reason TEXT - Motivo",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "performed_by UUID REFERENCES auth.users",
            "performed_at TIMESTAMPTZ",
            "created_at TIMESTAMPTZ"
        ]
    },
    "patio_stages": {
        "desc": "Estágios do Pátio Kanban (9 fixos)",
        "fields": [
            "id UUID PRIMARY KEY",
            "name TEXT - Nome do estágio",
            "order_num INTEGER - Ordem de exibição",
            "color TEXT - Cor do card",
            "description TEXT",
            "created_at TIMESTAMPTZ"
        ]
    },
    "patio_movements": {
        "desc": "Movimentações no Pátio Kanban",
        "fields": [
            "id UUID PRIMARY KEY",
            "ordem_servico_id UUID REFERENCES ordens_servico",
            "from_stage_id UUID REFERENCES patio_stages",
            "to_stage_id UUID REFERENCES patio_stages",
            "moved_by UUID REFERENCES auth.users",
            "notes TEXT",
            "moved_at TIMESTAMPTZ",
            "created_at TIMESTAMPTZ"
        ]
    },
    "promotions": {
        "desc": "Promoções e campanhas",
        "fields": [
            "id UUID PRIMARY KEY",
            "company_id UUID REFERENCES companies",
            "title TEXT - Título da promoção",
            "description TEXT",
            "discount_percentage DECIMAL - % desconto",
            "start_date TIMESTAMPTZ - Início",
            "end_date TIMESTAMPTZ - Fim",
            "is_active BOOLEAN",
            "created_at TIMESTAMPTZ"
        ]
    },
    "events": {
        "desc": "Eventos e ações de marketing",
        "fields": [
            "id UUID PRIMARY KEY",
            "company_id UUID REFERENCES companies",
            "title TEXT - Título do evento",
            "description TEXT",
            "event_date TIMESTAMPTZ - Data do evento",
            "location TEXT - Local",
            "max_participants INTEGER - Máximo participantes",
            "is_active BOOLEAN",
            "created_at TIMESTAMPTZ"
        ]
    },
    "event_participants": {
        "desc": "Participantes dos eventos",
        "fields": [
            "id UUID PRIMARY KEY",
            "event_id UUID REFERENCES events",
            "user_id UUID REFERENCES auth.users",
            "registered_at TIMESTAMPTZ",
            "attended BOOLEAN",
            "created_at TIMESTAMPTZ"
        ]
    }
}

def search_table_usage(table_name, src_dir='src'):
    """Busca arquivos que usam uma tabela"""
    files = []
    patterns = [
        f"from('{table_name}')",
        f'from("{table_name}")',
        f"from(`{table_name}`)",
    ]
    
    for root, _, filenames in os.walk(src_dir):
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for pattern in patterns:
                            if pattern in content:
                                files.append(filepath.replace('src/', ''))
                                break
                except:
                    pass
    
    return list(set(files))[:10]  # Limite de 10 arquivos

def generate_markdown():
    md = []
    md.append("# 📊 MAPEAMENTO COMPLETO DO BANCO DE DADOS")
    md.append("")
    md.append(f"**Gerado em:** {os.popen('date').read().strip()}")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 📋 ÍNDICE")
    md.append("")
    
    # Categorizar tabelas
    categories = {
        "🏢 EMPRESAS E ACESSO": ["companies", "user_company_access"],
        "👥 USUÁRIOS E PERMISSÕES": ["profiles", "roles", "user_roles", "user_companies", "invite_codes"],
        "🚗 VEÍCULOS": ["vehicles", "vehicle_history"],
        "📅 AGENDAMENTOS": ["appointments", "appointment_services", "appointment_funnel"],
        "🔧 ORDENS DE SERVIÇO": ["ordens_servico", "ordem_servico_items", "ordem_servico_history"],
        "💰 FINANCEIRO": ["payments", "payment_methods", "invoices"],
        "📦 ESTOQUE": ["parts", "parts_categories", "stock_movements"],
        "🚛 PÁTIO KANBAN": ["patio_stages", "patio_movements"],
        "🎁 MARKETING": ["promotions", "events", "event_participants"],
        "🛠️ SERVIÇOS": ["services"]
    }
    
    for category, tables in categories.items():
        md.append(f"### {category}")
        for table in tables:
            md.append(f"- [{table}](#{table})")
        md.append("")
    
    md.append("---")
    md.append("")
    
    # Detalhamento por categoria
    for category, tables in categories.items():
        md.append(f"## {category}")
        md.append("")
        
        for table in tables:
            if table not in TABLES_SCHEMA:
                continue
                
            schema = TABLES_SCHEMA[table]
            md.append(f"### 📋 `{table}`")
            md.append("")
            md.append(f"**Descrição:** {schema['desc']}")
            md.append("")
            md.append("**Campos:**")
            md.append("")
            for field in schema['fields']:
                md.append(f"- `{field}`")
            md.append("")
            
            # Buscar uso no código
            files = search_table_usage(table)
            if files:
                md.append("**📁 Usado em:**")
                md.append("```")
                for f in files:
                    md.append(f)
                md.append("```")
            else:
                md.append("**⚠️ Uso:** Não encontrado no código fonte ou usado via referências")
            
            md.append("")
            md.append("---")
            md.append("")
    
    # Estatísticas
    md.append("## 📈 ESTATÍSTICAS")
    md.append("")
    md.append(f"- **Total de Tabelas:** {len(TABLES_SCHEMA)}")
    md.append(f"- **Categorias:** {len(categories)}")
    
    total_fields = sum(len(schema['fields']) for schema in TABLES_SCHEMA.values())
    md.append(f"- **Total de Campos:** ~{total_fields}")
    
    md.append("")
    md.append("---")
    md.append("")
    md.append("**🚀 Sistema Doctor Auto Prime v1.1**")
    md.append("")
    
    return "\n".join(md)

if __name__ == "__main__":
    content = generate_markdown()
    with open("DATABASE_COMPLETE_MAP.md", "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ Arquivo DATABASE_COMPLETE_MAP.md criado com sucesso!")
