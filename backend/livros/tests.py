import json
import tempfile
from io import BytesIO
from pathlib import Path

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from PIL import Image

from .models import Livro
from .forms import CapaForm


class BibliotecaTests(TestCase):
    def setUp(self):
        pasta = tempfile.TemporaryDirectory()
        self.addCleanup(pasta.cleanup)
        configuracao = override_settings(MEDIA_ROOT=pasta.name)
        configuracao.enable()
        self.addCleanup(configuracao.disable)
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get("/api/csrf/").json()["token"]
        self.dados = {"nome": "Dom Casmurro", "autor": "Machado de Assis", "genero": "Romance", "lido": True}

    def cadastrar(self, dados):
        return self.client.post("/api/livros/", json.dumps(dados), content_type="application/json", HTTP_X_CSRFTOKEN=self.token)

    def test_cadastro_listagem_pesquisa_e_exclusao(self):
        resposta = self.cadastrar(self.dados)
        self.assertEqual(resposta.status_code, 201)
        livro = Livro.objects.get(pk=resposta.json()["id"])
        self.assertTrue(livro.lido)
        self.assertEqual(self.client.get("/api/livros/?nome=casmurro").json()["livros"][0]["id"], livro.id)
        self.assertEqual(self.client.get("/api/livros/?nome=ausente").json(), {"total": 1, "livros": []})
        self.assertEqual(self.client.delete(f"/api/livros/{livro.id}/", HTTP_X_CSRFTOKEN=self.token).status_code, 200)
        self.assertEqual(self.client.get("/api/livros/").json(), {"total": 0, "livros": []})

    def imagem(self, nome="capa.png"):
        arquivo = BytesIO()
        Image.new("RGB", (100, 150), "green").save(arquivo, format="PNG")
        return SimpleUploadedFile(nome, arquivo.getvalue(), content_type="image/png")

    def test_cadastro_com_capa_troca_e_exclusao(self):
        resposta = self.client.post(
            "/api/livros/", {**self.dados, "lido": "true", "capa": self.imagem()},
            HTTP_X_CSRFTOKEN=self.token,
        )
        self.assertEqual(resposta.status_code, 201)
        livro = Livro.objects.get(pk=resposta.json()["id"])
        anterior = Path(livro.capa.path)
        self.assertTrue(anterior.exists())
        self.assertEqual(self.client.get("/api/livros/").json()["livros"][0]["capa"], livro.capa.url)
        resposta = self.client.post(
            f"/api/livros/{livro.id}/capa/", {"capa": self.imagem("nova.png")},
            HTTP_X_CSRFTOKEN=self.token,
        )
        self.assertEqual(resposta.status_code, 200)
        livro.refresh_from_db()
        atual = Path(livro.capa.path)
        self.assertTrue(atual.exists())
        self.assertFalse(anterior.exists())
        self.client.delete(f"/api/livros/{livro.id}/", HTTP_X_CSRFTOKEN=self.token)
        self.assertFalse(atual.exists())

    def test_imagem_invalida_nao_cria_livro(self):
        resposta = self.client.post(
            "/api/livros/", {**self.dados, "lido": "false", "capa": SimpleUploadedFile("capa.png", b"invalido", content_type="image/png")},
            HTTP_X_CSRFTOKEN=self.token,
        )
        self.assertEqual(resposta.status_code, 400)
        self.assertFalse(Livro.objects.exists())

    def test_capa_grande_e_formato_nao_permitido(self):
        grande = self.imagem()
        grande.size = 5 * 1024 * 1024 + 1
        self.assertFalse(CapaForm(files={"capa": grande}).is_valid())
        arquivo = BytesIO()
        Image.new("RGB", (10, 10)).save(arquivo, format="GIF")
        gif = SimpleUploadedFile("capa.gif", arquivo.getvalue(), content_type="image/gif")
        self.assertFalse(CapaForm(files={"capa": gif}).is_valid())

    def test_adicionar_capa_em_livro_existente(self):
        livro = Livro.objects.create(**self.dados)
        resposta = self.client.post(f"/api/livros/{livro.id}/capa/", {"capa": self.imagem()}, HTTP_X_CSRFTOKEN=self.token)
        self.assertEqual(resposta.status_code, 200)
        livro.refresh_from_db()
        self.assertTrue(livro.capa)
        self.assertEqual(self.client.post(f"/api/livros/{livro.id}/capa/", {}, HTTP_X_CSRFTOKEN=self.token).status_code, 400)

    def test_validacao(self):
        for campo in ["nome", "autor", "genero"]:
            with self.subTest(campo=campo):
                self.assertEqual(self.cadastrar({**self.dados, campo: "   "}).status_code, 400)
        for dados in [[], {**self.dados, "lido": "false"}, {**self.dados, "nome": "a" * 151}]:
            self.assertEqual(self.cadastrar(dados).status_code, 400)
        self.assertEqual(Livro.objects.count(), 0)

    def test_ordenacao(self):
        self.cadastrar(self.dados)
        self.cadastrar({**self.dados, "nome": "A hora da estrela"})
        livros = self.client.get("/api/livros/?ordem=nome").json()["livros"]
        self.assertEqual([livro["nome"] for livro in livros], ["A hora da estrela", "Dom Casmurro"])
        self.assertEqual(self.client.get("/api/livros/?ordem=invalida").status_code, 400)

    def test_protecao_csrf_e_registro_inexistente(self):
        self.assertEqual(self.client.post("/api/livros/", self.dados).status_code, 403)
        self.assertEqual(self.client.delete("/api/livros/999/", HTTP_X_CSRFTOKEN=self.token).status_code, 404)
        self.assertEqual(self.client.put("/api/livros/", HTTP_X_CSRFTOKEN=self.token).status_code, 405)

    def test_cadastro_pelo_frontend(self):
        resposta = self.client.post(
            "/api/livros/", json.dumps(self.dados), content_type="application/json",
            HTTP_X_CSRFTOKEN=self.token, HTTP_ORIGIN="http://127.0.0.1:5173",
        )
        self.assertEqual(resposta.status_code, 201)
