import { KeycloakContainer, StartedKeycloakContainer } from './keycloak-container'

describe('Keycloak Container Test', () => {
  let keycloak: StartedKeycloakContainer

  beforeAll(async () => {
    keycloak = await new KeycloakContainer()
      .withAdminUsername('admin')
      .withAdminPassword('admin')
      .withExposedPorts(8080)
      .start()
    await keycloak.configCredentials('master', 'admin', 'admin')
  })

  it('should return whoami result', async () => {
    const whoamiResult = await keycloak.exec(['whoami'])

    expect(whoamiResult.exitCode).toBe(0)
    expect(whoamiResult.output.trim()).toBe('jboss')
  })

  it('realm operations: create, get', async () => {
    await keycloak.createRealm('demo')
    const realmResult = await keycloak.getRealm('demo')

    expect(realmResult.realm).toBe('demo')
  })

  it('user operations: create, get, set-password', async () => {
    await keycloak.createUser('demo', 'user01', 'yubin', 'hsu', true)
    const userId = await keycloak.getUserIdByUsername('demo', 'user01')
    const user = await keycloak.getUserById('demo', userId)
    await keycloak.setUserPassword('demo', 'user01', 'user01password')

    expect(userId).toBeDefined()
    expect(user.id).toBe(userId)
    expect(user.username).toBe('user01')
  })
})
