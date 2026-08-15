# Stage 1: build the React mobile web UI.
FROM node:20-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# Stage 2: build Spring Boot and embed React dist into static resources.
FROM gradle:8.10-jdk21 AS backend-build
WORKDIR /workspace/backend
COPY backend/ ./
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /workspace/frontend/dist/ ./src/main/resources/static/
RUN gradle clean bootJar --no-daemon

# Stage 3: small runtime image. UI + REST API share one origin/port.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /workspace/backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
