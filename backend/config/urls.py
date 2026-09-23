from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from livros import views

urlpatterns = [
    path("api/csrf/", views.csrf),
    path("api/livros/", views.livros),
    path("api/livros/<int:pk>/", views.excluir_livro),
    path("api/livros/<int:pk>/capa/", views.atualizar_capa),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
