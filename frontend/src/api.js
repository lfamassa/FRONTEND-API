export async function requisitar(caminho, opcoes = {}) {
  const headers = { ...opcoes.headers };
  if (opcoes.method && opcoes.method !== 'GET') {
    const resposta = await fetch('/api/csrf/');
    if (!resposta.ok) throw new Error('Não foi possível conectar à biblioteca. Tente novamente.');
    const { token } = await resposta.json();
    headers['X-CSRFToken'] = token;
    if (!(opcoes.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  }
  const resposta = await fetch(caminho, { ...opcoes, headers });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir a operação. Tente novamente.');
  return dados;
}

export function mensagemErro(erro) {
  return erro instanceof TypeError
    ? 'Não foi possível conectar à biblioteca. Verifique se o servidor está funcionando.'
    : erro.message;
}
