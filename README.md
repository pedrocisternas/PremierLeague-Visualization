# Visualización de la Premier League 2018/19

Este proyecto presenta una herramienta de visualización de datos de la Premier League temporada 2018/19. Los datos utilizados provienen de FootyStats y han sido procesados y filtrados para su uso en esta herramienta.

## Descripción

La herramienta permite explorar la relación entre los goles esperados y los goles reales marcados y recibidos por cada equipo durante la temporada. Los goles esperados son una métrica que asigna un valor entre 0 y 1 a cada disparo o intento de disparo, representando la probabilidad de que esa aproximación termine en gol.

La herramienta está diseñada para ser interactiva, permitiendo al usuario cambiar el tipo de información desplegada y filtrar dependiendo de lo que quiere ver en pantalla. Además, ofrece la posibilidad de seleccionar un equipo específico para ver qué pasó en cada partido de la temporada de ese equipo.

## Uso

El usuario objetivo de esta herramienta es cualquier persona que trabaje o sea fanática del fútbol, que quiera obtener información de cómo se relacionan los goles esperados con los goles, y cómo la relación entre estos puede definir el resultado de partidos y, por ende, campeonatos.

La herramienta se divide en dos vistas principales. La primera muestra una tabla donde cada fila representa a un equipo, ordenados de acuerdo a la posición que obtuvo en el campeonato. La segunda vista muestra todos los partidos de la temporada de un equipo seleccionado por el usuario.

## Tecnología

La herramienta fue desarrollada utilizando D3.js, una biblioteca de JavaScript para crear visualizaciones de datos. Se utilizaron las versiones 6 o 7 de D3.js y se desarrollaron las visualizaciones con elementos propios de un SVG.
