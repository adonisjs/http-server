export type NodeConfig = {
  /**
   * The number of milliseconds of inactivity a server needs to wait for additional incoming data, after
   * it has finished writing the last response, before a socket will be destroyed
   * @default 5000
   */
  keepAliveTimeout?: number

  /**
   * Limit the amount of time the parser will wait to receive the complete HTTP headers
   * @default 60000
   */
  headersTimeout?: number

  /**
   * Sets the timeout value in milliseconds for receiving the entire request from the client
   * @default 300000
   */
  requestTimeout?: number

  /**
   * The number of milliseconds of inactivity before a socket is presumed to have timed out
   * @default 0
   */
  timeout?: number
}
