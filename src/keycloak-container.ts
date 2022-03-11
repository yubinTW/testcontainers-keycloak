import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container'
import { LogWaitStrategy } from 'testcontainers/dist/wait-strategy'
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
    this.withWaitStrategy(new LogWaitStrategy(this.waitingLog))
      .withEnv('KEYCLOAK_USER', this.adminUsername)
      .withEnv('KEYCLOAK_PASSWORD', this.adminPassword)
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
    client_id: string,
    client_secret: string
  ) {
    const tokenEndpoint = `${this.SERVER}/auth/realms/${realmName}/protocol/openid-connect/token`

    const data = qs.stringify({
      username,
      password,
      client_id,
      client_secret,
      grant_type: 'password'
    })

    const curlCommand = `curl ${tokenEndpoint} -X POST -d ${data}`

    try {
      const curlResult = await this.runCmd(curlCommand)
      const accessToken: string = JSON.parse(curlResult)['access_token']
      if (accessToken && accessToken.length > 0) return Promise.resolve(accessToken)
      else {
        return Promise.reject(`Failed to get aaccess token: ${curlResult}`)
      }
    } catch (error) {
      return Promise.reject(`Failed to get aaccess token: ${error}`)
    }
  }
}
