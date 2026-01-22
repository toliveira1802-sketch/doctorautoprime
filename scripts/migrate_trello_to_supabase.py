#!/usr/bin/env python3
"""
Script de Migração: Trello → Supabase
Migra todos os cards do Trello Board NkhINjF2 para a tabela ordens_servico
"""

import os
import requests
from datetime import datetime
from typing import List, Dict, Any
import json

# ========== CONFIGURAÇÕES ==========
TRELLO_API_KEY = "e327cf4891fd2fcb6020899e3718c45e"
TRELLO_TOKEN = "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7"
TRELLO_BOARD_ID = "NkhINjF2"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://acuufrgoyjwzlyhopaus.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXVmcmdveWp3emx5aG9wYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MzQ5ODgsImV4cCI6MjA1MjMxMDk4OH0.Hh6QLdZqMZjQAcWXGPGBxXTaHJjqvNqVEPZfFHlQWEw")

# Mapeamento de listas do Trello para posições do Pátio
LISTA_PARA_POSICAO = {
    "AGENDADOS HOJE": "entrada",
    "DIAGNÓSTICO": "entrada",
    "ORÇAMENTOS": "aguardando_orcamento",
    "AGUARD. APROVAÇÃO": "aguardando_aprovacao",
    "AGUARD. PEÇAS": "aguardando_pecas",
    "PRONTO P/ INICIAR": "aguardando_pecas",  # Tem peças, pronto pra começar
    "EM EXECUÇÃO": "em_execucao",
    "PRONTOS": "pronto",
}

# Mapeamento de labels do Trello para prioridades
LABEL_PARA_PRIORIDADE = {
    "URGENTE": "urgente",
    "ALTA": "alta",
    "MÉDIA": "media",
    "BAIXA": "baixa",
}

# ========== FUNÇÕES TRELLO ==========

def get_trello_board_lists() -> Dict[str, str]:
    """Busca todas as listas do board e retorna dict {list_id: list_name}"""
    url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/lists"
    params = {
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    lists = response.json()
    return {lst["id"]: lst["name"] for lst in lists}


def get_trello_cards() -> List[Dict[str, Any]]:
    """Busca todos os cards do board com informações completas"""
    url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/cards"
    params = {
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
        "customFieldItems": "true",
        "fields": "all",
        "members": "true",
        "labels": "true",
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()


def get_card_custom_fields(card_id: str) -> Dict[str, Any]:
    """Busca os custom fields de um card específico"""
    url = f"https://api.trello.com/1/cards/{card_id}/customFieldItems"
    params = {
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    return response.json()


# ========== FUNÇÕES SUPABASE ==========

def insert_ordem_servico(data: Dict[str, Any]) -> bool:
    """Insere uma ordem de serviço no Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/ordens_servico"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        return True
    else:
        print(f"❌ Erro ao inserir: {response.status_code} - {response.text}")
        return False


# ========== CONVERSÃO ==========

def parse_trello_card_to_os(card: Dict[str, Any], list_name: str) -> Dict[str, Any]:
    """Converte um card do Trello para o formato da ordem de serviço"""
    
    # Extrai informações básicas
    card_name = card.get("name", "")
    card_desc = card.get("desc", "")
    card_url = card.get("url", "")
    card_id = card.get("id", "")
    
    # Tenta extrair placa do nome (formato comum: "ABC-1234 - Descrição")
    placa = ""
    veiculo = ""
    if " - " in card_name:
        parts = card_name.split(" - ", 1)
        placa = parts[0].strip()
        veiculo = parts[1].strip() if len(parts) > 1 else ""
    else:
        veiculo = card_name
    
    # Determina posição do pátio baseado na lista
    posicao_patio = LISTA_PARA_POSICAO.get(list_name, "entrada")
    
    # Determina prioridade baseado nas labels
    prioridade = "media"
    cor_card = "#3b82f6"  # Azul padrão
    tags = []
    
    for label in card.get("labels", []):
        label_name = label.get("name", "").upper()
        label_color = label.get("color", "")
        
        # Mapeia prioridade
        if label_name in LABEL_PARA_PRIORIDADE:
            prioridade = LABEL_PARA_PRIORIDADE[label_name]
        
        # Mapeia cor
        color_map = {
            "red": "#ef4444",
            "orange": "#f97316",
            "yellow": "#eab308",
            "green": "#22c55e",
            "blue": "#3b82f6",
            "purple": "#a855f7",
        }
        if label_color in color_map:
            cor_card = color_map[label_color]
        
        # Adiciona tag
        if label_name:
            tags.append(label_name.lower())
    
    # Extrai mecânico responsável (se houver membros)
    mecanico_responsavel = None
    if card.get("members"):
        mecanico_responsavel = card["members"][0].get("fullName")
    
    # Monta objeto da ordem de serviço
    os_data = {
        "client_name": veiculo,  # Temporário até ter dados reais
        "client_phone": "",
        "vehicle_plate": placa,
        "vehicle_model": veiculo,
        "service_description": card_desc or "Migrado do Trello",
        "status": "em_andamento",
        "posicao_patio": posicao_patio,
        "prioridade": prioridade,
        "cor_card": cor_card,
        "tags": tags,
        "mecanico_responsavel": mecanico_responsavel,
        "observacoes_patio": f"Migrado do Trello\nCard ID: {card_id}\nURL: {card_url}",
        "data_entrada": card.get("dateLastActivity") or datetime.now().isoformat(),
        "trello_card_id": card_id,
        "trello_card_url": card_url,
    }
    
    return os_data


# ========== MAIN ==========

def main():
    print("🚀 Iniciando migração Trello → Supabase\n")
    
    # 1. Busca listas do Trello
    print("📋 Buscando listas do Trello...")
    lists = get_trello_board_lists()
    print(f"✅ Encontradas {len(lists)} listas\n")
    
    for list_id, list_name in lists.items():
        print(f"  - {list_name}")
    print()
    
    # 2. Busca cards do Trello
    print("🃏 Buscando cards do Trello...")
    cards = get_trello_cards()
    print(f"✅ Encontrados {len(cards)} cards\n")
    
    # 3. Converte e insere no Supabase
    print("💾 Migrando para Supabase...")
    success_count = 0
    error_count = 0
    
    for card in cards:
        list_id = card.get("idList")
        list_name = lists.get(list_id, "DESCONHECIDO")
        
        # Pula cards arquivados
        if card.get("closed", False):
            print(f"⏭️  Pulando card arquivado: {card.get('name')}")
            continue
        
        # Converte card para OS
        os_data = parse_trello_card_to_os(card, list_name)
        
        # Insere no Supabase
        print(f"📤 Migrando: {card.get('name')} ({list_name})")
        
        if insert_ordem_servico(os_data):
            success_count += 1
            print(f"   ✅ Sucesso!")
        else:
            error_count += 1
            print(f"   ❌ Erro!")
        
        print()
    
    # 4. Resumo
    print("\n" + "="*50)
    print("📊 RESUMO DA MIGRAÇÃO")
    print("="*50)
    print(f"✅ Migrados com sucesso: {success_count}")
    print(f"❌ Erros: {error_count}")
    print(f"📋 Total processado: {len(cards)}")
    print("="*50)
    
    if error_count == 0:
        print("\n🎉 Migração concluída com sucesso!")
    else:
        print(f"\n⚠️  Migração concluída com {error_count} erros")


if __name__ == "__main__":
    main()
