import json

from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_http_methods

from .models import Livro
from .forms import CapaForm


def serializar(livro):
    return {
        "id": livro.id, "nome": livro.nome, "autor": livro.autor,
        "genero": livro.genero, "lido": livro.lido,
        "capa": livro.capa.url if livro.capa else None,
    }


@require_GET
def csrf(request):
    return JsonResponse({"token": get_token(request)})


@require_http_methods(["GET", "POST"])
def livros(request):
    if request.method == "GET":
        registros = Livro.objects.filter(nome__icontains=request.GET.get("nome", "").strip())
        ordem = request.GET.get("ordem", "nome")
        if ordem not in ["nome", "-nome", "autor", "-id"]:
            return JsonResponse({"erro": "Ordenação inválida."}, status=400)
        return JsonResponse({
            "total": Livro.objects.count(),
            "livros": [serializar(livro) for livro in registros.order_by(ordem, "id")],
        })

    if request.content_type == "multipart/form-data":
        dados = request.POST.dict()
        if dados.get("lido") in ["true", "false"]:
            dados["lido"] = dados["lido"] == "true"
    else:
        try:
            dados = json.loads(request.body)
        except (ValueError, UnicodeDecodeError):
            return JsonResponse({"erro": "Envie um JSON válido."}, status=400)
    if not isinstance(dados, dict):
        return JsonResponse({"erro": "Envie um objeto JSON."}, status=400)

    campos = {}
    for campo, limite in [("nome", 150), ("autor", 150), ("genero", 80)]:
        valor = dados.get(campo)
        if not isinstance(valor, str) or not valor.strip() or len(valor.strip()) > limite:
            return JsonResponse({"erro": f"Preencha {campo} com até {limite} caracteres."}, status=400)
        campos[campo] = valor.strip()
    if not isinstance(dados.get("lido", False), bool):
        return JsonResponse({"erro": "O campo lido deve ser verdadeiro ou falso."}, status=400)

    formulario = CapaForm(request.POST, request.FILES)
    if not formulario.is_valid():
        return JsonResponse({"erro": str(formulario.errors["capa"][0])}, status=400)
    livro = Livro.objects.create(**campos, lido=dados.get("lido", False), capa=formulario.cleaned_data["capa"])
    return JsonResponse(serializar(livro), status=201)


@require_http_methods(["POST"])
def atualizar_capa(request, pk):
    livro = Livro.objects.filter(pk=pk).first()
    if not livro:
        return JsonResponse({"erro": "Livro não encontrado."}, status=404)
    formulario = CapaForm(request.POST, request.FILES)
    if not formulario.is_valid():
        return JsonResponse({"erro": str(formulario.errors["capa"][0])}, status=400)
    capa = formulario.cleaned_data["capa"]
    if not capa:
        return JsonResponse({"erro": "Escolha uma imagem."}, status=400)
    anterior = livro.capa.name
    livro.capa = capa
    livro.save(update_fields=["capa"])
    if anterior:
        livro.capa.storage.delete(anterior)
    return JsonResponse(serializar(livro))


@require_http_methods(["DELETE"])
def excluir_livro(request, pk):
    livro = Livro.objects.filter(pk=pk).first()
    if not livro:
        return JsonResponse({"erro": "Livro não encontrado."}, status=404)
    livro.capa.delete(save=False)
    livro.delete()
    return JsonResponse({"mensagem": "Livro excluído."})
