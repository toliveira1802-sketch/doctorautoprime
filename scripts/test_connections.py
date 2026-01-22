#!/usr/bin/env python3
"""
Script de Teste: Verifica conexões com Trello e Supabase
Execute este script ANTES da migração para garantir que tudo está configurado
"""

import os
import requests
from typing import Tuple

# ========== CONFIGURAÇÕES ==========
TRELLO_API_KEY = "e327cf4891fd2fcb6020899e3718c45e"
TRELLO_TOKEN = "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7"
TRELLO_BOARD_ID = "NkhINjF2"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://acuufrgoyjwzlyhopaus.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdXVmcmdveWp3emx5aG9wYXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MzQ5ODgsImV4cCI6MjA1MjMxMDk4OH0.Hh6QLdZqMZjQAcWXGPGBxXTaHJjqvNqVEPZfFHlQWEw")

# ========== TESTES ==========

def test_trello_connection() -> Tuple[bool, str]:
    """Testa conexão com Trello"""
    try:
        url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}"
        params = {
            "key": TRELLO_API_KEY,
            "token": TRELLO_TOKEN,
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            board_data = response.json()
            board_name = board_data.get("name", "Desconhecido")
            return True, f"Board encontrado: {board_name}"
        else:
            return False, f"Erro HTTP {response.status_code}: {response.text}"
    
    except Exception as e:
        return False, f"Erro de conexão: {str(e)}"


def test_trello_lists() -> Tuple[bool, str]:
    """Testa busca de listas do Trello"""
    try:
        url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/lists"
        params = {
            "key": TRELLO_API_KEY,
            "token": TRELLO_TOKEN,
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            lists = response.json()
            list_names = [lst["name"] for lst in lists]
            return True, f"Encontradas {len(lists)} listas: {', '.join(list_names)}"
        else:
            return False, f"Erro HTTP {response.status_code}"
    
    except Exception as e:
        return False, f"Erro: {str(e)}"


def test_trello_cards() -> Tuple[bool, str]:
    """Testa busca de cards do Trello"""
    try:
        url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/cards"
        params = {
            "key": TRELLO_API_KEY,
            "token": TRELLO_TOKEN,
        }
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            cards = response.json()
            active_cards = [c for c in cards if not c.get("closed", False)]
            return True, f"Encontrados {len(active_cards)} cards ativos (de {len(cards)} total)"
        else:
            return False, f"Erro HTTP {response.status_code}"
    
    except Exception as e:
        return False, f"Erro: {str(e)}"


def test_supabase_connection() -> Tuple[bool, str]:
    """Testa conexão com Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False, "SUPABASE_URL ou SUPABASE_ANON_KEY não configurados"
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code in [200, 404]:  # 404 é ok, significa que conectou
            return True, "Conexão estabelecida"
        else:
            return False, f"Erro HTTP {response.status_code}"
    
    except Exception as e:
        return False, f"Erro de conexão: {str(e)}"


def test_supabase_table() -> Tuple[bool, str]:
    """Testa acesso à tabela ordens_servico"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False, "Supabase não configurado"
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/ordens_servico"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        params = {"limit": 1}
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return True, f"Tabela acessível ({len(data)} registros encontrados no teste)"
        else:
            return False, f"Erro HTTP {response.status_code}: {response.text}"
    
    except Exception as e:
        return False, f"Erro: {str(e)}"


def test_supabase_insert() -> Tuple[bool, str]:
    """Testa inserção de teste no Supabase (e remove em seguida)"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False, "Supabase não configurado"
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/ordens_servico"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Dados de teste
        test_data = {
            "client_name": "TESTE MIGRAÇÃO",
            "client_phone": "00000000000",
            "vehicle_plate": "TST-0000",
            "vehicle_model": "Teste",
            "service_description": "Teste de inserção - será deletado",
            "status": "orcamento",
            "posicao_patio": "entrada",
        }
        
        # Tenta inserir
        response = requests.post(url, headers=headers, json=test_data, timeout=10)
        
        if response.status_code in [200, 201]:
            inserted = response.json()
            if isinstance(inserted, list) and len(inserted) > 0:
                inserted_id = inserted[0].get("id")
                
                # Tenta deletar
                delete_url = f"{url}?id=eq.{inserted_id}"
                delete_response = requests.delete(delete_url, headers=headers, timeout=10)
                
                if delete_response.status_code in [200, 204]:
                    return True, "Inserção e deleção bem-sucedidas"
                else:
                    return True, f"Inserção OK, mas erro ao deletar (ID: {inserted_id})"
            else:
                return True, "Inserção bem-sucedida"
        else:
            return False, f"Erro HTTP {response.status_code}: {response.text}"
    
    except Exception as e:
        return False, f"Erro: {str(e)}"


# ========== MAIN ==========

def main():
    print("🔍 TESTE DE CONEXÕES - Migração Trello → Supabase")
    print("=" * 60)
    print()
    
    tests = [
        ("🔗 Conexão com Trello", test_trello_connection),
        ("📋 Listas do Trello", test_trello_lists),
        ("🃏 Cards do Trello", test_trello_cards),
        ("🔗 Conexão com Supabase", test_supabase_connection),
        ("📊 Tabela ordens_servico", test_supabase_table),
        ("💾 Permissão de inserção", test_supabase_insert),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"{test_name}...", end=" ")
        success, message = test_func()
        
        if success:
            print(f"✅ {message}")
            results.append(True)
        else:
            print(f"❌ {message}")
            results.append(False)
        
        print()
    
    # Resumo
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ TODOS OS TESTES PASSARAM ({passed}/{total})")
        print("\n🚀 Você pode executar a migração com segurança!")
    else:
        print(f"⚠️  ALGUNS TESTES FALHARAM ({passed}/{total})")
        print("\n❌ Corrija os erros antes de executar a migração!")
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("\n💡 DICA: Configure as variáveis de ambiente:")
            print("   export SUPABASE_URL='https://your-project.supabase.co'")
            print("   export SUPABASE_ANON_KEY='your-anon-key'")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
