# ============================================================
#  Dockerfile del FRONTEND (Angular)
#  Etapa 1: compila la app con Node y genera los archivos estaticos.
#  Etapa 2: sirve esos archivos con Nginx (un servidor web liviano y rapido).
# ============================================================

# ---- Etapa 1: compilar ----
FROM node:24-alpine AS build
WORKDIR /app

# Copiamos los package*.json y instalamos dependencias (npm ci usa el lock file).
COPY package*.json ./
RUN npm ci

# Copiamos el resto del codigo y hacemos el build de produccion.
COPY . .
RUN npm run build

# ---- Etapa 2: servir con Nginx ----
FROM nginx:alpine

# Copiamos los archivos compilados de Angular a la carpeta que sirve Nginx.
# El builder de Angular deja todo dentro de dist/G1-ui/browser.
COPY --from=build /app/dist/G1-ui/browser /usr/share/nginx/html

# Copiamos nuestra configuracion de Nginx (para que funcione el ruteo de Angular).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx escucha en el puerto 80.
EXPOSE 80
