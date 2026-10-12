/**
 * The Trosive mark as a 96px PNG on white, shown at 32px next to the name at
 * the top of every email. It travels inline with each message (`cid:`) rather
 * than as a hosted URL, so it shows up before the site is online too.
 *
 * Rendered from `public/brand/trosive-mark-light.svg` with sharp:
 * `sharp(svg, { density: 300 }).resize(96, 96).flatten({ background: "#ffffff" }).png({ palette: true })`
 */
export const LOGO_CONTENT_ID = "trosive-logo"

export const LOGO_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAeFBMVEX///9sbGwnJydERERYWFhbW1vv7+8KCgr19fVKSkq9vb2MjIxOTk7z8/Otra2mpqYqKioTExMZGRmdnZ0eHh7g4OC5ubnX19dubm4NDQ0fHx/AwMDS0tJ2dnbJycm+vr4wMDB9fX329vZiYmJRUVFISEiKioqJiYn2MlRjAAAACXBIWXMAAC4jAAAuIwF4pT92AAABLklEQVR42u3Z1w6DMAwFUNJFuvfe+///sKUtVdUHuLYTdcT3GecIIRwTouglNqalmxSdmxEcFtAoNj0DMS4wAVzgArDABlDhAQyqYA5PID5aAlCKKLkD2D1IAEgQAYggAwBBCOQLUiBXEAN5ghzIERwA2YILIFNgAdv3BnJyDFCigHdg37tl5w0o3eutAq6AfhlOnwUYfH4xCijwIcBW4NiAWsW0c82EC0yS6mkmUJDvWoUAgGU6Qa3RNddpxRICiunr00aB9nNs/BpgY5KsUGB1u3xDAAzn6ZqvA6jNjgxQ27UCCnwAoA6/JrxW4RP4/Q3HLzBvPTJEgWFaMQ9gLprVrllw114k1TM9SnAHjOpwRvoZq8C/AuManLEeayqgQHgA/Mv9PQMQkEaB0IALyMpftJ2G9boAAAAASUVORK5CYII="
