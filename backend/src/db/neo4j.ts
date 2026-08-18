import neo4j, { Driver, Integer, Node, Relationship } from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables (mostly for standalone scripts)
dotenv.config();

const uri = process.env.COGNODB_URI || 'bolt://localhost:7687';
const username = process.env.COGNODB_USERNAME || 'cognodb';
const password = process.env.COGNODB_PASSWORD || '';

let driver: Driver | null = null;

/**
 * Returns the active shared driver instance, initializing it if necessary.
 */
export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      disableLosslessIntegers: true, // Auto-converts numbers to JS Numbers where safe
    });
  }
  return driver;
}

/**
 * Verifies connectivity to the database.
 */
export async function verifyConnection(): Promise<void> {
  const drv = getDriver();
  console.log(`Verifying connection to CognoDB at ${uri}...`);
  await drv.verifyConnectivity();
  console.log('Successfully connected to CognoDB.');
}

/**
 * Helper to recursively convert Neo4j data types (Integer, Node, Relationship) into plain JS types.
 */
export function convertNeo4jTypes(val: any): any {
  if (val === null || val === undefined) {
    return val;
  }

  // Handle Neo4j Ints
  if (neo4j.isInt(val)) {
    return (val as Integer).toNumber();
  }

  // Handle Node object
  if (val instanceof Node) {
    const properties: any = {};
    for (const key in val.properties) {
      properties[key] = convertNeo4jTypes(val.properties[key]);
    }
    return {
      _type: 'node',
      id: convertNeo4jTypes(val.identity),
      labels: val.labels,
      properties,
    };
  }

  // Handle Relationship object
  if (val instanceof Relationship) {
    const properties: any = {};
    for (const key in val.properties) {
      properties[key] = convertNeo4jTypes(val.properties[key]);
    }
    return {
      _type: 'relationship',
      id: convertNeo4jTypes(val.identity),
      type: val.type,
      start: convertNeo4jTypes(val.start),
      end: convertNeo4jTypes(val.end),
      properties,
    };
  }

  // Handle Arrays
  if (Array.isArray(val)) {
    return val.map(convertNeo4jTypes);
  }

  // Handle standard Objects
  if (typeof val === 'object') {
    const obj: any = {};
    for (const key in val) {
      obj[key] = convertNeo4jTypes(val[key]);
    }
    return obj;
  }

  return val;
}

/**
 * Runs a query inside a read or write session and returns maps of key-value results.
 */
export async function runQuery<T = any>(query: string, params: Record<string, any> = {}): Promise<T[]> {
  const drv = getDriver();
  const session = drv.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj: any = {};
      record.keys.forEach(key => {
        obj[key] = convertNeo4jTypes(record.get(key));
      });
      return obj as T;
    });
  } finally {
    await session.close();
  }
}

/**
 * Closes the active driver instance.
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    console.log('Closing CognoDB driver...');
    await driver.close();
    driver = null;
    console.log('CognoDB driver closed.');
  }
}

// Graceful exit listeners
process.on('SIGINT', async () => {
  await closeDriver();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDriver();
  process.exit(0);
});
