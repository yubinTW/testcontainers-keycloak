# Testcontainers-Keycloak

A testcontainers for keycloak

https://www.npmjs.com/package/testcontainers-keycloak

## Installation

```
npm i -D testcontainers-keycloak
```

## Usage. Keycloak 23 and below

```typescript
// start a keycloak container
const keycloak = await new KeycloakContainer().withAdminUsername('admin').withAdminPassword('admin').withExposedPorts(8080).start()

// start a admin session
await keycloak.configCredentials('master', 'admin', 'admin')

// according to your scenarios
// create the realm, user and client
await keycloak.createRealm('demo')
await keycloak.createUser('demo', 'user01', 'yubin', 'hsu', true)
await keycloak.createClient('demo', 'client01', 'client01Secret', ['http://localhost:8888', 'http://localhost:8888/callback'], ['http://localhost:8888/home'])

// your test case ...
const accessToken = await keycloak.getAccessToken('demo', 'user01', 'user01password', 'client01', 'client01Secret')
```

## Usage. Keycloak 24 and above

```ts
const fake = {
  realmName: 'demo',
  username: 'demo',
  firstName: 'demo',
  lastName: 'demo',
  email: 'demo@gmail.com',
  password: 'demodemo1',
  enabled: true,
  clientId: 'clientID',
  clientSecret: 'clientSecret',
  redirectUris: ['http://localhost:8888', 'http://localhost:8888/callback'],
  webOrigins: ['http://localhost:8888/home'],
  directAccessGrantsEnabled: true
}

keycloak = await new Keycloak24Container('quay.io/keycloak/keycloak:24.0.1').withCommand(['start-dev']).withAdminUsername('admin').withAdminPassword('admin').withExposedPorts(8080).start()

// start a admin session
await keycloak.configCredentials('master', 'admin', 'admin')

// according to your scenarios
// create the realm, user and client
await keycloak.createRealm(fake.realmName)
await keycloak.createUser(fake.realmName, fake.username, fake.firstName, fake.lastName, fake.email, true)
await keycloak.setUserPassword(fake.realmName, fake.username, fake.password)
await keycloak.createClient(fake.realmName, fake.clientId, fake.clientSecret, fake.redirectUris, fake.webOrigins)

//
const accessToken = await keycloak.getAccessToken(fake.realmName, fake.username, fake.password, fake.clientId, fake.clientSecret)
```
