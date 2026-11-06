# Ajuste da cena 1 (pedido do Paulo em 6 nov 2026)

O Paulo não tem as cartas. Na cena 1 (e na 1B) ele aponta com o dedo: para baixo à esquerda ao dizer "Krark" e para baixo à direita ao dizer "Sakashima". A carta aparece onde ele apontou.

Ao juntar a narração, antes do `tiktok.cjs --narrar`:

1. Ache os instantes em que ele aponta (quadros a cada 0,1 s com ffmpeg, abrir com Read). TK = Krark, TS = Sakashima.
2. Converta o vídeo para 1080x1920 (o mesmo corte vertical do script) e ponha as cartas por baixo do título:
   `ffmpeg -i cena_1.mov -loop 1 -i carta-2.jpg -loop 1 -i carta-1.jpg -filter_complex "[0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v];[1]scale=380:-1,format=rgba,fade=in:st=TK:d=0.25:alpha=1[k];[2]scale=380:-1,format=rgba,fade=in:st=TS:d=0.25:alpha=1[s];[v][k]overlay=60:1280:shortest=1[a];[a][s]overlay=640:1280:shortest=1" -map 0:a -c:a copy cena_1_cartas.mp4`
   (carta-2.jpg = Krark, carta-1.jpg = Sakashima; Krark à esquerda, Sakashima à direita, abaixo do rosto, longe da caixa do título.)
3. Rode o `tiktok.cjs --narrar` com `cena_1_cartas.mp4` no lugar do `cena_1`. Mesmo processo para o `cena_1b`.
4. Confira um quadro do `tiktok-narrado.mp4` depois que as duas cartas entram.
