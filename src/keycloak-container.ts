import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { AbstractStartedContainer } from 'testcontainers/dist/modules/abstract-started-container'

export class KeycloakContainer extends GenericContainer {
  constructor(image: string) {
    super(image)
  }

  public async start(): Promise<StartedKeycloakContainer> {
    return new StartedKeycloakContainer(await super.start())
  }
}

export class StartedKeycloakContainer extends AbstractStartedContainer {
  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer)
  }
}
