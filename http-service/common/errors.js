/**
* errors
*/


class STANDARD extends Error {

    constructor(message = '') {
        const msg = 'STANDARD ERROR ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 500;
        this.out = 'Service Unavailable';
    }
}

class BAD_REQUEST extends STANDARD {

    constructor(message = '') {
        const msg = 'BAD REQUEST ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 400;
        this.out = 'Bad Request';
    }
}


class UNAUTHORIZED extends STANDARD {

    constructor(message = '') {
        const msg = 'UNAUTHORIZED ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 401;
        this.out = 'Unauthorized';
    }
}

class FORBIDDEN extends STANDARD {

    constructor(message = '') {
        const msg = 'FORBIDDEN ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 403;
        this.out = 'Forbidden';
    }
}

class NOT_FOUND extends STANDARD {

    constructor(message = '') {
        const msg = 'NOT FOUND ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 404;
        this.out = 'Not Found';
    }
}

class SERVICE_UNAVAILABLE extends STANDARD {

    constructor(message = '') {
        const msg = 'SERVICE UNAVAILABLE ' + (message ??= '');
        super(msg);
        this.message = msg;
        this.statusCode = 500;
        this.out = 'Service Unavailable';
    }
}

const _E_ = {
    STANDARD,
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    SERVICE_UNAVAILABLE
};

module.exports = _E_
