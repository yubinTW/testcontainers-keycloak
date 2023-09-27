import { describe, it, expect, beforeAll } from 'vitest'
import { KeycloakContainer, StartedKeycloakContainer } from '../src/keycloak-container'

describe('Keycloak Container Test', () => {
  let keycloak: StartedKeycloakContainer

  beforeAll(async () => {
    keycloak = await new KeycloakContainer()
      .withStartupTimeout(600_000)
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

  it('client operations: create, get', async () => {
    await keycloak.createClient(
      'demo',
      'client01',
      'client01Secret',
      ['http://localhost:8888', 'http://localhost:8888/callback'],
      ['http://localhost:8888/home']
    )
    const cid = await keycloak.getCidByClientId('demo', 'client01')
    const client = await keycloak.getClientByCid('demo', cid)
    const clientSecret = await keycloak.getClientSecretByCid('demo', cid)

    expect(client.id).toBe(cid)
    expect(client.clientId).toBe('client01')
    expect(client.redirectUris).toHaveLength(2)
    expect(client.webOrigins).toHaveLength(1)
    expect(clientSecret.value).toBe('client01Secret')
  })

  it.fails('when get cid with a non-exist client', async () => {
     await keycloak.getCidByClientId('demo','non-exist-client-id')
  })

  it('should get access_token', async () => {
    const accessToken = await keycloak.getAccessToken('demo', 'user01', 'user01password', 'client01', 'client01Secret')
    expect(accessToken).toBeTruthy()
  })

  it('should not get access_token when given a fake user', async () => {
    await expect(
      keycloak.getAccessToken('demo', 'fakeUser', 'user01password', 'client01', 'client01Secret')
    ).rejects.toThrow()
  })

  it('should get id_token', async () => {
    const idToken = await keycloak.getIdToken('demo', 'user01', 'user01password', 'client01', 'client01Secret')
    expect(idToken).toBeTruthy()
  })

  it('should not get id_token when given a fake user', async () => {
    await expect(
      keycloak.getIdToken('demo', 'fakeUser', 'user01password', 'client01', 'client01Secret')
    ).rejects.toThrow()
  })

  it('should return admin username', () => {
    const username = keycloak.getAdminUsername()
    expect(username).toBe('admin')
  })

  it('should return admin password', () => {
    const password = keycloak.getAdminPassword()
    expect(password).toBe('admin')
  })

  it.fails('when get a non-exist user', async () => {
    await keycloak.getUserIdByUsername('demo', 'non-exist-user')
  })
})
