from django import forms


class CapaForm(forms.Form):
    capa = forms.ImageField(required=False)

    def clean_capa(self):
        capa = self.cleaned_data["capa"]
        if capa:
            if capa.size > 5 * 1024 * 1024:
                raise forms.ValidationError("A imagem deve ter no máximo 5 MB.")
            if capa.image.format not in ["JPEG", "PNG", "WEBP"]:
                raise forms.ValidationError("Escolha uma imagem JPG, PNG ou WebP.")
        return capa
