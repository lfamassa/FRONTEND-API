# Entrelinhas

Biblioteca pessoal com React, API Django e persistência em SQLite.

## Executar no Windows

Pré-requisitos: Python 3.10 ou superior e Node.js 22.12 ou superior.

No primeiro terminal, na pasta do projeto:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python.exe backend/manage.py migrate
backend/.venv/Scripts/python.exe backend/manage.py runserver
```

No segundo terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Abra http://127.0.0.1:5173. Mantenha os dois terminais em execução. O Vite encaminha `/api` e `/media` para o Django na porta 8000.

## Funcionalidades

- Cadastro de título, autor, gênero e indicação de livro lido (`BooleanField`).
- Upload opcional da capa no cadastro, com prévia da imagem.
- Adição e troca de capas dos livros existentes. JPG, PNG e WebP de até 5 MB.
- Listagem, pesquisa por título, ordenação e exclusão com confirmação.
- Contador de todos os livros, independente da pesquisa.
- Validação dos campos, estados de carregamento, lista vazia e erros.
- Atualização com estado React, sem recarregar a página.

O `App` controla a integração. `FormularioLivro`, `CampoCapa`, `Filtros` e `ListaLivros` compõem a interface. O frontend usa `useState`, `useEffect`, `fetch`, `map` e renderização condicional.

## API

| Método | Endpoint | Função |
| --- | --- | --- |
| GET | `/api/livros/` | Listar livros e total |
| GET | `/api/livros/?nome=casmurro&ordem=nome` | Pesquisar e ordenar |
| POST | `/api/livros/` | Cadastrar livro |
| POST | `/api/livros/1/capa/` | Adicionar ou trocar a capa |
| DELETE | `/api/livros/1/` | Excluir livro |
| GET | `/api/csrf/` | Obter token CSRF para operações de escrita |

As opções de ordenação são `nome`, `-nome`, `autor` e `-id` (mais recentes).

Exemplo de corpo do POST:

```json
{
  "nome": "Dom Casmurro",
  "autor": "Machado de Assis",
  "genero": "Romance",
  "lido": true
}
```

Para enviar imagens, use `multipart/form-data` com o arquivo no campo `capa`. O cadastro também aceita JSON quando não há imagem. No formulário multipart, envie `lido` como `true` ou `false`.

O frontend envia automaticamente o cookie e o token CSRF. O banco é criado em `backend/db.sqlite3` e as imagens ficam em `backend/media/`. Ambos são locais e não são versionados. Ao trocar a capa ou excluir o livro, a imagem anterior é removida. A configuração fornecida é para execução local.

## Verificar

```powershell
backend/.venv/Scripts/python.exe backend/manage.py test livros
cd frontend
npm.cmd run build
```
