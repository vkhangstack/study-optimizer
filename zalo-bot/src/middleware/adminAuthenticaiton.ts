import { NextFunction, Request, Response } from "express"

export const adminAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const authenticationKey = req.headers["x-admin-authentication-key"]
  const adminKey = Bun.env.ADMIN_AUTHENTICATION_KEY

  if (authenticationKey !== adminKey) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  next()
}
