import json
import csv

# Arquivo JSON de entrada
json_file = 'itens.json'

# Arquivo CSV de saída
csv_file = 'produtos.csv'

# Abra o arquivo JSON
with open(json_file, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extraia as chaves do primeiro objeto como cabeçalhos do CSV
headers = data[0].keys()

# Escreva os dados no arquivo CSV
with open(csv_file, 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=headers)
    writer.writeheader()  # Escreve o cabeçalho
    writer.writerows(data)  # Escreve os dados

print(f'JSON convertido para CSV em {csv_file}')
