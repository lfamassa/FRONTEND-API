from django.db import models


class Livro(models.Model):
    nome = models.CharField(max_length=150)
    autor = models.CharField(max_length=150)
    genero = models.CharField(max_length=80)
    lido = models.BooleanField(default=False)
    capa = models.ImageField(upload_to="capas/", blank=True)

    class Meta:
        ordering = ["nome", "id"]
