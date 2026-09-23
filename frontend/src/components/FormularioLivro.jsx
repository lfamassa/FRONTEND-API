import React, { useState } from 'react';
import CampoCapa from './CampoCapa';

const inicial = { nome: '', autor: '', genero: '', lido: false };

export default function FormularioLivro({ aoCadastrar, salvando }) {
  const [livro, setLivro] = useState(inicial);
  const [erro, setErro] = useState('');
  const [capa, setCapa] = useState(null);
  const [versaoCapa, setVersaoCapa] = useState(0);

  function alterar(evento) {
    const { name, value, checked, type } = evento.target;
    setLivro({ ...livro, [name]: type === 'checkbox' ? checked : value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (![livro.nome, livro.autor, livro.genero].every(valor => valor.trim())) {
      setErro('Preencha título, autor e gênero para cadastrar.');
      return;
    }
    setErro('');
    const dados = new FormData();
    Object.entries(livro).forEach(([campo, valor]) => dados.append(campo, valor));
    if (capa) dados.append('capa', capa);
    if (await aoCadastrar(dados)) {
      setLivro(inicial);
      setCapa(null);
      setVersaoCapa(valor => valor + 1);
    }
  }

  return (
    <section className="painel formulario">
      <span className="sobretitulo">PRÓXIMA LEITURA</span>
      <h2>Um novo capítulo.</h2>
      <p>Reserve um lugar para mais uma história.</p>
      <form onSubmit={enviar} noValidate>
        <fieldset disabled={salvando}>
          <label htmlFor="nome">Título do livro</label>
          <input id="nome" name="nome" value={livro.nome} onChange={alterar} maxLength={150} required placeholder="Ex.: Dom Casmurro" />
          <label htmlFor="autor">Autor</label>
          <input id="autor" name="autor" value={livro.autor} onChange={alterar} maxLength={150} required placeholder="Quem escreveu essa história?" />
          <label htmlFor="genero">Gênero</label>
          <input id="genero" name="genero" value={livro.genero} onChange={alterar} maxLength={80} required placeholder="Ex.: Romance" />
          <label className="checkbox"><input name="lido" type="checkbox" checked={livro.lido} onChange={alterar} /> Já li este livro</label>
          <CampoCapa key={versaoCapa} aoSelecionar={setCapa} />
          {erro && <p className="erro" role="alert">{erro}</p>}
          <button className="primario" type="submit">{salvando ? 'Salvando...' : '+ Adicionar à biblioteca'}</button>
        </fieldset>
      </form>
    </section>
  );
}
