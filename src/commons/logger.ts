import winston from "winston";

export default new winston.Logger({
    level: "info",
    transports: [
        new winston.transports.Console({
            timestamp(){
                return new Date();
            },
            formatter(options?: any): string {
                return `${options.timestamp()} ${options.level.toUpperCase()}: ${(options.message ? options.message : '')}`
            }
        }),
    ],
})
