import '@japa/runner'

declare module '@japa/runner' {
  interface TestContext {
    sleep(time: number): Promise<void>
  }
}
