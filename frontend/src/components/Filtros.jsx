import React from 'react';

export default function Filtros({ pesquisa, ordem, aoPesquisar, aoOrdenar, leitura, aoFiltrarLeitura }) {
  return (
    <div className="filtros">
      <div>
        <label htmlFor="leitura">Leitura</label>
        <select id="leitura" value={leitura} onChange={evento => aoFiltrarLeitura(evento.target.value)}>
          <option value="todos">Todos</option>
          <option value="lidos">Apenas lidos</option>
          <option value="nao-lidos">Não lidos</option>
        </select>
      </div>
      <div className="busca">
        <label htmlFor="pesquisa">Pesquisar por título</label>
        <input id="pesquisa" type="search" placeholder="Encontre uma história..." value={pesquisa} onChange={evento => aoPesquisar(evento.target.value)} />
      </div>
      <div>
        <label htmlFor="ordem">Ordenar por</label>
        <select id="ordem" value={ordem} onChange={evento => aoOrdenar(evento.target.value)}>
          <option value="nome">Título: A → Z</option>
          <option value="-nome">Título: Z → A</option>
          <option value="autor">Autor</option>
          <option value="-id">Mais recentes</option>
        </select>
      </div>
    </div>
  );
}
