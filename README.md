# PeculiarSMS

Simple run guide for the project.

## Project Structure

- `frontend/` - React + Vite app
- `server/` - Spring Boot backend

## Prerequisites

- Node.js 18+ and npm
- Java 17
- MySQL running locally

## 1. Run the Backend

From the project root:

```bash
cd server
mvn spring-boot:run
```

Backend runs on:

- `http://localhost:8080`

Notes:

- Database settings are in `server/src/main/resources/application.properties`.
- Default DB points to MySQL database `SMS`.

## 2. Run the Frontend

Open a new terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:5173`

## 3. Quick Start (Two Terminals)

Terminal 1:

```bash
cd server
mvn spring-boot:run
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## 4. Troubleshooting

### Port 8080 already in use (backend)

Find and stop the process using port 8080:

```bash
sudo lsof -i :8080
kill -9 <PID>
```

Then run backend again:

```bash
cd server
mvn spring-boot:run
```

### Port 5173 already in use (frontend)

Find and stop the process using port 5173:

```bash
sudo lsof -i :5173
kill -9 <PID>
```

Then run frontend again:

```bash
cd frontend
npm run dev
```

### MySQL connection error

Check these values in `server/src/main/resources/application.properties`:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

Also make sure the `SMS` database exists.
