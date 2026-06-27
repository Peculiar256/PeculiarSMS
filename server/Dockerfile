# Stage 1: Building our Java application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer optimization)
RUN mvn dependency:go-offline 
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Running the Java application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]