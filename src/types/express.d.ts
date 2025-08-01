import { Request } from 'express'
import { Session, SessionData } from 'express-session'

declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File
    files?:
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
  }
}

declare module 'express-session' {
  interface SessionData {
    csrfToken: string
  }
}
