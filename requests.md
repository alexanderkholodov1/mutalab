# Pruebas manuales - Mutalab API

Todas las respuestas de este documento fueron capturadas ejecutando la API
localmente con `npm start` y lanzando las peticiones con `curl`. Los ids y
timestamps corresponden a esa corrida real.

- Base URL: `http://localhost:3000`
- Estado inicial en memoria: tres criaturas (`c-001`, `c-002`, `c-003`).

Indice:

1. [Salud del servicio](#1-salud-del-servicio)
2. [GET listar criaturas](#2-get-listar-criaturas)
3. [GET listar con filtros](#3-get-listar-con-filtros)
4. [GET obtener por id](#4-get-obtener-por-id)
5. [POST crear criatura](#5-post-crear-criatura)
6. [PUT actualizar completo](#6-put-actualizar-completo)
7. [PATCH actualizar parcial](#7-patch-actualizar-parcial)
8. [DELETE eliminar criatura](#8-delete-eliminar-criatura)
9. [Laboratorio de cruces](#9-laboratorio-de-cruces)
10. [Errores y validacion](#10-errores-y-validacion)

---

## 1. Salud del servicio

**Request**

```bash
curl http://localhost:3000/health
```

**Response `200 OK`**

```json
{ "ok": true, "service": "mutalab-api" }
```

---

## 2. GET listar criaturas

**Request**

```bash
curl http://localhost:3000/api/creatures
```

**Response `200 OK`**

```json
{
  "count": 3,
  "filters": {},
  "data": [
    {
      "id": "c-001",
      "name": "Drakonia",
      "species": "Dragón",
      "habitat": "Cavernas luminosas",
      "rarity": "legendario",
      "powerLevel": 98,
      "description": "Criatura con escamas cristalinas y vuelo de fuego.",
      "tags": ["fuego", "volador", "anciano"],
      "createdAt": "2026-09-17T01:37:34.000Z",
      "updatedAt": "2026-09-17T01:37:34.001Z"
    },
    {
      "id": "c-002",
      "name": "Mirelina",
      "species": "Fénix",
      "habitat": "Bosque de ceniza",
      "rarity": "epico",
      "powerLevel": 86,
      "description": "Ave luminosa que renace de sus cenizas.",
      "tags": ["renacimiento", "fuego", "guardian"],
      "createdAt": "2026-09-17T01:37:34.001Z",
      "updatedAt": "2026-09-17T01:37:34.001Z"
    },
    {
      "id": "c-003",
      "name": "Nim",
      "species": "Slime",
      "habitat": "Lago etéreo",
      "rarity": "raro",
      "powerLevel": 41,
      "description": "Forma adaptable de luz y agua que cambia de aspecto.",
      "tags": ["místico", "agua", "adaptable"],
      "createdAt": "2026-09-17T01:37:34.001Z",
      "updatedAt": "2026-09-17T01:37:34.001Z"
    }
  ]
}
```

La respuesta envuelve la coleccion en un objeto con `count` y `filters` para
que el cliente sepa cuantos resultados hay y que filtros se aplicaron.

---

## 3. GET listar con filtros

El listado acepta los query params `rarity`, `species`, `tag` y `minPower`,
combinables entre si.

**Request**

```bash
curl "http://localhost:3000/api/creatures?rarity=epico"
```

**Response `200 OK`**

```json
{
  "count": 1,
  "filters": { "rarity": "epico" },
  "data": [
    {
      "id": "c-002",
      "name": "Mirelina",
      "species": "Fénix",
      "habitat": "Bosque de ceniza",
      "rarity": "epico",
      "powerLevel": 86,
      "description": "Ave luminosa que renace de sus cenizas.",
      "tags": ["renacimiento", "fuego", "guardian"],
      "createdAt": "2026-09-17T01:37:34.001Z",
      "updatedAt": "2026-09-17T01:37:34.001Z"
    }
  ]
}
```

Otros ejemplos validos:

```bash
curl "http://localhost:3000/api/creatures?tag=hibrido"
curl "http://localhost:3000/api/creatures?minPower=80"
curl "http://localhost:3000/api/creatures?species=dragon&minPower=50"
```

**Filtro invalido - Response `400 Bad Request`**

```bash
curl "http://localhost:3000/api/creatures?minPower=mucho"
```

```json
{
  "error": "El query param minPower debe ser un numero",
  "status": 400,
  "requestId": "f1c0a4e2-6d33-4c19-8a7e-2b90d4c11a55"
}
```

---

## 4. GET obtener por id

**Request**

```bash
curl http://localhost:3000/api/creatures/c-001
```

**Response `200 OK`**

```json
{
  "id": "c-001",
  "name": "Drakonia",
  "species": "Dragón",
  "habitat": "Cavernas luminosas",
  "rarity": "legendario",
  "powerLevel": 98,
  "description": "Criatura con escamas cristalinas y vuelo de fuego.",
  "tags": ["fuego", "volador", "anciano"],
  "createdAt": "2026-09-17T01:37:34.000Z",
  "updatedAt": "2026-09-17T01:37:34.001Z"
}
```

**Id inexistente - Response `404 Not Found`**

```bash
curl http://localhost:3000/api/creatures/c-999
```

```json
{
  "error": "No se encontró una criatura con id c-999",
  "status": 404,
  "requestId": "dabd7246-0c25-4610-9ef3-f6b9574d2917"
}
```

---

## 5. POST crear criatura

**Request**

```bash
curl -X POST http://localhost:3000/api/creatures \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lunora",
    "species": "Slime",
    "habitat": "Lago etéreo",
    "rarity": "comun",
    "powerLevel": 41,
    "description": "Forma viva de luz y agua.",
    "tags": ["mistico", "agua"]
  }'
```

**Response `201 Created`**

```json
{
  "id": "c-004",
  "name": "Lunora",
  "species": "Slime",
  "habitat": "Lago etéreo",
  "rarity": "comun",
  "powerLevel": 41,
  "description": "Forma viva de luz y agua.",
  "tags": ["mistico", "agua"],
  "createdAt": "2026-09-17T01:37:46.868Z",
  "updatedAt": "2026-09-17T01:37:46.868Z"
}
```

El servidor asigna `id`, `createdAt` y `updatedAt`: no se aceptan desde el
cliente. Los ids se generan con un contador que nunca retrocede, de modo que
eliminar una criatura no provoca ids repetidos mas adelante.

---

## 6. PUT actualizar completo

`PUT` exige el recurso completo: si falta un campo obligatorio, responde 400.

**Request**

```bash
curl -X PUT http://localhost:3000/api/creatures/c-001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Drakonia Prime",
    "species": "Dragón",
    "habitat": "Cavernas de cristal",
    "rarity": "legendario",
    "powerLevel": 99,
    "description": "Version alfa del dragon lunar.",
    "tags": ["fuego", "cristal"]
  }'
```

**Response `200 OK`**

```json
{
  "id": "c-001",
  "name": "Drakonia Prime",
  "species": "Dragón",
  "habitat": "Cavernas de cristal",
  "rarity": "legendario",
  "powerLevel": 99,
  "description": "Version alfa del dragon lunar.",
  "tags": ["fuego", "cristal"],
  "createdAt": "2026-09-17T01:37:34.000Z",
  "updatedAt": "2026-09-17T01:37:47.268Z"
}
```

`createdAt` se conserva y `updatedAt` se refresca.

---

## 7. PATCH actualizar parcial

`PATCH` acepta solo los campos que se quieren cambiar.

**Request**

```bash
curl -X PATCH http://localhost:3000/api/creatures/c-002 \
  -H "Content-Type: application/json" \
  -d '{ "powerLevel": 95 }'
```

**Response `200 OK`**

```json
{
  "id": "c-002",
  "name": "Mirelina",
  "species": "Fénix",
  "habitat": "Bosque de ceniza",
  "rarity": "epico",
  "powerLevel": 95,
  "description": "Ave luminosa que renace de sus cenizas.",
  "tags": ["renacimiento", "fuego", "guardian"],
  "createdAt": "2026-09-17T01:37:34.001Z",
  "updatedAt": "2026-09-17T01:37:47.359Z"
}
```

---

## 8. DELETE eliminar criatura

**Request**

```bash
curl -X DELETE http://localhost:3000/api/creatures/c-003
```

**Response `200 OK`**

```json
{
  "message": "Criatura eliminada correctamente",
  "id": "c-003"
}
```

**Id inexistente - Response `404 Not Found`**

```bash
curl -X DELETE http://localhost:3000/api/creatures/c-999
```

```json
{
  "error": "No se encontró una criatura con id c-999",
  "status": 404,
  "requestId": "e968bbec-ec4d-4420-8da8-8f87dcee8fcb"
}
```

---

## 9. Laboratorio de cruces

El laboratorio es la parte asincrona de la API: cruza dos especies, simula el
tiempo de procesamiento sin bloquear el event loop y registra cada intento en
un historial en memoria.

### 9.1 GET /api/lab/species

**Request**

```bash
curl http://localhost:3000/api/lab/species
```

**Response `200 OK`**

```json
[
  {
    "id": "dragon",
    "name": "Dragón",
    "baseAttributes": { "fuerza": 80, "velocidad": 55, "magia": 90, "resistencia": 70 },
    "incompatibleWith": ["golem"]
  },
  {
    "id": "conejo",
    "name": "Conejo",
    "baseAttributes": { "fuerza": 15, "velocidad": 85, "magia": 20, "resistencia": 30 },
    "incompatibleWith": []
  },
  {
    "id": "golem",
    "name": "Golem",
    "baseAttributes": { "fuerza": 95, "velocidad": 10, "magia": 25, "resistencia": 100 },
    "incompatibleWith": ["dragon", "fenix"]
  },
  {
    "id": "fenix",
    "name": "Fénix",
    "baseAttributes": { "fuerza": 50, "velocidad": 70, "magia": 95, "resistencia": 40 },
    "incompatibleWith": ["golem"]
  },
  {
    "id": "slime",
    "name": "Slime",
    "baseAttributes": { "fuerza": 25, "velocidad": 30, "magia": 40, "resistencia": 60 },
    "incompatibleWith": []
  }
]
```

### 9.2 POST /api/lab/cross - cruce valido

**Request**

```bash
curl -X POST http://localhost:3000/api/lab/cross \
  -H "Content-Type: application/json" \
  -d '{ "speciesA": "dragon", "speciesB": "conejo" }'
```

**Response `201 Created`**

```json
{
  "id": "lab-1789609087527",
  "name": "Draejo",
  "species": "Dragón x Conejo",
  "habitat": "Laboratorio de cruces",
  "rarity": "epico",
  "powerLevel": 55,
  "description": "Híbrido generado a partir de Dragón y Conejo.",
  "tags": ["dragon", "conejo", "hibrido"],
  "createdAt": "2026-09-17T01:38:07.527Z",
  "updatedAt": "2026-09-17T01:38:07.527Z",
  "parents": ["Dragón", "Conejo"],
  "attributes": { "fuerza": 41, "velocidad": 75, "magia": 60, "resistencia": 44 }
}
```

Los atributos se derivan promediando los de ambos padres con una variacion
aleatoria, asi que cada cruce da numeros ligeramente distintos.

El hibrido se incorpora al catalogo principal y queda disponible para el CRUD:

```bash
curl "http://localhost:3000/api/creatures?tag=hibrido"
```

```json
{
  "count": 1,
  "filters": { "tag": "hibrido" },
  "data": [
    {
      "id": "lab-1789609087527",
      "name": "Draejo",
      "species": "Dragón x Conejo",
      "habitat": "Laboratorio de cruces",
      "rarity": "epico",
      "powerLevel": 55,
      "description": "Híbrido generado a partir de Dragón y Conejo.",
      "tags": ["dragon", "conejo", "hibrido"],
      "createdAt": "2026-09-17T01:38:07.527Z",
      "updatedAt": "2026-09-17T01:38:07.527Z",
      "parents": ["Dragón", "Conejo"],
      "attributes": { "fuerza": 41, "velocidad": 75, "magia": 60, "resistencia": 44 }
    }
  ]
}
```

Parametros opcionales del cruce:

```bash
curl -X POST http://localhost:3000/api/lab/cross \
  -H "Content-Type: application/json" \
  -d '{ "speciesA": "fenix", "speciesB": "slime", "variation": 0.3, "delayMs": 1000 }'
```

- `variation` (0 a 1): cuanta dispersion aleatoria tienen los atributos.
- `delayMs` (0 a 5000): tiempo simulado de procesamiento del laboratorio.

### 9.3 POST /api/lab/cross - cruce incompatible

Dragon y Golem estan declarados como incompatibles. El rechazo no es un error
del servidor sino un conflicto con las reglas del dominio, por eso responde 409.

**Request**

```bash
curl -X POST http://localhost:3000/api/lab/cross \
  -H "Content-Type: application/json" \
  -d '{ "speciesA": "dragon", "speciesB": "golem" }'
```

**Response `409 Conflict`**

```json
{
  "error": "Dragón y Golem son incompatibles: el cruce fue rechazado.",
  "status": 409,
  "requestId": "de6f0471-aea6-4550-a675-73a67bf2dfeb"
}
```

### 9.4 GET /api/lab/registry

El historial guarda tanto los cruces exitosos como los rechazados.

**Request**

```bash
curl http://localhost:3000/api/lab/registry
```

**Response `200 OK`**

```json
{
  "total": 2,
  "successful": 1,
  "rejected": 1,
  "entries": [
    {
      "status": "success",
      "parents": ["dragon", "conejo"],
      "result": {
        "id": "lab-1789609087527",
        "name": "Draejo",
        "species": "Dragón x Conejo",
        "powerLevel": 55,
        "attributes": { "fuerza": 41, "velocidad": 75, "magia": 60, "resistencia": 44 }
      },
      "timestamp": "2026-09-17T01:38:07.527Z"
    },
    {
      "status": "rejected",
      "parents": ["dragon", "golem"],
      "reason": "Dragón y Golem son incompatibles: el cruce fue rechazado.",
      "timestamp": "2026-09-17T01:38:08.093Z"
    }
  ]
}
```

---

## 10. Errores y validacion

### 10.1 Falta un campo obligatorio - `400`

```bash
curl -X POST http://localhost:3000/api/creatures \
  -H "Content-Type: application/json" \
  -d '{ "name": "Incompleta" }'
```

```json
{
  "error": "Falta el campo obligatorio: species",
  "status": 400,
  "requestId": "f5b3f014-6179-453d-9f41-9ac46a8eaec7"
}
```

### 10.2 Valor fuera del conjunto permitido - `400`

```bash
curl -X POST http://localhost:3000/api/creatures \
  -H "Content-Type: application/json" \
  -d '{ "name":"X", "species":"S", "habitat":"H", "rarity":"mitico", "powerLevel":10, "description":"d", "tags":["t"] }'
```

```json
{
  "error": "El campo rarity debe ser: comun, raro, epico o legendario",
  "status": 400,
  "requestId": "c7a817ed-012b-4f19-9b65-16ec33308706"
}
```

### 10.3 powerLevel fuera de rango - `400`

```bash
curl -X POST http://localhost:3000/api/creatures \
  -H "Content-Type: application/json" \
  -d '{ "name":"X", "species":"S", "habitat":"H", "rarity":"comun", "powerLevel":9999, "description":"d", "tags":["t"] }'
```

```json
{
  "error": "El campo powerLevel debe ser un número válido entre 1 y 1000",
  "status": 400,
  "requestId": "8b21f0aa-4c7d-49b2-9f10-0d5e6a3c8811"
}
```

### 10.4 JSON malformado - `400`

El body no es JSON valido. `express.json()` lanza un `SyntaxError` que el
manejador centralizado traduce a 400 en vez de dejarlo escalar a 500.

```bash
curl -X POST http://localhost:3000/api/creatures \
  -H "Content-Type: application/json" \
  -d '{ "x": roto }'
```

```json
{
  "error": "El cuerpo de la peticion no es JSON valido",
  "details": "Unexpected token 'r', \"{\"x\": roto}\" is not valid JSON",
  "status": 400,
  "requestId": "c4327d70-0601-4737-a066-7492a08a74ed"
}
```

### 10.5 Especie inexistente en el laboratorio - `400`

```bash
curl -X POST http://localhost:3000/api/lab/cross \
  -H "Content-Type: application/json" \
  -d '{ "speciesA": "unicornio", "speciesB": "slime" }'
```

```json
{
  "error": "La especie \"unicornio\" no existe. Disponibles: dragon, conejo, golem, fenix, slime",
  "status": 400,
  "requestId": "9f540221-6e44-48d6-83e1-7812d875b47d"
}
```

### 10.6 Ruta inexistente - `404`

Toda la API responde JSON, incluidas las rutas no registradas.

```bash
curl http://localhost:3000/api/noexiste
```

```json
{
  "error": "La ruta GET /api/noexiste no existe en esta API",
  "status": 404,
  "requestId": "c4817794-8a23-4751-a9e7-868c81546cbc"
}
```

---

## Evidencia de middleware

Cada peticion pasa por `requestId` y `requestLogger` antes de llegar a las
rutas. Salida real de la consola del servidor durante estas pruebas:

```text
[2026-09-17T01:38:08.455Z] [a20c0086-82bb-4b74-aad9-3fe71a97f94b] GET /api/lab/registry
[2026-09-17T01:38:18.175Z] [ba9db64b-d952-44ec-98bc-bfe2c2c70207] DELETE /api/creatures/c-002
[2026-09-17T01:38:18.293Z] [bdcd3f86-f402-4202-8d4c-6f59c6f5c1ea] POST /api/creatures
[2026-09-17T01:38:18.399Z] [22f74603-74bb-462d-976a-a322916cbd8d] GET /api/creatures
[2026-09-17T01:38:18.522Z] [c4327d70-0601-4737-a066-7492a08a74ed] POST /api/creatures
[2026-09-17T01:38:18.626Z] [399cc6c2-7967-46bd-aff0-f35cffa43103] GET /api/creatures?tag=hibrido
```

El `requestId` que aparece en el log es el mismo que viaja en el cuerpo de las
respuestas de error, lo que permite correlacionar un error reportado por el
cliente con su linea exacta en el log del servidor.

Tambien se puede fijar el id desde el cliente con la cabecera `x-request-id`:

```bash
curl http://localhost:3000/api/creatures/c-999 -H "x-request-id: prueba-123"
```

```json
{
  "error": "No se encontró una criatura con id c-999",
  "status": 404,
  "requestId": "prueba-123"
}
```
