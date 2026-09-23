import React, { useEffect, useId, useState } from 'react';

export default function CampoCapa({ aoSelecionar, disabled = false }) {
  const id = useId();
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!arquivo) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(arquivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  function selecionar(evento) {
    const imagem = evento.target.files[0] || null;
    if (imagem && (!['image/jpeg', 'image/png', 'image/webp'].includes(imagem.type) || imagem.size > 5 * 1024 * 1024)) {
      setErro('Escolha uma imagem JPG, PNG ou WebP de até 5 MB.');
      evento.target.value = '';
      setArquivo(null);
      aoSelecionar(null);
      return;
    }
    setErro('');
    setArquivo(imagem);
    aoSelecionar(imagem);
  }

  return (
    <div className="campo-capa">
      <label htmlFor={id}>Imagem da capa (opcional)</label>
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionar} disabled={disabled} aria-describedby={`${id}-ajuda`} />
      <p id={`${id}-ajuda`} className="ajuda">JPG, PNG ou WebP. Até 5 MB.</p>
      {preview && <img className="preview-capa" src={preview} alt="Prévia da capa selecionada" />}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </div>
  );
}
