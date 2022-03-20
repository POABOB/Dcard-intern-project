class BaseModel {
	constructor(ShortId, ShortUrl) {
		if(ShortId) { this.id = ShortId; }
		if(ShortUrl) { this.shortUrl = ShortUrl; }
	}
}

class ErrorModel {
	constructor(error, message) {
		if(error) { this.error = error; }
		if(message) { this.message = message; }
	}
}

module.exports = {
	BaseModel,
    ErrorModel
};