# ---------- BUILD STAGE ----------
    FROM maven:3.9-eclipse-temurin-17 AS builder

    WORKDIR /app
    
    # Maven cache için önce pom.xml kopyala
    COPY pom.xml .
    RUN mvn -q -e -B dependency:go-offline
    
    # Şimdi tüm kaynak kodu kopyala ve build et
    COPY src ./src
    RUN mvn -q -e -B clean package -DskipTests
    
    # ---------- RUNTIME STAGE ----------
    FROM eclipse-temurin:17-jre
    
    WORKDIR /app
    
    # JAR'ı builder'dan çek
    COPY --from=builder /app/target/*.jar app.jar
    
<<<<<<< HEAD
    # Ortam değişkenleri (gerekirse override edilebilir)s
=======
    # Ortam değişkenleri (gerekirse override edilebilir)
>>>>>>> dockerfile
    ENV JAVA_OPTS=""
    ENV SERVER_PORT=8080
    
    EXPOSE 8080
    
    # Healthcheck opsiyonel
    HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
      CMD curl -f http://localhost:${SERVER_PORT}/actuator/health || exit 1
    
    ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
    