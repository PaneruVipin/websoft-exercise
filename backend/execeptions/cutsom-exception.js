
    class CustomException extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
            this.name = this.constructor.name;
        }
    }

    class NotFoundException extends CustomException {
        constructor(message) {
            super(message || 'Resource not found', 404);
        }
    }

    class BadRequestException extends CustomException {
        constructor(message) {
            super(message || 'Bad request', 400);
        }
    }

    class UnauthorizedException extends CustomException {
        constructor(message) {
            super(message || 'Unauthorized', 401);
        }
    }

    class ForbiddenException extends CustomException {
        constructor(message) {
            super(message || 'Forbidden', 403);
        }
    }
    class InternalServerErrorException extends CustomException {
        constructor(message) {
            super(message || 'Internal server error', 500);
        }
    }
    class ConflictException extends CustomException {
        constructor(message) {
            super(message || 'Conflict', 409);
        }
    }

    class UnprocessableEntityException extends CustomException {
        constructor(message) {
            super(message || 'Unprocessable entity', 422);
        }
    }
    class ServiceUnavailableException extends CustomException {
        constructor(message) {
            super(message || 'Service unavailable', 503);
        }
    }

module.exports = {
    CustomException,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
    ConflictException,
    UnprocessableEntityException,
    ServiceUnavailableException
}