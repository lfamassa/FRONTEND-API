import React, { useState } from 'react';
import CampoCapa from './CampoCapa';

export default function ListaLivros({ livros, pesquisa, aoExcluir, excluindo, aoAtualizarCapa, atualizandoCapa }) {
  const [editando, setEditando] = useState(null);
  const [capa, setCapa] = useState(null);

  async function salvarCapa(livro) {
    if (capa && await aoAtualizarCapa(livro, capa)) {
      setEditando(null);
      setCapa(null);
    }
  }
  if (!livros.length) {
    return <div className="vazio"><span aria-hidden="true">▤</span><h3>{pesquisa ? 'Nenhum livro encontrado.' : 'Nenhum item cadastrado.'}</h3><p>{pesquisa ? 'Tente pesquisar outro título.' : 'Sua próxima história começa no formulário ao lado.'}</p></div>;
  }

  return (
    <ul className="livros">
      {livros.map(livro => (
        <li className="livro" key={livro.id}>
          {livro.capa ? <img className="capa-livro" src={livro.capa} alt={`Capa de ${livro.nome}`} /> : <div className="lombada" aria-hidden="true">{livro.nome.slice(0, 1).toUpperCase()}</div>}
          <div className="livro-info">
            <span className="genero">{livro.genero}</span>
            <h3>{livro.nome}</h3>
            <p>{livro.autor}</p>
            <span className={`status ${livro.lido ? 'lido' : ''}`}>{livro.lido ? '✓ Lido' : '○ Para ler'}</span>
            {editando === livro.id && <div className="editar-capa">
              <CampoCapa aoSelecionar={setCapa} disabled={atualizandoCapa !== null} />
              <button className="primario" disabled={!capa || atualizandoCapa !== null} onClick={() => salvarCapa(livro)}>{atualizandoCapa === livro.id ? 'Salvando...' : 'Salvar capa'}</button>
            </div>}
          </div>
          <div className="acoes-livro">
            <button className="alterar-capa" disabled={atualizandoCapa !== null || excluindo !== null} onClick={() => { setEditando(editando === livro.id ? null : livro.id); setCapa(null); }}>{editando === livro.id ? 'Cancelar' : livro.capa ? 'Trocar capa' : 'Adicionar capa'}</button>
            <button className="excluir" disabled={excluindo !== null || atualizandoCapa !== null} onClick={() => aoExcluir(livro)} aria-label={`Excluir ${livro.nome}`}>{excluindo === livro.id ? 'Excluindo...' : 'Excluir'}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
