import { GenericContainer, StartedTestContainer, AbstractStartedContainer, Wait } from 'testcontainers'
import { ClientSecret, KeycloakClient, KeycloakRealm, KeycloakUser } from './types'
import axios from 'axios'
import qs from 'qs'
export class KeycloakContainer extends GenericContainer {
  private waitingLog = 'Admin console listening on http://127.0.0.1:9990'
  private adminUsername = 'admin'
  private adminPassword = 'admin'

  constructor(image: string = 'jboss/keycloak:16.1.1') {
    super(image)
  }

  public withWaitingLog(log: string) {
    this.waitingLog = log
  }

  public withAdminUsername(username: string) {
    this.adminUsername = username
    return this
  }

  public withAdminPassword(password: string) {
    this.adminPassword = password
    return this
  }

  public async start(): Promise<StartedKeycloakContainer> {
    this.withWaitStrategy(Wait.forLogMessage(this.waitingLog))
      .withEnvironment({ KEYCLOAK_USER: this.adminUsername })
      .withEnvironment({ KEYCLOAK_PASSWORD: this.adminPassword })
    return new StartedKeycloakContainer(await super.start(), this.adminUsername, this.adminPassword)
  }
}

export class StartedKeycloakContainer extends AbstractStartedContainer {
  private KCADM = `/opt/jboss/keycloak/bin/kcadm.sh`
  private SERVER = 'http://localhost:8080'

  constructor(
    startedTestContainer: StartedTestContainer,
    private readonly adminUsername: string,
    private readonly adminPassword: string
  ) {
    super(startedTestContainer)
  }

  public getAdminUsername() {
    return this.adminUsername
  }

  public getAdminPassword() {
    return this.adminPassword
  }

  private async runCmd(command: string): Promise<string> {
    const commandArray = command.split(' ')
    const execResult = await this.exec(commandArray)
    if (execResult.exitCode === 0) {
      return Promise.resolve(execResult.output.trim())
    } else {
      return Promise.reject(execResult.output.trim())
    }
  }

  /**
   * Start an authenticated session on this keycloak server
   * @params realmName th3 realm name you want to config
   * @params user the user who starting this session, usually the username of admin
   * @params user password, usually is the password of admin
   */
  public async configCredentials(realmName: string, user: string, password: string) {
    return await this.runCmd(
      `${this.KCADM} config credentials --server ${this.SERVER}/auth --realm ${realmName} --user ${user} --password ${password}`
    )
  }

  public async createRealm(realmName: string, enabled: boolean = true) {
    return await this.runCmd(`${this.KCADM} create realms -s realm=${realmName} -s enabled=${enabled}`)
  }

  public async getRealm(realmName: string) {
    const realmResult = await this.runCmd(`${this.KCADM} get realms/${realmName}`)
    const realm: KeycloakRealm = JSON.parse(realmResult)
    return realm
  }

  public async createUser(
    realmName: string,
    username: string,
    firstName: string,
    lastName: string,
    enabled: boolean = true
  ) {
    return await this.runCmd(
      `${this.KCADM} create users -r ${realmName} -s username=${username} -s firstName=${firstName} -s lastName=${lastName} -s enabled=${enabled}`
    )
  }

  public async getUserById(realmName: string, userId: string) {
    const userResult = await this.runCmd(`${this.KCADM} get users/${userId} -r ${realmName}`)
    const user: KeycloakUser = JSON.parse(userResult)
    return user
  }

  public async getUserIdByUsername(realmName: string, username: string) {
    const usersResult = await this.runCmd(`${this.KCADM} get users -r ${realmName} -q username=${username}`)
    const userArray: Array<KeycloakUser> = JSON.parse(usersResult)
    if (userArray.length === 1) {
      return Promise.resolve(userArray[0].id)
    } else {
      return Promise.reject(`Cannot find username '${username}' in realm '${realmName}'`)
    }
  }

  public async setUserPassword(realmName: string, username: string, password: string) {
    return await this.runCmd(
      `${this.KCADM} set-password -r ${realmName} --username ${username} --new-password ${password}`
    )
  }

  public async createClient(
    realmName: string,
    clientId: string,
    clientSecret: string,
    redirectUris: Array<string> = [],
    webOrigins: Array<string> = [],
    directAccessGrantsEnabled: boolean = true,
    enabled: boolean = true
  ) {
    const redirectUrisString = redirectUris.map((uri) => `"${uri}"`).join(',')
    const webOriginsString = webOrigins.map((uri) => `"${uri}"`).join(',')
    return await this.runCmd(
      `${this.KCADM} create clients -r ${realmName} -s clientId=${clientId} -s secret=${clientSecret} -s enabled=${enabled} -s redirectUris=[${redirectUrisString}] -s webOrigins=[${webOriginsString}] -s directAccessGrantsEnabled=${directAccessGrantsEnabled}`
    )
  }

  public async getCidByClientId(realmName: string, clientId: string) {
    const clientsResult = await this.runCmd(
      `${this.KCADM} get clients -r ${realmName} --fields id -q clientId=${clientId}`
    )
    const clients: Array<KeycloakClient> = JSON.parse(clientsResult)
    if (clients.length === 1) {
      return Promise.resolve(clients[0]['id'])
    } else {
      return Promise.reject(`Can't find client '${clientId}' in realm '${realmName}'`)
    }
  }

  public async getClientByCid(realmName: string, cid: string) {
    const clientResult = await this.runCmd(`${this.KCADM} get clients/${cid} -r ${realmName}`)
    const client: KeycloakClient = JSON.parse(clientResult)
    return client
  }

  public async getClientSecretByCid(realmName: string, cid: string) {
    const clientSecretResult = await this.runCmd(`${this.KCADM} get clients/${cid}/client-secret -r ${realmName}`)
    const secret: ClientSecret = JSON.parse(clientSecretResult)
    return secret
  }

  public async getAccessToken(
    realmName: string,
    username: string,
    password: string,
    clientId: string,
    clientSecret: string
  ) {
    const tokenEndpoint = `http://${this.getHost()}:${this.getMappedPort(
      8080
    )}/auth/realms/${realmName}/protocol/openid-connect/token`

    const payload = qs.stringify({
      username,
      password,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'password'
    })

    try {
      const response = await axios.post(tokenEndpoint, payload)
      const accessToken: string = response.data['access_token']
      if (accessToken) {
        return accessToken
      } else {
        throw new Error(`Failed to get access_token: access_token undefined`)
      }
    } catch (error) {
      throw new Error(`Failed to get access_token: ${error}`)
    }
  }

  public async getIdToken(
    realmName: string,
    username: string,
    password: string,
    clientId: string,
    clientSecret: string
  ) {
    const tokenEndpoint = `http://${this.getHost()}:${this.getMappedPort(
      8080
    )}/auth/realms/${realmName}/protocol/openid-connect/token`

    const payload = qs.stringify({
      username,
      password,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'password',
      scope: 'openid'
    })

    try {
      const response = await axios.post(tokenEndpoint, payload)
      const idToken: string = response.data['id_token']
      if (idToken) {
        return idToken
      } else {
        throw new Error(`Failed to get id_token: id_token undefined`)
      }
    } catch (error) {
      throw new Error(`Failed to get id_token: ${error}`)
    }
  }
}
