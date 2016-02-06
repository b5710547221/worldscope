/**
 * @module StreamService
 */
'use strict';

var rfr = require('rfr');

var CustomError = rfr('app/util/Error');
var Utility = rfr('app/util/Utility');
var Storage = rfr('app/models/Storage');
var SocketAdapter = rfr('app/adapters/socket/SocketAdapter');

var logger = Utility.createLogger(__filename);

function StreamService() {
}

var Class = StreamService.prototype;

Class.createNewStream = function(userId, streamAttributes) {
  logger.debug('Creating new stream: %j', streamAttributes);

  return Storage.createStream(userId, streamAttributes)
    .then((result) => {
      if (result) {
        initializeChatRoomForStream(userId, streamAttributes);
        return Utility.formatStreamObject(result, 'stream');
      }

      return null;
    }).catch(function(err) {
      logger.error('Error in stream creation ', err);
      if (err.name === 'SequelizeValidationError' ||
          err.message === 'Validation error') {
        return Promise.resolve(new CustomError
          .InvalidFieldError(err.errors[0].message, err.errors[0].path));
      } else if (err.name === 'TypeError') {
        return Promise.resolve(new CustomError
          .NotFoundError('User not found'));
      } else {
        return Promise.resolve(new CustomError.UnknownError());
      }
    });
};

Class.getStreamById = function(streamId) {
  logger.debug('Getting stream by Id: %j', streamId);

  return Storage.getStreamById(streamId).then(function receiveResult(result) {
    if (result) {
      return Utility.formatStreamObject(result, 'view');
    } else {
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
  });
};

Class.getListOfStreams = function(filters) {
  logger.debug('Getting list of streams with filters: %j', filters);

  return Storage.getListOfStreams(filters).then(function receiveResult(results) {
    if (results) {
      return results.map((singleStream) =>
        Utility.formatStreamObject(singleStream, 'view'));
    } else {
      return Promise.resolve(new CustomError
        .NotFoundError('Stream not found'));
    }
  }).catch(function(err) {
    logger.error(err);
    return null;
  });
};

/**
 * Creates a new chat room for a new stream and add the streamer to that room
 * @param userId {string}
 * @param streamAttributes {object}
 */
function initializeChatRoomForStream(userId, streamAttributes) {
  if (!SocketAdapter.isInitialized) {
    logger.error('SocketAdapter is not isInitialized');
    return;
  }

  let room = SocketAdapter.createNewRoom(streamAttributes.appInstance);
  if (!room || room instanceof Error) {
    logger.error('Unable to create new chat room for stream %s',
                 streamAttributes.title);
  }
}

module.exports = new StreamService();
