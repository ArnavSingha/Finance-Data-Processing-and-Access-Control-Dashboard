import { createLogger, format, transports } from "winston";

const isProduction = process.env.NODE_ENV === "production";

export const logger = createLogger({
  level: isProduction ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "finance-dashboard-backend" },
  transports: [
    new transports.Console({
      format: isProduction
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(({ level, message, timestamp, stack }) =>
              `${timestamp} ${level}: ${stack ?? message}`
            )
          )
    })
  ]
});

