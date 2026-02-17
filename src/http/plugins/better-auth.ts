import Elysia from "elysia";
import { auth } from "../../auth";

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler) 
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        
        if (!session) {
          return status(401, { message: "Unauthorized" });
        }

        return session;
      }
    }
  })

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

function sanitizeForOpenAPI3(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(sanitizeForOpenAPI3)
    if (obj === null || typeof obj !== 'object') return obj

    const record = obj as Record<string, unknown>

    // When $ref is present, other properties are ignored in OpenAPI 3.0.3
    if ('$ref' in record) {
        return { $ref: record.$ref }
    }

    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(record)) {
        if (key === '$schema') continue

        // Convert type arrays (JSON Schema 2020-12) to nullable (OpenAPI 3.0.3)
        if (key === 'type' && Array.isArray(value)) {
            const types = value.filter((t) => t !== 'null')
            result.type = types.length === 1 ? types[0] : types
            if (value.includes('null')) result.nullable = true
            continue
        }

        result[key] = sanitizeForOpenAPI3(value)
    }

    return result
}

export const OpenAPI = {
    getPaths: (prefix = '/auth') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = sanitizeForOpenAPI3(paths[path]) as (typeof paths)[string]

                for (const method of Object.keys(reference[key])) {
                    const operation = (reference[key] as any)[method]

                    operation.tags = ['Better Auth']
                }
            }

            return reference
        }) as Promise<any>,
    components: getSchema().then(({ components }) => sanitizeForOpenAPI3(components)) as Promise<any>
} as const