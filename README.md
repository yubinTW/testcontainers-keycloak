# Testcontainers-Keycloak

A testcontainers for keycloak

https://www.npmjs.com/package/testcontainers-keycloak

## Usage

```typescript
// start a keycloak container
const keycloak = await new KeycloakContainer()
    .withAdminUsername('admin')
    .withAdminPassword('admin')
    .withExposedPorts(8080)
    .start()

// start a admin session
await keycloak.configCredentials('master', 'admin', 'admin')

// according to your scenarios
// create the realm, user and client
await keycloak.createRealm('demo')
await keycloak.createUser('demo', 'user01', 'yubin', 'hsu', true)
await keycloak.createClient(
      'demo',
      'client01',
      'client01Secret',
      ['http://localhost:8888', 'http://localhost:8888/callback'],
      ['http://localhost:8888/home']
    )

// your test case ...

```