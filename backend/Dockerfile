FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /source
COPY pom.xml .
COPY src src
RUN mvn -B package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir /app/data && chown 10001:10001 /app/data
COPY --from=build /source/target/archarena-0.1.0.jar /app/app.jar
USER 10001
ENTRYPOINT ["java","-XX:MaxRAMPercentage=65","-jar","/app/app.jar"]
