# Testcontainers-Keycloak

A testcontainer for Keycloak

## Usage

```typescript
const keycloak = await new KeycloakContainer()
    .withAdminUsername('admin')
    .withAdminPassword('admin')
    .withExposedPorts(8080)
    .start()
```