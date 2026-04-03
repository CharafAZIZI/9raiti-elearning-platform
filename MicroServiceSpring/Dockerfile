# Étape 1 : build avec Maven
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copier seulement le pom.xml pour télécharger les dépendances (cache Docker)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copier le reste du projet
COPY src ./src

# Build le projet en sautant les tests
RUN mvn clean package -Dmaven.test.skip=true

# Étape 2 : runtime avec JRE (plus léger)
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copier le jar depuis l'étape build
COPY --from=build /app/target/MicroServiceSpring-0.0.1-SNAPSHOT.jar app.jar

# Exposer le port Spring Boot
EXPOSE 8080

# Commande pour lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]