import React, { useEffect, useState } from 'react';
import FormularioLivro from './components/FormularioLivro';
import Filtros from './components/Filtros';
import ListaLivros from './components/ListaLivros';
import { requisitar, mensagemErro } from './api';

export default function App() {
  const [livros, setLivros] = useState([]);
  const [total, setTotal] = useState(0);
  const [pesquisa, setPesquisa] = useState('');
  const [ordem, setOrdem] = useState('nome');
  const [versao, setVersao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [atualizandoCapa, setAtualizandoCapa] = useState(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setCarregando(true);
    setErro('');
    const parametros = new URLSearchParams({ nome: pesquisa, ordem });
    requisitar(`/api/livros/?${parametros}`, { signal: controller.signal })
      .then(dados => {
        setLivros(dados.livros);
        setTotal(dados.total);
      })
      .catch(falha => {
        if (falha.name !== 'AbortError') setErro(mensagemErro(falha));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, [pesquisa, ordem, versao]);

  async function cadastrar(livro) {
    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      await requisitar('/api/livros/', { method: 'POST', body: livro });
      setAviso('Livro cadastrado com sucesso.');
      setVersao(valor => valor + 1);
      return true;
    } catch (falha) {
      setErro(mensagemErro(falha));
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarCapa(livro, capa) {
    setAtualizandoCapa(livro.id);
    setErro('');
    setAviso('');
    try {
      const dados = new FormData();
      dados.append('capa', capa);
      await requisitar(`/api/livros/${livro.id}/capa/`, { method: 'POST', body: dados });
      setAviso('Capa atualizada com sucesso.');
      setVersao(valor => valor + 1);
      return true;
    } catch (falha) {
      setErro(mensagemErro(falha));
      return false;
    } finally {
      setAtualizandoCapa(null);
    }
  }

  async function excluir(livro) {
    if (!window.confirm(`Deseja realmente excluir “${livro.nome}”?`)) return;
    setExcluindo(livro.id);
    setErro('');
    setAviso('');
    try {
      await requisitar(`/api/livros/${livro.id}/`, { method: 'DELETE' });
      setAviso('Livro excluído com sucesso.');
      setVersao(valor => valor + 1);
    } catch (falha) {
      setErro(mensagemErro(falha));
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div className="pagina">
      <header><a className="marca" href="/">▥ entrelinhas<span>BIBLIOTECA PESSOAL</span></a><span className="cabecalho-nota">Cada livro, um novo mundo.</span></header>
      <main>
        <section className="introducao"><div><span className="sobretitulo">SUA COLEÇÃO DE HISTÓRIAS</span><h1>Boas histórias.<br /><em>Sempre por perto.</em></h1><p>Organize seus livros e descubra sua próxima leitura.</p></div><div className="contador"><strong>{total}</strong><span>{total === 1 ? 'livro na biblioteca' : 'livros na biblioteca'}</span></div></section>
        {erro && <div className="erro alerta" role="alert">{erro} <button onClick={() => setVersao(valor => valor + 1)}>Tentar novamente</button></div>}
        <p className="aviso" role="status">{aviso}</p>
        <div className="conteudo">
          <FormularioLivro aoCadastrar={cadastrar} salvando={salvando} />
          <section className="colecao" aria-labelledby="titulo-colecao">
            <div className="titulo-colecao"><h2 id="titulo-colecao">Minha estante</h2><span>Seu pequeno universo de leituras</span></div>
            <Filtros pesquisa={pesquisa} ordem={ordem} aoPesquisar={setPesquisa} aoOrdenar={setOrdem} />
            {carregando ? <p className="vazio" role="status">Carregando...</p> : <ListaLivros livros={livros} pesquisa={pesquisa} aoExcluir={excluir} excluindo={excluindo} aoAtualizarCapa={atualizarCapa} atualizandoCapa={atualizandoCapa} />}
          </section>
        </div>
      </main>
      <footer>entrelinhas <span>Um espaço para as histórias que ficam.</span></footer>
    </div>
  );
}
