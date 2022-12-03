/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type QSParserConfig = {
  parse: {
    /**
     * Nesting depth till the parameters should be parsed.
     *
     * Defaults to 5
     */
    depth: number

    /**
     * Number of parameters to parse.
     *
     * Defaults to 1000
     */
    parameterLimit: number

    /**
     * Allow sparse elements in an array.
     *
     * Defaults to false
     */
    allowSparse: boolean

    /**
     * The max limimit for the array indices. After the given limit
     * the array indices will be converted to an object, where the
     * index is the key.
     *
     * Defaults to 20
     */
    arrayLimit: number

    /**
     * Join comma seperated query string values to an array
     *
     * Defaults to false
     */
    comma: boolean
  }

  stringify: {
    /**
     * URI encode the stringified query string
     *
     * Defaults to true
     */
    encode: boolean

    /**
     * URI encode but only the values and not the keys
     *
     * Defaults to false
     */
    encodeValuesOnly: boolean

    /**
     * Define the format in which arrays should be serialized.
     *
     * - indices:   a[0]=b&a[1]=c
     * - brackets:  a[]=b&a[]=c
     * - repeat:    a=b&a=c
     * - comma:     a=b,c
     *
     * Defaults to "indices"
     */
    arrayFormat: 'indices' | 'brackets' | 'repeat' | 'comma'

    /**
     * Whether or not to skip null values when serializing. When set to
     * false, the null values will be treated as an empty string.
     *
     * Defaults to: false
     */
    skipNulls: boolean
  }
}
