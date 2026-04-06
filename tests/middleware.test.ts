import { NextFunction, Request, Response } from "express";
import { authenticate } from "../src/middlewares/authenticate";
import { authorize } from "../src/middlewares/authorize";
import { ApiError } from "../src/utils/apiError";
import { signAccessToken } from "../src/utils/token";
import { UserRole } from "../src/utils/enums";

describe("auth middlewares", () => {
  const createNext = () => jest.fn() as NextFunction;

  it("rejects requests without a bearer token", () => {
    const req = { headers: {} } as Request;
    const next = createNext();

    authenticate(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  it("attaches the authenticated user to the request", () => {
    const token = signAccessToken({
      sub: "user-1",
      email: "user@example.com",
      role: UserRole.Admin
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    } as Request;
    const next = createNext();

    authenticate(req, {} as Response, next);

    expect(req.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      role: UserRole.Admin
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects forbidden roles", () => {
    const req = {
      user: {
        id: "user-1",
        email: "viewer@example.com",
        role: UserRole.Viewer
      }
    } as Request;
    const next = createNext();

    authorize(UserRole.Admin)(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403
      })
    );
  });
});
