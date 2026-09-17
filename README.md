# Mutalab API

API REST de un laboratorio de criaturas mutantes, construida con Node.js,
Express y TypeScript. Entregable 2 de Desarrollo Web 3 (DIM-3203).

## Tema

Mutalab es el registro de un laboratorio clandestino que cataloga criaturas
imaginarias y experimenta cruzandolas entre si. El backend tiene dos mitades
que se conectan:

- **El catalogo**: un CRUD completo sobre las criaturas registradas.
- **El laboratorio**: cruza dos especies, deriva los atributos del hibrido y
  guarda en un historial tanto los cruces logrados como los rechazados. Cada
  hibrido que nace entra automaticamente al catalogo, asi que despues se puede
  consultar, editar o eliminar como cualquier otra criatura.

No todas las especies son compatibles: un Dragon y un Golem se rechazan, y ese
rechazo queda registrado como parte del historial del laboratorio.

## Stack

- Node.js con modulos ES (`"type": "module"`)
- Express 5
- TypeScript en modo `strict`, compilado a `dist/`
- Almacenamiento en memoria (sin base de datos, segun el alcance del entregable)

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm start
```

Compila TypeScript y levanta el servidor en `http://localhost:3000`.
El puerto se puede cambiar con la variable de entorno `PORT`:

```bash
PORT=4000 npm start
```

Otros comandos:

```bash
npm run build      # solo compilar a dist/
npm run typecheck  # verificar tipos sin generar archivos
```

## Estructura del proyecto

El codigo esta separado por capas: cada archivo tiene una sola razon para
cambiar.

```
ts/
├── index.ts                      Configuracion de Express y arranque
├── types.ts                      Modelos del dominio y AppError
├── routes/
│   ├── creatureRoutes.ts         Rutas REST del catalogo
│   └── labRoutes.ts              Rutas del laboratorio
├── controllers/
│   ├── creatureController.ts     Traduce HTTP <-> servicio (catalogo)
│   └── labController.ts          Traduce HTTP <-> servicio (laboratorio)
├── services/
│   ├── creatureService.ts        Logica de negocio y estado en memoria
│   └── labService.ts             Orquesta los cruces y el historial
├── middleware/
│   ├── requestLogger.ts          requestId + logging
│   ├── validation.ts             Validacion de entrada
│   ├── notFound.ts               404 en JSON para rutas desconocidas
│   └── errorHandler.ts           Manejo centralizado de errores
├── lib/
│   ├── lab.ts                    Motor asincrono de cruces
│   └── registry.ts               Historial encapsulado en un closure
└── data/
    └── species.ts                Catalogo de especies y reglas de compatibilidad
```

Responsabilidad de cada capa:

- **routes**: declaran que verbo y ruta existen, y que middleware corre antes.
- **controllers**: leen `req`, delegan al servicio y eligen el codigo de estado.
  No contienen reglas de negocio.
- **services**: concentran las reglas y son el unico lugar que toca el estado.
- **lib / data**: el dominio puro, sin ninguna dependencia de Express.

Esa ultima separacion es la que permite que `lib/lab.ts` no sepa que existe una
API: recibe especies y un registro, y devuelve una criatura.

## Modelo de dominio

El recurso principal es `Creature`, con diez campos obligatorios tipados:
siete los envia el cliente y tres los asigna el servidor (`id`, `createdAt` y
`updatedAt`). Ademas tiene dos campos opcionales que solo existen en las
criaturas nacidas en el laboratorio.

```ts
export interface Creature {
  id: string;
  name: string;
  species: string;
  habitat: string;
  rarity: "comun" | "raro" | "epico" | "legendario";
  powerLevel: number;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  parents?: [string, string];   // solo si nacio en el laboratorio
  attributes?: Attributes;      // solo si nacio en el laboratorio
}
```

Decisiones de modelado que vale la pena senalar:

- `rarity` es una union literal, no un `string`: los valores invalidos se
  detectan al compilar, no en produccion.
- El historial del laboratorio es una **union discriminada** por el campo
  `status`, de modo que TypeScript sabe que una entrada `rejected` tiene
  `reason` y una `success` tiene `result`:

  ```ts
  type RegistryEntry = SuccessEntry | RejectedEntry;
  ```

- `UpdateCreatureInput` se deriva con `Partial<CreateCreatureInput>`, asi que
  `PATCH` no puede desincronizarse de `POST`.
- `parents` es una tupla `[string, string]`: exactamente dos padres, ni uno ni
  tres.

## Endpoints

### Catalogo de criaturas

| Metodo | Ruta                  | Descripcion              | Codigos               |
| ------ | --------------------- | ------------------------ | --------------------- |
| GET    | `/api/creatures`      | Listar (acepta filtros)  | 200, 400              |
| GET    | `/api/creatures/:id`  | Obtener por id           | 200, 404              |
| POST   | `/api/creatures`      | Crear                    | 201, 400              |
| PUT    | `/api/creatures/:id`  | Reemplazar completo      | 200, 400, 404         |
| PATCH  | `/api/creatures/:id`  | Actualizar parcial       | 200, 400, 404         |
| DELETE | `/api/creatures/:id`  | Eliminar                 | 200, 404              |

Filtros del listado, combinables: `?rarity=`, `?species=`, `?tag=`, `?minPower=`

```bash
curl "http://localhost:3000/api/creatures?rarity=epico&minPower=50"
```

### Laboratorio

| Metodo | Ruta                 | Descripcion                    | Codigos            |
| ------ | -------------------- | ------------------------------ | ------------------ |
| GET    | `/api/lab/species`   | Especies disponibles           | 200                |
| POST   | `/api/lab/cross`     | Cruzar dos especies            | 201, 400, 409      |
| GET    | `/api/lab/registry`  | Historial de cruces + resumen  | 200                |

### Servicio

| Metodo | Ruta       | Descripcion       | Codigos |
| ------ | ---------- | ----------------- | ------- |
| GET    | `/health`  | Estado del server | 200     |

### Criterio de codigos de estado

- `200` lectura o actualizacion correcta
- `201` recurso creado (POST de criatura o de cruce)
- `400` entrada invalida: falta un campo, tipo incorrecto, JSON malformado
- `404` el recurso o la ruta no existen
- `409` el cruce viola una regla del dominio (especies incompatibles)
- `500` fallo inesperado del servidor

El `409` es deliberado: un cruce incompatible no es un error de formato del
cliente ni una falla del servidor, es un conflicto con el estado del dominio.

## Middleware

Se ejecutan en este orden, definido en `ts/index.ts`:

1. **`requestId`** — asigna un UUID a cada peticion, o respeta el que venga en
   la cabecera `x-request-id`. Va antes que `express.json()` a proposito: asi
   incluso una peticion con JSON malformado queda trazada con su id.
2. **`requestLogger`** — imprime timestamp, requestId, metodo y URL.
3. **`express.json()`** — parseo del cuerpo (middleware integrado de Express).
4. **`validateCreature`** — a nivel de ruta, valida el payload de `POST`, `PUT`
   y `PATCH`. Exige todos los campos en `POST`/`PUT` y solo valida los
   presentes en `PATCH`.
5. **`notFound`** — convierte cualquier ruta no registrada en un `AppError` 404,
   para que la API responda JSON y no la pagina HTML por defecto de Express.
6. **`errorHandler`** — manejador centralizado de errores.

### Manejo centralizado de errores

Ningun controlador arma una respuesta de error por su cuenta: lanzan o pasan el
error a `next()`, y `errorHandler` decide el formato y el codigo.

```ts
// types.ts
export class AppError extends Error {
  statusCode: number;
}
```

`errorHandler` distingue tres casos:

- **`AppError`** — error de dominio previsto, responde con su `statusCode`.
- **`SyntaxError` con `body`** — JSON malformado. Es culpa del cliente, asi que
  responde `400` en lugar de dejarlo escalar a `500`.
- **Cualquier otro** — `500`, con el mensaje original en `details`.

Toda respuesta de error lleva el `requestId`, que es el mismo que aparece en el
log del servidor. Eso permite tomar el id de un error reportado por el cliente y
encontrar la linea exacta en el log.

```json
{
  "error": "No se encontró una criatura con id c-999",
  "status": 404,
  "requestId": "dabd7246-0c25-4610-9ef3-f6b9574d2917"
}
```

## Node.js asincrono

El endpoint `POST /api/lab/cross` es el que muestra el modelo no bloqueante de
Node. `crossSpecies` es `async` y espera un delay simulado que representa el
procesamiento del laboratorio:

```ts
await simulateLabDelay(delayMs);
```

Durante esa espera el event loop queda libre: el servidor sigue atendiendo
otras peticiones en lugar de quedarse bloqueado. Se puede comprobar lanzando un
cruce lento y otra peticion en paralelo:

```bash
curl -X POST http://localhost:3000/api/lab/cross \
  -H "Content-Type: application/json" \
  -d '{"speciesA":"fenix","speciesB":"slime","delayMs":3000}' &
curl http://localhost:3000/api/creatures   # responde de inmediato
```

Como el controlador es `async`, sus rechazos se pasan explicitamente a `next()`
para que lleguen al manejador centralizado de errores.

## Pruebas manuales

Estan documentadas en **[requests.md](./requests.md)**, con el request y la
respuesta real de cada endpoint: los cuatro verbos del CRUD, los filtros, los
tres endpoints del laboratorio y seis escenarios de error distintos.

## Flujo de trabajo Git

El desarrollo se hizo en ramas por funcionalidad, integradas a `main` mediante
pull requests:

- `feature/javascript` — prototipo inicial del dominio en JavaScript
- `feature/typescript` — migracion del dominio a TypeScript
- `feature/api-rest` — capa REST: Express, capas, middleware y documentacion

La carpeta `js/` conserva el prototipo original en JavaScript como referencia
de la evolucion del proyecto; el codigo que se ejecuta es el de `ts/`.

## Cumplimiento del entregable

| Requisito                                    | Donde |
| -------------------------------------------- | ----- |
| Proyecto Node.js con Express y TypeScript    | `package.json`, `tsconfig.json` |
| Capas routes / controllers / services / tipos| `ts/routes`, `ts/controllers`, `ts/services`, `ts/types.ts` |
| Recurso con minimo 5 campos tipados          | `Creature`: 10 obligatorios + 2 opcionales |
| CRUD completo en memoria                     | `ts/services/creatureService.ts` |
| Minimo 5 rutas REST                          | 10 rutas (6 del catalogo, 3 del laboratorio, 1 de salud) |
| Minimo 2 middlewares personalizados          | `requestId`, `requestLogger`, `validateCreature`, `notFound` |
| Middleware centralizado de errores           | `ts/middleware/errorHandler.ts` |
| Validacion de entrada                        | `ts/middleware/validation.ts` |
| Pruebas manuales documentadas                | [`requests.md`](./requests.md) |
| Flujo Git con ramas y commits descriptivos   | Ramas `feature/*` + pull requests |
